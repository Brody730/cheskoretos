/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - ARCADE: "SNAKE DEL PARQUE"
 * ═══════════════════════════════════════════
 * Snake clásico en grilla, mismo patrón que js/arcade.js (Flappy
 * Chesko): estados listo/jugando/gameover, envío de puntaje a la RPC
 * genérica registrar_partida_arcade (con juego='snake_parque'),
 * leaderboard propio y el mismo puente window.ArcadeGames que usa
 * js/arcade-lobby.js para mostrar/ocultar esta pantalla.
 *
 * Controles: flechas/WASD o el D-pad propio de esta pantalla
 * (clase .snake-dpad-btn — a propósito NO usa .dpad-btn para no
 * mezclarse con el D-pad del lobby, que busca esa clase en todo el
 * documento).
 */
(function() {
    'use strict';

    var JUEGO_ID = 'snake_parque';

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
        comer: function() { this._beep(660, 0.08, 'square', 0.07); this._beep(880, 0.07, 'square', 0.06); },
        crash: function() {
            if (!this.enabled || !this.ctx) return;
            var t = this.ctx.currentTime;
            var osc = this.ctx.createOscillator();
            var gain = this.ctx.createGain();
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, t);
            osc.frequency.exponentialRampToValueAtTime(35, t + 0.35);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            osc.start(t); osc.stop(t + 0.4);
        }
    };

    document.addEventListener('DOMContentLoaded', function() {
        var canvas = document.getElementById('snakeCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var CELL = 8;
        var COLS = Math.floor(canvas.width / CELL);
        var ROWS = Math.floor(canvas.height / CELL);

        var pantalla        = document.getElementById('snakeGameScreen');
        var startOverlay    = document.getElementById('snakeStartOverlay');
        var gameOverPanel   = document.getElementById('snakeGameOverPanel');
        var hudScore        = document.getElementById('snakeHudScore');
        var goPuntaje       = document.getElementById('snakeGoPuntaje');
        var goPuntosGanados = document.getElementById('snakeGoPuntosGanados');
        var goMultiplicador = document.getElementById('snakeGoMultiplicador');
        var goIntentosHoy   = document.getElementById('snakeGoIntentosHoy');
        var goMensajeSesion = document.getElementById('snakeGoMensajeSesion');
        var btnReintentar   = document.getElementById('snakeBtnReintentar');
        var soundToggle     = document.getElementById('snakeSoundToggle');
        var leaderboardBody = document.getElementById('snakeLeaderboardBody');

        var sesion = getSesion();

        var ESTADO = { LISTO: 'listo', JUGANDO: 'jugando', GAMEOVER: 'gameover' };
        var estado = ESTADO.LISTO;

        var snake, dir, dirSiguiente, comida, puntaje, tickAcc, tickIntervalo;
        var TICK_INICIAL = 0.16, TICK_MINIMO = 0.075;
        var rafId = null, lastTime = 0;

        function celdaLibre(x, y) {
            return !snake.some(function(s) { return s.x === x && s.y === y; });
        }

        function colocarComida() {
            var libres = [];
            for (var x = 0; x < COLS; x++) {
                for (var y = 0; y < ROWS; y++) {
                    if (celdaLibre(x, y)) libres.push({ x: x, y: y });
                }
            }
            comida = libres.length ? libres[Math.floor(Math.random() * libres.length)] : { x: 0, y: 0 };
        }

        function reiniciar() {
            var cx = Math.floor(COLS / 2), cy = Math.floor(ROWS / 2);
            snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
            dir = { x: 1, y: 0 };
            dirSiguiente = { x: 1, y: 0 };
            puntaje = 0;
            tickAcc = 0;
            tickIntervalo = TICK_INICIAL;
            colocarComida();
            actualizarHud();
        }

        function actualizarHud() {
            if (hudScore) hudScore.textContent = String(puntaje);
        }

        function cambiarDireccion(nx, ny) {
            /* no permitir invertir directo sobre el propio cuerpo */
            if (nx === -dir.x && ny === -dir.y) return;
            dirSiguiente = { x: nx, y: ny };
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

            tickAcc += dt;
            if (tickAcc >= tickIntervalo) {
                tickAcc = 0;
                paso();
            }
            dibujar();

            if (estado === ESTADO.JUGANDO) rafId = requestAnimationFrame(loop);
        }

        function paso() {
            dir = dirSiguiente;
            var cabeza = snake[0];
            var nueva = { x: cabeza.x + dir.x, y: cabeza.y + dir.y };

            var chocaMuro = nueva.x < 0 || nueva.x >= COLS || nueva.y < 0 || nueva.y >= ROWS;
            var chocaCuerpo = snake.some(function(s, i) { return i < snake.length - 1 && s.x === nueva.x && s.y === nueva.y; });
            if (chocaMuro || chocaCuerpo) return terminar();

            snake.unshift(nueva);

            if (nueva.x === comida.x && nueva.y === comida.y) {
                puntaje++;
                actualizarHud();
                SoundFX.comer();
                tickIntervalo = Math.max(TICK_MINIMO, TICK_INICIAL - puntaje * 0.004);
                colocarComida();
            } else {
                snake.pop();
            }
        }

        function terminar() {
            if (estado !== ESTADO.JUGANDO) return;
            estado = ESTADO.GAMEOVER;
            SoundFX.crash();
            if (rafId) cancelAnimationFrame(rafId);
            mostrarGameOver();
        }

        function dibujar() {
            ctx.fillStyle = '#0d1f0d';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = 'rgba(255,255,255,0.04)';
            for (var gx = 0; gx <= COLS; gx++) {
                ctx.beginPath(); ctx.moveTo(gx * CELL, 0); ctx.lineTo(gx * CELL, canvas.height); ctx.stroke();
            }
            for (var gy = 0; gy <= ROWS; gy++) {
                ctx.beginPath(); ctx.moveTo(0, gy * CELL); ctx.lineTo(canvas.width, gy * CELL); ctx.stroke();
            }

            ctx.fillStyle = '#FF6600';
            ctx.fillRect(comida.x * CELL + 1, comida.y * CELL + 1, CELL - 2, CELL - 2);

            snake.forEach(function(s, i) {
                ctx.fillStyle = i === 0 ? '#FFCC00' : '#39c46a';
                ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
            });
        }

        function dibujarInicial() {
            reiniciar();
            dibujar();
        }

        /* ── Controles: flechas/WASD + D-pad propio ── */
        var MAPA_TECLAS = {
            ArrowUp: [0, -1], KeyW: [0, -1],
            ArrowDown: [0, 1], KeyS: [0, 1],
            ArrowLeft: [-1, 0], KeyA: [-1, 0],
            ArrowRight: [1, 0], KeyD: [1, 0]
        };

        function pantallaVisible() {
            return !!pantalla && pantalla.style.display !== 'none';
        }

        window.addEventListener('keydown', function(e) {
            if (!pantallaVisible()) return;
            if (estado === ESTADO.LISTO && MAPA_TECLAS[e.code]) { e.preventDefault(); iniciar(); return; }
            var d = MAPA_TECLAS[e.code];
            if (d) { e.preventDefault(); cambiarDireccion(d[0], d[1]); }
        });

        canvas.addEventListener('pointerdown', function(e) {
            e.preventDefault();
            if (estado === ESTADO.LISTO) iniciar();
        });

        document.querySelectorAll('.snake-dpad-btn').forEach(function(btn) {
            var dir2 = btn.getAttribute('data-dir');
            var vec = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir2];
            btn.addEventListener('click', function() {
                if (estado === ESTADO.LISTO) { iniciar(); return; }
                if (vec) cambiarDireccion(vec[0], vec[1]);
            });
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
            if (goPuntaje) goPuntaje.textContent = String(puntaje);

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

            DataStore.registrarPartidaArcade(sesion.id, JUEGO_ID, puntaje).then(function(res) {
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
            /* El saldo de puntos es compartido por todos los juegos
               (ver sql/arcade-schema.sql); js/arcade.js expone este
               puente para refrescar el HUD "MIS PUNTOS" y el catálogo
               de recompensas sin duplicar esa lógica aquí. */
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
        window.ArcadeGames.snake_parque = {
            mostrar: function() {
                if (rafId) cancelAnimationFrame(rafId);
                estado = ESTADO.LISTO;
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
