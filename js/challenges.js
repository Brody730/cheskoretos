// js/challenges.js

/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - LISTA DE RETOS Y RENDERIZADO
 * ═══════════════════════════════════════════
 */
window.CHALLENGES = [
  // ═══ NIVEL FÁCIL (Descuento: $5) ═══
  {
    id: "intelectual",
    title: "EL INTELECTUAL",
    description: "Sácale brillo a la neurona: aviéntate un dato curioso más rápido que un chisme (ej: ¿Sabías que los delfines duermen con un ojo abierto?). Si se te congela el cerebro, ¡se vale pedirle ayuda al de atrás en la fila!",
    wheelText: "Dato Curioso",
    discount: "$5",
    complexity: "Fácil"
  },
  {
    id: "volado",
    title: "EL VOLADO",
    description: "El clásico de clásicos. Escoges águila o sol, aventamos la moneda al aire de forma legal y que el destino decida tu suerte en un segundo.",
    wheelText: "Volado",
    discount: "$5",
    complexity: "Fácil"
  },
  {
    id: "miron",
    title: "EL MIRÓN",
    description: "Duelo de miradas épico contra el de la caja. El primero que parpadee, se ría o agache la mirada, pierde. ¡Se vale hacer caras para presionar al rival!",
    wheelText: "Duelo Miradas",
    discount: "$5",
    complexity: "Fácil"
  },
  {
    id: "chistosito",
    title: "EL CHISTOSITO",
    description: "Saca tu mejor chiste (el de Pepito, Jaimito o uno de papás). Tienes una oportunidad para hacer reír al de la caja. Si logras sacarle la carcajada, ¡te ganas el descuento! Si tu chiste está bien frío, no te agüites, de todos modos te dejamos el chesco al mismo precio para que no te vayas triste.",
    wheelText: "Chiste",
    discount: "$5",
    complexity: "Fácil"
  },

  // ═══ NIVEL INTERMEDIO (Descuento: $10) ═══
  {
    id: "botellazo",
    title: "EL BOTELLAZO",
    description: "El reto del 'Bottle Flip'. Lanzas la botella de agua al aire, da una vuelta completa y tiene que caer perfectamente parada en la mesa. ¡Un solo intento para la gloria!",
    wheelText: "Bottle Flip",
    discount: "$10",
    complexity: "Intermedio"
  },
  {
    id: "griton",
    title: "EL GRITÓN",
    description: "Saca el aire y conviértete en el promotor oficial del puesto. Tienes que gritar a todo pulmón hacia el parque: ¡Pásale, pásale por tu ChesKoreto bien frío! con ritmo y actitud de marchante. Si voltean al menos tres personas, ¡reto superado!",
    wheelText: "¡Pásale!",
    discount: "$10",
    complexity: "Intermedio"
  },
  {
    id: "mimo",
    title: "EL MIMO",
    description: "Tienes que pedir tu ChesKoreto favorito y el tamaño utilizando únicamente mímica. Cero palabras, cero sonidos, puro lenguaje corporal. Si el de la caja le entiende a la primera, reto superado.",
    wheelText: "Mímica",
    discount: "$10",
    complexity: "Intermedio"
  },
  {
    id: "cirquero",
    title: "EL CIRQUERO",
    description: "Le das dos limones al cliente. Tiene que aventarse al menos 3 cachadas seguidas haciendo malabares en el aire con una sola mano o cruzados, sin que se le caiga ninguno al piso.",
    wheelText: "Malabares",
    discount: "$10",
    complexity: "Intermedio"
  },
  {
    id: "monedazo",
    title: "EL MONEDAZO",
    description: "Ponemos un vaso de plástico en el suelo a tres pasos de distancia. El cliente tiene dos intentos para lanzar una moneda de un peso y meterla en el vaso. ¡Ojo, que en el piso el rebote traiciona!",
    wheelText: "Monedazo",
    discount: "$10",
    complexity: "Intermedio"
  },
  {
    id: "basquetbolista",
    title: "EL BÁSQUETBOLISTA",
    description: "Saca el Michael Jordan que llevas dentro. Tienes un tiro para encestar la bola en nuestra canasta miniatura. ¡Cero presión, todo el parque te está viendo!",
    wheelText: "Tiro Basket",
    discount: "$10",
    complexity: "Intermedio"
  },
  {
    id: "trabalenguas",
    title: "EL TRABALENGUAS",
    description: "¡Sin escupir! Tienes 15 segundos para recitar el trabalenguas corto de la cartulina sin que se te trabe la lengua y sin equivocarte. Respira hondo y ¡dale!",
    wheelText: "Trabalenguas",
    discount: "$10",
    complexity: "Intermedio"
  },

  // ═══ NIVEL DIFÍCIL (Descuento: $15) ═══
  {
    id: "posibilidad",
    title: "¿QUÉ POSIBILIDAD HAY?",
    description: "Conexión mental: a la de tres, tú y el de la caja van a decir un número del 1 al 3 al mismo tiempo. Si dicen exactamente el mismo número, ¡ganas!",
    wheelText: "Mismo Número",
    discount: "$15",
    complexity: "Difícil"
  },
  {
    id: "influencer",
    title: "EL INFLUENCER",
    description: "Presume el antojo: sube una foto o video chido del puesto a tus historias de Instagram o Facebook etiquetándonos, enséñala en caja y ya ganaste tu descuento.",
    wheelText: "Subir Historia",
    discount: "$15",
    complexity: "Difícil"
  },
  {
    id: "retador",
    title: "EL RETADOR",
    description: "Te juegas el descuento en una sola ronda a muerte súbita contra el de la caja. Si ganas, te lo llevas a precio especial; si empatan o pierdes, te damos otra oportunidad para que nadie se vaya triste del puesto.",
    wheelText: "Muerte Súbita",
    discount: "$15",
    complexity: "Difícil"
  },
  {
    id: "inventor",
    title: "EL INVENTOR",
    description: "¡Aquí tú pones las reglas! Invéntate un minireto rápido en ese momento y aplícaselo al cliente que sigue atrás de ti en la fila (ej. Que pida su chesco con voz de Mickey Mouse o cantando).",
    wheelText: "Inventor",
    discount: "$15",
    complexity: "Difícil"
  },
  {
    id: "milimetrico",
    title: "EL MILIMÉTRICO",
    description: "Pones un vaso vacío en la mesa. El cliente toma una jarra y tiene que llenar el vaso hasta una línea exacta marcada con cinta, pero con los ojos bien cerrados. Si se queda a menos de un dedo de distancia de la línea (sin pasarse), ¡gana!",
    wheelText: "Cubero",
    discount: "$15",
    complexity: "Difícil"
  },
  {
    id: "reflejo-x",
    title: "REFLEJO X",
    description: "Pones tus manos con las palmas hacia arriba a la altura del pecho. El cliente pone las suyas encima flotando (sin tocarte). El cliente tiene que intentar darte un manotazo leve en las palmas antes de que tú las quites. Tienen 3 intentos para lograrlo.",
    wheelText: "Reflejos",
    discount: "$15",
    complexity: "Difícil"
  },
  {
    id: "reloj-humano",
    title: "EL RELOJ HUMANO",
    description: "Le pides al cliente que cierre los ojos. Cuando diga 'ya', tú activas el cronómetro en caja. El cliente tiene que decir 'stop' exactamente cuando crea que pasaron 7 segundos (sin ver). Si lo detiene entre el segundo 6.5 y el 7.5, ¡reto superado!",
    wheelText: "Reloj",
    discount: "$15",
    complexity: "Difícil"
  },

  // ═══ PREMIO MAYOR (¡GRATIS!) ═══
  {
    id: "suertudote",
    title: "¡EL SUERTUDOTE!",
    description: "El gajo de la suerte máxima. No hay retos, no hay preguntas, no hay osos; solo la ruleta premiando tu bonita visita.",
    wheelText: "GRATIS",
    discount: "100%",
    complexity: "Extremo"
  },

  // ═══ EL DONATIVO (Precio Completo) ═══
  {
    id: "donativo",
    title: "EL DONATIVO",
    description: "Aquí no hay esfuerzo físico ni osos. Pagas un precio intermedio de $30 pesitos, y esos $5 extras de ganancia se van directo a la 'caja de buena onda' para patrocinar el chesco del próximo suertudote.",
    wheelText: "Donativo",
    discount: "PRECIO COMPLETO",
    complexity: "Especial"
  }
];

