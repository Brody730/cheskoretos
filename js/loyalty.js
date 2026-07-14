/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - MÓDULO DE LEALTAD (RACHA 5+1)
 * ═══════════════════════════════════════════
 * Sistema de rachas de sábados.
 * - Máx 1 visita por semana (bloqueo si <= 1 día)
 * - Si asistió el sábado pasado (6-8 días): racha +1
 * - Si se saltó un sábado (>8 días): racha = 1
 * - Al llegar a 5 sábados: Chesko GRATIS + medalla
 *
 * La lógica de negocio pesada está en la función SQL
 * registrar_visita(). Este módulo llama esa función RPC
 * y maneja la respuesta.
 *
 * Para uso desde el perfil (auto-registro) Y desde el
 * escáner (admin/empleado registrando a otro usuario).
 */
var Loyalty = (function() {
    'use strict';

    var RACHA_MAX = 5;

    /* ═══════════════════════════════════════════
       1. REGISTRAR VISITA (vía RPC)
       ═══════════════════════════════════════════ */

    /**
     * Registrar una visita para un usuario.
     * Llama a la función SQL registrar_visita() que contiene
     * toda la lógica de racha y bloqueo.
     *
     * @param {string} targetUserId - UUID del usuario que recibe la visita
     * @returns {object} Resultado con tipo, mensaje, titulo, etc.
     */
    async function registrarVisita(targetUserId) {
        if (!targetUserId) {
            return { tipo: 'error', mensaje: 'Usuario no especificado.' };
        }

        var resultado = await DataStore.registrarVisita(targetUserId);

        /* Refrescar caché local si es el usuario actual */
        var actual = Auth.obtenerUsuarioActual();
        if (actual && actual.authUser.id === targetUserId) {
            await Auth.refrescarDatos();
        }

        return resultado;
    }

    /* ═══════════════════════════════════════════
       2. REGISTRAR VISITA PROPIA (auto)
       ═══════════════════════════════════════════ */

    /**
     * Registrar visita para el usuario que tiene sesión activa.
     * @returns {object} Resultado
     */
    async function registrarMiVisita() {
        var actual = Auth.obtenerUsuarioActual();
        if (!actual) {
            return { tipo: 'no_logueado', mensaje: 'Debes iniciar sesión primero.' };
        }
        return await registrarVisita(actual.authUser.id);
    }

    /* ═══════════════════════════════════════════
       3. CANJEAR CHESKO GRATIS
       ═══════════════════════════════════════════ */

    /**
     * Canjear el cupón de Chesko gratis.
     * @returns {boolean} true si se canjeó
     */
    async function canjearCheskoGratis() {
        var actual = Auth.obtenerUsuarioActual();
        if (!actual || !actual.lealtad) return false;
        if (!actual.lealtad.chesko_gratis_activo) return false;

        await DataStore.actualizarLealtad(actual.authUser.id, {
            chesko_gratis_activo: false
        });

        await Auth.refrescarDatos();
        return true;
    }

    /* ═══════════════════════════════════════════
       4. OBTENER ESTADO DE LEALTAD
       ═══════════════════════════════════════════ */

    /**
     * Obtener el estado actual de la lealtad del usuario en sesión.
     * @returns {object|null}
     */
    function obtenerEstadoLealtad() {
        var actual = Auth.obtenerUsuarioActual();
        if (!actual || !actual.lealtad) return null;

        var l = actual.lealtad;
        var hoy = new Date().toISOString().slice(0, 10);
        var yaRegistro = l.ultima_visita === hoy;

        /* Calcular si puede registrar hoy (diferencia > 1 día) */
        var puedeRegistrar = true;
        if (l.ultima_visita) {
            var ultima = new Date(l.ultima_visita);
            var hoyDate = new Date(hoy);
            var diffDias = Math.floor((hoyDate - ultima) / (1000 * 60 * 60 * 24));
            if (diffDias <= 1) {
                puedeRegistrar = false;
            }
        }

        return {
            rachaActual:          l.racha_actual || 0,
            rachaMax:             RACHA_MAX,
            rachaRestantes:       RACHA_MAX - (l.racha_actual || 0),
            ultimaVisita:         l.ultima_visita,
            medallasGanadas:      l.medallas_ganadas || 0,
            cheskoGratisActivo:   l.chesko_gratis_activo || false,
            yaRegistroHoy:        yaRegistro,
            puedeRegistrar:       puedeRegistrar,
            rachaCompleta:        (l.racha_actual || 0) >= RACHA_MAX
        };
    }

    /* ── API pública ── */
    return {
        registrarVisita:        registrarVisita,
        registrarMiVisita:      registrarMiVisita,
        canjearCheskoGratis:    canjearCheskoGratis,
        obtenerEstadoLealtad:   obtenerEstadoLealtad,
        RACHA_MAX:              RACHA_MAX
    };

})();
