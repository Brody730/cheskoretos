/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - ENVIAR PUSH (Vercel Serverless Function)
 * ═══════════════════════════════════════════
 * Lo dispara un Database Webhook de Supabase cada vez que se
 * inserta una fila en la tabla `notificaciones`. Busca las
 * suscripciones push del usuario y les manda la notificación
 * real (llega aunque tengan el navegador cerrado).
 *
 * Requiere:
 *   npm install web-push
 *
 * Variables de entorno en Vercel (Settings → Environment Variables):
 *   VAPID_PUBLIC_KEY
 *   VAPID_PRIVATE_KEY
 *   VAPID_SUBJECT        (ej. "mailto:tuemail@ejemplo.com")
 *   SUPABASE_URL         (la misma de config.js)
 *   SUPABASE_ANON_KEY    (la misma de config.js)
 */

var webpush = require('web-push');
var { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        webpush.setVapidDetails(
            process.env.VAPID_SUBJECT,
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );

        /* Payload que manda el Database Webhook de Supabase */
        var body   = req.body || {};
        var record = body.record || body; /* por si se llama manualmente con el objeto plano */

        if (!record || !record.usuario_id) {
            res.status(400).json({ error: 'Falta usuario_id en el payload' });
            return;
        }

        var supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

        var { data: subs, error } = await supabase.rpc('obtener_push_subscriptions', {
            p_usuario_id: record.usuario_id
        });

        if (error) {
            console.error('obtener_push_subscriptions:', error);
            res.status(500).json({ error: 'No se pudieron obtener las suscripciones' });
            return;
        }

        if (!subs || subs.length === 0) {
            /* El usuario no activó notificaciones push; no es un error */
            res.status(200).json({ success: true, enviados: 0, motivo: 'sin suscripciones' });
            return;
        }

        var payload = JSON.stringify({
            titulo:  record.titulo,
            mensaje: record.mensaje,
            tag:     'chesko-' + (record.tipo || 'notif'),
            url:     '/perfil.html'
        });

        var resultados = await Promise.allSettled(
            subs.map(function(sub) {
                var pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth_key }
                };
                return webpush.sendNotification(pushSubscription, payload).catch(async function(err) {
                    /* 404/410 = la suscripción ya no existe (navegador desinstalado, etc.) */
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        await supabase.rpc('borrar_push_subscription', { p_endpoint: sub.endpoint });
                    }
                    throw err;
                });
            })
        );

        var enviados = resultados.filter(function(r) { return r.status === 'fulfilled'; }).length;

        res.status(200).json({ success: true, enviados: enviados, total: subs.length });
    } catch (err) {
        console.error('send-push error:', err);
        res.status(500).json({ error: err.message || 'Error desconocido' });
    }
};
