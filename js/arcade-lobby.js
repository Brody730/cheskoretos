/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - LOBBY DEL ARCADE (sala top-down)
 * ═══════════════════════════════════════════
 * Un pasillo de arcade visto desde arriba (estilo Pac-Man) con una
 * cámara que sigue al avatar: los gabinetes están agrupados en
 * secciones de ~4 contra la pared de arriba, separadas por zonas de
 * ambientación (mesas con sillas, estación de pizza, rincón de
 * curiosidades) para que el pasillo se sienta como un arcade real y
 * no un corredor vacío. El jugador camina por el piso de abajo para
 * acercarse al gabinete que quiera jugar.
 *
 * Al acercarse a un gabinete "disponible" y presionar ENTER/A, se
 * oculta el lobby y se muestra la pantalla del juego correspondiente
 * (ver window.ArcadeGames en js/arcade.js). Los gabinetes marcados
 * `disponible:false` solo muestran un aviso de "próximamente". Las
 * piezas de ambientación no son interactuables, solo estorban el paso
 * (hay que rodearlas) para que la sala se sienta viva.
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

        /* Coordenadas "de diseño" — TODA la lógica del juego (posición,
           colisiones, cámara) vive en este sistema fijo, sin importar
           la resolución real del canvas. ajustarResolucionCanvas()
           mapea este espacio a la resolución real de pantalla. */
        var VIEW_W = 176, H = 220;

        /* ═══════════════════════════════════════════
           RESOLUCIÓN REAL DEL CANVAS (evita el texto
           borroso: en vez de dibujar a 176x220 y estirar
           con CSS, el backing store del canvas se ajusta
           al tamaño real en pantalla × devicePixelRatio,
           y se usa setTransform para poder seguir
           programando todo en coordenadas 176x220).
           ═══════════════════════════════════════════ */
        function ajustarResolucionCanvas() {
            var rect = canvas.getBoundingClientRect();
            var dpr = Math.min(window.devicePixelRatio || 1, 3);
            var anchoReal = Math.max(1, Math.round((rect.width || VIEW_W) * dpr));
            var altoReal = Math.max(1, Math.round((rect.height || H) * dpr));
            if (canvas.width !== anchoReal) canvas.width = anchoReal;
            if (canvas.height !== altoReal) canvas.height = altoReal;
            var escala = canvas.width / VIEW_W;
            ctx.setTransform(escala, 0, 0, escala, 0, 0);
        }
        var resizeTimeoutId = null;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeoutId);
            resizeTimeoutId = setTimeout(ajustarResolucionCanvas, 150);
        });

        var lobbyScreen = document.getElementById('arcadeLobbyScreen');
        var gameScreen  = document.getElementById('arcadeGameScreen');
        var btnVolver   = document.getElementById('btnVolverArcade');
        var btnA        = document.getElementById('btnArcadeA');

        /* ═══════════════════════════════════════════
           LAYOUT: secciones de ~4 gabinetes separadas por
           zonas de ambientación (mesas, pizza, curiosidades)
           para que el pasillo se sienta lleno de vida. La
           cámara sigue al avatar en X.
           ═══════════════════════════════════════════ */
        var MURO = 10;
        var CAB_W = 34, CAB_H = 26;
        var GAP_CLUSTER = 10;    /* separación entre gabinetes de la misma sección */
        var DECOR_GAP_W = 92;    /* ancho de cada zona de ambientación entre secciones */
        var END_GAP_W = 74;      /* ancho del rincón de curiosidades al final */
        var MARGEN_MUNDO = 24;
        var SECCION_TAMANO = 4;
        var FURN_Y = 132; /* línea base donde se paran los muebles/decoración en el piso */

        var gabinetes = [];
        var decoraciones = [];
        var cursorX = MARGEN_MUNDO;
        var TIPOS_DECOR_CICLO = ['pizza', 'lounge'];
        var decorIdx = 0;

        function construirDecoracion(tipo, xIzquierda, anchoZona) {
            var coreW = tipo === 'lounge' ? 50 : 44;
            var coreH = tipo === 'curiosidades' ? 34 : 28;
            var x = xIzquierda + (anchoZona - coreW) / 2;
            return {
                tipo: tipo,
                x: x, y: FURN_Y, w: coreW, h: coreH,
                wallCX: xIzquierda + anchoZona / 2
            };
        }

        ARCADE_MACHINES.forEach(function(maquina, i) {
            var y = MURO + 8;
            gabinetes.push({
                def: maquina, x: cursorX, y: y, w: CAB_W, h: CAB_H,
                zonaX: cursorX - 5, zonaY: y + CAB_H, zonaW: CAB_W + 10, zonaH: 22,
                seccion: Math.floor(i / SECCION_TAMANO)
            });
            cursorX += CAB_W;

            var esUltimo = i === ARCADE_MACHINES.length - 1;
            var finDeSeccion = (i + 1) % SECCION_TAMANO === 0;

            if (!esUltimo) {
                if (finDeSeccion) {
                    var tipo = TIPOS_DECOR_CICLO[decorIdx % TIPOS_DECOR_CICLO.length];
                    decorIdx++;
                    decoraciones.push(construirDecoracion(tipo, cursorX, DECOR_GAP_W));
                    cursorX += DECOR_GAP_W;
                } else {
                    cursorX += GAP_CLUSTER;
                }
            }
        });

        /* Rincón de curiosidades: cierre del pasillo con máquina de
           peluches + repisa de trofeos + planta. */
        decoraciones.push(construirDecoracion('curiosidades', cursorX + 12, END_GAP_W));
        cursorX += END_GAP_W + 24;
        var WORLD_W = cursorX;
        var TOTAL_SECCIONES = Math.ceil(ARCADE_MACHINES.length / SECCION_TAMANO);

        var sSecciones = gabinetes.reduce(function(rangos, g) {
            var r = rangos[g.seccion] || { min: Infinity, max: -Infinity };
            r.min = Math.min(r.min, g.x);
            r.max = Math.max(r.max, g.x + g.w);
            rangos[g.seccion] = r;
            return rangos;
        }, {});
        var PALETAS_SECCION = [
            { a: '#1d1d1d', b: '#181818', muro: '#3a1a00' }, /* naranja tenue */
            { a: '#181d1d', b: '#141818', muro: '#001a1a' }, /* cian tenue */
            { a: '#1d181d', b: '#181418', muro: '#2a0a2a' }  /* morado tenue */
        ];
        function paletaEnX(x) {
            for (var s = 0; s < TOTAL_SECCIONES; s++) {
                var r = sSecciones[s];
                if (r && x >= r.min - DECOR_GAP_W / 2 && x <= r.max + DECOR_GAP_W / 2) {
                    return PALETAS_SECCION[s % PALETAS_SECCION.length];
                }
            }
            return PALETAS_SECCION[0];
        }

        var solidos = gabinetes.concat(decoraciones);

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
            /* Resolución de colisión separada por eje contra gabinetes
               Y decoración (mesas, puestos, curiosidades) — todo lo
               sólido vive en `solidos`. */
            var nx = avatar.x + dx;
            if (nx - avatar.r >= MURO && nx + avatar.r <= WORLD_W - MURO &&
                !solidos.some(function(s) { return rectVsCirculo(s, nx, avatar.y, avatar.r); })) {
                avatar.x = nx;
            }
            var ny = avatar.y + dy;
            if (ny - avatar.r >= MURO && ny + avatar.r <= H - MURO &&
                !solidos.some(function(s) { return rectVsCirculo(s, avatar.x, ny, avatar.r); })) {
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
            ctx.fillStyle = '#141414';
            ctx.fillRect(camaraX, 0, VIEW_W, H);
            var tile = 11;
            var xInicio = Math.floor(camaraX / tile) * tile;
            for (var y = MURO; y < H - MURO; y += tile) {
                for (var x = xInicio; x < camaraX + VIEW_W; x += tile) {
                    var pal = paletaEnX(x);
                    var par = (Math.floor(x / tile) + Math.floor(y / tile)) % 2 === 0;
                    ctx.fillStyle = par ? pal.a : pal.b;
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
                ctx.font = '11px monospace';
                ctx.fillStyle = '#00120a';
                ctx.fillText(d.emoji, g.x + g.w / 2, pantY + pantH - 3);
            } else {
                ctx.fillStyle = '#0a0a0a';
                ctx.fillRect(pantX, pantY, pantW, pantH);
                ctx.font = '9px monospace';
                ctx.fillStyle = '#444';
                ctx.fillText('🔒', g.x + g.w / 2, pantY + pantH - 3);
            }

            ctx.font = 'bold 6px monospace';
            ctx.fillStyle = d.disponible ? '#FFCC00' : '#888';
            var nombreCorto = d.nombre.length > 13 ? d.nombre.slice(0, 12) + '…' : d.nombre;
            ctx.fillText(nombreCorto, g.x + g.w / 2, g.y + g.h - 3);

            if (!d.disponible) {
                ctx.save();
                ctx.translate(g.x + g.w / 2, g.y + g.h / 2);
                ctx.rotate(-0.35);
                ctx.fillStyle = 'rgba(255,204,0,0.85)';
                ctx.fillRect(-g.w / 2 - 3, -3, g.w + 6, 7);
                ctx.fillStyle = '#111';
                ctx.font = 'bold 6px monospace';
                ctx.fillText('PRONTO', 0, 2);
                ctx.restore();
            }
        }

        /* ── Ambientación: mesas/sillas, estación de pizza, curiosidades ── */
        function dibujarPoster(cx, y) {
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(cx - 9, y, 18, 13);
            ctx.strokeStyle = '#555';
            ctx.strokeRect(cx - 9 + 0.5, y + 0.5, 17, 12);
            ctx.fillStyle = ['#FF6600', '#00CCFF', '#FF44CC'][Math.floor(cx) % 3];
            ctx.fillRect(cx - 6, y + 3, 12, 7);
        }

        function dibujarLounge(d) {
            dibujarPoster(d.wallCX, MURO + 4);
            /* mesa */
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(d.x + 8, d.y + 6, d.w - 16, d.h - 12);
            ctx.strokeStyle = '#3a2410';
            ctx.strokeRect(d.x + 8.5, d.y + 6.5, d.w - 17, d.h - 13);
            /* sillas alrededor */
            ctx.fillStyle = '#7a4a1a';
            var sillas = [
                [d.x - 2, d.y + d.h / 2 - 4],
                [d.x + d.w - 6, d.y + d.h / 2 - 4],
                [d.x + d.w / 2 - 4, d.y - 4],
                [d.x + d.w / 2 - 4, d.y + d.h + 2]
            ];
            sillas.forEach(function(s) { ctx.fillRect(s[0], s[1], 8, 8); });
        }

        function dibujarPizza(d) {
            dibujarPoster(d.wallCX, MURO + 4);
            /* mostrador */
            ctx.fillStyle = '#b02020';
            ctx.fillRect(d.x, d.y + d.h - 10, d.w, 10);
            ctx.fillStyle = '#fff';
            for (var i = 0; i < d.w; i += 8) { ctx.fillRect(d.x + i, d.y + d.h - 10, 4, 10); }
            /* pizza redonda encima */
            var pcx = d.x + d.w / 2, pcy = d.y + d.h - 16;
            ctx.fillStyle = '#e8b84b';
            ctx.beginPath(); ctx.arc(pcx, pcy, 9, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#c0392b';
            for (var a = 0; a < 6; a++) {
                var ang = (a / 6) * Math.PI * 2;
                ctx.beginPath();
                ctx.arc(pcx + Math.cos(ang) * 4, pcy + Math.sin(ang) * 4, 1.4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.strokeStyle = '#8a5a10';
            ctx.lineWidth = 0.6;
            for (var s = 0; s < 6; s++) {
                var ang2 = (s / 6) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(pcx, pcy);
                ctx.lineTo(pcx + Math.cos(ang2) * 9, pcy + Math.sin(ang2) * 9);
                ctx.stroke();
            }
        }

        function dibujarCuriosidades(d) {
            dibujarPoster(d.wallCX, MURO + 4);
            /* máquina de peluches (garra) */
            var gx = d.x, gy = d.y - 4, gw = d.w * 0.55, gh = d.h + 6;
            ctx.fillStyle = '#7a1fa0';
            ctx.fillRect(gx, gy, gw, gh);
            ctx.fillStyle = 'rgba(150,220,255,0.35)';
            ctx.fillRect(gx + 3, gy + 3, gw - 6, gh * 0.55);
            ctx.fillStyle = '#FFCC00';
            [0.3, 0.6].forEach(function(f, i) {
                ctx.beginPath();
                ctx.arc(gx + gw * f, gy + gh * 0.42, 2.4, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.fillStyle = '#333';
            ctx.fillRect(gx + gw / 2 - 1, gy - 3, 2, 6);

            /* repisa de trofeos */
            var rx = d.x + gw + 6, ry = d.y + d.h - 6;
            ctx.fillStyle = '#4a3220';
            ctx.fillRect(rx, ry, d.w - gw - 6, 3);
            ctx.font = '8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('🏆', rx + 6, ry - 1);
            ctx.fillText('🏆', rx + 15, ry - 1);

            /* planta */
            ctx.fillStyle = '#7a4a1a';
            ctx.fillRect(d.x + d.w + 4, d.y + d.h - 6, 8, 6);
            ctx.fillStyle = '#2e7d32';
            ctx.beginPath();
            ctx.arc(d.x + d.w + 8, d.y + d.h - 10, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        function dibujarDecoracion(d) {
            if (d.tipo === 'lounge') return dibujarLounge(d);
            if (d.tipo === 'pizza') return dibujarPizza(d);
            if (d.tipo === 'curiosidades') return dibujarCuriosidades(d);
        }

        function dibujarPrompt(g) {
            var texto = g.def.disponible ? ('▲ ' + g.def.nombre) : '🔒 PRÓXIMAMENTE';
            var sub = g.def.disponible ? 'ENTER / A' : '';
            var cx = g.x + g.w / 2;
            var y = g.zonaY + g.zonaH + 11;

            ctx.font = 'bold 7px monospace';
            var anchoTexto = Math.max(ctx.measureText(texto).width, sub ? ctx.measureText(sub).width : 0) + 12;
            var boxX = Math.min(Math.max(cx - anchoTexto / 2, camaraX + MURO + 2), camaraX + VIEW_W - MURO - anchoTexto - 2);

            var alpha = 0.55 + 0.35 * Math.sin(tiempoGlobal * 5);
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(boxX, y - 10, anchoTexto, sub ? 22 : 14);
            ctx.strokeStyle = g.def.disponible ? ('rgba(255,204,0,' + alpha + ')') : 'rgba(150,150,150,0.7)';
            ctx.strokeRect(boxX, y - 10, anchoTexto, sub ? 22 : 14);

            ctx.textAlign = 'center';
            ctx.fillStyle = g.def.disponible ? '#FFCC00' : '#bbb';
            ctx.fillText(texto, boxX + anchoTexto / 2, y);
            if (sub) {
                ctx.font = '6px monospace';
                ctx.fillStyle = '#fff';
                ctx.fillText(sub, boxX + anchoTexto / 2, y + 10);
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

        /* pistas visuales de "hay más máquinas" en los bordes del viewport.
           Se dibuja DESPUÉS de ctx.restore() del mundo, o sea en espacio
           de pantalla normal (sin la traslación de cámara) — por eso usa
           coordenadas fijas del viewport (0..VIEW_W), no de mundo. */
        function dibujarIndicadoresScroll() {
            if (camaraX > 2) {
                ctx.fillStyle = 'rgba(255,204,0,0.65)';
                ctx.font = '11px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('◀', 2, H / 2);
            }
            if (camaraX + VIEW_W < WORLD_W - 2) {
                ctx.fillStyle = 'rgba(255,204,0,0.65)';
                ctx.font = '11px monospace';
                ctx.textAlign = 'right';
                ctx.fillText('▶', VIEW_W - 2, H / 2);
            }
        }

        function dibujarLobby() {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            ctx.save();
            ctx.translate(-camaraX, 0);
            dibujarPiso();
            decoraciones.forEach(dibujarDecoracion);
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
            ajustarResolucionCanvas();
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

        ajustarResolucionCanvas();
        actualizarCamara();
        dibujarLobby();
        requestAnimationFrame(function(t) { lastTime = t; requestAnimationFrame(loop); });
    });
})();
