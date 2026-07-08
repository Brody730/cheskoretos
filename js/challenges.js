// js/challenges.js

/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - LISTA DE RETOS Y RENDERIZADO
 * ═══════════════════════════════════════════
 * Este archivo contiene la base de datos de retos que utiliza la Ruleta
 * y el código para renderizar dinámicamente la lista de retos en retos.html.
 */
window.CHALLENGES = [
    {
        text: "EL INTELECTUAL",
        wheelText: "INTELECTUAL",
        emoji: "🧠",
        description: "Sácale brillo a la neurona: aviéntate un dato curioso más rápido que un chisme (ej: '¿Sabías que los delfines duermen con un ojo abierto?'). Si se te congela el cerebro, ¡se vale pedirle ayuda al de atrás!",
        price: "$25",
        color: "#2196F3",
        weight: 5
    },
    {
        text: "EL VOLADO",
        wheelText: "VOLADO",
        emoji: "🪙",
        description: "El clásico de clásicos. Escoges águila o sol, aventamos la moneda al aire de forma legal y que el destino decida tu suerte en un segundo.",
        price: "$25",
        color: "#FF9800",
        weight: 5
    },
    {
        text: "EL BÁSQUETBOLISTA",
        wheelText: "CANASTA",
        emoji: "🏀",
        description: "Saca el Michael Jordan que llevas dentro. Tienes un tiro para encestar la bola en nuestra canasta miniatura. ¡Cero presión, todo el parque te está viendo!",
        price: "$25",
        color: "#E65100",
        weight: 4
    },
    {
        text: "¿QUÉ POSIBILIDAD HAY?",
        wheelText: "NÚMERO",
        emoji: "🔢",
        description: "Conexión mental: a la de tres, tú y el de la caja van a decir un número del 1 al 3 al mismo tiempo. Si dicen exactamente el mismo número, ¡ganas!",
        price: "$25",
        color: "#00BCD4",
        weight: 5
    },
    {
        text: "EL MIRÓN",
        wheelText: "MIRADAS",
        emoji: "👀",
        description: "Duelo de miradas épico contra el de la caja. El primero que parpadee, se ría o agache la mirada, pierde. ¡Se vale hacer caras para presionar al rival!",
        price: "$25",
        color: "#607D8B",
        weight: 5
    },
    {
        text: "EL BOTELLAZO",
        wheelText: "BOTELLA",
        emoji: "🍾",
        description: "El reto del 'Bottle Flip'. Lanzas la botella de agua al aire, da una vuelta completa y tiene que caer perfectamente parada en la mesa. ¡Un solo intento para la gloria!",
        price: "$25",
        color: "#009688",
        weight: 4
    },
    {
        text: "EL INFLUENCER",
        wheelText: "HISTORIA",
        emoji: "🤳",
        description: "Presume el antojo: sube una foto o video chido del puesto a tus historias de Instagram o Facebook etiquetándonos, enséñala en caja y ya ganaste tu descuento.",
        price: "$25",
        color: "#E1306C",
        weight: 5
    },
    {
        text: "EL TRABALENGUAS",
        wheelText: "LENGUA",
        emoji: "👅",
        description: "¡Sin escupir! Tienes 15 segundos para recitar el trabalenguas corto de la cartulina sin que se te trabe la lengua y sin equivocarte. Respira hondo y ¡dale!",
        price: "$25",
        color: "#FFEB3B",
        weight: 4
    },
    {
        text: "EL RETADOR",
        wheelText: "RETADOR",
        emoji: "✊",
        description: "Te juegas el descuento en una sola ronda a muerte súbita contra el de la caja. Si ganas, te lo llevas a precio especial; si pierdes, te damos otra oportunidad.",
        price: "$25",
        color: "#F44336",
        weight: 5
    },
    {
        text: "EL GRITÓN",
        wheelText: "GRITÓN",
        emoji: "📣",
        description: "Saca el aire y conviértete en el promotor del puesto. Tienes que gritar a todo pulmón: '¡Pásale, pásale por tu ChesKoreto bien frío!'. Si voltean al menos 3 personas, ¡ganas!",
        price: "$25",
        color: "#FF5722",
        weight: 5
    },
    {
        text: "EL DONATIVO",
        wheelText: "DONATIVO",
        emoji: "😇",
        description: "Para los que traen flojera: aquí no haces ejercicio ni osos. Pagas $30 pesitos y esos $5 extras van directo a la 'caja de buena onda' para patrocinar al próximo suertudote.",
        price: "$30",
        color: "#4CAF50",
        weight: 3
    },
    {
        text: "EL SUERTUDOTE!",
        wheelText: "GRATIS",
        emoji: "🌟",
        description: "¡Te rayaste! San Antojito te sonrió hoy. Sin retos, sin preguntas, sin hacer el ridículo. El chesco va por nuestra cuenta porque nos caes muy bien.",
        price: "¡GRATIS!",
        color: "#FFD700",
        weight: 1
    },
    {
        text: "EL INVENTOR",
        wheelText: "INVENTOR",
        emoji: "🎲",
        description: "¡Aquí tú pones las reglas! Invéntate un minireto rápido en ese momento y aplícaselo al cliente que sigue atrás de ti en la fila (ej: 'Que pida con voz de Mickey Mouse').",
        price: "$25",
        color: "#9C27B0",
        weight: 5,
        hasInput: true
    },
    {
        text: "EL MIMO",
        wheelText: "MIMO",
        emoji: "🤫",
        description: "Tienes que pedir tu ChesKoreto favorito y el tamaño utilizando únicamente mímica. Cero palabras, cero sonidos, puro lenguaje corporal. ¡Que te entiendan a la primera!",
        price: "$25",
        color: "#795548",
        weight: 4
    },
    {
        text: "EL MILIMÉTRICO",
        wheelText: "CUBERO",
        emoji: "📐",
        description: "Ojo de buen cubero: llena el vaso hasta la línea marcada con cinta usando la jarra, pero con los ojos bien cerrados. ¡Si te quedas a menos de un dedo de distancia, ganas!",
        price: "$25",
        color: "#3F51B5",
        weight: 4
    },
    {
        text: "EL CIRQUERO",
        wheelText: "MALABARES",
        emoji: "🥚",
        description: "Le das dos limones al cliente. Tiene que aventarse al menos 3 cachadas seguidas haciendo malabares en el aire con una sola mano o cruzados, sin que caigan al piso.",
        price: "$25",
        color: "#00E676",
        weight: 4
    },
    {
        text: "REFLEJO X",
        wheelText: "REFLEJOS",
        emoji: "🖐️",
        description: "Pon tus manos flotando sobre las del cajero. Intentará darle un manotazo leve en las palmas antes de que las quite. ¡Tienes 3 intentos para ganarle en velocidad!",
        price: "$25",
        color: "#00796B",
        weight: 5
    },
    {
        text: "EL MONEDAZO",
        wheelText: "MONEDAZO",
        emoji: "🪙",
        description: "Tiro al blanco: ponemos un vaso en el suelo a tres pasos. Tienes dos intentos para lanzar una moneda de un peso y meterla dentro. ¡Cuidado con el rebote del piso!",
        price: "$25",
        color: "#8BC34A",
        weight: 5
    },
    {
        text: "EL RELOJ HUMANO",
        wheelText: "RELOJ",
        emoji: "⏰",
        description: "Cierra los ojos y di 'ya'. Tienes que decir 'stop' exactamente a los 7 segundos sin ver el reloj. Si le atinas entre el segundo 6.5 y el 7.5, ¡lo lograste!",
        price: "$25",
        color: "#9E9E9E",
        weight: 5
    },
    {
        text: "EL CHISTOSITO",
        wheelText: "CHISTE",
        emoji: "🎭",
        description: "Cuéntale tu mejor chiste al de la caja. Si se ríe, te da tu descuento. Si no da risa, no te agüites, ¡de todos modos te lo dejamos a $25 para que no te vayas triste!",
        price: "$25",
        color: "#FF4081",
        weight: 5
    }
];