var CHALLENGE_COLORS = {
  intelectual: "#2196F3",
  volado: "#FF9800",
  miron: "#607D8B",
  chistosito: "#FF4081",
  botellazo: "#009688",
  griton: "#FF5722",
  mimo: "#795548",
  cirquero: "#00E676",
  monedazo: "#8BC34A",
  basquetbolista: "#E65100",
  trabalenguas: "#FFEB3B",
  posibilidad: "#00BCD4",
  influencer: "#E1306C",
  retador: "#F44336",
  inventor: "#9C27B0",
  milimetrico: "#3F51B5",
  "reflejo-x": "#00796B",
  "reloj-humano": "#9E9E9E",
  suertudote: "#FFD700",
  donativo: "#4CAF50"
};

var CHALLENGE_EMOJIS = {
  intelectual: "🧠",
  volado: "🪙",
  miron: "👀",
  chistosito: "🎭",
  botellazo: "🍾",
  griton: "📣",
  mimo: "🤫",
  cirquero: "🥚",
  monedazo: "🪙",
  basquetbolista: "🏀",
  trabalenguas: "👅",
  posibilidad: "🔢",
  influencer: "🤳",
  retador: "✊",
  inventor: "🎲",
  milimetrico: "📐",
  "reflejo-x": "🖐️",
  "reloj-humano": "⏰",
  suertudote: "🌟",
  donativo: "😇"
};

