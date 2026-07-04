/**
 * ChesKoretos Landing - efectos visuales
 */
(function() {
    'use strict';

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

    function initCardHoverSpark(card) {
        card.addEventListener('mouseenter', function() {
            card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        createLights();

        var cards = document.querySelectorAll('.tarjeta-reto');
        cards.forEach(initCardHoverSpark);
    });
})();
