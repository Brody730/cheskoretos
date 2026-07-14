/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - CONFIGURACIÓN DE SUPABASE
 * ═══════════════════════════════════════════
 * Inicializa el cliente de Supabase y exporta constantes globales.
 *
 * CONFIGURACIÓN REQUERIDA:
 * 1. Ve a https://supabase.com → tu proyecto → Settings → API
 * 2. Copia la "Project URL" → pégala en SUPABASE_URL
 * 3. Copia la "anon public" key → pégala en SUPABASE_ANON_KEY
 * 4. En Authentication → Providers, habilita "Phone" (Twilio)
 */
var AppConfig = (function() {
    'use strict';

    /* ═══════════════════════════════════════════
       CREDENCIALES — ¡REEMPLAZA CON TUS VALORES!
       ═══════════════════════════════════════════ */
    var SUPABASE_URL    = 'https://rpscbkwtbbzqizhkkkpk.supabase.co';
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwc2Nia3d0YmJ6cWl6aGtra3BrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5ODgzNTAsImV4cCI6MjA5OTU2NDM1MH0.Qyb2OWoeI0YamU2w1GAD2oBUWsrJrpBf5rPtdNlOB9o';

    /* ═══════════════════════════════════════════
       CONSTANTES DE NEGOCIO
       ═══════════════════════════════════════════ */
    var RACHA_MAX           = 5;   /* Sábados consecutivos para Chesko gratis */
    var SELLOS_PARA_GRATIS  = 5;   /* Alias de RACHA_MAX */
    var URL_BASE            = 'https://cheskoretos.vercel.app';

    /* ═══════════════════════════════════════════
       INICIALIZACIÓN DEL CLIENTE SUPABASE
       ═══════════════════════════════════════════ */
    var client = null;

    function getClient() {
        if (!client) {
            if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
                console.error('Supabase JS SDK no está cargado. Incluye el CDN de @supabase/supabase-js@2');
                return null;
            }
            client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        return client;
    }

    /* ── API pública ── */
    return {
        getClient:         getClient,
        SUPABASE_URL:      SUPABASE_URL,
        SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
        RACHA_MAX:         RACHA_MAX,
        SELLOS_PARA_GRATIS: SELLOS_PARA_GRATIS,
        URL_BASE:          URL_BASE
    };

})();