/**
 * Renderiza dinámicamente los retos dentro del elemento #contenedorRetos si existe en el DOM (en retos.html).
 */
document.addEventListener("DOMContentLoaded", function() {
    var contenedor = document.getElementById("contenedorRetos");
    
    // Evita ejecutar la lógica si no estamos en retos.html
    if (!contenedor) return;

    var retos = window.CHALLENGES || [];

    if (retos.length === 0) {
        contenedor.innerHTML = "<p style='color: #ffffff;'>Cargando los retos de la suerte...</p>";
        return;
    }

    // Renderizar tarjetas de retos con bordes y sombras dinámicas según su color asignado
    contenedor.innerHTML = retos.map(function(reto) {
        var esGratis = (reto.wheelText === 'GRATIS') ? 'gratis' : '';
        return `
            <div class="tarjeta-reto" style="border-color: ${reto.color}; box-shadow: 5px 5px 0px ${reto.color}80, 5px 5px 0px #000;">
                <h3 style="color: ${reto.color};">${reto.emoji} ${reto.text}</h3>
                <p>${reto.description}</p>
                <p class="precio ${esGratis}">${reto.price === '¡GRATIS!' ? reto.price : 'Cumple y paga: ' + reto.price}</p>
            </div>
        `;
    }).join('');
});

