/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - LÓGICA Y EFECTOS LANDING
 * ═══════════════════════════════════════════
 * Este archivo controla los efectos interactivos de la página de inicio (Landing Page)
 * y elementos comunes de la interfaz como las luces de feria y modales.
 */
(function() {
    'use strict';

    /**
     * Crea luces parpadeantes estilo feria de forma aleatoria en el contenedor #lights
     */
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

    /**
     * Inicializa efectos de interacción sutiles en tarjetas
     */
    function initCardHoverSpark(card) {
        card.addEventListener('mouseenter', function() {
            card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        });
    }

    /**
     * Inicializa y controla el modal de aviso de los días de Tianguis
     */
    function initAvisoModal() {
        var modal = document.getElementById('modalAvisoTianguis');
        if (!modal) return;

        var botonesGirar = document.querySelectorAll('.btn-girar-ruleta');
        var botonCerrar = document.getElementById('btnCerrarModal');

        // Asignar evento click a todos los botones que abran el modal de aviso
        botonesGirar.forEach(function(boton) {
            boton.addEventListener('click', function(e) {
                e.preventDefault();
                modal.classList.add('activo');
            });
        });

        // Evento de cierre para el botón
        if (botonCerrar) {
            botonCerrar.addEventListener('click', function() {
                modal.classList.remove('activo');
            });
        }

        // Cierre al dar clic fuera del contenido del modal (en el backdrop)
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('activo');
            }
        });
    }

    /**
     * Inicializa y controla el Buzón de Sugerencias Digital
     * Envía la sugerencia de forma local y retroalimenta al usuario en formato cómic
     */
    function initSugerenciasForm() {
        var form = document.getElementById('formSugerencias');
        var successMessage = document.getElementById('sugerenciaExito');
        if (!form || !successMessage) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var nickname = document.getElementById('inputNickname').value.trim();
            var message = document.getElementById('inputSugerencia').value.trim();
            
            if (message === "") {
                return;
            }
            
            // Mostrar cuadro de éxito estilo explosión cómic (¡BOOM!)
            successMessage.style.display = 'block';
            form.reset();
            
            // Desplazar la vista suavemente hacia el mensaje de éxito
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Ocultar automáticamente después de 5 segundos
            setTimeout(function() {
                successMessage.style.display = 'none';
            }, 5000);
        });
    }

    // Inicializar funciones al cargar el DOM
    document.addEventListener('DOMContentLoaded', function() {
        createLights();
        initAvisoModal();
        initSugerenciasForm();

        var cards = document.querySelectorAll('.tarjeta-reto');
        cards.forEach(initCardHoverSpark);
    });
})();
