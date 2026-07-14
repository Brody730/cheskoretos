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
     * Contar retos completados del usuario actual.
     * @returns {Promise<number>}
     */
    async function contarRetosCompletados() {
        var retos = await obtenerRetosCompletados();
        return retos.length;
    }

    /**
     * Renderizar el álbum de retos completo en un contenedor del DOM.
     * ASYNC: debe ser llamada con await.
     *
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

        var completados = await DataStore.obtenerRetosCompletados(actual.authUser.id);
        var retos = window.CHALLENGES || [];

        if (retos.length === 0) {
            contenedor.innerHTML = '<p class="album-empty-msg">Cargando retos de la suerte...</p>';
            return;
        }

        var html = retos.map(function(reto) {
            var completado = completados.indexOf(reto.id) !== -1;
            var emoji      = RETO_EMOJIS[reto.id] || '🎯';
            var color      = (typeof CHALLENGE_COLORS !== 'undefined' && CHALLENGE_COLORS[reto.id])
                             ? CHALLENGE_COLORS[reto.id] : '#888888';

            var clases = 'album-cromo' + (completado ? ' completado' : ' pendiente');
            var selloOverlay = completado
                ? '<div class="cromo-check">✅</div>'
                : '<div class="cromo-lock">🔒</div>';

            return '' +
                '<div class="' + clases + '" ' +
                     'style="border-color:' + color + '; box-shadow: 5px 5px 0 ' + color + '80, 5px 5px 0 #000;" ' +
                     'data-reto-id="' + reto.id + '">' +
                    '<div class="cromo-emoji">' + emoji + '</div>' +
                    '<div class="cromo-titulo">' + reto.title + '</div>' +
                    '<div class="cromo-descuento">' + reto.discount + '</div>' +
                    selloOverlay +
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