var CHALLENGE_WEIGHTS = {
  Fácil: 5,
  Intermedio: 4,
  Difícil: 3,
  Extremo: 1,
  Especial: 2
};

function getChallengeColor(ch) { return CHALLENGE_COLORS[ch.id] || '#888888'; }
function getChallengeEmoji(ch) { return CHALLENGE_EMOJIS[ch.id] || ''; }
function getChallengeWeight(ch) { return CHALLENGE_WEIGHTS[ch.complexity] || 3; }

function getDiscountText(ch) {
  if (ch.wheelText === 'GRATIS') return '¡GRATIS!';
  if (ch.discount === 'PRECIO COMPLETO') return 'SOPORTE A LA CAUSA: PRECIO COMPLETO';
  return 'CUMPLE Y OBTÉN UN DESCUENTO DE: ' + ch.discount;
}

function getDiscountTextModal(ch) {
  if (ch.wheelText === 'GRATIS') return '¡GRATIS!';
  if (ch.discount === 'PRECIO COMPLETO') return 'SOPORTE A LA CAUSA: PRECIO COMPLETO';
  return 'CUMPLE Y OBTÉN UN DESCUENTO DE: ' + ch.discount;
}

function getDiscountTextDescription(ch) {
  if (ch.wheelText === 'GRATIS') return '¡Gratis! No necesitas cumplir ningún reto.';
  if (ch.discount === 'PRECIO COMPLETO') return '¡Hoy te toca apoyar la causa! Sin descuento, precio completo.';
  return '¡Cumple el reto y obtén un descuento de ' + ch.discount + '!';
}

document.addEventListener("DOMContentLoaded", function() {
    var contenedor = document.getElementById("contenedorRetos");
    if (!contenedor) return;
    var retos = window.CHALLENGES || [];
    if (retos.length === 0) {
        contenedor.innerHTML = "<p style='color: #ffffff;'>Cargando los retos de la suerte...</p>";
        return;
    }
    contenedor.innerHTML = retos.map(function(reto) {
        var esGratis = (reto.wheelText === 'GRATIS') ? 'gratis' : '';
        var borderColor = getChallengeColor(reto);
        return `
            <div class="tarjeta-reto" style="border-color: ${borderColor}; box-shadow: 5px 5px 0px ${borderColor}80, 5px 5px 0px #000;">
                <h3 style="color: ${borderColor};">${getChallengeEmoji(reto)} ${reto.title}</h3>
                <p>${reto.description}</p>
                <p class="precio ${esGratis}">${getDiscountText(reto)}</p>
            </div>
        `;
    }).join('');
});

/**
 * ═══════════════════════════════════════════
 * SISTEMA INTERACTIVO DE LA RULETA (canvas)
 * ═══════════════════════════════════════════
 */