/**
 * ═══════════════════════════════════════════
 * SISTEMA INTERACTIVO DE LA RULETA (canvas)
 * ═══════════════════════════════════════════
 * Este módulo controla toda la física de giro, audio sintético, efectos visuales
 * y sistema de archivos local para la ruleta en ruleta.html.
 * Se encuentra protegido para ejecutarse únicamente si existe el elemento #wheelCanvas.
 */
(function() {
    'use strict';

    document.addEventListener("DOMContentLoaded", function() {
        var canvas = document.getElementById('wheelCanvas');
        if (!canvas) return; // Si no hay canvas de ruleta, salimos silenciosamente

        var ctx = canvas.getContext('2d');
        var spinBtn = document.getElementById('spinBtn');
        var resultLabel = document.getElementById('resultLabel');
        var resultText = document.getElementById('resultText');
        var resultDescription = document.getElementById('resultDescription');
        var inventorContainer = document.getElementById('inventorContainer');
        var inventorInput = document.getElementById('inventorInput');
        var inventorSaveBtn = document.getElementById('inventorSaveBtn');
        var inventorSavedMsg = document.getElementById('inventorSavedMsg');
        var savedRetosList = document.getElementById('savedRetosList');
        var savedRetosCount = document.getElementById('savedRetosCount');
        var wheelContainer = document.getElementById('wheelContainer');
        var arrowIndicator = document.getElementById('arrowIndicator');
        var logoContainer = document.getElementById('logoContainer');
        var flashOverlay = document.getElementById('flashOverlay');
        var soundToggle = document.getElementById('soundToggle');

        var STORAGE_KEY = 'cheskoretos_inventor_retos';
        var FILE_HANDLE_DB = 'cheskoretos_db';
        var FILE_HANDLE_STORE = 'handles';
        var FILE_HANDLE_KEY = 'retos_txt';

        var retosFileHandle = null;
        var lastTickSection = -1;
        var soundEnabled = true;

        var idleAnimationId = null;     
        var isIdleSpinning = false;     
        var idleRotation = 0;           
        var IDLE_SPEED = 0.008;       

        /**
         * Sintetizador de audio Web Audio API
         */
        var SoundFX = {
            ctx: null,
            init: function() {
                if (!this.ctx) {
                    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
            },
            playTick: function() {
                if (!soundEnabled || !this.ctx) return;
                const t = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.frequency.setValueAtTime(800 + Math.random() * 400, t);
                osc.type = 'square';
                gain.gain.setValueAtTime(0.08, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
                osc.start(t);
                osc.stop(t + 0.05);
            },
            playSpinStart: function() {
                if (!soundEnabled || !this.ctx) return;
                const t = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.frequency.setValueAtTime(150, t);
                osc.frequency.exponentialRampToValueAtTime(600, t + 0.3);
                osc.type = 'sawtooth';
                gain.gain.setValueAtTime(0.12, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
                osc.start(t);
                osc.stop(t + 0.35);
            },
            playWin: function(isJackpot) {
                if (!soundEnabled || !this.ctx) return;
                const t = this.ctx.currentTime;
                const notes = isJackpot ? [523, 659, 784, 1047, 1319] : [440, 554, 659, 880];
                notes.forEach(function(freq, i) {
                    const osc = SoundFX.ctx.createOscillator();
                    const gain = SoundFX.ctx.createGain();
                    osc.connect(gain);
                    gain.connect(SoundFX.ctx.destination);
                    osc.frequency.value = freq;
                    osc.type = isJackpot ? 'square' : 'triangle';
                    const start = t + i * 0.12;
                    gain.gain.setValueAtTime(0, start);
                    gain.gain.linearRampToValueAtTime(0.15, start + 0.03);
                    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
                    osc.start(start);
                    osc.stop(start + 0.35);
                });
            },
            playSave: function() {
                if (!soundEnabled || !this.ctx) return;
                const t = this.ctx.currentTime;
                [660, 880].forEach(function(freq, i) {
                    const osc = SoundFX.ctx.createOscillator();
                    const gain = SoundFX.ctx.createGain();
                    osc.connect(gain);
                    gain.connect(SoundFX.ctx.destination);
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    const start = t + i * 0.1;
                    gain.gain.setValueAtTime(0.12, start);
                    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
                    osc.start(start);
                    osc.stop(start + 0.2);
                });
            }
        };

        // --- SISTEMA DE PERSISTENCIA Y ARCHIVOS ---

        function getSavedRetos() {
            try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { return []; }
        }

        function formatRetosAsTxt(retos) {
            var lines = ['=== CHESKORETOS - RETOS INVENTADOS ===', ''];
            retos.forEach(function(entry, i) { lines.push((i + 1) + '. [' + entry.date + '] ' + entry.text); });
            lines.push('');
            return lines.join('\n');
        }

        function renderSavedRetosList() {
            var retos = getSavedRetos();
            if (savedRetosCount) savedRetosCount.textContent = retos.length;
            if (!savedRetosList) return;
            if (retos.length === 0) {
                savedRetosList.innerHTML = '<li style="color:#888">Aún no hay retos guardados</li>';
                return;
            }
            savedRetosList.innerHTML = retos.slice().reverse().slice(0, 10).map(function(entry) {
                return '<li><span class="reto-date">' + entry.date + '</span> — ' + escapeHtml(entry.text) + '</li>';
            }).join('');
        }

        function escapeHtml(str) {
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        function downloadRetosTxt() {
            var retos = getSavedRetos();
            var blob = new Blob([formatRetosAsTxt(retos)], { type: 'text/plain;charset=utf-8' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url; a.download = 'retos-inventados.txt'; a.click();
            URL.revokeObjectURL(url);
        }

        function openFileHandleDB() {
            return new Promise(function(resolve, reject) {
                var req = indexedDB.open(FILE_HANDLE_DB, 1);
                req.onupgradeneeded = function() { req.result.createObjectStore(FILE_HANDLE_STORE); };
                req.onsuccess = function() { resolve(req.result); };
                req.onerror = function() { reject(req.error); };
            });
        }

        async function storeFileHandle(handle) {
            try {
                var db = await openFileHandleDB();
                var tx = db.transaction(FILE_HANDLE_STORE, 'readwrite');
                tx.objectStore(FILE_HANDLE_STORE).put(handle, FILE_HANDLE_KEY);
                retosFileHandle = handle;
            } catch (e) { console.warn('No se pudo guardar referencia al archivo', e); }
        }

        async function loadStoredFileHandle() {
            try {
                var db = await openFileHandleDB();
                var tx = db.transaction(FILE_HANDLE_STORE, 'readonly');
                var req = tx.objectStore(FILE_HANDLE_STORE).get(FILE_HANDLE_KEY);
                return new Promise(function(resolve) {
                    req.onsuccess = function() {
                        var handle = req.result;
                        if (handle && typeof handle.queryPermission === 'function') {
                            handle.queryPermission({ mode: 'readwrite' }).then(function(perm) {
                                if (perm === 'granted') { retosFileHandle = handle; }
                                resolve(handle);
                            }).catch(function() { resolve(null); });
                        } else { resolve(null); }
                    };
                    req.onerror = function() { resolve(null); };
                });
            } catch (e) { return null; }
        }

        async function appendLineToTxtFile(line) {
            if (!retosFileHandle) return false;
            try {
                var perm = await retosFileHandle.queryPermission({ mode: 'readwrite' });
                if (perm !== 'granted') { perm = await retosFileHandle.requestPermission({ mode: 'readwrite' }); }
                if (perm !== 'granted') return false;
                var file = await retosFileHandle.getFile();
                var existing = file.size > 0 ? await file.text() : '=== CHESKORETOS - RETOS INVENTADOS ===\n\n';
                var writable = await retosFileHandle.createWritable();
                await writable.write(existing + line + '\n');
                await writable.close();
                return true;
            } catch (e) { console.warn('Error escribiendo archivo', e); retosFileHandle = null; return false; }
        }

        async function linkTxtFile() {
            if (!('showOpenFilePicker' in window) && !('showSaveFilePicker' in window)) {
                if (inventorSavedMsg) {
                    inventorSavedMsg.textContent = 'Tu navegador no soporta guardar directo. Usa "Descargar .txt".';
                    inventorSavedMsg.classList.add('visible');
                }
                downloadRetosTxt(); return;
            }
            try {
                var handle;
                if ('showOpenFilePicker' in window) {
                    var handles = await window.showOpenFilePicker({ types: [{ description: 'Texto', accept: { 'text/plain': ['.txt'] } }], multiple: false });
                    handle = handles[0];
                } else {
                    handle = await window.showSaveFilePicker({ suggestedName: 'retos-inventados.txt', types: [{ description: 'Texto', accept: { 'text/plain': ['.txt'] } }] });
                }
                await storeFileHandle(handle);
                var retos = getSavedRetos();
                if (retos.length > 0) {
                    var writable = await handle.createWritable();
                    await writable.write(formatRetosAsTxt(retos));
                    await writable.close();
                }
                if (inventorSavedMsg) {
                    inventorSavedMsg.textContent = 'Archivo vinculado! Los retos se guardarán ahí automáticamente.';
                    inventorSavedMsg.classList.add('visible');
                }
            } catch (e) {
                if (e.name !== 'AbortError' && inventorSavedMsg) {
                    inventorSavedMsg.textContent = 'No se pudo vincular. Usa Descargar .txt';
                    inventorSavedMsg.classList.add('visible');
                }
            }
        }

        async function saveInventorChallenge() {
            SoundFX.init();
            var text = inventorInput.value.trim();
            if (!text) {
                if (inventorSavedMsg) {
                    inventorSavedMsg.textContent = 'Escribe un reto primero!';
                    inventorSavedMsg.style.color = '#FF3300';
                    inventorSavedMsg.classList.add('visible');
                }
                inventorInput.focus(); return;
            }
            var entry = { text: text, date: new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) };
            var retos = getSavedRetos(); retos.push(entry);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(retos));
            var line = (retos.length) + '. [' + entry.date + '] ' + entry.text;
            var wroteToFile = await appendLineToTxtFile(line);
            renderSavedRetosList(); SoundFX.playSave(); createSparks(wheelContainer);
            inventorInput.value = '';
            
            if (inventorSaveBtn) {
                inventorSaveBtn.textContent = '¡GUARDADO!';
                inventorSaveBtn.classList.add('saved');
            }
            if (inventorSavedMsg) {
                inventorSavedMsg.style.color = '#4CAF50';
                inventorSavedMsg.textContent = wroteToFile ? 'Reto guardado en la página Y en tu archivo .txt' : 'Reto guardado! (Vincula un .txt para guardar en archivo)';
                inventorSavedMsg.classList.add('visible');
            }
            setTimeout(function() {
                if (inventorSaveBtn) {
                    inventorSaveBtn.textContent = '¡GUARDAR RETO!';
                    inventorSaveBtn.classList.remove('saved');
                }
            }, 2000);
        }

        // --- ASIGNACIÓN DE EVENTOS ---
        if (inventorSaveBtn) inventorSaveBtn.addEventListener('click', saveInventorChallenge);
        if (inventorInput) {
            inventorInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') saveInventorChallenge(); });
        }
        
        var linkTxtBtn = document.getElementById('linkTxtBtn');
        if (linkTxtBtn) linkTxtBtn.addEventListener('click', linkTxtFile);

        var downloadTxtBtn = document.getElementById('downloadTxtBtn');
        if (downloadTxtBtn) downloadTxtBtn.addEventListener('click', downloadRetosTxt);

        if (soundToggle) {
            soundToggle.addEventListener('click', function() {
                soundEnabled = !soundEnabled;
                soundToggle.textContent = soundEnabled ? '🔊 SONIDO' : '🔇 MUDO';
                soundToggle.classList.toggle('muted', !soundEnabled);
            });
        }

        // --- FISICA Y RENDERIZADO DE LA RULETA ---

        function createSparks(container) {
            if (!container) return;
            var rect = container.getBoundingClientRect();
            var cx = rect.width / 2; var cy = rect.height / 2;
            for (var i = 0; i < 12; i++) {
                var spark = document.createElement('div'); spark.className = 'spark'; spark.style.left = cx + 'px'; spark.style.top = cy + 'px';
                spark.style.background = ['#FFCC00', '#FF6600', '#FF3300', '#FFD700'][i % 4];
                var angle = (Math.PI * 2 * i) / 12; var dist = 80 + Math.random() * 60;
                spark.style.setProperty('--tx', Math.cos(angle) * dist + 'px'); spark.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
                container.appendChild(spark); setTimeout(function() { spark.remove(); }, 800);
            }
        }

        function flashScreen() {
            if (flashOverlay) {
                flashOverlay.classList.add('active');
                setTimeout(function() { flashOverlay.classList.remove('active'); }, 150);
            }
        }
        
        function shakeScreen() {
            document.body.classList.add('shake');
            setTimeout(function() { document.body.classList.remove('shake'); }, 400);
        }

        let currentRotation = 0; let isSpinning = false; let animationId = null;
        var CHALLENGES = window.CHALLENGES || [];
        const CENTER_X = canvas.width / 2; const CENTER_Y = canvas.height / 2;
        const RADIUS = canvas.width / 2 - 20; const NUM_SECTIONS = CHALLENGES.length;
        const ARC_ANGLE = (2 * Math.PI) / NUM_SECTIONS;

        function drawWheel() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save(); ctx.translate(CENTER_X, CENTER_Y); ctx.rotate(currentRotation); ctx.translate(-CENTER_X, -CENTER_Y);

            for (let i = 0; i < NUM_SECTIONS; i++) {
                const startAngle = i * ARC_ANGLE - Math.PI / 2; const endAngle = startAngle + ARC_ANGLE;
                ctx.beginPath(); ctx.moveTo(CENTER_X, CENTER_Y); ctx.arc(CENTER_X, CENTER_Y, RADIUS, startAngle, endAngle); ctx.closePath();
                ctx.fillStyle = CHALLENGES[i].color; ctx.fill(); ctx.strokeStyle = "#000000"; ctx.lineWidth = 3; ctx.stroke();

                const midAngle = startAngle + ARC_ANGLE / 2; const textRadius = RADIUS * 0.65;
                const textX = CENTER_X + Math.cos(midAngle) * textRadius; const textY = CENTER_Y + Math.sin(midAngle) * textRadius;

                ctx.save(); ctx.translate(textX, textY); ctx.rotate(midAngle + Math.PI / 2);
                ctx.font = "bold 14px 'Arial Black', 'Impact', sans-serif"; ctx.fillStyle = "#FFFFFF"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.strokeStyle = "#000000"; ctx.lineWidth = 4; ctx.lineJoin = "round";

                const displayText = CHALLENGES[i].wheelText || CHALLENGES[i].text;
                ctx.strokeText(displayText, 0, 0); ctx.fillText(displayText, 0, 0); ctx.restore();
            }

            ctx.beginPath(); ctx.arc(CENTER_X, CENTER_Y, 45, 0, 2 * Math.PI); ctx.fillStyle = "#000000"; ctx.fill(); ctx.strokeStyle = "#FFCC00"; ctx.lineWidth = 4; ctx.stroke();
            ctx.beginPath(); ctx.arc(CENTER_X, CENTER_Y, RADIUS, 0, 2 * Math.PI); ctx.strokeStyle = "#FFCC00"; ctx.lineWidth = 6; ctx.stroke();
            ctx.restore();
        }

        function selectWinner() {
            const totalWeight = CHALLENGES.reduce((sum, ch) => sum + ch.weight, 0);
            let random = Math.random() * totalWeight;
            for (let i = 0; i < CHALLENGES.length; i++) { random -= CHALLENGES[i].weight; if (random <= 0) { return i; } }
            return CHALLENGES.length - 1;
        }

        function calculateTargetAngle(winnerIndex) {
            const winnerCenterAngle = winnerIndex * ARC_ANGLE - Math.PI / 2 + ARC_ANGLE / 2;
            return -Math.PI / 2 - winnerCenterAngle;
        }

        function startIdleSpin() {
            if (isIdleSpinning || isSpinning) return;
            isIdleSpinning = true;
            function idleAnimate() {
                if (!isIdleSpinning) return;
                idleRotation += IDLE_SPEED;
                if (idleRotation > 2 * Math.PI) { idleRotation -= 2 * Math.PI; }
                currentRotation = idleRotation; drawWheel();
                idleAnimationId = requestAnimationFrame(idleAnimate);
            }
            idleAnimationId = requestAnimationFrame(idleAnimate);
        }

        function stopIdleSpin() {
            isIdleSpinning = false;
            if (idleAnimationId) { cancelAnimationFrame(idleAnimationId); idleAnimationId = null; }
        }

        function spinWheel() {
            if (isSpinning) return;
            SoundFX.init(); SoundFX.playSpinStart(); stopIdleSpin();
            isSpinning = true; if (spinBtn) spinBtn.disabled = true; lastTickSection = -1;

            if (wheelContainer) {
                wheelContainer.classList.add('spinning'); wheelContainer.classList.remove('landing');
            }
            if (logoContainer) logoContainer.classList.add('spin-active');
            if (arrowIndicator) arrowIndicator.classList.remove('landing');

            if (resultLabel) resultLabel.classList.remove('visible');
            if (resultText) resultText.classList.remove('visible', 'animate', 'jackpot');
            if (resultDescription) resultDescription.classList.remove('visible');
            if (inventorContainer) inventorContainer.classList.remove('visible');
            if (inventorSavedMsg) inventorSavedMsg.classList.remove('visible');
            
            if (resultText) resultText.textContent = '';
            if (resultDescription) resultDescription.textContent = '';
            if (inventorInput) inventorInput.value = '';

            const winnerIndex = selectWinner();
            const targetAngle = calculateTargetAngle(winnerIndex);
            const spinDuration = 4000; const minSpins = 5; const startAngle = currentRotation;
            const extraSpins = minSpins * 2 * Math.PI;
            let targetFinal = targetAngle + extraSpins;

            while (targetFinal < startAngle + extraSpins) { targetFinal += 2 * Math.PI; }
            const randomOffset = (Math.random() - 0.5) * ARC_ANGLE * 0.2; targetFinal += randomOffset;
            const startTime = performance.now();

            function animate(currentTime) {
                const elapsed = currentTime - startTime; let progress = elapsed / spinDuration;
                if (progress >= 1) {
                    progress = 1; currentRotation = targetFinal; drawWheel();
                    if (wheelContainer) {
                        wheelContainer.classList.remove('spinning'); wheelContainer.classList.add('landing');
                    }
                    if (logoContainer) logoContainer.classList.remove('spin-active');
                    if (arrowIndicator) arrowIndicator.classList.add('landing');
                    
                    setTimeout(function() {
                        if (wheelContainer) wheelContainer.classList.remove('landing');
                        if (arrowIndicator) arrowIndicator.classList.remove('landing');
                    }, 700);

                    showResult(winnerIndex); isSpinning = false; if (spinBtn) spinBtn.disabled = false;
                    currentRotation = currentRotation % (2 * Math.PI); idleRotation = currentRotation;
                    setTimeout(function() { if (!isSpinning) { startIdleSpin(); } }, 3000); return;
                }

                const easeOut = 1 - Math.pow(1 - progress, 3);
                currentRotation = startAngle + (targetFinal - startAngle) * easeOut;

                var normalizedRot = ((currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
                var currentSection = Math.floor(normalizedRot / ARC_ANGLE) % NUM_SECTIONS;
                if (currentSection !== lastTickSection) { SoundFX.playTick(); lastTickSection = currentSection; }
                if (Math.random() < 0.08) { createSparks(wheelContainer); }

                drawWheel(); animationId = requestAnimationFrame(animate);
            }
            animationId = requestAnimationFrame(animate);
        }

        function showResult(winnerIndex) {
            const winner = CHALLENGES[winnerIndex]; const isJackpot = winner.wheelText === 'GRATIS';
            flashScreen(); shakeScreen(); SoundFX.playWin(isJackpot);

            if (resultText) {
                resultText.style.borderColor = winner.color;
                resultText.style.textShadow = `3px 3px 0 ${winner.color}, 6px 6px 0 #000000, 0 0 20px ${winner.color}80`;
                resultText.textContent = winner.emoji ? winner.emoji + ' ' + winner.text : winner.text;
                if (isJackpot) { resultText.classList.add('jackpot'); }
                resultText.classList.add('visible', 'animate');
            }

            if (resultDescription) {
                resultDescription.innerHTML = winner.description + '<span class="price">Cumple y el chesco te queda en: ' + winner.price + '</span>';
                resultDescription.classList.add('visible');
            }

            if (winner.hasInput) {
                if (inventorContainer) {
                    inventorContainer.classList.add('visible');
                    setTimeout(function() { inventorInput.focus(); }, 600);
                }
            } else {
                if (inventorContainer) inventorContainer.classList.remove('visible');
            }

            if (resultLabel) resultLabel.classList.add('visible');
            createConfetti(isJackpot ? 60 : 30); createSparks(wheelContainer);
        }

        function createConfetti(count) {
            count = count || 30; const colors = ['#FF6600', '#FFCC00', '#FF3300', '#2196F3', '#4CAF50', '#E91E63', '#FFD700'];
            for (let i = 0; i < count; i++) {
                const confetti = document.createElement('div'); confetti.className = 'confetti'; confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 1 + 's'; confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0'; confetti.style.width = (Math.random() * 10 + 5) + 'px'; confetti.style.height = (Math.random() * 10 + 5) + 'px';
                document.body.appendChild(confetti); setTimeout(() => confetti.remove(), 4000);
            }
        }

        function createLights() {
            const container = document.getElementById('lights');
            if (!container) return;
            const colors = ['#FFCC00', '#FF3300', '#FF6600', '#FFEB3B'];
            for (let i = 0; i < 20; i++) {
                const light = document.createElement('div'); light.className = 'light'; light.style.left = Math.random() * 100 + '%'; light.style.top = Math.random() * 100 + '%';
                light.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]; light.style.animationDelay = Math.random() * 2 + 's';
                light.style.boxShadow = `0 0 10px ${light.style.backgroundColor}`; container.appendChild(light);
            }
        }

        if (spinBtn) spinBtn.addEventListener('click', spinWheel);

        // Inicialización del Canvas de la ruleta
        drawWheel();
        createLights();
        renderSavedRetosList();
        loadStoredFileHandle();
        startIdleSpin();
    });
})();