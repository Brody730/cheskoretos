/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - LOBBY DEL ARCADE (sala top-down)
 * ═══════════════════════════════════════════
 * Un pasillo de arcade visto desde arriba (estilo Pac-Man) con una
 * cámara que sigue al avatar: los gabinetes están alineados en una
 * sola fila contra la pared de arriba, uno por juego, y el jugador
 * camina por el piso de abajo para acercarse al que quiera jugar.
 *
 * Al acercarse a un gabinete "disponible" y presionar ENTER/A, se
 * oculta el lobby y se muestra la pantalla del juego correspondiente
 * (ver window.ArcadeGames en js/arcade.js). Los gabinetes marcados
 * `disponible:false` solo muestran un aviso de "próximamente".
 *
 * Este archivo es dueño de la transición entre las dos pantallas de
 * arcade.html (#arcadeLobbyScreen / #arcadeGameScreen); js/arcade.js
 * no sabe nada del lobby, solo expone mostrar()/ocultar().
 *
 * Requiere que #lobbyCanvas exista en el HTML (arcade.html). No toca
 * Supabase ni sesión — es puramente de navegación/UI.
 */
(function() {
    'use strict';

    /* ═══════════════════════════════════════════
       CATÁLOGO DE MÁQUINAS
       1 disponible (Flappy Chesko) + 10 "próximamente". El id debe
       coincidir con la clave usada en window.ArcadeGames (js/arcade.js)
       para las que sí estén implementadas.
       ═══════════════════════════════════════════ */
    var ARCADE_MACHINES = [
        { id: 'flappy_chesko',   nombre: 'FLAPPY CHESKO',    emoji: '🐦', disponible: true  },
        { id: 'cruza_calle',     nombre: 'CRUZA LA CALLE',   emoji: '🚗', disponible: false },
        { id: 'chesko_runner',   nombre: 'CHESKO RUNNER',    emoji: '🏃', disponible: false },
        { id: 'chesko_invaders', nombre: 'CHESKO INVADERS',  emoji: '👾', disponible: false },
        { id: 'tetrisko',        nombre: 'TETRISKO',         emoji: '🧱', disponible: false },
        { id: 'snake_parque',    nombre: 'SNAKE DEL PARQUE', emoji: '🐍', disponible: false },
        { id: 'rompe_vasos',     nombre: 'ROMPE VASOS',      emoji: '🥤', disponible: false },
        { id: 'memoria_extrema', nombre: 'MEMORIA EXTREMA',  emoji: '🧠', disponible: false },
        { id: 'ruleta_rush',     nombre: 'RULETA RUSH',      emoji: '🎡', disponible: false },
        { id: 'puzzle_koreto',   nombre: 'PUZZLE KORETO',    emoji: '🧩', disponible: false },
        { id: 'boxeo_sabado',    nombre: 'BOXEO DE SÁBADO',  emoji: '🥊', disponible: false }
    ];
    window.ARCADE_MACHINES = ARCADE_MACHINES;

    /* ═══════════════════════════════════════════
       SONIDO (blips simples, sin archivos de audio)
       ═══════════════════════════════════════════ */
    var Blip = {
        ctx: null,
        init: function() {
            if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (this.ctx.state === 'suspended') this.ctx.resume();
        },
        tono: function(freq, dur) {
            if (!this.ctx) return;
            var t = this.ctx.currentTime;
            var osc = this.ctx.createOscillator();
            var gain = this.ctx.createGain();
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
            osc.start(t); osc.stop(t + dur);
        },
        entrar:    function() { this.tono(660, 0.12); this.tono(990, 0.1); },
        bloqueado: function() { this.tono(160, 0.15); }
    };

    document.addEventListener('DOMContentLoaded', function() {
        var canvas = document.getElementById('lobbyCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var VIEW_W = canvas.width;   /* 176 — ventana visible (viewport) */
        var H = canvas.height;       /* 220 — el pasillo no hace scroll vertical */

        var lobbyScreen = document.getElementById('arcadeLobbyScreen');
        var gameScreen  = document.getElementById('arcadeGameScreen');
        var btnVolver   = document.getElementById('btnVolverArcade');
        var btnA        = document.getElementById('btnArcadeA');

        /* ═══════════════════════════════════════════
           LAYOUT: pasillo ancho con una sola fila de
           gabinetes contra la pared de arriba; la cámara
           sigue al avatar en X (el mundo es más ancho que
           el canvas visible).
           ═══════════════════════════════════════════ */
        var MURO = 10;
        var CAB_W = 34, CAB_H = 26, GAP = 18;
        var MARGEN_MUNDO = 24;

        var WORLD_W = MARGEN_MUNDO * 2 + ARCADE_MACHINES.length * CAB_W + (ARCADE_MACHINES.length - 1) * GAP;

        var gabinetes = ARCADE_MACHINES.map(function(maquina, i) {
            var x = MARGEN_MUNDO + i * (CAB_W + GAP);
            var y = MURO + 8;
            return {
                def: maquina,
                x: x, y: y, w: CAB_W, h: CAB_H,
                /* zona de interacción: franja de piso justo debajo del gabinete */
                zonaX: x - 5, zonaY: y + CAB_H, zonaW: CAB_W + 10, zonaH: 22
            };
        });

        /* ═══════════════════════════════════════════
           AVATAR (arranca justo bajo Flappy Chesko, el
           único gabinete jugable ahorita)
           ═══════════════════════════════════════════ */
        var avatar = {
            x: gabinetes[0].x + gabinetes[0].w / 2,
            y: gabinetes[0].zonaY + gabinetes[0].zonaH + 26,
            r: 6,
            dirX: 0, dirY: -1,
            caminando: false,
            pasoT: 0
        };
        var VELOCIDAD = 62; /* px/s, mundo */

        var camaraX = 0;
        function actualizarCamara() {
            camaraX = avatar.x - VIEW_W / 2;
            camaraX = Math.max(0, Math.min(WORLD_W - VIEW_W, camaraX));
        }

        /* ═══════════════════════════════════════════
           ENTRADA: teclado + D-pad táctil
           ═══════════════════════════════════════════ */
        var teclas = { up: false, down: false, left: false, right: false };

        function lobbyVisible() {
            return !lobbyScreen || lobbyScreen.style.display !== 'none';
        }

        var MAPA_TECLAS = {
            ArrowUp: 'up', KeyW: 'up',
            ArrowDown: 'down', KeyS: 'down',
            ArrowLeft: 'left', KeyA: 'left',
            ArrowRight: 'right', KeyD: 'right'
        };

        window.addEventListener('keydown', function(e) {
            if (!lobbyVisible()) return;
            var dir = MAPA_TECLAS[e.code];
            if (dir) { teclas[dir] = true; e.preventDefault(); }
            if (e.code === 'Enter' || e.code === 'NumpadEnter') { e.preventDefault(); intentarEntrar(); }
        });
        window.addEventListener('keyup', function(e) {
            var dir = MAPA_TECLAS[e.code];
            if (dir) { teclas[dir] = false; }
        });
        /* si la pestaña pierde foco a medio movimiento, no se debe quedar "pegado" caminando */
        window.addEventListener('blur', function() {
            teclas.up = teclas.down = teclas.left = teclas.right = false;
        });

        /* D-pad táctil: mismo patrón pointerdown/up que el resto del sitio */
        document.querySelectorAll('.dpad-btn').forEach(function(btn) {
            var dir = btn.getAttribute('data-dir');
            var activar = function(e) { e.preventDefault(); teclas[dir] = true; };
            var desactivar = function() { teclas[dir] = false; };
            btn.addEventListener('pointerdown', activar);
            btn.addEventListener('pointerup', desactivar);
            btn.addEventListener('pointerleave', desactivar);
            btn.addEventListener('pointercancel', desactivar);
        });
        if (btnA) {
            btnA.addEventListener('click', function() { intentarEntrar(); });
        }

        /* ═══════════════════════════════════════════
           ACTUALIZAR / COLISIONES (todo en coordenadas de mundo)
           ═══════════════════════════════════════════ */
        function actualizarAvatar(dt) {
            var vx = (teclas.right ? 1 : 0) - (teclas.left ? 1 : 0);
            var vy = (teclas.down ? 1 : 0) - (teclas.up ? 1 : 0);

            avatar.caminando = vx !== 0 || vy !== 0;
            if (avatar.caminando) {
                var mag = Math.sqrt(vx * vx + vy * vy) || 1;
                vx /= mag; vy /= mag;
                avatar.dirX = vx; avatar.dirY = vy;
                avatar.pasoT += dt;
                moverConColision(vx * VELOCIDAD * dt, vy * VELOCIDAD * dt);
            }
            actualizarCamara();
        }

        function rectVsCirculo(rect, cx, cy, r) {
            var cercaX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
            var cercaY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
            var dx = cx - cercaX, dy = cy - cercaY;
            return (dx * dx + dy * dy) < (r * r);
        }

        function moverConColision(dx, dy) {
            /* Resolución de colisión separada por eje: intenta mover en X,
               si choca con un gabinete o pared revierte solo ese eje. */
            var nx = avatar.x + dx;
            if (nx - avatar.r >= MURO && nx + avatar.r <= WORLD_W - MURO &&
                !gabinetes.some(function(g) { return rectVsCirculo(g, nx, avatar.y, avatar.r); })) {
                avatar.x = nx;
            }
            var ny = avatar.y + dy;
            if (ny - avatar.r >= MURO && ny + avatar.r <= H - MURO &&
                !gabinetes.some(function(g) { return rectVsCirculo(g, avatar.x, ny, avatar.r); })) {
                avatar.y = ny;
            }
        }

        function gabineteCercano() {
            var mejor = null, mejorDist = Infinity;
            gabinetes.forEach(function(g) {
                var cx = g.zonaX + g.zonaW / 2, cy = g.zonaY + g.zonaH / 2;
                var dx = avatar.x - cx, dy = avatar.y - cy;
                var dist = Math.sqrt(dx * dx + dy * dy);
                var dentro = avatar.x >= g.zonaX - 4 && avatar.x <= g.zonaX + g.zonaW + 4 &&
                             avatar.y >= g.zonaY - 6 && avatar.y <= g.zonaY + g.zonaH + 12;
                if (dentro && dist < mejorDist) { mejor = g; mejorDist = dist; }
            });
            return mejor;
        }

        /* ═══════════════════════════════════════════
           DIBUJO (todo se traduce por -camaraX para el efecto cámara)
           ═══════════════════════════════════════════ */
        function dibujarPiso() {
            ctx.fillStyle = '#161616';
            ctx.fillRect(camaraX, 0, VIEW_W, H);
            var tile = 11;
            var xInicio = Math.floor(camaraX / tile) * tile;
            for (var y = MURO; y < H - MURO; y += tile) {
                for (var x = xInicio; x < camaraX + VIEW_W; x += tile) {
                    var par = (Math.floor(x / tile) + Math.floor(y / tile)) % 2 === 0;
                    ctx.fillStyle = par ? '#1d1d1d' : '#181818';
                    ctx.fillRect(x, y, tile, tile);
                }
            }
            /* muros arriba/abajo (dentro del viewport actual) */
            ctx.fillStyle = '#000';
            ctx.fillRect(camaraX, 0, VIEW_W, MURO);
            ctx.fillRect(camaraX, H - MURO, VIEW_W, MURO);
            /* muros de los extremos del mundo, solo se dibujan si están a la vista */
            if (camaraX <= MURO) { ctx.fillRect(0, 0, MURO, H); }
            if (camaraX + VIEW_W >= WORLD_W - MURO) { ctx.fillRect(WORLD_W - MURO, 0, MURO, H); }
        }

        var tiempoGlobal = 0;

        function dibujarGabinete(g, esCercano) {
            var d = g.def;
            var pulso = 0.5 + 0.5 * Math.sin(tiempoGlobal * 3);

            ctx.fillStyle = d.disponible ? '#3a1a00' : '#1c1c1c';
            ctx.strokeStyle = d.disponible ? '#FF6600' : '#3a3a3a';
            ctx.lineWidth = 1;
            ctx.fillRect(g.x, g.y, g.w, g.h);
            ctx.strokeRect(g.x + 0.5, g.y + 0.5, g.w - 1, g.h - 1);

            var pantX = g.x + 4, pantY = g.y + 3, pantW = g.w - 8, pantH = g.h * 0.55;
            ctx.textAlign = 'center';
            if (d.disponible) {
                ctx.fillStyle = esCercano ? ('rgba(0,255,180,' + (0.55 + 0.35 * pulso) + ')') : '#00d68f';
                ctx.fillRect(pantX, pantY, pantW, pantH);
                ctx.font = '10px monospace';
                ctx.fillStyle = '#00120a';
                ctx.fillText(d.emoji, g.x + g.w / 2, pantY + pantH - 3);
            } else {
                ctx.fillStyle = '#0a0a0a';
                ctx.fillRect(pantX, pantY, pantW, pantH);
                ctx.font = '8px monospace';
                ctx.fillStyle = '#444';
                ctx.fillText('🔒', g.x + g.w / 2, pantY + pantH - 3);
            }

            ctx.font = '5px monospace';
            ctx.fillStyle = d.disponible ? '#FFCC00' : '#777';
            var nombreCorto = d.nombre.length > 13 ? d.nombre.slice(0, 12) + '…' : d.nombre;
            ctx.fillText(nombreCorto, g.x + g.w / 2, g.y + g.h - 3);

            if (!d.disponible) {
                ctx.save();
                ctx.translate(g.x + g.w / 2, g.y + g.h / 2);
                ctx.rotate(-0.35);
                ctx.fillStyle = 'rgba(255,204,0,0.85)';
                ctx.fillRect(-g.w / 2 - 3, -3, g.w + 6, 7);
                ctx.fillStyle = '#111';
                ctx.font = 'bold 5px monospace';
                ctx.fillText('PRONTO', 0, 2);
                ctx.restore();
            }
        }

        function dibujarPrompt(g) {
            var texto = g.def.disponible ? ('▲ ' + g.def.nombre) : '🔒 PRÓXIMAMENTE';
            var sub = g.def.disponible ? 'ENTER / A' : '';
            var cx = g.x + g.w / 2;
            var y = g.zonaY + g.zonaH + 10;

            ctx.font = '6px monospace';
            var anchoTexto = Math.max(ctx.measureText(texto).width, sub ? ctx.measureText(sub).width : 0) + 10;
            var boxX = Math.min(Math.max(cx - anchoTexto / 2, camaraX + MURO + 2), camaraX + VIEW_W - MURO - anchoTexto - 2);

            var alpha = 0.55 + 0.35 * Math.sin(tiempoGlobal * 5);
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(boxX, y - 9, anchoTexto, sub ? 20 : 12);
            ctx.strokeStyle = g.def.disponible ? ('rgba(255,204,0,' + alpha + ')') : 'rgba(150,150,150,0.7)';
            ctx.strokeRect(boxX, y - 9, anchoTexto, sub ? 20 : 12);

            ctx.textAlign = 'center';
            ctx.fillStyle = g.def.disponible ? '#FFCC00' : '#aaa';
            ctx.fillText(texto, boxX + anchoTexto / 2, y);
            if (sub) {
                ctx.fillStyle = '#fff';
                ctx.fillText(sub, boxX + anchoTexto / 2, y + 9);
            }
        }

        function dibujarAvatar() {
            var bounce = avatar.caminando ? Math.sin(avatar.pasoT * 10) * 1.5 : 0;
            ctx.save();
            ctx.translate(avatar.x, avatar.y + bounce);

            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(0, avatar.r + 1, avatar.r * 0.8, avatar.r * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(0, 0, avatar.r + 1, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#FFCC00';
            ctx.beginPath(); ctx.arc(0, 0, avatar.r, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#FF6600';
            ctx.beginPath();
            ctx.arc(avatar.dirX * avatar.r * 0.7, avatar.dirY * avatar.r * 0.7, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        /* pistas visuales de "hay más máquinas" en los bordes del viewport */
        /* Se dibuja DESPUÉS de ctx.restore(), o sea en espacio de
           pantalla normal (sin la traslación de cámara) — por eso usa
           coordenadas fijas del viewport (0..VIEW_W), no de mundo. */
        function dibujarIndicadoresScroll() {
            if (camaraX > 2) {
                ctx.fillStyle = 'rgba(255,204,0,0.65)';
                ctx.font = '10px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('◀', 2, H / 2);
            }
            if (camaraX + VIEW_W < WORLD_W - 2) {
                ctx.fillStyle = 'rgba(255,204,0,0.65)';
                ctx.font = '10px monospace';
                ctx.textAlign = 'right';
                ctx.fillText('▶', VIEW_W - 2, H / 2);
            }
        }

        function dibujarLobby() {
            ctx.clearRect(0, 0, VIEW_W, H);
            ctx.save();
            ctx.translate(-camaraX, 0);
            dibujarPiso();
            var cercano = gabineteCercano();
            gabinetes.forEach(function(g) { dibujarGabinete(g, g === cercano); });
            dibujarAvatar();
            if (cercano) dibujarPrompt(cercano);
            ctx.restore();
            dibujarIndicadoresScroll();
        }

        /* ═══════════════════════════════════════════
           ENTRAR A UNA MÁQUINA
           ═══════════════════════════════════════════ */
        function intentarEntrar() {
            if (!lobbyVisible()) return;
            var g = gabineteCercano();
            if (!g) return;

            Blip.init();
            if (!g.def.disponible) {
                Blip.bloqueado();
                mostrarAvisoProximamente(g.def.nombre);
                return;
            }

            var juego = window.ArcadeGames && window.ArcadeGames[g.def.id];
            if (!juego || typeof juego.mostrar !== 'function') {
                Blip.bloqueado();
                mostrarAvisoProximamente(g.def.nombre);
                return;
            }

            Blip.entrar();
            if (lobbyScreen) lobbyScreen.style.display = 'none';
            if (gameScreen) gameScreen.style.display = 'flex';
            teclas.up = teclas.down = teclas.left = teclas.right = false;
            juego.mostrar();
        }

        function volverAlLobby() {
            ARCADE_MACHINES.filter(function(m) { return m.disponible; }).forEach(function(m) {
                var juego = window.ArcadeGames && window.ArcadeGames[m.id];
                if (juego && typeof juego.ocultar === 'function') juego.ocultar();
            });
            if (gameScreen) gameScreen.style.display = 'none';
            if (lobbyScreen) lobbyScreen.style.display = 'flex';
        }
        if (btnVolver) btnVolver.addEventListener('click', volverAlLobby);

        /* Aviso simple de "próximamente" (toast flotante, no bloquea). */
        var avisoTimeoutId = null;
        function mostrarAvisoProximamente(nombre) {
            var toast = document.getElementById('arcadeProximamenteToast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'arcadeProximamenteToast';
                toast.className = 'arcade-proximamente-toast';
                document.body.appendChild(toast);
            }
            toast.textContent = '🚧 ' + nombre + ' — ¡muy pronto en el arcade!';
            toast.classList.add('visible');
            if (avisoTimeoutId) clearTimeout(avisoTimeoutId);
            avisoTimeoutId = setTimeout(function() { toast.classList.remove('visible'); }, 2200);
        }

        /* ═══════════════════════════════════════════
           LOOP
           ═══════════════════════════════════════════ */
        var lastTime = 0;
        function loop(now) {
            var dt = Math.min(0.033, (now - lastTime) / 1000);
            lastTime = now;
            tiempoGlobal += dt;

            if (lobbyVisible()) {
                actualizarAvatar(dt);
                dibujarLobby();
            }
            requestAnimationFrame(loop);
        }

        actualizarCamara();
        dibujarLobby();
        requestAnimationFrame(function(t) { lastTime = t; requestAnimationFrame(loop); });
    });
})();
