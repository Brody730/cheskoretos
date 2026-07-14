/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - CONTROLADOR PRINCIPAL (APP)
 * ═══════════════════════════════════════════
 * Orquesta: Config, DataStore, Auth, Loyalty, AlbumRetos.
 * Maneja DOM, QR, escáner y flujos admin/empleado.
 *
 * Auth: PIN de 4 dígitos (sin SMS, gratis).
 */
(function() {
    'use strict';

    var $ = function(id) { return document.getElementById(id); };

    /* ═══════════════════════════════════════════
       0. REFERENCIAS AL DOM
       ═══════════════════════════════════════════ */

    /* Login */
    var vistaLogin       = $('vistaLogin');
    var vistaPerfil      = $('vistaPerfil');
    var seccionSellos    = $('seccionSellos');
    var seccionAlbum     = $('seccionAlbum');
    var seccionQR        = $('seccionQR');
    var formRegistro     = $('formRegistro');
    var formLogin        = $('formLogin');
    var btnModoRegistro  = $('btnModoRegistro');
    var btnModoLogin     = $('btnModoLogin');
    var inputUsername     = $('inputUsername');
    var inputTelefono     = $('inputTelefono');
    var inputPIN          = $('inputPIN');
    var inputTelefonoLogin = $('inputTelefonoLogin');
    var inputPINLogin     = $('inputPINLogin');
    var loginError        = $('loginError');

    /* Perfil */
    var perfilNickname    = $('perfilNickname');
    var perfilTelefono    = $('perfilTelefono');
    var perfilRol         = $('perfilRol');
    var statRacha         = $('statRacha');
    var statRetos         = $('statRetos');
    var statMedallas      = $('statMedallas');
    var btnLogout         = $('btnLogout');

    /* Sellos */
    var sellosGrid        = $('sellosGrid');
    var btnRegistrarVisita = $('btnRegistrarVisita');
    var cuponGratis       = $('cuponGratis');
    var btnCanjearGratis  = $('btnCanjearGratis');

    /* QR */
    var qrContainer       = $('qrContainer');
    var qrUrl             = $('qrUrl');

    /* Escáner de cámara */
    var btnEscanearQR     = $('btnEscanearQR');
    var scannerOverlay    = $('scannerOverlay');
    var btnCerrarScanner  = $('btnCerrarScanner');
    var qrCameraScanner   = null; /* Instancia de Html5Qrcode */

    /* PWA install */
    var deferredPrompt    = null;
    var btnInstalarPWA    = $('btnInstalarPWA');
    var seccionInstalarPWA = $('seccionInstalarPWA');

    /* Álbum */
    var albumGrid         = $('albumGrid');
    var albumContador     = $('albumContador');

    /* Modal alerta */
    var modalAlerta       = $('modalAlerta');
    var modalIcono        = $('modalIcono');
    var modalTitulo       = $('modalTitulo');
    var modalSub          = $('modalSub');
    var modalMensaje      = $('modalMensaje');
    var btnCerrarModal    = $('btnCerrarModalAlerta');

    /* Modal escáner */
    var modalScanner      = $('modalScanner');
    var scannerUsername    = $('scannerUsername');
    var scannerRacha      = $('scannerRacha');
    var scannerMedallas   = $('scannerMedallas');
    var btnConfirmarVisita = $('btnConfirmarVisita');
    var btnCancelarVisita  = $('btnCancelarVisita');

    /* Modal canje */
    var modalCanje        = $('modalCanje');
    var btnCerrarCanje    = $('btnCerrarCanje');

    var _targetUserId = null;

    /* ═══════════════════════════════════════════
       1. INICIALIZACIÓN
       ═══════════════════════════════════════════ */
    async function init() {
        crearLucesFeria();
        bindEventos();

        var tieneSesion = await Auth.restaurarSesion();

        var params = new URLSearchParams(window.location.search);
        var validarId = params.get('validar_usuario_id');

        if (tieneSesion) {
            if (validarId) {
                await manejarEscaneoQR(validarId);
            } else {
                await actualizarVista();
            }
        } else {
            mostrarVistaLogin();
            if (validarId) {
                mostrarAlerta('⚠️', 'Sin Sesión', 'Debes iniciar sesión como admin o empleado para validar visitas.', 'error');
            }
        }
    }

    /* ═══════════════════════════════════════════
       2. EVENTOS
       ═══════════════════════════════════════════ */
    function bindEventos() {
        /* Toggle Registro / Login */
        if (btnModoRegistro) {
            btnModoRegistro.addEventListener('click', function() {
                formRegistro.style.display = 'block';
                formLogin.style.display = 'none';
                btnModoRegistro.classList.add('activo');
                btnModoLogin.classList.remove('activo');
                loginError.classList.remove('visible');
            });
        }
        if (btnModoLogin) {
            btnModoLogin.addEventListener('click', function() {
                formRegistro.style.display = 'none';
                formLogin.style.display = 'block';
                btnModoLogin.classList.add('activo');
                btnModoRegistro.classList.remove('activo');
                loginError.classList.remove('visible');
            });
        }

        /* Formulario de registro */
        if (formRegistro) {
            formRegistro.addEventListener('submit', async function(e) {
                e.preventDefault();
                await manejarRegistro();
            });
        }

        /* Formulario de login */
        if (formLogin) {
            formLogin.addEventListener('submit', async function(e) {
                e.preventDefault();
                await manejarLogin();
            });
        }

        /* Logout */
        if (btnLogout) {
            btnLogout.addEventListener('click', function() {
                Auth.logout();
                mostrarVistaLogin();
            });
        }

        /* Registrar visita */
        if (btnRegistrarVisita) {
            btnRegistrarVisita.addEventListener('click', async function() {
                await manejarRegistroVisita();
            });
        }

        /* Canjear gratis */
        if (btnCanjearGratis) {
            btnCanjearGratis.addEventListener('click', async function() {
                var ok = await Loyalty.canjearCheskoGratis();
                if (ok) {
                    cuponGratis.classList.remove('visible');
                    modalCanje.style.display = 'flex';
                    modalCanje.classList.add('activo');
                    await actualizarVista();
                }
            });
        }

        /* Cerrar modal alerta */
        if (btnCerrarModal) {
            btnCerrarModal.addEventListener('click', function() {
                modalAlerta.classList.remove('activo');
            });
        }
        if (modalAlerta) {
            modalAlerta.addEventListener('click', function(e) {
                if (e.target === modalAlerta) modalAlerta.classList.remove('activo');
            });
        }

        /* Escáner: confirmar */
        if (btnConfirmarVisita) {
            btnConfirmarVisita.addEventListener('click', async function() {
                await confirmarVisitaEscaneada();
            });
        }
        if (btnCancelarVisita) {
            btnCancelarVisita.addEventListener('click', function() {
                modalScanner.classList.remove('activo');
                window.history.replaceState({}, '', window.location.pathname);
                actualizarVista();
            });
        }

        /* Cerrar modal canje */
        if (btnCerrarCanje) {
            btnCerrarCanje.addEventListener('click', function() {
                modalCanje.style.display = 'none';
            });
        }

        /* Escáner de cámara */
        if (btnEscanearQR) {
            btnEscanearQR.addEventListener('click', function() {
                abrirScannerCamara();
            });
        }
        if (btnCerrarScanner) {
            btnCerrarScanner.addEventListener('click', function() {
                cerrarScannerCamara();
            });
        }

        /* PWA install */
        window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            deferredPrompt = e;
            if (seccionInstalarPWA) seccionInstalarPWA.style.display = 'block';
        });

        if (btnInstalarPWA) {
            btnInstalarPWA.addEventListener('click', function() {
                if (!deferredPrompt) return;
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(function(choice) {
                    if (choice.outcome === 'accepted') {
                        mostrarAlerta('✅', '¡Instalada!', 'ChesKoretos se instaló en tu celular.', 'exito');
                        if (seccionInstalarPWA) seccionInstalarPWA.style.display = 'none';
                    }
                    deferredPrompt = null;
                });
            });
        }
    }

    /* ═══════════════════════════════════════════
       3. REGISTRAR USUARIO
       ═══════════════════════════════════════════ */
    async function manejarRegistro() {
        var username = inputUsername.value.trim();
        var telefono = inputTelefono.value.trim();
        var pin      = inputPIN.value.trim();

        if (username.length < 2) {
            mostrarErrorLogin('El nickname debe tener al menos 2 caracteres.');
            return;
        }
        if (telefono.length < 8) {
            mostrarErrorLogin('El teléfono debe tener al menos 8 dígitos.');
            return;
        }
        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            mostrarErrorLogin('El PIN debe ser exactamente 4 números.');
            return;
        }

        var btn = formRegistro.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = '⏳ Creando cuenta...';

        var resultado = await Auth.registrarUsuario(username, telefono, pin);

        btn.disabled = false;
        btn.textContent = '💥 ¡Crear Cuenta! 💥';

        if (!resultado.ok) {
            mostrarErrorLogin(resultado.mensaje);
            return;
        }

        loginError.classList.remove('visible');
        formRegistro.reset();
        await actualizarVista();
        mostrarExplosion('¡BIENVENIDO!', '¡Ya eres parte del Club ChesKoretos, @' + resultado.usuario.username + '!', 'exito');
    }

    /* ═══════════════════════════════════════════
       4. LOGIN CON PIN
       ═══════════════════════════════════════════ */
    async function manejarLogin() {
        var telefono = inputTelefonoLogin.value.trim();
        var pin      = inputPINLogin.value.trim();

        if (telefono.length < 8) {
            mostrarErrorLogin('El teléfono debe tener al menos 8 dígitos.');
            return;
        }
        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            mostrarErrorLogin('El PIN debe ser exactamente 4 números.');
            return;
        }

        var btn = formLogin.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = '⏳ Entrando...';

        var resultado = await Auth.loginConPin(telefono, pin);

        btn.disabled = false;
        btn.textContent = '🚀 ¡Entrar! 🚀';

        if (!resultado.ok) {
            mostrarErrorLogin(resultado.mensaje);
            return;
        }

        loginError.classList.remove('visible');
        formLogin.reset();
        await actualizarVista();
        mostrarExplosion('¡HOLA DE NUEVO!', '¡Bienvenido @' + resultado.usuario.username + '!', 'exito');
    }

    function mostrarErrorLogin(msg) {
        loginError.textContent = '💥 ' + msg;
        loginError.classList.add('visible');
    }

    /* ═══════════════════════════════════════════
       5. REGISTRAR VISITA
       ═══════════════════════════════════════════ */
    async function manejarRegistroVisita() {
        var resultado = await Loyalty.registrarMiVisita();
        await manejarResultadoVisita(resultado);
    }

    async function manejarResultadoVisita(resultado) {
        switch (resultado.tipo) {
            case 'no_logueado':
                mostrarAlerta('⚠️', '¡Sin sesión!', 'Debes iniciar sesión para ganar sábados.', 'error');
                break;
            case 'ya_registro_hoy':
                mostrarAlerta('🚫', resultado.titulo, resultado.mensaje, 'error');
                break;
            case 'error':
                mostrarAlerta('❌', 'Error', resultado.mensaje, 'error');
                break;
            case 'visita_registrada':
                await actualizarVista();
                mostrarExplosion(resultado.titulo, resultado.mensaje, 'exito');
                break;
            case 'chesko_gratis':
                await actualizarVista();
                mostrarCuponGratis();
                mostrarExplosion('¡BOOM! ¡CHESCO GRATIS!', resultado.mensaje, 'exito');
                break;
        }
    }

    /* ═══════════════════════════════════════════
       6. ESCÁNER QR
       ═══════════════════════════════════════════ */
    async function manejarEscaneoQR(targetUserId) {
        if (!Auth.esStaff()) {
            mostrarAlerta(
                '🚫',
                'Acceso Denegado',
                'Solo los admins y empleados pueden validar visitas. Tu rol: ' + (Auth.obtenerRol() || 'ninguno'),
                'error'
            );
            setTimeout(function() { window.location.href = 'perfil.html'; }, 3000);
            return;
        }

        var datos = await DataStore.obtenerUsuarioCompleto(targetUserId);
        if (!datos || !datos.perfil) {
            mostrarAlerta('❌', 'Usuario No Encontrado', 'El código QR no corresponde a un usuario válido.', 'error');
            return;
        }

        _targetUserId = targetUserId;
        scannerUsername.textContent = '@' + datos.perfil.username;
        scannerRacha.textContent   = (datos.lealtad ? datos.lealtad.racha_actual : 0) + ' / ' + Loyalty.RACHA_MAX;
        scannerMedallas.textContent = datos.lealtad ? datos.lealtad.medallas_ganadas : 0;

        modalScanner.classList.add('activo');
    }

    async function confirmarVisitaEscaneada() {
        if (!_targetUserId) return;

        btnConfirmarVisita.disabled = true;
        btnConfirmarVisita.textContent = '⏳ Registrando...';

        var resultado = await Loyalty.registrarVisita(_targetUserId);

        btnConfirmarVisita.disabled = false;
        btnConfirmarVisita.textContent = '✅ Confirmar Visita';

        modalScanner.classList.remove('activo');
        _targetUserId = null;

        window.history.replaceState({}, '', window.location.pathname);

        await manejarResultadoVisita(resultado);
        await actualizarVista();
    }

    /* ═══════════════════════════════════════════
       7. ACTUALIZAR VISTA
       ═══════════════════════════════════════════ */
    async function actualizarVista() {
        var logueado = Auth.obtenerUsuarioActual() !== null;

        vistaLogin.style.display    = logueado ? 'none' : 'block';
        vistaPerfil.style.display   = logueado ? 'block' : 'none';
        seccionSellos.style.display = logueado ? 'block' : 'none';
        seccionAlbum.style.display  = logueado ? 'block' : 'none';
        if (seccionQR) seccionQR.style.display = logueado ? 'block' : 'none';

        if (!logueado) return;

        var usuario = Auth.obtenerUsuarioActual();
        var lealtad = usuario.lealtad;

        renderizarPerfil(usuario.perfil);
        renderizarSellos(lealtad);
        actualizarBotonVisita(lealtad);
        renderizarCuponGratis(lealtad);
        generarQR(usuario.perfil.id);

        await AlbumRetos.renderizarAlbumDeRetos('albumGrid');
        var totalRetos = await AlbumRetos.contarRetosCompletados();
        var totalChallenges = (window.CHALLENGES || []).length;
        if (albumContador) {
            albumContador.textContent = totalRetos + ' / ' + totalChallenges + ' retos completados';
        }
    }

    function mostrarVistaLogin() {
        vistaLogin.style.display    = 'block';
        vistaPerfil.style.display   = 'none';
        seccionSellos.style.display = 'none';
        seccionAlbum.style.display  = 'none';
        if (seccionQR) seccionQR.style.display = 'none';
        if (seccionInstalarPWA) seccionInstalarPWA.style.display = 'none';
        if (formRegistro) { formRegistro.style.display = 'block'; formRegistro.reset(); }
        if (formLogin) { formLogin.style.display = 'none'; formLogin.reset(); }
        if (btnModoRegistro) btnModoRegistro.classList.add('activo');
        if (btnModoLogin) btnModoLogin.classList.remove('activo');
    }

    /* ═══════════════════════════════════════════
       8. RENDERIZAR PERFIL
       ═══════════════════════════════════════════ */
    function renderizarPerfil(perfil) {
        if (!perfil) return;
        if (perfilNickname) perfilNickname.textContent = perfil.username;
        if (perfilTelefono) perfilTelefono.textContent = perfil.telefono;
        if (perfilRol) {
            var rolLabel = { admin: '🛡️ Admin', empleado: '👷 Empleado', usuario: '🥤 Koreto' };
            perfilRol.textContent = rolLabel[perfil.rol] || perfil.rol;
        }

        /* Mostrar botón escáner solo para admin/empleado */
        if (btnEscanearQR) {
            btnEscanearQR.style.display = (perfil.rol === 'admin' || perfil.rol === 'empleado') ? 'block' : 'none';
        }

        var estado = Loyalty.obtenerEstadoLealtad();
        if (estado) {
            if (statRacha)    statRacha.textContent = estado.rachaActual;
            if (statMedallas) statMedallas.textContent = estado.medallasGanadas;
        }
        if (statRetos) {
            AlbumRetos.contarRetosCompletados().then(function(n) {
                statRetos.textContent = n;
            });
        }
    }

    /* ═══════════════════════════════════════════
       9. RENDERIZAR SELLOS
       ═══════════════════════════════════════════ */
    function renderizarSellos(lealtad) {
        if (!sellosGrid || !lealtad) return;

        var racha     = lealtad.racha_actual || 0;
        var gratisAct = lealtad.chesko_gratis_activo || false;
        var max       = Loyalty.RACHA_MAX;
        var html      = '';

        for (var i = 1; i <= max; i++) {
            if (i === max) html += '<div class="sello-separador">→</div>';

            var ganado = i <= racha;
            var esGratis = (i === max);
            var clases = 'sello-item';

            if (esGratis) {
                clases += ' sello-gratis';
                if (gratisAct) clases += ' activo';
            }
            if (ganado && !esGratis) clases += ' ganado';

            var contenido = esGratis
                ? '<span class="sello-numero">🥤<br>¡GRATIS!</span>'
                : '<span class="sello-numero">' + (ganado ? '🥤' : i) + '</span>';

            html += '<div class="' + clases + '" style="animation-delay: ' + (i * 0.08) + 's;">' + contenido + '</div>';
        }

        sellosGrid.innerHTML = html;
    }

    /* ═══════════════════════════════════════════
       10. BOTÓN REGISTRAR VISITA
       ═══════════════════════════════════════════ */
    function actualizarBotonVisita(lealtad) {
        if (!btnRegistrarVisita || !lealtad) return;

        if (!lealtad.chesko_gratis_activo && lealtad.ultima_visita) {
            var ultima = new Date(lealtad.ultima_visita);
            var hoy    = new Date();
            var diff   = Math.floor((hoy - ultima) / (1000 * 60 * 60 * 24));

            if (diff <= 1) {
                btnRegistrarVisita.disabled = true;
                btnRegistrarVisita.textContent = '🚫 YA REGISTRASTE ESTE FIN DE SEMANA';
                return;
            }
        }

        if (lealtad.chesko_gratis_activo) {
            btnRegistrarVisita.disabled = true;
            btnRegistrarVisita.textContent = '🥤 ¡YA GANASTE TU CHESCO GRATIS!';
        } else {
            btnRegistrarVisita.disabled = false;
            btnRegistrarVisita.textContent = '⚡ REGISTRAR MI VISITA HOY ⚡';
        }
    }

    /* ═══════════════════════════════════════════
       11. CUPÓN GRATIS
       ═══════════════════════════════════════════ */
    function renderizarCuponGratis(lealtad) {
        if (!cuponGratis) return;
        if (lealtad && lealtad.chesko_gratis_activo) {
            mostrarCuponGratis();
        } else {
            cuponGratis.classList.remove('visible');
        }
    }

    function mostrarCuponGratis() {
        cuponGratis.classList.add('visible');
        setTimeout(function() {
            cuponGratis.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 600);
    }

    /* ═══════════════════════════════════════════
       12. GENERAR QR
       ═══════════════════════════════════════════ */
    function generarQR(userId) {
        if (!qrContainer) return;

        var url = AppConfig.URL_BASE + '/perfil.html?validar_usuario_id=' + userId;

        if (qrUrl) qrUrl.textContent = url;

        if (typeof qrcode !== 'undefined') {
            qrContainer.innerHTML = '';
            var qr = qrcode(0, 'M');
            qr.addData(url);
            qr.make();

            var img = document.createElement('img');
            img.src = qr.createDataURL(6, 8);
            img.alt = 'Código QR de validación';
            img.style.maxWidth = '200px';
            img.style.borderRadius = '10px';
            img.style.border = '3px solid #000';
            img.style.boxShadow = '5px 5px 0 #000';
            qrContainer.appendChild(img);
        } else {
            qrContainer.innerHTML = '<p style="font-family: monospace; font-size: 0.7rem; color: #aaa; word-break: break-all;">' + url + '</p>';
        }
    }

    /* ═══════════════════════════════════════════
       13. ESCÁNER DE CÁMARA QR
       ═══════════════════════════════════════════ */

    function abrirScannerCamara() {
        if (typeof Html5Qrcode === 'undefined') {
            mostrarAlerta('❌', 'Error', 'No se pudo cargar el lector QR. Recarga la página.', 'error');
            return;
        }

        scannerOverlay.style.display = 'flex';

        qrCameraScanner = new Html5Qrcode('qrReader');

        qrCameraScanner.start(
            { facingMode: 'environment' },
            {
                fps: 10,
                qrbox: { width: 220, height: 220 },
                aspectRatio: 1.0
            },
            function onScanSuccess(decodedText) {
                /* Extraer UUID del URL */
                var match = decodedText.match(/validar_usuario_id=([a-f0-9-]+)/i);
                if (match && match[1]) {
                    cerrarScannerCamara();
                    manejarEscaneoQR(match[1]);
                }
            },
            function onScanFailure(error) {
                /* Silenciar errores de escaneo continuo */
            }
        ).catch(function(err) {
            console.error('Error al iniciar cámara:', err);
            cerrarScannerCamara();
            mostrarAlerta('❌', 'Cámara No Disponible', 'No se pudo acceder a la cámara. Verifica los permisos.', 'error');
        });
    }

    function cerrarScannerCamara() {
        scannerOverlay.style.display = 'none';
        if (qrCameraScanner) {
            qrCameraScanner.stop().catch(function() {});
            qrCameraScanner.clear().catch(function() {});
            qrCameraScanner = null;
        }
    }

    /* ═══════════════════════════════════════════
       14. MODALES
       ═══════════════════════════════════════════ */
    function mostrarAlerta(icono, titulo, mensaje, tipo) {
        if (!modalAlerta) return;
        modalIcono.textContent   = icono;
        modalTitulo.textContent  = titulo;
        modalSub.textContent     = '';
        modalMensaje.textContent = mensaje;
        modalAlerta.classList.remove('modal-error', 'modal-exito');
        if (tipo === 'error') modalAlerta.classList.add('modal-error');
        if (tipo === 'exito') modalAlerta.classList.add('modal-exito');
        modalAlerta.classList.add('activo');
    }

    function mostrarExplosion(titulo, mensaje, tipo) {
        mostrarAlerta(tipo === 'exito' ? '💥' : '⚠️', titulo, mensaje, tipo);
        if (tipo === 'exito') lanzarConfeti();
    }

    /* ═══════════════════════════════════════════
       14. EFECTOS VISUALES
       ═══════════════════════════════════════════ */
    function lanzarConfeti() {
        var colores = ['#FF6600', '#FFCC00', '#FF3300', '#39FF14', '#9C27B0', '#2196F3', '#FFD700'];
        for (var i = 0; i < 45; i++) {
            (function(idx) {
                setTimeout(function() {
                    var c = document.createElement('div');
                    c.className = 'confetti';
                    c.style.left = Math.random() * 100 + 'vw';
                    c.style.backgroundColor = colores[idx % colores.length];
                    c.style.animationDelay = Math.random() * 0.5 + 's';
                    c.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
                    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                    c.style.width = (Math.random() * 10 + 5) + 'px';
                    c.style.height = (Math.random() * 10 + 5) + 'px';
                    document.body.appendChild(c);
                    setTimeout(function() { c.remove(); }, 3500);
                }, idx * 30);
            })(i);
        }
    }

    function crearLucesFeria() {
        var container = document.getElementById('lights');
        if (!container) return;
        var colors = ['#FFCC00', '#FF3300', '#FF6600', '#FFEB3B'];
        for (var i = 0; i < 20; i++) {
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

    /* ═══════════════════════════════════════════
       15. ARRANQUE
       ═══════════════════════════════════════════ */
    document.addEventListener('DOMContentLoaded', init);

})();
