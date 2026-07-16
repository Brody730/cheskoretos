/**
 * ═══════════════════════════════════════════════════
 * CHESKORETOS — GOOGLE WALLET PASS (Vercel Function)
 * ═══════════════════════════════════════════════════
 * Crea / actualiza una tarjeta de lealtad en Google Wallet
 * y retorna un link "Save to Google Wallet".
 *
 * VARIABLES DE ENTORNO REQUERIDAS (en Vercel Dashboard):
 *   GOOGLE_WALLET_SERVICE_ACCOUNT  → JSON del service account (una línea)
 *   GOOGLE_WALLET_ISSUER_ID        → Tu Issuer ID (ej: "1234567890")
 */
const { GoogleAuth } = require('google-auth-library');
const { google }     = require('googleapis');
const jwt            = require('jsonwebtoken');

module.exports = async function handler(req, res) {
    /* ── CORS ── */
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

    /* ── Input ── */
    const { user_id, username, stamps, max_stamps } = req.body || {};

    if (!user_id || !username) {
        return res.status(400).json({ error: 'Faltan campos requeridos: user_id, username' });
    }

    /* ── Env vars ── */
    const SERVICE_ACCOUNT_JSON = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT;
    const ISSUER_ID            = process.env.GOOGLE_WALLET_ISSUER_ID;

    if (!SERVICE_ACCOUNT_JSON || !ISSUER_ID) {
        return res.status(500).json({
            error: 'Variables de entorno de Google Wallet no configuradas',
            hint:  'Agrega GOOGLE_WALLET_SERVICE_ACCOUNT y GOOGLE_WALLET_ISSUER_ID en Vercel'
        });
    }

    try {
        const serviceAccount = JSON.parse(SERVICE_ACCOUNT_JSON);
        const BASE_URL = 'https://cheskoretos.vercel.app';

        /* ══════════════════════════════════════
           1. AUTENTICACIÓN CON GOOGLE
           ══════════════════════════════════════ */
        const auth = new GoogleAuth({
            credentials: serviceAccount,
            scopes: ['https://www.googleapis.com/auth/wallet_object.issuer']
        });

        const walletobjects = google.walletobjects({ version: 'v1', auth });

        const classId  = `${ISSUER_ID}.cheskoretos-loyalty`;
        const objectId = `${ISSUER_ID}.cheskoretos-loyalty.${user_id}`;

        /* ══════════════════════════════════════
           2. CREAR CLASE DE LEALTAD (si no existe)
           ══════════════════════════════════════ */
        try {
            await walletobjects.loyaltyclass.get({ resource: classId });
        } catch (e) {
            if (e.code === 404 || e.response?.status === 404) {
                console.log('Creando clase de lealtad:', classId);
                await walletobjects.loyaltyclass.insert({
                    requestBody: {
                        id: classId,
                        issuerName: 'ChesKoretos',
                        programName: 'ChesKoretos — Lealtad',
                        programLogo: {
                            sourceUri: {
                                uri: `${BASE_URL}/assets/logo-wallet.png`,
                                description: 'Logo ChesKoretos'
                            }
                        },
                        reviewStatus: 'UNDER_REVIEW',
                        rewardItems: ['Chesko Gratis'],
                        locations: [{
                            name: 'ChesKoretos — Parque Dr. Montes De Oca',
                            address: 'Parque Dr. Montes De Oca, Detrás del Kiosco principal'
                        }]
                    }
                });
                console.log('Clase creada:', classId);
            } else {
                throw e;
            }
        }

        /* ══════════════════════════════════════
           3. CREAR / ACTUALIZAR OBJETO DEL USUARIO
           ══════════════════════════════════════ */
        const qrUrl      = `${BASE_URL}/perfil.html?validar_usuario_id=${user_id}`;
        const stampsCount = stamps     || 0;
        const maxStamps   = max_stamps || 5;

        const loyaltyObject = {
            id: objectId,
            classId: classId,
            state: 'ACTIVE',
            hexBackgroundColor: '#FF6600',
            textModulesData: [
                { header: 'RACHA',   body: `${stampsCount} de ${maxStamps} sábados` },
                { header: 'MIEMBRO', body: `@${username}` }
            ],
            barcode: {
                type: 'QR_CODE',
                value: qrUrl,
                alternateText: 'Escanea para validar tu visita'
            },
            linksModuleData: {
                uris: [{
                    uri: qrUrl,
                    description: 'Ver mi CheskoCard'
                }]
            }
        };

        try {
            await walletobjects.loyaltyobject.insert({
                requestBody: loyaltyObject,
                upsert: true
            });
            console.log('Objeto creado/actualizado:', objectId);
        } catch (e) {
            console.error('Error creando objeto:', e.message);
            throw e;
        }

        /* ══════════════════════════════════════
           4. GENERAR LINK "SAVE TO GOOGLE WALLET"
           ══════════════════════════════════════ */
        const now = Math.floor(Date.now() / 1000);

        const savePayload = {
            iss:    serviceAccount.client_email,
            aud:    'google',
            typ:    'savetowallet',
            iat:    now,
            exp:    now + 3600,   /* 1 hora de validez */
            payload: {
                loyaltyClasses:  [{ id: classId }],
                loyaltyObjects:  [{ id: objectId }]
            }
        };

        const token = jwt.sign(savePayload, serviceAccount.private_key, {
            algorithm: 'RS256'
        });

        const walletUrl = `https://pay.google.com/gp/v/save/${token}`;

        return res.status(200).json({
            success:   true,
            walletUrl: walletUrl,
            objectId:  objectId,
            classId:   classId
        });

    } catch (error) {
        console.error('Google Wallet error:', error);
        return res.status(500).json({
            error:   'Error al crear la tarjeta para Google Wallet',
            details: error.message
        });
    }
};
