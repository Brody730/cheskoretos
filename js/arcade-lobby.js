/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - LOBBY DEL ARCADE (sala top-down)
 * ═══════════════════════════════════════════
 * Un pasillo de arcade visto desde arriba (estilo Pac-Man) con una
 * cámara que sigue al avatar: los gabinetes están agrupados en
 * secciones de ~4 contra la pared de arriba, separadas por zonas de
 * ambientación (mesas con sillas, estación de pizza, rincón de
 * curiosidades) y desorden (pizza tirada, helado derritiéndose) para
 * que el pasillo se sienta vivo y no un corredor vacío. Además hay
 * niños NPC deambulando y todo — gabinetes, muebles, tele retro,
 * desorden, niños — responde a ENTER/A con un mensaje de sabor.
 *
 * El avatar tiene físico "orgánico": acelera/frena en vez de moverse
 * a velocidad constante, tiene animación de piernas al caminar, y se
 * cansa si caminas mucho rato seguido (más lento + gotita de sudor;
 * se recupera parado).
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
        { id: 'snake_parque',    nombre: 'SNAKE DEL PARQUE', emoji: '🐍', disponible: true  },
        { id: 'rompe_vasos',     nombre: 'ROMPE VASOS',      emoji: '🥤', disponible: false },
        { id: 'memoria_extrema', nombre: 'MEMORIA EXTREMA',  emoji: '🧠', disponible: false },
        { id: 'ruleta_rush',     nombre: 'RULETA RUSH',      emoji: '🎡', disponible: false },
        { id: 'puzzle_koreto',   nombre: 'PUZZLE KORETO',    emoji: '🧩', disponible: false },
        { id: 'boxeo_sabado',    nombre: 'BOXEO DE SÁBADO',  emoji: '🥊', disponible: true  }
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
        entrar:     function() { this.tono(660, 0.12); this.tono(990, 0.1); },
        bloqueado:  function() { this.tono(160, 0.15); },
        curiosidad: function() { this.tono(520, 0.09); }
    };

    /* Frases de sabor al interactuar con cosas que NO son un juego —
       mesas, la tele, el desorden, los niños. Se elige una al azar
       cada vez para que no se sienta repetitivo. */
    var FRASES = {
        lounge: [
            '🪑 Mesa reservada para los que pierden en Flappy Chesko y necesitan un momento.',
            '🪑 Alguien dejó una servilleta doblada en forma de avioncito. Arte.'
        ],
        pizza: [
            '🍕 Huele delicioso. El de la caja jura que "en un rato sale más".',
            '🍕 Hay una rebanada con más queso que las demás. Es la elegida.'
        ],
        curiosidades: [
            '🕹️ La máquina de peluches: nadie ha ganado nada aquí desde 2019.',
            '🏆 Los trofeos son del torneo de Flappy Chesko del año pasado. ¿Serás el próximo?'
        ],
        tv_retro: [
            '📺 Están pasando el especial de "LOS SÚPER SABIOS DEL BARRIO" (temp. 47, sigue igual de buena).',
            '📺 Puro ruido y estática... pero con mucho estilo ochentero.'
        ],
        pizza_tirada: [
            '🍕 Alguien tiró su pizza. La regla de los 5 segundos ya expiró hace rato.',
            '🍕 Pizza en el piso: 0/10, muy triste, no recomendado.'
        ],
        helado_derretido: [
            '🍦 Se está derritiendo bajo las luces del arcade. Un momento de silencio.',
            '🍦 Charquito pegajoso. Alguien lo va a pisar y se va a arrepentir.'
        ],
        npc: [
            '🏃 ¡Un niño pasó corriendo y casi te tropieza!',
            '🧒 "¡Cuidado!" — grita sin dejar de correr.',
            '🏃 Está jugando a que es más rápido que la ruleta. Va ganando.'
        ]
    };
    function fraseAlAzar(clave) {
        var lista = FRASES[clave] || ['✨ Justo lo que buscabas.'];
        return lista[Math.floor(Math.random() * lista.length)];
    }

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
           borroso: el backing store se ajusta al tamaño
           real en pantalla × devicePixelRatio).
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
        var btnA        = document.getElementById('btnArcadeA');

        /* Cada juego implementado vive en su propia pantalla dentro de
           #arcadePlayArea; el id de la máquina (ARCADE_MACHINES[].id)
           es la clave para saber cuál mostrar/ocultar y qué botón
           "volver" le pertenece. Si mañana se agrega un juego nuevo,
           solo hace falta sumar su entrada aquí (y su <script> propio
           que registre window.ArcadeGames[id]). */
        var PANTALLAS_JUEGO = {
            flappy_chesko: document.getElementById('arcadeGameScreen'),
            snake_parque: document.getElementById('snakeGameScreen'),
            boxeo_sabado: document.getElementById('boxeoGameScreen')
        };
        var BOTONES_VOLVER = ['btnVolverArcade', 'btnVolverArcadeSnake', 'btnVolverArcadeBoxeo'];
        var pantallaActivaId = null;

        /* ═══════════════════════════════════════════
           LAYOUT: secciones de ~4 gabinetes separadas por
           zonas de ambientación. La cámara sigue al avatar en X.
           ═══════════════════════════════════════════ */
        var MURO = 10;
        var CAB_W = 34, CAB_H = 26;
        var GAP_CLUSTER = 10;
        var DECOR_GAP_W = 92;
        var END_GAP_W = 74;
        var MARGEN_MUNDO = 24;
        var SECCION_TAMANO = 4;
        var FURN_Y = 132;

        var gabinetes = [];
        var decoraciones = [];
        var cursorX = MARGEN_MUNDO;
        var TIPOS_DECOR_CICLO = ['pizza', 'lounge'];
        var decorIdx = 0;

        function construirDecoracion(tipo, xIzquierda, anchoZona) {
            var coreW = tipo === 'lounge' ? 50 : 44;
            var coreH = tipo === 'curiosidades' ? 34 : 28;
            var x = xIzquierda + (anchoZona - coreW) / 2;
            var y = FURN_Y;
            return {
                tipo: tipo, solido: true, frasesClave: tipo,
                x: x, y: y, w: coreW, h: coreH,
                wallCX: xIzquierda + anchoZona / 2,
                zonaX: x - 6, zonaY: y - 6, zonaW: coreW + 12, zonaH: coreH + 20
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

        /* ── Referencias rápidas a las zonas de decoración ya construidas
           (pizza = idx0, lounge = idx1, curiosidades = idx2) para anclar
           el desorden y la tele cerca de algo que ya existe. ── */
        var zonaPizza = decoraciones[0];
        var zonaLounge = decoraciones[1];

        /* ── Desorden (NO sólido: se puede caminar encima, es piso sucio) ── */
        var desorden = [
            {
                tipo: 'pizza_tirada', solido: false, frasesClave: 'pizza_tirada',
                x: zonaPizza.x - 22, y: zonaPizza.y + 16, w: 14, h: 10,
                zonaX: zonaPizza.x - 30, zonaY: zonaPizza.y + 6, zonaW: 30, zonaH: 28
            },
            {
                tipo: 'helado_derretido', solido: false, frasesClave: 'helado_derretido',
                x: (gabinetes[5] ? gabinetes[5].x : zonaLounge.x) + 6, y: FURN_Y + 30, w: 10, h: 8,
                zonaX: (gabinetes[5] ? gabinetes[5].x : zonaLounge.x) - 4, zonaY: FURN_Y + 18, zonaW: 26, zonaH: 26
            }
        ];

        /* ── Tele retro (SÍ sólida: tiene mueble/base) junto al lounge ── */
        var teleRetro = {
            tipo: 'tv_retro', solido: true, frasesClave: 'tv_retro',
            x: zonaLounge.x + zonaLounge.w + 12, y: zonaLounge.y - 10, w: 16, h: 20,
            zonaX: zonaLounge.x + zonaLounge.w + 4, zonaY: zonaLounge.y - 16, zonaW: 32, zonaH: 40
        };
        decoraciones.push(teleRetro);

        var sSecciones = gabinetes.reduce(function(rangos, g) {
            var r = rangos[g.seccion] || { min: Infinity, max: -Infinity };
            r.min = Math.min(r.min, g.x);
            r.max = Math.max(r.max, g.x + g.w);
            rangos[g.seccion] = r;
            return rangos;
        }, {});
        var PALETAS_SECCION = [
            { a: '#1d1d1d', b: '#181818' },
            { a: '#181d1d', b: '#141818' },
            { a: '#1d181d', b: '#181418' }
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

        var solidos = gabinetes.concat(decoraciones.filter(function(d) { return d.solido; }));

        /* ═══════════════════════════════════════════
           NIÑOS NPC — deambulan cerca de su "hogar" (wander AI simple),
           le dan vida al pasillo. No estorban el paso (no colisionan),
           solo se pueden saludar/interactuar para una frase de sabor.
           ═══════════════════════════════════════════ */
        var NPC_VELOCIDAD = 46;
        function crearNPC(hogarX, hogarY, color) {
            return {
                hogarX: hogarX, hogarY: hogarY,
                x: hogarX, y: hogarY, r: 4.5, color: color,
                dirX: 0, dirY: 1, pasoT: Math.random() * 10,
                objetivoX: hogarX, objetivoY: hogarY,
                esperando: 0, caminando: false
            };
        }
        var npcs = [
            crearNPC(gabinetes[1] ? gabinetes[1].x : 60, 160, '#66BBFF'),
            crearNPC(zonaPizza.x + 10, 168, '#FF6699'),
            crearNPC(cursorX - END_GAP_W - 30, 155, '#8CFF66')
        ];

        function actualizarNPCs(dt) {
            npcs.forEach(function(n) {
                n.esperando -= dt;
                if (n.esperando <= 0) {
                    n.objetivoX = Math.max(MURO + 10, Math.min(WORLD_W - MURO - 10, n.hogarX + (Math.random() * 2 - 1) * 46));
                    n.objetivoY = Math.max(FURN_Y - 30, Math.min(H - MURO - 14, n.hogarY + (Math.random() * 2 - 1) * 26));
                    n.esperando = 1 + Math.random() * 2.2;
                }
                var dx = n.objetivoX - n.x, dy = n.objetivoY - n.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 3) {
                    var vx = dx / dist, vy = dy / dist;
                    n.dirX = vx; n.dirY = vy;
                    n.x += vx * NPC_VELOCIDAD * dt;
                    n.y += vy * NPC_VELOCIDAD * dt;
                    n.pasoT += dt;
                    n.caminando = true;
                } else {
                    n.caminando = false;
                }
            });
        }

        /* ═══════════════════════════════════════════
           AVATAR — física orgánica (acelera/frena en vez
           de "snap" instantáneo) + energía que baja al
           caminar y sube al parar.
           ═══════════════════════════════════════════ */
        var avatar = {
            x: gabinetes[0].x + gabinetes[0].w / 2,
            y: gabinetes[0].zonaY + gabinetes[0].zonaH + 26,
            r: 6.5,
            vx: 0, vy: 0,
            dirX: 0, dirY: -1,
            caminando: false,
            pasoT: 0,
            energia: 100,
            cansado: false
        };
        var VELOCIDAD_NORMAL = 62, VELOCIDAD_CANSADO = 36;
        var ACELERACION = 380, FRICCION = 460;
        var DRENAJE_ENERGIA = 9, REGEN_ENERGIA = 20;
        var UMBRAL_CANSADO = 26;

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
        window.addEventListener('blur', function() {
            teclas.up = teclas.down = teclas.left = teclas.right = false;
        });

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
        function acercar(actual, objetivo, maxDelta) {
            var diff = objetivo - actual;
            if (Math.abs(diff) <= maxDelta) return objetivo;
            return actual + (diff > 0 ? maxDelta : -maxDelta);
        }

        function actualizarAvatar(dt) {
            var inputX = (teclas.right ? 1 : 0) - (teclas.left ? 1 : 0);
            var inputY = (teclas.down ? 1 : 0) - (teclas.up ? 1 : 0);
            var hayInput = inputX !== 0 || inputY !== 0;

            if (hayInput) {
                var mag = Math.sqrt(inputX * inputX + inputY * inputY) || 1;
                inputX /= mag; inputY /= mag;
                avatar.dirX = inputX; avatar.dirY = inputY;
                avatar.energia = Math.max(0, avatar.energia - DRENAJE_ENERGIA * dt);
            } else {
                avatar.energia = Math.min(100, avatar.energia + REGEN_ENERGIA * dt);
            }
            avatar.cansado = avatar.energia < UMBRAL_CANSADO;

            var velObjetivo = avatar.cansado ? VELOCIDAD_CANSADO : VELOCIDAD_NORMAL;
            var vObjX = hayInput ? inputX * velObjetivo : 0;
            var vObjY = hayInput ? inputY * velObjetivo : 0;
            var tasa = hayInput ? ACELERACION : FRICCION;

            avatar.vx = acercar(avatar.vx, vObjX, tasa * dt);
            avatar.vy = acercar(avatar.vy, vObjY, tasa * dt);

            avatar.caminando = (avatar.vx * avatar.vx + avatar.vy * avatar.vy) > 16;
            if (avatar.caminando) {
                avatar.pasoT += dt;
                moverConColision(avatar.vx * dt, avatar.vy * dt);
            }
            actualizarNPCs(dt);
            actualizarCamara();
        }

        function rectVsCirculo(rect, cx, cy, r) {
            var cercaX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
            var cercaY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
            var dx = cx - cercaX, dy = cy - cercaY;
            return (dx * dx + dy * dy) < (r * r);
        }

        function moverConColision(dx, dy) {
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

        /* ═══════════════════════════════════════════
           PROXIMIDAD / INTERACCIÓN GENERALIZADA
           Todo (gabinetes, muebles, tele, desorden, niños)
           puede ser "lo más cercano" y reaccionar a ENTER/A.
           ═══════════════════════════════════════════ */
        function objetoCercano() {
            var mejor = null, mejorDist = Infinity;

            function evaluarConZona(obj, kind) {
                var cx = obj.zonaX + obj.zonaW / 2, cy = obj.zonaY + obj.zonaH / 2;
                var dx = avatar.x - cx, dy = avatar.y - cy;
                var dist = Math.sqrt(dx * dx + dy * dy);
                var dentro = avatar.x >= obj.zonaX - 4 && avatar.x <= obj.zonaX + obj.zonaW + 4 &&
                             avatar.y >= obj.zonaY - 4 && avatar.y <= obj.zonaY + obj.zonaH + 6;
                if (dentro && dist < mejorDist) { mejor = { kind: kind, ref: obj }; mejorDist = dist; }
            }

            gabinetes.forEach(function(g) { evaluarConZona(g, 'gabinete'); });
            decoraciones.forEach(function(d) { evaluarConZona(d, 'decor'); });
            desorden.forEach(function(d) { evaluarConZona(d, 'decor'); });

            var RADIO_NPC = 15;
            npcs.forEach(function(n) {
                var dx = avatar.x - n.x, dy = avatar.y - n.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= RADIO_NPC && dist < mejorDist) { mejor = { kind: 'npc', ref: n }; mejorDist = dist; }
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
            ctx.fillStyle = '#000';
            ctx.fillRect(camaraX, 0, VIEW_W, MURO);
            ctx.fillRect(camaraX, H - MURO, VIEW_W, MURO);
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

        /* ── Ambientación ── */
        function dibujarPoster(cx, y, semilla) {
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(cx - 9, y, 18, 13);
            ctx.strokeStyle = '#555';
            ctx.strokeRect(cx - 9 + 0.5, y + 0.5, 17, 12);
            ctx.fillStyle = ['#FF6600', '#00CCFF', '#FF44CC'][Math.floor(semilla) % 3];
            ctx.fillRect(cx - 6, y + 3, 12, 7);
        }

        function dibujarLounge(d) {
            dibujarPoster(d.wallCX, MURO + 4, d.wallCX);
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(d.x + 8, d.y + 6, d.w - 16, d.h - 12);
            ctx.strokeStyle = '#3a2410';
            ctx.strokeRect(d.x + 8.5, d.y + 6.5, d.w - 17, d.h - 13);
            ctx.fillStyle = '#7a4a1a';
            [
                [d.x - 2, d.y + d.h / 2 - 4],
                [d.x + d.w - 6, d.y + d.h / 2 - 4],
                [d.x + d.w / 2 - 4, d.y - 4],
                [d.x + d.w / 2 - 4, d.y + d.h + 2]
            ].forEach(function(s) { ctx.fillRect(s[0], s[1], 8, 8); });
        }

        function dibujarPizza(d) {
            dibujarPoster(d.wallCX, MURO + 4, d.wallCX);
            ctx.fillStyle = '#b02020';
            ctx.fillRect(d.x, d.y + d.h - 10, d.w, 10);
            ctx.fillStyle = '#fff';
            for (var i = 0; i < d.w; i += 8) { ctx.fillRect(d.x + i, d.y + d.h - 10, 4, 10); }
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
            dibujarPoster(d.wallCX, MURO + 4, d.wallCX);
            var gx = d.x, gy = d.y - 4, gw = d.w * 0.55, gh = d.h + 6;
            ctx.fillStyle = '#7a1fa0';
            ctx.fillRect(gx, gy, gw, gh);
            ctx.fillStyle = 'rgba(150,220,255,0.35)';
            ctx.fillRect(gx + 3, gy + 3, gw - 6, gh * 0.55);
            ctx.fillStyle = '#FFCC00';
            [0.3, 0.6].forEach(function(f) {
                ctx.beginPath();
                ctx.arc(gx + gw * f, gy + gh * 0.42, 2.4, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.fillStyle = '#333';
            ctx.fillRect(gx + gw / 2 - 1, gy - 3, 2, 6);

            var rx = d.x + gw + 6, ry = d.y + d.h - 6;
            ctx.fillStyle = '#4a3220';
            ctx.fillRect(rx, ry, d.w - gw - 6, 3);
            ctx.font = '8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('🏆', rx + 6, ry - 1);
            ctx.fillText('🏆', rx + 15, ry - 1);

            ctx.fillStyle = '#7a4a1a';
            ctx.fillRect(d.x + d.w + 4, d.y + d.h - 6, 8, 6);
            ctx.fillStyle = '#2e7d32';
            ctx.beginPath();
            ctx.arc(d.x + d.w + 8, d.y + d.h - 10, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        function dibujarTeleRetro(d) {
            /* base/mueble */
            ctx.fillStyle = '#3a2a1a';
            ctx.fillRect(d.x - 2, d.y + d.h - 4, d.w + 4, 6);
            /* caja de la tele */
            ctx.fillStyle = '#e8e0c8';
            ctx.fillRect(d.x, d.y, d.w, d.h - 4);
            ctx.strokeStyle = '#8a8262';
            ctx.strokeRect(d.x + 0.5, d.y + 0.5, d.w - 1, d.h - 5);
            /* pantalla con "estática" de colores (guiño retro, sin IP real) */
            var pantX = d.x + 2, pantY = d.y + 2, pantW = d.w - 4, pantH = d.h - 9;
            ctx.fillStyle = '#101018';
            ctx.fillRect(pantX, pantY, pantW, pantH);
            var coloresEstatica = ['#FF6600', '#00CCFF', '#FFCC00', '#FF44CC', '#39FF14'];
            for (var i = 0; i < 10; i++) {
                var sx = pantX + ((i * 37 + Math.floor(tiempoGlobal * 6) * 7) % Math.round(pantW));
                var sy = pantY + ((i * 13) % Math.round(pantH));
                ctx.fillStyle = coloresEstatica[i % coloresEstatica.length];
                ctx.fillRect(sx, sy, 2, 2);
            }
            /* antena en V */
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(d.x + d.w / 2, d.y);
            ctx.lineTo(d.x + d.w / 2 - 5, d.y - 6);
            ctx.moveTo(d.x + d.w / 2, d.y);
            ctx.lineTo(d.x + d.w / 2 + 5, d.y - 6);
            ctx.stroke();
        }

        function dibujarDecoracion(d) {
            if (d.tipo === 'lounge') return dibujarLounge(d);
            if (d.tipo === 'pizza') return dibujarPizza(d);
            if (d.tipo === 'curiosidades') return dibujarCuriosidades(d);
            if (d.tipo === 'tv_retro') return dibujarTeleRetro(d);
        }

        function dibujarPizzaTirada(d) {
            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(0.3);
            ctx.fillStyle = '#e8b84b';
            ctx.beginPath();
            ctx.moveTo(0, 0); ctx.arc(0, 0, 7, -0.5, 0.9); ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#c0392b';
            ctx.beginPath(); ctx.arc(-1, -2, 1, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(2, 1, 1, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            /* migajas */
            ctx.fillStyle = '#c89a4a';
            ctx.fillRect(d.x - 6, d.y + 5, 1.5, 1.5);
            ctx.fillRect(d.x + 5, d.y + 4, 1.5, 1.5);
        }

        function dibujarHeladoDerretido(d) {
            var pulso = 0.5 + 0.5 * Math.sin(tiempoGlobal * 2);
            /* charco */
            ctx.fillStyle = 'rgba(255, 210, 235, ' + (0.5 + 0.2 * pulso) + ')';
            ctx.beginPath();
            ctx.ellipse(d.x, d.y + 5, 9, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            /* bolita derritiéndose */
            ctx.fillStyle = '#ffb6d9';
            ctx.beginPath();
            ctx.arc(d.x, d.y, 4.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#e89ac2';
            ctx.beginPath();
            ctx.arc(d.x - 1, d.y - 1, 1.2, 0, Math.PI * 2);
            ctx.fill();
            /* palito/cono */
            ctx.fillStyle = '#c98a3f';
            ctx.fillRect(d.x - 1, d.y + 2, 2, 5);
        }

        function dibujarDesorden(d) {
            if (d.tipo === 'pizza_tirada') return dibujarPizzaTirada(d);
            if (d.tipo === 'helado_derretido') return dibujarHeladoDerretido(d);
        }

        /* ── Figura genérica (avatar y niños) con ciclo de caminata top-down ── */
        function dibujarFigura(opts) {
            /* opts: x, y, r, colorCuerpo, dirX, dirY, pasoT, caminando, cansado */
            var cadencia = opts.cansado ? 5.5 : 9.5;
            var fase = opts.pasoT * cadencia;
            var bounce = opts.caminando ? Math.abs(Math.sin(fase)) * (opts.cansado ? 1 : 1.8) : 0;
            var achatado = opts.cansado ? 0.92 : 1;

            ctx.save();
            ctx.translate(opts.x, opts.y - bounce);

            /* sombra fija en el piso (no rebota con el cuerpo) */
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(0, opts.r + 1 + bounce, opts.r * 0.8, opts.r * 0.32, 0, 0, Math.PI * 2);
            ctx.fill();

            /* piernas/pies: dos óvalos que se turnan hacia adelante/atrás
               respecto a la dirección de movimiento (ciclo de caminata
               "top-down" clásico de RPG). */
            if (opts.caminando) {
                var perpX = -opts.dirY, perpY = opts.dirX;
                var avance = Math.sin(fase) * opts.r * 0.6;
                ctx.fillStyle = 'rgba(0,0,0,0.55)';
                [1, -1].forEach(function(lado, idx) {
                    var av = idx === 0 ? avance : -avance;
                    var px = perpX * lado * opts.r * 0.55 + opts.dirX * av;
                    var py = perpY * lado * opts.r * 0.55 + opts.dirY * av;
                    ctx.beginPath();
                    ctx.ellipse(px, py + opts.r * 0.6, opts.r * 0.32, opts.r * 0.42, 0, 0, Math.PI * 2);
                    ctx.fill();
                });
            }

            /* cuerpo */
            ctx.scale(1, achatado);
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(0, 0, opts.r + 1, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = opts.colorCuerpo;
            ctx.beginPath(); ctx.arc(0, 0, opts.r, 0, Math.PI * 2); ctx.fill();
            ctx.scale(1, 1 / achatado);

            /* "nariz": hacia dónde mira */
            ctx.fillStyle = opts.colorAcento || '#FF6600';
            ctx.beginPath();
            ctx.arc(opts.dirX * opts.r * 0.7, opts.dirY * opts.r * 0.7, opts.r * 0.28, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            /* gotita de sudor si está cansado (solo aplica al jugador) */
            if (opts.cansado) {
                var flotar = Math.sin(tiempoGlobal * 4) * 1.2;
                ctx.font = (opts.r + 3) + 'px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('💧', opts.x + opts.r * 0.9, opts.y - opts.r - 3 + flotar);
            }
        }

        function dibujarAvatar() {
            dibujarFigura({
                x: avatar.x, y: avatar.y, r: avatar.r,
                colorCuerpo: '#FFCC00', colorAcento: '#FF6600',
                dirX: avatar.dirX, dirY: avatar.dirY,
                pasoT: avatar.pasoT, caminando: avatar.caminando, cansado: avatar.cansado
            });
        }

        function dibujarNPCs() {
            npcs.forEach(function(n) {
                dibujarFigura({
                    x: n.x, y: n.y, r: n.r,
                    colorCuerpo: n.color, colorAcento: '#222',
                    dirX: n.dirX, dirY: n.dirY,
                    pasoT: n.pasoT, caminando: n.caminando, cansado: false
                });
            });
        }

        /* pistas visuales de "hay más máquinas" en los bordes del viewport.
           Se dibuja DESPUÉS de ctx.restore() del mundo, o sea en espacio
           de pantalla normal (sin la traslación de cámara). */
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

        function tituloParaCercano(obj) {
            if (obj.kind === 'gabinete') return obj.ref.def.disponible ? ('▲ ' + obj.ref.def.nombre) : '🔒 PRÓXIMAMENTE';
            if (obj.kind === 'npc') return '🧒 NIÑO CORRIENDO';
            var nombres = { lounge: '🪑 MESAS', pizza: '🍕 ESTACIÓN DE PIZZA', curiosidades: '🎁 CURIOSIDADES', tv_retro: '📺 TELE RETRO', pizza_tirada: '🍕 DESORDEN', helado_derretido: '🍦 DESORDEN' };
            return nombres[obj.ref.tipo] || '❓ ALGO INTERESANTE';
        }

        function dibujarPrompt(obj) {
            var g = obj.ref;
            var puedeEntrar = obj.kind === 'gabinete';
            var texto = tituloParaCercano(obj);
            var sub = puedeEntrar ? 'ENTER / A' : 'ENTER / A: VER';
            var refX = obj.kind === 'npc' ? g.x : (g.x + g.w / 2);
            var refYBase = obj.kind === 'npc' ? g.y : (g.zonaY + g.zonaH);
            var cx = refX;
            var y = refYBase + 11;

            ctx.font = 'bold 7px monospace';
            var anchoTexto = Math.max(ctx.measureText(texto).width, ctx.measureText(sub).width) + 12;
            var boxX = Math.min(Math.max(cx - anchoTexto / 2, camaraX + MURO + 2), camaraX + VIEW_W - MURO - anchoTexto - 2);

            var alpha = 0.55 + 0.35 * Math.sin(tiempoGlobal * 5);
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(boxX, y - 10, anchoTexto, 22);
            ctx.strokeStyle = puedeEntrar && g.def && g.def.disponible ? ('rgba(255,204,0,' + alpha + ')') : 'rgba(150,150,150,0.7)';
            ctx.strokeRect(boxX, y - 10, anchoTexto, 22);

            ctx.textAlign = 'center';
            ctx.fillStyle = puedeEntrar && g.def && g.def.disponible ? '#FFCC00' : '#bbb';
            ctx.fillText(texto, boxX + anchoTexto / 2, y);
            ctx.font = '6px monospace';
            ctx.fillStyle = '#fff';
            ctx.fillText(sub, boxX + anchoTexto / 2, y + 10);
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
            desorden.forEach(dibujarDesorden);
            var cercano = objetoCercano();
            gabinetes.forEach(function(g) { dibujarGabinete(g, cercano && cercano.kind === 'gabinete' && cercano.ref === g); });
            dibujarNPCs();
            dibujarAvatar();
            if (cercano) dibujarPrompt(cercano);
            ctx.restore();
            dibujarIndicadoresScroll();
        }

        /* ═══════════════════════════════════════════
           ENTRAR / INTERACTUAR
           ═══════════════════════════════════════════ */
        function intentarEntrar() {
            if (!lobbyVisible()) return;
            var obj = objetoCercano();
            if (!obj) return;

            Blip.init();

            if (obj.kind === 'gabinete') {
                var g = obj.ref;
                if (!g.def.disponible) {
                    Blip.bloqueado();
                    mostrarToast('🚧 ' + g.def.nombre + ' — ¡muy pronto en el arcade!');
                    return;
                }
                var juego = window.ArcadeGames && window.ArcadeGames[g.def.id];
                var pantallaJuego = PANTALLAS_JUEGO[g.def.id];
                if (!juego || typeof juego.mostrar !== 'function' || !pantallaJuego) {
                    Blip.bloqueado();
                    mostrarToast('🚧 ' + g.def.nombre + ' — ¡muy pronto en el arcade!');
                    return;
                }
                Blip.entrar();
                if (lobbyScreen) lobbyScreen.style.display = 'none';
                pantallaJuego.style.display = 'flex';
                pantallaActivaId = g.def.id;
                teclas.up = teclas.down = teclas.left = teclas.right = false;
                juego.mostrar();
                return;
            }

            /* Muebles, tele, desorden o niños: solo una frase de sabor */
            Blip.curiosidad();
            var clave = obj.kind === 'npc' ? 'npc' : (obj.ref.frasesClave || 'npc');
            mostrarToast(fraseAlAzar(clave));
        }

        function volverAlLobby() {
            if (pantallaActivaId) {
                var juegoActivo = window.ArcadeGames && window.ArcadeGames[pantallaActivaId];
                if (juegoActivo && typeof juegoActivo.ocultar === 'function') juegoActivo.ocultar();
                var pantallaActiva = PANTALLAS_JUEGO[pantallaActivaId];
                if (pantallaActiva) pantallaActiva.style.display = 'none';
                pantallaActivaId = null;
            }
            if (lobbyScreen) lobbyScreen.style.display = 'flex';
            ajustarResolucionCanvas();
        }
        BOTONES_VOLVER.forEach(function(id) {
            var btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', volverAlLobby);
        });

        /* Toast flotante genérico (avisos + frases de sabor), no bloquea. */
        var toastTimeoutId = null;
        function mostrarToast(mensaje) {
            var toast = document.getElementById('arcadeProximamenteToast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'arcadeProximamenteToast';
                toast.className = 'arcade-proximamente-toast';
                document.body.appendChild(toast);
            }
            toast.textContent = mensaje;
            toast.classList.add('visible');
            if (toastTimeoutId) clearTimeout(toastTimeoutId);
            toastTimeoutId = setTimeout(function() { toast.classList.remove('visible'); }, 2400);
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