(function() {
    'use strict';

    // Inyección de estilos correctivos e interactivos forzados con !important para anular bloqueos previos
    const style = document.createElement('style');
    style.innerHTML = `
        /* Corregir posición para que la ruleta no se encime sobre el bloque inferior de textos */
        .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding-bottom: 50px;
        }
        .result-container {
            position: relative !important;
            margin-top: 40px !important;
            z-index: 10 !important;
            width: 100%;
            max-width: 600px;
        }

        /* Forzar el crecimiento dinámico y espectacular de la ruleta mediante CSS transform */
        #wheelContainer {
            transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) !important;
            transform-origin: center center !important;
            z-index: 5 !important;
        }
        #wheelContainer.fullscreen-spin {
            transform: scale(1.45) !important; /* Se agranda un 45% en pantalla */
        }

        /* MODAL GIGANTE EN MEDIO DE LA PANTALLA */
        .modal-resultado-gigante {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) scale(0.6);
            width: 90%;
            max-width: 650px;
            background: rgba(15, 15, 15, 0.98) !important;
            border: 6px solid #FFCC00 !important;
            box-shadow: 0 0 60px rgba(255, 204, 0, 0.6), 0 0 0 9999px rgba(0, 0, 0, 0.85) !important;
            border-radius: 24px;
            padding: 35px;
            text-align: center;
            z-index: 99999 !important;
            opacity: 0;
            visibility: hidden;
            transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        }
        .modal-resultado-gigante.active {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
            visibility: visible;
        }
        .modal-resultado-gigante h2 {
            font-family: 'Luckiest Guy', 'Bangers', sans-serif !important;
            font-size: 3rem !important;
            color: #FFF;
            margin: 10px 0 20px 0;
            letter-spacing: 1px;
        }
        .modal-resultado-gigante p {
            font-family: 'Arial', sans-serif;
            font-size: 1.3rem !important;
            line-height: 1.6 !important;
            color: #FFF !important;
            margin-bottom: 25px;
        }
        .modal-resultado-gigante .modal-price-badge {
            display: inline-block;
            font-family: 'Luckiest Guy', sans-serif;
            font-size: 2rem;
            color: #FFF;
            padding: 10px 30px;
            border-radius: 50px;
            box-shadow: 4px 4px 0px #000;
            margin-bottom: 25px;
        }
        .modal-resultado-gigante .btn-cerrar-modal {
            background: #FF5722;
            color: #FFF;
            font-family: 'Luckiest Guy', sans-serif;
            font-size: 1.4rem;
            border: 3px solid #000;
            padding: 12px 40px;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 3px 3px 0px #000;
            transition: transform 0.1s;
        }
        .modal-resultado-gigante .btn-cerrar-modal:active {
            transform: translate(2px, 2px);
        }

        /* Animación del confeti recuperada y corregida */
        .confetti {
            position: fixed;
            width: 12px;
            height: 12px;
            z-index: 999999;
            top: -20px;
            animation: fall linear forwards;
        }
        @keyframes fall {
            to {
                transform: translateY(105vh) rotate(360deg);
            }
        }

        /* ═══ LEYENDA DE RETOS ═══ */
        .legend-panel {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            padding: 15px 20px;
            background: rgba(0,0,0,0.85);
            border: 4px solid #FFCC00;
            border-radius: 15px;
            box-shadow: 8px 8px 0 #000;
        }
        .legend-panel h3 {
            font-family: 'Luckiest Guy', sans-serif;
            font-size: 1.3rem;
            color: #FFCC00;
            text-shadow: 2px 2px 0 #000;
            text-align: center;
            margin-bottom: 10px;
            letter-spacing: 1px;
        }
        .legend-list {
            list-style: none;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 6px 12px;
            padding: 0;
            margin: 0;
        }
        .legend-list li {
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: 'Bangers', sans-serif;
            font-size: 0.85rem;
            color: #FFF;
            text-shadow: 1px 1px 0 #000;
            padding: 3px 8px;
            border-radius: 6px;
            background: rgba(255,255,255,0.05);
        }
        .legend-num {
            font-family: 'Luckiest Guy', sans-serif;
            font-size: 0.75rem;
            color: #FFF;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #000;
            flex-shrink: 0;
        }
        .legend-name {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .legend-discount {
            font-family: 'Luckiest Guy', sans-serif;
            font-size: 0.8rem;
            color: #FFCC00;
            text-shadow: 1px 1px 0 #000;
            white-space: nowrap;
        }

        /* ═══ SCOREBOARD ═══ */
        .scoreboard-section {
            width: 100%;
            max-width: 600px;
            margin: 25px auto;
            padding: 20px;
            background: rgba(0,0,0,0.9);
            border: 4px solid #FF6600;
            border-radius: 15px;
            box-shadow: 8px 8px 0 #000;
        }
        .scoreboard-title {
            font-family: 'Luckiest Guy', sans-serif;
            font-size: 1.6rem;
            color: #FF6600;
            text-shadow: 3px 3px 0 #000;
            text-align: center;
            margin-bottom: 5px;
            letter-spacing: 2px;
        }
        .scoreboard-subtitle {
            font-family: 'Bangers', sans-serif;
            font-size: 0.85rem;
            color: #888;
            text-align: center;
            margin-bottom: 15px;
        }
        .scoreboard-table-wrap {
            overflow-x: auto;
            margin-bottom: 15px;
        }
        .scoreboard-table {
            width: 100%;
            border-collapse: collapse;
            font-family: 'Bangers', sans-serif;
            font-size: 0.95rem;
            color: #FFF;
            text-shadow: 1px 1px 0 #000;
        }
        .scoreboard-table th {
            background: #FF6600;
            color: #000;
            padding: 8px 10px;
            text-align: left;
            border: 2px solid #000;
            font-family: 'Luckiest Guy', sans-serif;
            font-size: 0.9rem;
            letter-spacing: 1px;
        }
        .scoreboard-table td {
            padding: 6px 10px;
            border: 2px solid #333;
        }
        .scoreboard-table tr:nth-child(even) td {
            background: rgba(255,102,0,0.08);
        }
        .scoreboard-table .empty-row td {
            text-align: center;
            color: #666;
            padding: 20px;
        }
        .col-num { width: 40px; text-align: center; color: #FFCC00; }
        .col-user { font-family: 'Luckiest Guy', sans-serif; color: #FFCC00; }
        .col-reto { }
        .col-check { width: 50px; text-align: center; font-size: 1.2rem; }
        .sb-avatar {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            font-family: 'Luckiest Guy', sans-serif;
            font-size: 0.62rem;
            color: #fff;
            border: 2px solid rgba(0,0,0,0.6);
            vertical-align: middle;
            margin-right: 4px;
            flex-shrink: 0;
        }
        .sb-avatar-photo {
            display: inline-block;
            object-fit: cover;
            border: 2px solid #FFCC00;
            background: #333;
        }

        .scoreboard-form {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
            justify-content: center;
            padding-top: 10px;
            border-top: 2px dashed #FF6600;
        }
        .scoreboard-form label {
            font-family: 'Bangers', sans-serif;
            font-size: 0.9rem;
            color: #FFF;
            text-shadow: 1px 1px 0 #000;
        }
        .scoreboard-form input[type="text"] {
            font-family: 'Bangers', sans-serif;
            font-size: 0.95rem;
            padding: 8px 12px;
            background: #222;
            color: #FFF;
            border: 3px solid #FF6600;
            border-radius: 8px;
            width: 160px;
        }
        .scoreboard-form input[type="text"]:focus {
            outline: none;
            border-color: #FFCC00;
            box-shadow: 0 0 10px rgba(255,204,0,0.4);
        }
        .checkbox-group {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        .checkbox-group label {
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            font-family: 'Bangers', sans-serif;
            font-size: 0.9rem;
            color: #FFF;
        }
        .checkbox-group input[type="radio"] {
            accent-color: #FF6600;
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
        .btn-scoreboard {
            font-family: 'Luckiest Guy', sans-serif;
            font-size: 0.95rem;
            padding: 8px 18px;
            border: 3px solid #000;
            border-radius: 10px;
            cursor: pointer;
            letter-spacing: 1px;
            text-shadow: 1px 1px 0 #000;
            transition: all 0.1s ease;
            box-shadow: 3px 3px 0 #000;
        }
        .btn-scoreboard:active {
            transform: translate(2px, 2px);
            box-shadow: 0 0 0 #000;
        }
        .btn-scoreboard.register {
            background: linear-gradient(180deg, #FF6600, #FF3300);
            color: #FFF;
        }
        .btn-scoreboard.register:hover {
            background: linear-gradient(180deg, #FF7700, #FF4400);
        }
        .btn-scoreboard.clear {
            background: #333;
            color: #FF6600;
            border-color: #FF6600;
            flex: 0;
        }
        .btn-scoreboard.clear:hover {
            background: #444;
        }
        .btn-scoreboard.share {
            background: linear-gradient(180deg, #FFCC00, #FF9900);
            color: #000;
            text-shadow: none;
            border-color: #000;
            flex: 0;
        }
        .btn-scoreboard.share:hover {
            background: linear-gradient(180deg, #FFDD33, #FFAA22);
        }
    `;
    document.head.appendChild(style);

    document.addEventListener("DOMContentLoaded", function() {
        var canvas = document.getElementById('wheelCanvas');
        if (!canvas) return;

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

        // Construir dinámicamente la ventana modal centralizada si no existe
        var modalGigante = document.getElementById('modalResultadoGigante');
        if (!modalGigante) {
            modalGigante = document.createElement('div');
            modalGigante.className = 'modal-resultado-gigante';
            modalGigante.id = 'modalResultadoGigante';
            modalGigante.innerHTML = `
                <div style="font-size: 1.2rem; color: #FFCC00; font-family: 'Luckiest Guy', sans-serif; letter-spacing: 2px;">¡RETO OBTENIDO!</div>
                <h2 id="modalTitle">EL RETO</h2>
                <p id="modalDesc">Descripción del juego...</p>
                <div><span class="modal-price-badge" id="modalBadge">$25</span></div>
                <div><button type="button" class="btn-cerrar-modal" id="btnCerrarModal">¡ACEPTAR RETO!</button></div>
            `;
            document.body.appendChild(modalGigante);
        }

        var modalTitle = document.getElementById('modalTitle');
        var modalDesc = document.getElementById('modalDesc');
        var modalBadge = document.getElementById('modalBadge');
        var btnCerrarModal = document.getElementById('btnCerrarModal');

        // RE-HABILITAR el botón de giro y restaurar tamaño al cerrar el modal central
        btnCerrarModal.addEventListener('click', function() {
            modalGigante.classList.remove('active');
            if (wheelContainer) wheelContainer.classList.remove('fullscreen-spin');
            if (spinBtn) {
                spinBtn.disabled = false; // Desbloquear botón
                spinBtn.style.opacity = "1";
            }

            var textActual = modalTitle.textContent || "";
            if (textActual.includes("INVENTOR")) {
                if (inventorContainer) inventorContainer.classList.add('visible');
                if (inventorInput) setTimeout(() => inventorInput.focus(), 400);
            }

            autoRegistrarParticipante();
        });

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
        var IDLE_SPEED = 0.006;       

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
                gain.gain.setValueAtTime(0.06, t);
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
                osc.frequency.exponentialRampToValueAtTime(550, t + 0.3);
                osc.type = 'sawtooth';
                gain.gain.setValueAtTime(0.1, t);
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
                    gain.gain.linearRampToValueAtTime(0.12, start + 0.03);
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
                    gain.gain.setValueAtTime(0.1, start);
                    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
                    osc.start(start);
                    osc.stop(start + 0.2);
                });
            }
        };

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
        var lastWinnerIndex = -1;
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
                ctx.fillStyle = getChallengeColor(CHALLENGES[i]); ctx.fill(); ctx.strokeStyle = "#000000"; ctx.lineWidth = 3; ctx.stroke();

                const midAngle = startAngle + ARC_ANGLE / 2; const textRadius = RADIUS * 0.65;
                const textX = CENTER_X + Math.cos(midAngle) * textRadius; const textY = CENTER_Y + Math.sin(midAngle) * textRadius;

                ctx.save(); ctx.translate(textX, textY); ctx.rotate(midAngle + Math.PI / 2);
                ctx.font = "bold 22px 'Arial Black', 'Impact', sans-serif"; ctx.fillStyle = "#FFFFFF"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.strokeStyle = "#000000"; ctx.lineWidth = 4; ctx.lineJoin = "round";

                const displayText = String(i + 1);
                ctx.strokeText(displayText, 0, 0); ctx.fillText(displayText, 0, 0); ctx.restore();
            }

            ctx.beginPath(); ctx.arc(CENTER_X, CENTER_Y, 45, 0, 2 * Math.PI); ctx.fillStyle = "#000000"; ctx.fill(); ctx.strokeStyle = "#FFCC00"; ctx.lineWidth = 4; ctx.stroke();
            ctx.beginPath(); ctx.arc(CENTER_X, CENTER_Y, RADIUS, 0, 2 * Math.PI); ctx.strokeStyle = "#FFCC00"; ctx.lineWidth = 6; ctx.stroke();
            ctx.restore();
        }

        function selectWinner() {
            const totalWeight = CHALLENGES.reduce((sum, ch) => sum + getChallengeWeight(ch), 0);
            let random = Math.random() * totalWeight;
            for (let i = 0; i < CHALLENGES.length; i++) { random -= getChallengeWeight(CHALLENGES[i]); if (random <= 0) { return i; } }
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
            isSpinning = true; 
            
            if (spinBtn) {
                spinBtn.disabled = true;
                spinBtn.style.opacity = "0.4"; // Atenuar botón mientras gira
            }
            lastTickSection = -1;

            modalGigante.classList.remove('active');

            // AGRANDAR LA RULETA AL GIRAR (Añadir clase fullscreen)
            if (wheelContainer) {
                wheelContainer.classList.add('spinning', 'fullscreen-spin'); 
                wheelContainer.classList.remove('landing');
            }
            if (logoContainer) logoContainer.classList.add('spin-active');
            if (arrowIndicator) arrowIndicator.classList.remove('landing');

            if (resultLabel) resultLabel.classList.remove('visible');
            if (resultText) resultText.classList.remove('visible', 'animate', 'jackpot');
            if (resultDescription) resultDescription.classList.remove('visible');
            if (inventorContainer) inventorContainer.classList.remove('visible');
            if (inventorSavedMsg) inventorSavedMsg.classList.remove('visible');
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
                        wheelContainer.classList.remove('spinning'); 
                        wheelContainer.classList.add('landing');
                    }
                    if (logoContainer) logoContainer.classList.remove('spin-active');
                    if (arrowIndicator) arrowIndicator.classList.add('landing');
                    
                    setTimeout(function() {
                        if (arrowIndicator) arrowIndicator.classList.remove('landing');
                    }, 700);

                    showResult(winnerIndex); 
                    isSpinning = false; // Permite volver a girar en el futuro
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
            lastWinnerIndex = winnerIndex;
            const winner = CHALLENGES[winnerIndex]; const isJackpot = winner.wheelText === 'GRATIS';
            const winnerColor = getChallengeColor(winner);
            const winnerEmoji = getChallengeEmoji(winner);
            flashScreen(); shakeScreen(); SoundFX.playWin(isJackpot);

            // 1. Mantener también los textos de abajo actualizados (por si acaso)
            if (resultText) {
                resultText.style.borderColor = winnerColor;
                resultText.style.textShadow = `3px 3px 0 ${winnerColor}, 6px 6px 0 #000000, 0 0 20px ${winnerColor}80`;
                resultText.textContent = winnerEmoji ? winnerEmoji + ' ' + winner.title : winner.title;
                if (isJackpot) { resultText.classList.add('jackpot'); }
                resultText.classList.add('visible', 'animate');
            }
            if (resultDescription) {
                resultDescription.innerHTML = winner.description + '<span class="price">' + getDiscountTextDescription(winner) + '</span>';
                resultDescription.classList.add('visible');
            }
            if (resultLabel) resultLabel.classList.add('visible');

            // 2. INYECTAR Y MOSTRAR EN EL MODAL GIGANTE AL CENTRO
            if (modalTitle) {
                modalTitle.textContent = winnerEmoji ? winnerEmoji + " " + winner.title : winner.title;
                modalTitle.style.color = winnerColor;
            }
            if (modalDesc) {
                modalDesc.textContent = winner.description;
            }
            if (modalBadge) {
                modalBadge.textContent = getDiscountTextModal(winner);
                modalBadge.style.backgroundColor = winnerColor;
            }

            // Activar modal
            modalGigante.classList.add('active');

            // 3. ENCIENDE EL CONFETI DE NUEVO (Recuperado al 100%)
            createConfetti(isJackpot ? 70 : 35); 
            createSparks(wheelContainer);
        }

        // FUNCIÓN DE CONFETI RECONSTRUIDA
        function createConfetti(count) {
            count = count || 35; 
            const colors = ['#FF6600', '#FFCC00', '#FF3300', '#2196F3', '#4CAF50', '#E91E63', '#FFD700'];
            for (let i = 0; i < count; i++) {
                const confetti = document.createElement('div'); 
                confetti.className = 'confetti'; 
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 1 + 's'; 
                confetti.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0'; 
                confetti.style.width = (Math.random() * 12 + 6) + 'px'; 
                confetti.style.height = (Math.random() * 12 + 6) + 'px';
                document.body.appendChild(confetti); 
                setTimeout(() => confetti.remove(), 3500);
            }
        }

        // FUNCIÓN DE LUCES DE FERIA (fondo animado)
        function createLights() {
            var container = document.getElementById('lights');
            if (!container) return;
            var colors = ['#FFCC00', '#FF3300', '#FF6600', '#FFEB3B'];
            for (var i = 0; i < 25; i++) {
                var light = document.createElement('div');
                light.className = 'light';
                light.style.left = Math.random() * 100 + '%';
                light.style.top = Math.random() * 100 + '%';
                light.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                light.style.animationDelay = Math.random() * 2 + 's';
                light.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
                light.style.boxShadow = '0 0 10px ' + light.style.backgroundColor;
                container.appendChild(light);
            }
        }

        // ═══ LEYENDA DE RETOS (número → nombre → descuento) ═══
        function renderLegend() {
            var legendList = document.getElementById('legendList');
            if (!legendList) return;
            legendList.innerHTML = CHALLENGES.map(function(ch, i) {
                var color = getChallengeColor(ch);
                var discountLabel = ch.discount;
                return '<li style="border-left: 4px solid ' + color + ';">' +
                    '<span class="legend-num" style="background:' + color + ';">' + (i + 1) + '</span>' +
                    '<span class="legend-name">' + ch.title + '</span>' +
                    '<span class="legend-discount">' + discountLabel + '</span>' +
                    '</li>';
            }).join('');
        }

        // ═══ SCOREBOARD - PARTICIPANTES DEL DÍA ═══
        var SCOREBOARD_KEY = 'cheskoretos_scoreboard_' + new Date().toLocaleDateString('es-MX');

        function getUserColor(username) {
            var colors = ['#FF6600', '#2196F3', '#E91E63', '#4CAF50', '#9C27B0', '#FF9800', '#00BCD4', '#F44336'];
            var hash = 0;
            for (var i = 0; i < (username || '').length; i++) {
                hash = username.charCodeAt(i) + ((hash << 5) - hash);
            }
            return colors[Math.abs(hash) % colors.length];
        }

        function getAvatarInitials(username) {
            return (username || '').replace(/^@/, '').substring(0, 2).toUpperCase();
        }

        function autoRegistrarParticipante() {
            if (lastWinnerIndex < 0 || lastWinnerIndex >= CHALLENGES.length) return;
            try {
                var sesion = localStorage.getItem('chesko_session');
                if (!sesion) return;
                var usuario = JSON.parse(sesion);
                if (!usuario || !usuario.username) return;

                var winner = CHALLENGES[lastWinnerIndex];
                var color = getUserColor(usuario.username);
                var avatarUrl = usuario.id ? (localStorage.getItem('chesko_avatar_' + usuario.id) || null) : null;
                var participants = getScoreboard();
                participants.push({
                    user: usuario.username,
                    reto: winner.title,
                    retoNum: lastWinnerIndex + 1,
                    cumplio: true,
                    avatarColor: color,
                    avatarUrl: avatarUrl,
                    timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                });
                saveScoreboard(participants);
                renderScoreboard();
                SoundFX.playSave();

                if (typeof DataStore !== 'undefined' && usuario.id) {
                    DataStore.registrarReto(usuario.id, winner.id, true).catch(function() {});
                }

                var input = document.getElementById('participantInput');
                if (input) {
                    input.value = '';
                    input.placeholder = '✅ @' + usuario.username + ' registrado';
                    setTimeout(function() { input.placeholder = 'usuario'; }, 3000);
                }
            } catch (e) {
                console.warn('autoRegistrarParticipante:', e);
            }
        }

        function getScoreboard() {
            try { return JSON.parse(localStorage.getItem(SCOREBOARD_KEY) || '[]'); } catch (e) { return []; }
        }

        function saveScoreboard(list) {
            localStorage.setItem(SCOREBOARD_KEY, JSON.stringify(list));
        }

        function renderScoreboard() {
            var tbody = document.getElementById('scoreboardBody');
            var countEl = document.getElementById('scoreboardCount');
            if (!tbody) return;
            var participants = getScoreboard();
            if (countEl) countEl.textContent = participants.length;
            if (participants.length === 0) {
                tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Aún no hay participantes registrados</td></tr>';
                return;
            }
            tbody.innerHTML = participants.map(function(p, i) {
                var color = p.avatarColor || getUserColor(p.user);
                var initials = getAvatarInitials(p.user);
                var avatar = p.avatarUrl
                    ? '<img class="sb-avatar sb-avatar-photo" src="' + p.avatarUrl + '" alt="">'
                    : '<span class="sb-avatar" style="background:' + color + ';">' + escapeHtml(initials) + '</span>';
                return '<tr>' +
                    '<td class="col-num">' + (i + 1) + '</td>' +
                    '<td class="col-user">' + avatar + '@' + escapeHtml(p.user) + '</td>' +
                    '<td class="col-reto">' + escapeHtml(p.reto) + '</td>' +
                    '<td class="col-check">' + (p.cumplio ? '✅' : '❌') + '</td>' +
                    '</tr>';
            }).join('');
        }

        function registerParticipant() {
            if (lastWinnerIndex < 0 || lastWinnerIndex >= CHALLENGES.length) {
                alert('Primero gira la ruleta para obtener un reto.');
                return;
            }
            var input = document.getElementById('participantInput');
            var checkYes = document.getElementById('checkYes');
            var checkNo = document.getElementById('checkNo');
            if (!input) return;
            var user = input.value.trim().replace(/^@/, '');
            if (!user) {
                input.focus();
                return;
            }
            var cumple = checkYes ? checkYes.checked : false;
            var winner = CHALLENGES[lastWinnerIndex];
            var participants = getScoreboard();
            participants.push({
                user: user,
                reto: winner.title,
                retoNum: lastWinnerIndex + 1,
                cumplio: cumple,
                timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
            });
            saveScoreboard(participants);
            renderScoreboard();
            input.value = '';
            if (checkYes) checkYes.checked = false;
            if (checkNo) checkNo.checked = true;
            SoundFX.playSave();
        }

        function clearScoreboard() {
            if (!confirm('¿Vaciar la tabla de participantes del día?')) return;
            localStorage.removeItem(SCOREBOARD_KEY);
            renderScoreboard();
        }

        function shareScoreboard() {
            var target = document.querySelector('.scoreboard-section');
            if (!target) return;
            var participants = getScoreboard();
            if (participants.length === 0) {
                alert('No hay participantes registrados para compartir.');
                return;
            }
            html2canvas(target, {
                backgroundColor: '#000000',
                scale: 2,
                useCORS: true,
                logging: false
            }).then(function(canvas) {
                canvas.toBlob(function(blob) {
                    if (!blob) return;
                    var file = new File([blob], 'cheskoretos-tabla-del-dia.png', { type: 'image/png' });
                    if (navigator.share && navigator.canShare({ files: [file] })) {
                        navigator.share({
                            title: 'ChesKoretos - Participantes del Día',
                            text: '🔥 Mira la tabla de participantes del día en ChesKoretos!',
                            files: [file]
                        }).catch(function() {});
                    } else {
                        var url = URL.createObjectURL(blob);
                        var a = document.createElement('a');
                        a.href = url;
                        a.download = 'cheskoretos-tabla-del-dia.png';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }
                }, 'image/png');
            }).catch(function(err) {
                console.warn('Error al capturar la tabla:', err);
                alert('No se pudo generar la imagen. Intenta de nuevo.');
            });
        }

        // FUNCIÓN DE SOPORTE PARA ESPACIO / SPACEBAR
        window.addEventListener('keydown', function(event) {
            if (document.activeElement === inventorInput) return; // Evitar disparar si se escribe un reto
            if (event.key === ' ' || event.code === 'Space') {
                event.preventDefault(); // Detener scroll por defecto
                if (!isSpinning && (!spinBtn || !spinBtn.disabled)) {
                    spinWheel();
                }
            }
        });

        if (spinBtn) spinBtn.addEventListener('click', spinWheel);

        // Scoreboard listeners
        var registerBtn = document.getElementById('registerParticipantBtn');
        if (registerBtn) registerBtn.addEventListener('click', registerParticipant);
        var clearBtn = document.getElementById('clearScoreboardBtn');
        if (clearBtn) clearBtn.addEventListener('click', clearScoreboard);
        var shareBtn = document.getElementById('shareScoreboardBtn');
        if (shareBtn) shareBtn.addEventListener('click', shareScoreboard);
        var partInput = document.getElementById('participantInput');
        if (partInput) {
            partInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') registerParticipant(); });
            // Evitar que Space cierre el input
            partInput.addEventListener('keydown', function(e) { if (e.key === ' ') e.stopPropagation(); });
        }

        drawWheel();
        renderLegend();
        renderScoreboard();
        createLights();
        renderSavedRetosList();
        loadStoredFileHandle();
        startIdleSpin();
    });
})();
