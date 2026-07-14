/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - ENDPOINTS DE API PARA WIDGETS
 * ═══════════════════════════════════════════
 * Funciones que devuelven datos en formato JSON listos
 * para alimentar widgets de la app TWA.
 *
 * Cada función es independiente y puede llamarse desde
 * cualquier parte de la aplicación.
 */
var ChescoAPI = (function() {
    'use strict';

    /**
     * Obtener ranking de los 5 usuarios con más retos cumplidos.
     * @returns {Promise<object>} JSON con { ok, data, timestamp }
     */
    async function obtenerRankingUsuarios() {
        try {
            var ranking = await DataStore.obtenerRankingUsuarios();
            return {
                ok:      true,
                endpoint: 'ranking_usuarios',
                data:    ranking,
                total:   ranking.length,
                timestamp: new Date().toISOString()
            };
        } catch (e) {
            return { ok: false, endpoint: 'ranking_usuarios', error: e.message };
        }
    }

    /**
     * Obtener los cromos (retos) de un usuario específico.
     * @param {string} userId - UUID del usuario
     * @returns {Promise<object>} JSON con { ok, data, resumen, timestamp }
     */
    async function obtenerCromosUsuario(userId) {
        try {
            var cromos = await DataStore.obtenerCromosUsuario(userId);
            var perfil = await DataStore.obtenerPerfil(userId);

            var completados = cromos.filter(function(c) { return c.cumplio; }).length;
            var totalReto = (window.CHALLENGES || []).length;

            return {
                ok:       true,
                endpoint: 'cromos_usuario',
                username: perfil ? perfil.username : 'Desconocido',
                resumen:  {
                    completados: completados,
                    total:       totalReto,
                    porcentaje:  totalReto > 0 ? Math.round((completados / totalReto) * 100) : 0
                },
                data:     cromos,
                timestamp: new Date().toISOString()
            };
        } catch (e) {
            return { ok: false, endpoint: 'cromos_usuario', error: e.message };
        }
    }

    /**
     * Obtener la promoción activa más reciente.
     * @returns {Promise<object>} JSON con { ok, data, timestamp }
     */
    async function obtenerPromoActiva() {
        try {
            var promo = await DataStore.obtenerPromoActiva();
            return {
                ok:       true,
                endpoint: 'promo_activa',
                data:     promo,
                timestamp: new Date().toISOString()
            };
        } catch (e) {
            return { ok: false, endpoint: 'promo_activa', error: e.message };
        }
    }

    /**
     * Obtener el estado de lealtad de un usuario.
     * @param {string} userId
     * @returns {Promise<object>}
     */
    async function obtenerEstadoLealtad(userId) {
        try {
            var lealtad = await DataStore.obtenerLealtad(userId);
            var perfil  = await DataStore.obtenerPerfil(userId);
            return {
                ok:       true,
                endpoint: 'estado_lealtad',
                username: perfil ? perfil.username : '???',
                data:     lealtad,
                timestamp: new Date().toISOString()
            };
        } catch (e) {
            return { ok: false, endpoint: 'estado_lealtad', error: e.message };
        }
    }

    /**
     * Dashboard resumido (para admin).
     * @returns {Promise<object>}
     */
    async function obtenerDashboard() {
        try {
            var ranking = await DataStore.obtenerRankingUsuarios();
            var promo   = await DataStore.obtenerPromoActiva();

            return {
                ok:       true,
                endpoint: 'dashboard',
                data: {
                    ranking:    ranking,
                    promo:      promo,
                    totalRetos: (window.CHALLENGES || []).length
                },
                timestamp: new Date().toISOString()
            };
        } catch (e) {
            return { ok: false, endpoint: 'dashboard', error: e.message };
        }
    }

    /* ── API pública ── */
    return {
        obtenerRankingUsuarios:  obtenerRankingUsuarios,
        obtenerCromosUsuario:    obtenerCromosUsuario,
        obtenerPromoActiva:      obtenerPromoActiva,
        obtenerEstadoLealtad:    obtenerEstadoLealtad,
        obtenerDashboard:        obtenerDashboard
    };

})();
