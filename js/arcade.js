/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - ARCADE DE PUNTOS: "FLAPPY CHESKO"
 * ═══════════════════════════════════════════
 * Minijuego retro (estilo 8/16 bits) de un solo botón: tocar/clic o
 * barra espaciadora para "aletear" y esquivar obstáculos. Cada
 * obstáculo esquivado suma 1 al puntaje; el puntaje se manda al
 * terminar la partida a la RPC registrar_partida_arcade (ver
 * sql/arcade-schema.sql), que calcula cuántos PUNTOS (moneda
 * canjeable) se otorgan según un multiplicador que baja mientras más
 * veces se juega el mismo día — el puntaje competitivo (leaderboard)
 * siempre se guarda completo, solo la conversión a puntos decrece.
 *
 * Solo funciona con sesión iniciada (localStorage['chesko_session'],
 * la misma que usa perfil.html) para poder guardar el puntaje y
 * otorgar puntos; sin sesión se puede jugar igual mostrando el
 * puntaje, pero no se guarda ni cuenta para el leaderboard.
 *
 * Requiere en el HTML: js/config.js y js/data.js cargados antes que
 * este archivo (para AppConfig/DataStore), y el SDK de Supabase.
 */
(function() {
    'use strict';

    /* ═══════════════════════════════════════════
       CATÁLOGO DE RECOMPENSAS
       (vive solo en el frontend, igual que window.CHALLENGES en
       challenges.js; la RPC de canje solo valida el costo que se le
       manda, no conoce el catálogo)
       ═══════════════════════════════════════════ */
    var ARCADE_REWARDS = [
        { id: 'sabritas_gratis',       nombre: 'Sabritas Gratis',          emoji: '🥔', costo: 120 },
        { id: 'chesko_gratis',         nombre: 'Chesko Gratis',            emoji: '🥤', costo: 200 },
        { id: 'combo_chesko_sabritas', nombre: 'Combo Chesko + Sabritas',  emoji: '🎉', costo: 300 }
    ];
    window.ARCADE_REWARDS = ARCADE_REWARDS;

    var JUEGO_ID = 'flappy_chesko';

    function getSesion() {
        try {
            var s = JSON.parse(localStorage.getItem('chesko_session'));
            return (s && s.id) ? s : null;
        } catch (_) { return null; }
    }

    /* ═══════════════════════════════════════════
       SONIDO CHIPTUNE (Web Audio, sin archivos de audio)
       ═══════════════════════════════════════════ */
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
            gain.gain.setValueAtTime(vol || 0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
            osc.start(t); osc.stop(t + dur);
        },
        flap:  function() { this._beep(520, 0.08, 'square', 0.06); },
        point: function() { this._beep(880, 0.12, 'square', 0.08); },
        crash: function() {
            if (!this.enabled || !this.ctx) return;
            var t = this.ctx.currentTime;
            var osc = this.ctx.createOscillator();
            var gain = this.ctx.createGain();
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, t);
            osc.frequency.exponentialRampToValueAtTime(40, t + 0.4);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
            osc.start(t); osc.stop(t + 0.45);
        }
    };

    document.addEventListener('DOMContentLoaded', function() {
        var canvas = document.getElementById('arcadeCanvas');
        if (!canvas) return; /* esta página no tiene el juego (no debería pasar en arcade.html) */
        var ctx = canvas.getContext('2d');

        /* ── Resolución lógica baja a propósito (look retro de bloques);
           el CSS la escala hacia arriba con image-rendering:pixelated ── */
        var W = canvas.width;   /* 128 */
        var H = canvas.height;  /* 224 */

        var startOverlay   = document.getElementById('arcadeStartOverlay');
        var gameOverPanel  = document.getElementById('arcadeGameOverPanel');
        var loginBanner    = document.getElementById('arcadeLoginBanner');
        var hudScore       = document.getElementById('hudScoreActual');
        var hudPuntos      = document.getElementById('arcadePuntosTotales');
        var goPuntaje      = document.getElementById('goPuntaje');
        var goPuntosGanados = document.getElementById('goPuntosGanados');
        var goMultiplicador = document.getElementById('goMultiplicador');
        var goIntentosHoy   = document.getElementById('goIntentosHoy');
        var goMensajeSesion = document.getElementById('goMensajeSesion');
        var btnReintentar   = document.getElementById('btnReintentar');
        var soundToggle     = document.getElementById('soundToggleArcade');
        var leaderboardBody = document.getElementById('arcadeLeaderboardBody');
        var rewardsGrid      = document.getElementById('arcadeRewardsGrid');
        var canjeModal       = document.getElementById('arcadeCanjeModal');
        var canjeMensaje     = document.getElementById('canjeMensaje');
        var btnCerrarCanje   = document.getElementById('btnCerrarCanjeArcade');

        var sesion = getSesion();
        var puntosActuales = 0;

        /* ═══════════════════════════════════════════
           ESTADO DEL JUEGO
           ═══════════════════════════════════════════ */
        var ESTADO = { LISTO: 'listo', JUGANDO: 'jugando', GAMEOVER: 'gameover' };
        var estado = ESTADO.LISTO;

        var BIRD_X = Math.round(W * 0.28);
        var BIRD_SIZE = 8;
        var GRAVEDAD = 420;        /* px/s² en coordenadas lógicas */
        var IMPULSO_ALETEO = -145; /* px/s */
        var VEL_MAX_CAIDA = 220;

        var bird = { y: H / 2, vy: 0, rot: 0 };
        var obstaculos = [];   /* { x, gapY, gapH, contado } */
        var puntaje = 0;
        var velocidadBase = 62;   /* px/s, sube un poco con el puntaje */
        var espacioEntreObstaculos = 62; /* px lógicos entre obstáculos */
        var distanciaProxObstaculo = 0;
        var lastTime = 0;
        var rafId = null;

        function anchoGap() {
            /* El hueco se va cerrando poco a poco hasta un mínimo jugable */
            return Math.max(46, 68 - puntaje * 1.1);
        }
        function velocidadActual() {
            return Math.min(120, velocidadBase + puntaje * 2.2);
        }

        function reiniciarJuego() {
            bird.y = H / 2; bird.vy = 0; bird.rot = 0;
            obstaculos = [];
            puntaje = 0;
            distanciaProxObstaculo = 40;
            actualizarHudScore();
        }

        function actualizarHudScore() {
            if (hudScore) hudScore.textContent = String(puntaje);
        }

        function aletear() {
            if (estado === ESTADO.LISTO) {
                iniciarJuego();
                return;
            }
            if (estado === ESTADO.GAMEOVER) {
                return; /* usa el botón "Reintentar", para no reiniciar por accidente */
            }
            SoundFX.init();
            SoundFX.flap();
            bird.vy = IMPULSO_ALETEO;
        }

        function iniciarJuego() {
            SoundFX.init();
            reiniciarJuego();
            estado = ESTADO.JUGANDO;
            if (startOverlay) startOverlay.style.display = 'none';
            if (gameOverPanel) gameOverPanel.style.display = 'none';
            bird.vy = IMPULSO_ALETEO;
            SoundFX.flap();
            lastTime = performance.now();
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(loop);
        }

        function spawnObstaculo() {
            var gapH = anchoGap();
            var margen = 18;
            var gapY = margen + Math.random() * (H - margen * 2 - gapH);
            obstaculos.push({ x: W + 10, gapY: gapY, gapH: gapH, contado: false });
        }

        function loop(now) {
            var dt = Math.min(0.033, (now - lastTime) / 1000);
            lastTime = now;

            actualizar(dt);
            dibujar();

            if (estado === ESTADO.JUGANDO) {
                rafId = requestAnimationFrame(loop);
            }
        }

        function actualizar(dt) {
            if (estado !== ESTADO.JUGANDO) return;

            bird.vy = Math.min(VEL_MAX_CAIDA, bird.vy + GRAVEDAD * dt);
            bird.y += bird.vy * dt;
            bird.rot = Math.max(-0.5, Math.min(1.1, bird.vy / 260));

            var v = velocidadActual();

            distanciaProxObstaculo -= v * dt;
            if (distanciaProxObstaculo <= 0) {
                spawnObstaculo();
                distanciaProxObstaculo = espacioEntreObstaculos + Math.random() * 20;
            }

            for (var i = obstaculos.length - 1; i >= 0; i--) {
                var o = obstaculos[i];
                o.x -= v * dt;

                if (!o.contado && o.x + 10 < BIRD_X) {
                    o.contado = true;
                    puntaje++;
                    actualizarHudScore();
                    SoundFX.point();
                }

                if (o.x < -14) obstaculos.splice(i, 1);
            }

            /* Colisión con techo/piso */
            if (bird.y - BIRD_SIZE / 2 <= 0 || bird.y + BIRD_SIZE / 2 >= H) {
                return terminarPartida();
            }

            /* Colisión con obstáculos (AABB simple contra el hueco) */
            for (var j = 0; j < obstaculos.length; j++) {
                var ob = obstaculos[j];
                var dentroX = BIRD_X + BIRD_SIZE / 2 > ob.x - 9 && BIRD_X - BIRD_SIZE / 2 < ob.x + 9;
                if (!dentroX) continue;
                var dentroGap = bird.y - BIRD_SIZE / 2 > ob.gapY && bird.y + BIRD_SIZE / 2 < ob.gapY + ob.gapH;
                if (!dentroGap) {
                    return terminarPartida();
                }
            }
        }

        function terminarPartida() {
            if (estado !== ESTADO.JUGANDO) return;
            estado = ESTADO.GAMEOVER;
            SoundFX.crash();
            if (rafId) cancelAnimationFrame(rafId);
            mostrarPanelGameOver();
        }

        /* ═══════════════════════════════════════════
           DIBUJO (pixel-art simple con rectángulos, sin sprites externos)
           ═══════════════════════════════════════════ */
        var PALETA = {
            cielo1: '#1a0f08', cielo2: '#3a1f0a',
            pipe: '#FF6600', pipeBorde: '#000',
            pipeDetalle: '#FFCC00',
            pajaro: '#FFCC00', pajaroBorde: '#000', ala: '#FF6600'
        };

        function dibujar() {
            ctx.imageSmoothingEnabled = false;

            /* fondo degradado retro */
            var grad = ctx.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, PALETA.cielo1);
            grad.addColorStop(1, PALETA.cielo2);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            /* estrellitas fijas de fondo (decorativo, look retro) */
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            for (var s = 0; s < 14; s++) {
                var sx = (s * 37) % W;
                var sy = (s * 53) % H;
                ctx.fillRect(sx, sy, 1, 1);
            }

            /* obstáculos */
            obstaculos.forEach(function(o) {
                ctx.fillStyle = PALETA.pipe;
                ctx.strokeStyle = PALETA.pipeBorde;
                ctx.lineWidth = 1;
                /* tramo de arriba */
                ctx.fillRect(o.x - 9, 0, 18, o.gapY);
                ctx.strokeRect(o.x - 9, 0, 18, o.gapY);
                /* tramo de abajo */
                ctx.fillRect(o.x - 9, o.gapY + o.gapH, 18, H - (o.gapY + o.gapH));
                ctx.strokeRect(o.x - 9, o.gapY + o.gapH, 18, H - (o.gapY + o.gapH));
                /* detalle tipo "tapa de botella" en la punta de cada tramo */
                ctx.fillStyle = PALETA.pipeDetalle;
                ctx.fillRect(o.x - 11, o.gapY - 5, 22, 5);
                ctx.fillRect(o.x - 11, o.gapY + o.gapH, 22, 5);
                ctx.fillStyle = PALETA.pipe;
            });

            /* pájaro (Cheskin pixelado) */
            ctx.save();
            ctx.translate(BIRD_X, bird.y);
            ctx.rotate(bird.rot * 0.6);
            ctx.fillStyle = PALETA.pajaroBorde;
            ctx.fillRect(-BIRD_SIZE / 2 - 1, -BIRD_SIZE / 2 - 1, BIRD_SIZE + 2, BIRD_SIZE + 2);
            ctx.fillStyle = PALETA.pajaro;
            ctx.fillRect(-BIRD_SIZE / 2, -BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE);
            ctx.fillStyle = PALETA.ala;
            ctx.fillRect(-BIRD_SIZE / 2, -1, BIRD_SIZE / 2, 3);
            ctx.fillStyle = '#000';
            ctx.fillRect(BIRD_SIZE / 2 - 3, -BIRD_SIZE / 2 + 1, 2, 2); /* ojo */
            ctx.restore();
        }

        /* dibuja al menos un frame en 'listo' para que no se vea negro */
        function dibujarPantallaInicial() {
            reiniciarJuego();
            dibujar();
        }

        /* ═══════════════════════════════════════════
           CONTROLES
           ═══════════════════════════════════════════ */
        var gameScreenEl = document.getElementById('arcadeGameScreen');
        function estaVisibleEstaPantalla() {
            /* En arcade.html este juego vive dentro de #arcadeGameScreen,
               que el lobby oculta/muestra. Si no existe ese contenedor
               (ej. si algún día se usa este canvas suelto en otra
               página) se asume visible. Evita que la tecla ESPACIO del
               lobby dispare este juego mientras está escondido detrás. */
            return !gameScreenEl || gameScreenEl.style.display !== 'none';
        }

        canvas.addEventListener('pointerdown', function(e) { e.preventDefault(); aletear(); });
        window.addEventListener('keydown', function(e) {
            if (e.code === 'Space' && estaVisibleEstaPantalla()) { e.preventDefault(); aletear(); }
        });

        if (btnReintentar) {
            btnReintentar.addEventListener('click', function() { iniciarJuego(); });
        }
        if (soundToggle) {
            soundToggle.addEventListener('click', function() {
                SoundFX.enabled = !SoundFX.enabled;
                soundToggle.textContent = SoundFX.enabled ? '🔊' : '🔇';
            });
        }

        /* ═══════════════════════════════════════════
           FIN DE PARTIDA → guardar puntaje + refrescar UI
           ═══════════════════════════════════════════ */
        function mostrarPanelGameOver() {
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
                puntosActuales = res.puntos_totales;
                actualizarHudPuntos();
                actualizarEstadoRecompensas();
                cargarLeaderboard();
            });

            if (gameOverPanel) gameOverPanel.style.display = 'flex';
        }

        /* ═══════════════════════════════════════════
           HUD de puntos + banner de sesión
           ═══════════════════════════════════════════ */
        function actualizarHudPuntos() {
            if (hudPuntos) hudPuntos.textContent = String(puntosActuales);
        }

        async function cargarSaldoInicial() {
            if (!sesion) {
                if (loginBanner) loginBanner.style.display = 'flex';
                return;
            }
            if (loginBanner) loginBanner.style.display = 'none';
            var lealtad = await DataStore.obtenerLealtad(sesion.id);
            puntosActuales = (lealtad && lealtad.puntos_arcade) || 0;
            actualizarHudPuntos();
            actualizarEstadoRecompensas();
        }

        /* ═══════════════════════════════════════════
           LEADERBOARD
           ═══════════════════════════════════════════ */
        async function cargarLeaderboard() {
            if (!leaderboardBody) return;
            var top = await DataStore.obtenerLeaderboardArcade(JUEGO_ID, 10);
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

        /* ═══════════════════════════════════════════
           CATÁLOGO DE RECOMPENSAS
           ═══════════════════════════════════════════ */
        function renderRecompensas() {
            if (!rewardsGrid) return;
            rewardsGrid.innerHTML = ARCADE_REWARDS.map(function(r) {
                return '' +
                    '<div class="arcade-reward-card" data-reward="' + r.id + '" data-costo="' + r.costo + '">' +
                        '<div class="arcade-reward-emoji">' + r.emoji + '</div>' +
                        '<div class="arcade-reward-nombre">' + r.nombre + '</div>' +
                        '<div class="arcade-reward-costo">' + r.costo + ' pts</div>' +
                        '<button type="button" class="arcade-reward-btn" data-reward-btn="' + r.id + '">Canjear</button>' +
                    '</div>';
            }).join('');
            actualizarEstadoRecompensas();
        }

        function actualizarEstadoRecompensas() {
            if (!rewardsGrid) return;
            rewardsGrid.querySelectorAll('.arcade-reward-card').forEach(function(card) {
                var costo = Number(card.getAttribute('data-costo'));
                var btn = card.querySelector('[data-reward-btn]');
                var alcanza = !!sesion && puntosActuales >= costo;
                card.classList.toggle('bloqueada', !alcanza);
                if (btn) {
                    btn.disabled = !alcanza;
                    btn.textContent = !sesion ? 'Inicia sesión' : (alcanza ? 'Canjear' : 'Te faltan ' + (costo - puntosActuales));
                }
            });
        }

        if (rewardsGrid) {
            rewardsGrid.addEventListener('click', function(e) {
                var btn = e.target.closest('[data-reward-btn]');
                if (!btn || btn.disabled) return;
                var card = btn.closest('.arcade-reward-card');
                var id = card.getAttribute('data-reward');
                var costo = Number(card.getAttribute('data-costo'));
                canjear(id, costo);
            });
        }

        async function canjear(recompensaId, costo) {
            if (!sesion) return;
            var reward = ARCADE_REWARDS.filter(function(r) { return r.id === recompensaId; })[0];
            var res = await DataStore.canjearRecompensaArcade(sesion.id, recompensaId, costo);
            if (!res || !res.ok) {
                mostrarModalCanje((res && res.mensaje) || 'No se pudo canjear. Intenta de nuevo.', false);
                return;
            }
            puntosActuales = res.puntos_totales;
            actualizarHudPuntos();
            actualizarEstadoRecompensas();
            mostrarModalCanje('✅ ¡' + (reward ? reward.nombre : 'Recompensa') + ' canjeada! Muestra esta pantalla en el puesto.', true);
        }

        function mostrarModalCanje(mensaje, exito) {
            if (!canjeModal) return;
            if (canjeMensaje) canjeMensaje.textContent = mensaje;
            canjeModal.classList.toggle('exito', !!exito);
            canjeModal.classList.add('open');
        }
        if (btnCerrarCanje) {
            btnCerrarCanje.addEventListener('click', function() {
                canjeModal.classList.remove('open');
            });
        }

        /* ═══════════════════════════════════════════
           PUENTE CON EL LOBBY (js/arcade-lobby.js)
           ═══════════════════════════════════════════
           El lobby controla cuál de las dos pantallas (sala o juego)
           está visible; solo necesita poder decirle a este juego
           "te toca, arranca en cero" y "ya no eres visible, párate". */
        window.ArcadeGames = window.ArcadeGames || {};
        window.ArcadeGames.flappy_chesko = {
            mostrar: function() {
                if (rafId) cancelAnimationFrame(rafId);
                estado = ESTADO.LISTO;
                reiniciarJuego();
                dibujar();
                if (startOverlay) startOverlay.style.display = 'flex';
                if (gameOverPanel) gameOverPanel.style.display = 'none';
            },
            ocultar: function() {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = null;
                estado = ESTADO.LISTO;
            }
        };

        /* ═══════════════════════════════════════════
           ARRANQUE
           ═══════════════════════════════════════════ */
        dibujarPantallaInicial();
        renderRecompensas();
        cargarSaldoInicial();
        cargarLeaderboard();
    });
})();
