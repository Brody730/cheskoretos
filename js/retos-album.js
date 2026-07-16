/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - ÁLBUM DE RETOS (Gamificación)
 * ═══════════════════════════════════════════
 * Renderiza la cuadrícula de cromos/estampitas.
 * - Reto completado → color + checkmark
 * - Reto pendiente  → grises + candado
 *
 * Datos de retos: window.CHALLENGES (challenges.js)
 * Historial del usuario: tabla historial_retos en Supabase
 */
var AlbumRetos = (function() {
    'use strict';

    /* ── Emojis representativos de cada reto ── */
    var RETO_EMOJIS = {
        intelectual:   '🧠',
        volado:        '🪙',
        miron:         '👀',
        chistosito:    '🎭',
        botellazo:     '🍾',
        griton:        '📣',
        mimo:          '🤫',
        cirquero:      '🥚',
        monedazo:      '🪙',
        basquetbolista:'🏀',
        trabalenguas:  '👅',
        posibilidad:   '🔢',
        influencer:    '🤳',
        retador:       '✊',
        inventor:      '🎲',
        milimetrico:   '📐',
        'reflejo-x':   '🖐️',
        'reloj-humano':'⏰',
        suertudote:    '🌟',
        donativo:      '😇'
    };

    /**
     * Marcar un reto como cumplido (o no) en Supabase.
     * @param {string} retoId
     * @param {boolean} cumplio - true = completó, false = no completó
     * @returns {boolean}
     */
    async function marcarReto(retoId, cumplio) {
        var actual = Auth.obtenerUsuarioActual();
        if (!actual) return false;

        var resultado = await DataStore.registrarReto(
            actual.authUser.id,
            retoId,
            cumplio !== false
        );
        return resultado !== null;
    }

    /**
     * Wrapper para marcar como cumplido (compatibilidad con código existente).
     */
    async function marcarRetoComoCumplido(retoId) {
        return await marcarReto(retoId, true);
    }

    /**
     * Obtener lista de IDs de retos completados del usuario actual.
     * @returns {Promise<string[]>}
     */
    async function obtenerRetosCompletados() {
        var actual = Auth.obtenerUsuarioActual();
        if (!actual) return [];
        return await DataStore.obtenerRetosCompletados(actual.authUser.id);
    }

    /**
     * Contar retos ÚNICOS completados del usuario actual (sin duplicados).
     * @returns {Promise<number>}
     */
    async function contarRetosCompletados() {
        var actual = Auth.obtenerUsuarioActual();
        if (!actual) return 0;
        var conteo = await DataStore.obtenerConteoPorReto(actual.authUser.id);
        return Object.keys(conteo).length;
    }

    function getMedallaNivel(veces) {
        if (veces >= 15) return { clase: 'medalla-oro',   emoji: '🥇', label: 'ORO' };
        if (veces >= 5)  return { clase: 'medalla-plata', emoji: '🥈', label: 'PLATA' };
        return             { clase: 'medalla-bronce',     emoji: '🥉', label: 'BRONCE' };
    }

    /**
     * Renderizar el álbum de retos con sistema de medallas.
     * ASYNC: debe ser llamada con await.
     * @param {string} contenedorId
     */
    async function renderizarAlbumDeRetos(contenedorId) {
        var contenedor = document.getElementById(contenedorId);
        if (!contenedor) return;

        var actual = Auth.obtenerUsuarioActual();
        if (!actual) {
            contenedor.innerHTML = '<p class="album-empty-msg">Inicia sesión para ver tu álbum de retos.</p>';
            return;
        }

        var conteo = await DataStore.obtenerConteoPorReto(actual.authUser.id);
        var retos = window.CHALLENGES || [];

        if (retos.length === 0) {
            contenedor.innerHTML = '<p class="album-empty-msg">Cargando retos de la suerte...</p>';
            return;
        }

        var html = retos.map(function(reto) {
            var veces  = conteo[reto.id] || 0;
            var emoji  = RETO_EMOJIS[reto.id] || '🎯';
            var color  = (typeof CHALLENGE_COLORS !== 'undefined' && CHALLENGE_COLORS[reto.id])
                         ? CHALLENGE_COLORS[reto.id] : '#888888';

            var overlay;
            var clases = 'album-cromo';

            if (veces === 0) {
                clases += ' pendiente';
                overlay = '<div class="cromo-lock">🔒</div>';
            } else {
                var medalla = getMedallaNivel(veces);
                clases += ' completado ' + medalla.clase;
                overlay =
                    '<div class="cromo-medalla">' + medalla.emoji + '</div>' +
                    '<div class="cromo-veces">' + veces + 'x</div>';
            }

            return '' +
                '<div class="' + clases + '" ' +
                     'style="border-color:' + color + ';" ' +
                     'data-reto-id="' + reto.id + '">' +
                    '<div class="cromo-emoji">' + emoji + '</div>' +
                    '<div class="cromo-titulo">' + reto.title + '</div>' +
                    '<div class="cromo-descuento">' + reto.discount + '</div>' +
                    overlay +
                '</div>';
        }).join('');

        contenedor.innerHTML = html;
    }

    /* ── API pública ── */
    return {
        marcarReto:                marcarReto,
        marcarRetoComoCumplido:    marcarRetoComoCumplido,
        renderizarAlbumDeRetos:    renderizarAlbumDeRetos,
        obtenerRetosCompletados:   obtenerRetosCompletados,
        contarRetosCompletados:    contarRetosCompletados,
        RETO_EMOJIS:               RETO_EMOJIS
    };

})();
