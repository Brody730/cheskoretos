/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - ARCADE: "BOXEO DE SÁBADO"
 * ═══════════════════════════════════════════
 * Juego de timing tipo "prueba tu fuerza": una aguja sube y baja por
 * una barra vertical; hay que presionar GOLPEAR justo cuando la aguja
 * está en la "zona de poder" de arriba. 6 rondas, cada una un poco
 * más rápida y con la zona más angosta que la anterior. El puntaje
 * final es la suma de las 6 rondas.
 *
 * Mismo patrón que los demás juegos del arcade (js/arcade.js,
 * js/arcade-snake.js): estados listo/jugando/gameover, envío de
 * puntaje a la RPC genérica registrar_partida_arcade (juego=
 * 'boxeo_sabado'), leaderboard propio, y el puente window.ArcadeGames
 * que usa js/arcade-lobby.js.
 */
(function() {
    'use strict';

    var JUEGO_ID = 'boxeo_sabado';
    var RONDAS_TOTAL = 6;

    function getSesion() {
        try {
            var s = JSON.parse(localStorage.getItem('chesko_session'));
            return (s && s.id) ? s : null;
        } catch (_) { return null; }
    }

    var SoundFX = {
        ctx: null,
        enabled: true,
        init: function() {
            if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (this.ctx.state === 'suspended') this.ctx.resume();
        },
        _beep: function(freq, dur, type, vol) {
            if (!this.enabled || !this.ctx) return;
            var t = this.ctx.currentTime;
            var osc = this.ctx.createOscillator();
            var gain = this.ctx.createGain();
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.type = type || 'square';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(vol || 0.07, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
            osc.start(t); osc.stop(t + dur);
        },
        golpeBueno: function(fuerte) {
            var notas = fuerte ? [523, 659, 784, 1047] : [440, 523];
            var self = this;
            notas.forEach(function(f, i) { setTimeout(function() { self._beep(f, 0.12, 'square', 0.07); }, i * 60); });
        },
        golpeFallo: function() { this._beep(140, 0.18, 'sawtooth', 0.08); }
    };

    document.addEventListener('DOMContentLoaded', function() {
        var canvas = document.getElementById('boxeoCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var W = canvas.width, H = canvas.height;

        var pantalla        = document.getElementById('boxeoGameScreen');
        var startOverlay    = document.getElementById('boxeoStartOverlay');
        var gameOverPanel   = document.getElementById('boxeoGameOverPanel');
        var hudScore        = document.getElementById('boxeoHudScore');
        var hudRonda        = document.getElementById('boxeoHudRonda');
        var goPuntaje       = document.getElementById('boxeoGoPuntaje');
        var goPuntosGanados = document.getElementById('boxeoGoPuntosGanados');
        var goMultiplicador = document.getElementById('boxeoGoMultiplicador');
        var goIntentosHoy   = document.getElementById('boxeoGoIntentosHoy');
        var goMensajeSesion = document.getElementById('boxeoGoMensajeSesion');
        var btnReintentar   = document.getElementById('boxeoBtnReintentar');
        var btnGolpear      = document.getElementById('boxeoBtnGolpear');
        var soundToggle     = document.getElementById('boxeoSoundToggle');
        var leaderboardBody = document.getElementById('boxeoLeaderboardBody');

        var sesion = getSesion();

        var ESTADO = { LISTO: 'listo', JUGANDO: 'jugando', RESULTADO: 'resultado', GAMEOVER: 'gameover' };
        var estado = ESTADO.LISTO;

        var ronda, puntajeTotal, nivel, faseT, velocidad, zonaMin, zonaMax;
        var resultadoTexto = '', resultadoColor = '#fff', resultadoT = 0;
        var rafId = null, lastTime = 0;

        function configurarRonda() {
            velocidad = 1.6 + (ronda - 1) * 0.35;
            var anchoZona = Math.max(0.10, 0.34 - (ronda - 1) * 0.045);
            zonaMax = 1.0;
            zonaMin = 1.0 - anchoZona;
            faseT = 0;
        }

        function reiniciar() {
            ronda = 1;
            puntajeTotal = 0;
            configurarRonda();
            actualizarHud();
        }

        function actualizarHud() {
            if (hudScore) hudScore.textContent = String(puntajeTotal);
            if (hudRonda) hudRonda.textContent = ronda + ' / ' + RONDAS_TOTAL;
        }

        function iniciar() {
            SoundFX.init();
            reiniciar();
            estado = ESTADO.JUGANDO;
            if (startOverlay) startOverlay.style.display = 'none';
            if (gameOverPanel) gameOverPanel.style.display = 'none';
            lastTime = performance.now();
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(loop);
        }

        function loop(now) {
            var dt = Math.min(0.05, (now - lastTime) / 1000);
            lastTime = now;

            if (estado === ESTADO.JUGANDO) {
                faseT += dt;
                nivel = (Math.sin(faseT * velocidad) + 1) / 2;
            } else if (estado === ESTADO.RESULTADO) {
                resultadoT -= dt;
                if (resultadoT <= 0) siguienteRondaOFin();
            }
            dibujar();

            if (estado === ESTADO.JUGANDO || estado === ESTADO.RESULTADO) {
                rafId = requestAnimationFrame(loop);
            }
        }

        function golpear() {
            if (estado !== ESTADO.JUGANDO) return;
            var puntos;
            if (nivel >= zonaMin) {
                var precision = (nivel - zonaMin) / Math.max(0.001, zonaMax - zonaMin);
                puntos = Math.round(55 + 45 * precision);
                resultadoTexto = puntos >= 95 ? '¡GOLPE PERFECTO!' : '¡BUEN GOLPE!';
                resultadoColor = '#39FF14';
                SoundFX.golpeBueno(puntos >= 95);
            } else if (nivel >= zonaMin - 0.18) {
                var faltante = (zonaMin - nivel) / 0.18;
                puntos = Math.round(30 * (1 - faltante));
                resultadoTexto = 'FLOJITO...';
                resultadoColor = '#FFCC00';
                SoundFX.golpeBueno(false);
            } else {
                puntos = 0;
                resultadoTexto = '¡FALLASTE!';
                resultadoColor = '#FF3300';
                SoundFX.golpeFallo();
            }
            puntajeTotal += puntos;
            actualizarHud();
            estado = ESTADO.RESULTADO;
            resultadoT = 0.9;
        }

        function siguienteRondaOFin() {
            /* No programar aquí el próximo requestAnimationFrame: esta
               función se llama DESDE dentro de loop() (rama RESULTADO),
               así que el propio loop() ya se encarga de re-programarse
               al final según el estado que dejamos aquí. Hacerlo dos
               veces duplicaría el bucle (doble velocidad, doble dibujo,
               y un rafId huérfano imposible de cancelar). */
            ronda++;
            if (ronda > RONDAS_TOTAL) {
                return terminar();
            }
            configurarRonda();
            estado = ESTADO.JUGANDO;
        }

        function terminar() {
            estado = ESTADO.GAMEOVER;
            if (rafId) cancelAnimationFrame(rafId);
            mostrarGameOver();
        }

        function dibujar() {
            ctx.fillStyle = '#12100a';
            ctx.fillRect(0, 0, W, H);

            var margen = 16;
            var barX = W / 2 - 14, barW = 28;
            var barY = margen, barH = H - margen * 2;

            /* marco de la barra */
            ctx.fillStyle = '#000';
            ctx.fillRect(barX - 3, barY - 3, barW + 6, barH + 6);
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(barX, barY, barW, barH);

            /* zona de poder (arriba) */
            var zonaAltoMax = barH * (1 - zonaMin);
            var zonaAltoMin = barH * (1 - zonaMax);
            ctx.fillStyle = 'rgba(57,255,20,0.35)';
            ctx.fillRect(barX, barY + zonaAltoMin, barW, zonaAltoMax - zonaAltoMin);
            ctx.strokeStyle = '#39FF14';
            ctx.strokeRect(barX + 0.5, barY + zonaAltoMin + 0.5, barW - 1, (zonaAltoMax - zonaAltoMin) - 1);

            /* nivel actual relleno desde abajo */
            if (estado === ESTADO.JUGANDO || estado === ESTADO.RESULTADO) {
                var alturaNivel = barH * nivel;
                var grad = ctx.createLinearGradient(0, barY + barH, 0, barY + barH - alturaNivel);
                grad.addColorStop(0, '#FF3300');
                grad.addColorStop(0.6, '#FF6600');
                grad.addColorStop(1, '#FFCC00');
                ctx.fillStyle = grad;
                ctx.fillRect(barX, barY + barH - alturaNivel, barW, alturaNivel);

                /* marca de la aguja */
                ctx.fillStyle = '#fff';
                ctx.fillRect(barX - 5, barY + barH - alturaNivel - 1, barW + 10, 2);
            }

            /* texto de resultado flotante */
            if (estado === ESTADO.RESULTADO) {
                ctx.font = 'bold 13px monospace';
                ctx.textAlign = 'center';
                ctx.fillStyle = resultadoColor;
                ctx.fillText(resultadoTexto, W / 2, H / 2 - 20);
            }
        }

        function dibujarInicial() {
            reiniciar();
            estado = ESTADO.LISTO;
            nivel = 0;
            dibujar();
        }

        /* ── Controles ── */
        function pantallaVisible() {
            return !!pantalla && pantalla.style.display !== 'none';
        }

        window.addEventListener('keydown', function(e) {
            if (!pantallaVisible()) return;
            if (e.code !== 'Space' && e.code !== 'Enter') return;
            e.preventDefault();
            if (estado === ESTADO.LISTO) { iniciar(); return; }
            golpear();
        });

        if (btnGolpear) {
            btnGolpear.addEventListener('click', function() {
                if (estado === ESTADO.LISTO) { iniciar(); return; }
                golpear();
            });
        }
        canvas.addEventListener('pointerdown', function(e) {
            e.preventDefault();
            if (estado === ESTADO.LISTO) { iniciar(); return; }
            golpear();
        });

        if (btnReintentar) btnReintentar.addEventListener('click', iniciar);
        if (soundToggle) {
            soundToggle.addEventListener('click', function() {
                SoundFX.enabled = !SoundFX.enabled;
                soundToggle.textContent = SoundFX.enabled ? '🔊' : '🔇';
            });
        }

        /* ── Fin de partida → guardar puntaje ── */
        function mostrarGameOver() {
            if (goPuntaje) goPuntaje.textContent = String(puntajeTotal);

            if (!sesion) {
                if (goMensajeSesion) {
                    goMensajeSesion.style.display = 'block';
                    goMensajeSesion.textContent = '🔒 Inicia sesión en tu Perfil para guardar tus puntos y salir en la tabla.';
                }
                if (goPuntosGanados) goPuntosGanados.parentElement.style.display = 'none';
                if (gameOverPanel) gameOverPanel.style.display = 'flex';
                return;
            }
            if (goMensajeSesion) goMensajeSesion.style.display = 'none';
            if (goPuntosGanados) goPuntosGanados.parentElement.style.display = 'flex';

            DataStore.registrarPartidaArcade(sesion.id, JUEGO_ID, puntajeTotal).then(function(res) {
                if (!res || !res.ok) {
                    if (goPuntosGanados) goPuntosGanados.textContent = '0';
                    if (goMultiplicador) goMultiplicador.textContent = '—';
                    if (goIntentosHoy) goIntentosHoy.textContent = '—';
                    return;
                }
                if (goPuntosGanados) goPuntosGanados.textContent = '+' + res.puntos_ganados;
                if (goMultiplicador) goMultiplicador.textContent = 'x' + Number(res.multiplicador).toFixed(2);
                if (goIntentosHoy) goIntentosHoy.textContent = String(res.intentos_hoy);
                actualizarPuntosGlobales(res.puntos_totales);
                cargarLeaderboard();
            });

            if (gameOverPanel) gameOverPanel.style.display = 'flex';
        }

        function actualizarPuntosGlobales(total) {
            if (window.ArcadeUI && typeof window.ArcadeUI.actualizarPuntos === 'function') {
                window.ArcadeUI.actualizarPuntos(total);
            } else {
                var el = document.getElementById('arcadePuntosTotales');
                if (el) el.textContent = String(total);
            }
        }

        async function cargarLeaderboard() {
            if (!leaderboardBody) return;
            var top = await DataStore.obtenerLeaderboardArcade(JUEGO_ID, 5);
            if (!top || top.length === 0) {
                leaderboardBody.innerHTML = '<tr class="empty-row"><td colspan="3">Todavía nadie ha jugado. ¡Sé el primero!</td></tr>';
                return;
            }
            leaderboardBody.innerHTML = top.map(function(row, i) {
                var esYo = sesion && row.usuario_id === sesion.id;
                return '<tr class="' + (esYo ? 'fila-propia' : '') + '">' +
                    '<td class="col-num">' + (i + 1) + '</td>' +
                    '<td class="col-user">@' + escapeHtml(row.username) + (esYo ? ' (tú)' : '') + '</td>' +
                    '<td class="col-score">' + row.puntaje + '</td>' +
                    '</tr>';
            }).join('');
        }

        function escapeHtml(str) {
            var div = document.createElement('div');
            div.textContent = str == null ? '' : String(str);
            return div.innerHTML;
        }

        /* ── Puente con el lobby ── */
        window.ArcadeGames = window.ArcadeGames || {};
        window.ArcadeGames.boxeo_sabado = {
            mostrar: function() {
                if (rafId) cancelAnimationFrame(rafId);
                dibujarInicial();
                if (startOverlay) startOverlay.style.display = 'flex';
                if (gameOverPanel) gameOverPanel.style.display = 'none';
            },
            ocultar: function() {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = null;
                estado = ESTADO.LISTO;
            }
        };

        dibujarInicial();
        cargarLeaderboard();
    });
})();
