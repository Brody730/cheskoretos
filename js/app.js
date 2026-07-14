/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - CONTROLADOR PRINCIPAL (APP)
 * ═══════════════════════════════════════════
 * Orquesta: Config, DataStore, Auth, Loyalty, AlbumRetos.
 * Maneja DOM, QR, escáner y flujos admin/empleado.
 *
 * Todos los módulos son ASYNC. El init() espera a Supabase
 * antes de renderizar la interfaz.
 */
(function() {
    'use strict';

    /* ═══════════════════════════════════════════
       0. REFERENCIAS AL DOM
       ═══════════════════════════════════════════ */
    var $ = function(id) { return document.getElementById(id); };

    /* Login / OTP */
    var vistaLogin          = $('vistaLogin');
    var vistaPerfil         = $('vistaPerfil');
    var seccionSellos       = $('seccionSellos');
    var seccionAlbum        = $('seccionAlbum');
    var seccionQR           = $('seccionQR');
    var formLogin           = $('formLogin');
    var formOTP             = $('formOTP');
    var inputUsername        = $('inputUsername');
    var inputTelefono        = $('inputTelefono');
    var inputOTP             = $('inputOTP');
    var loginError           = $('loginError');
    var otpInfo              = $('otpInfo');
    /* loginStep1 = formLogin (the form itself is step 1)
       loginStep2 = formOTP  (the form itself is step 2) */

    /* Perfil */
    var perfilNickname       = $('perfilNickname');
    var perfilTelefono       = $('perfilTelefono');
    var perfilRol            = $('perfilRol');
    var statRacha            = $('statRacha');
    var statRetos            = $('statRetos');
    var statMedallas         = $('statMedallas');
    var btnLogout            = $('btnLogout');

    /* Sellos / Lealtad */
    var sellosGrid           = $('sellosGrid');
    var btnRegistrarVisita   = $('btnRegistrarVisita');
    var cuponGratis          = $('cuponGratis');
    var btnCanjearGratis     = $('btnCanjearGratis');

    /* QR */
    var qrContainer          = $('qrContainer');
    var qrUrl                = $('qrUrl');

    /* Álbum */
    var albumGrid            = $('albumGrid');
    var albumContador        = $('albumContador');

    /* Modal de alerta */
    var modalAlerta          = $('modalAlerta');
    var modalIcono           = $('modalIcono');
    var modalTitulo          = $('modalTitulo');
    var modalSub             = $('modalSub');
    var modalMensaje         = $('modalMensaje');
    var btnCerrarModal       = $('btnCerrarModalAlerta');

    /* Modal de escáner (validación de visita) */
    var modalScanner         = $('modalScanner');
    var scannerUsername       = $('scannerUsername');
    var scannerRacha         = $('scannerRacha');
    var scannerMedallas      = $('scannerMedallas');
    var btnConfirmarVisita    = $('btnConfirmarVisita');
    var btnCancelarVisita     = $('btnCancelarVisita');

    /* Modal de canje */
    var modalCanje           = $('modalCanje');
    var btnCerrarCanje       = $('btnCerrarCanje');

    /* Estado del escáner */
    var _targetUserId = null; /* UUID del usuario escaneado */

    /* ═══════════════════════════════════════════
       1. INICIALIZACIÓN
       ═══════════════════════════════════════════ */
    async function init() {
        crearLucesFeria();
        bindEventos();

        /* Restaurar sesión existente (si hay token guardado) */
        var tieneSesion = await Auth.restaurarSesion();

        /* Verificar si es un link de escáner */
        var params = new URLSearchParams(window.location.search);
        var validarId = params.get('validar_usuario_id');

        if (tieneSesion) {
            if (validarId) {
                /* Modo escáner: el usuario escaneó un QR */
                await manejarEscaneoQR(validarId);
            } else {
                /* Modo perfil normal */
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
       2. EVENTOS (BINDING)
       ═══════════════════════════════════════════ */
    function bindEventos() {
        /* Login paso 1: enviar OTP */
        if (formLogin) {
            formLogin.addEventListener('submit', async function(e) {
                e.preventDefault();
                await manejarEnviarOTP();
            });
        }

        /* Login paso 2: verificar OTP */
        if (formOTP) {
            formOTP.addEventListener('submit', async function(e) {
                e.preventDefault();
                await manejarVerificarOTP();
            });
        }

        /* Logout */
        if (btnLogout) {
            btnLogout.addEventListener('click', async function() {
                await Auth.logout();
                mostrarVistaLogin();
            });
        }

        /* Registrar visita (auto o escáner) */
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

        /* Escáner: confirmar visita */
        if (btnConfirmarVisita) {
            btnConfirmarVisita.addEventListener('click', async function() {
                await confirmarVisitaEscaneada();
            });
        }
        if (btnCancelarVisita) {
            btnCancelarVisita.addEventListener('click', function() {
                modalScanner.classList.remove('activo');
                /* Limpiar parámetro de URL sin recargar */
                window.history.replaceState({}, '', window.location.pathname);
                /* Volver al perfil */
                actualizarVista();
            });
        }

        /* Cerrar modal canje */
        if (btnCerrarCanje) {
            btnCerrarCanje.addEventListener('click', function() {
                modalCanje.style.display = 'none';
            });
        }
    }

    /* ═══════════════════════════════════════════
       3. FLUJO OTP — PASO 1: ENVIAR CÓDIGO
       ═══════════════════════════════════════════ */
    async function manejarEnviarOTP() {
        var username = inputUsername.value.trim();
        var telefono = inputTelefono.value.trim();

        if (username.length < 2) {
            mostrarErrorLogin('El nickname debe tener al menos 2 caracteres.');
            return;
        }
        if (telefono.length < 8) {
            mostrarErrorLogin('El teléfono debe tener al menos 8 dígitos.');
            return;
        }

        var btn = formLogin.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = '📱 Enviando código...';

        var resultado = await Auth.enviarOTP(telefono, username);

        btn.disabled = false;
        btn.textContent = '💥 ¡Entrar al Club! 💥';

        if (!resultado.ok) {
            mostrarErrorLogin(resultado.mensaje);
            return;
        }

        /* Avanzar al paso 2 */
        formLogin.style.display = 'none';
        formOTP.style.display = 'block';
        otpInfo.textContent = '📱 Código enviado a ' + Auth.obtenerTelefonoPendiente();
        inputOTP.focus();
    }

    /* ═══════════════════════════════════════════
       4. FLUJO OTP — PASO 2: VERIFICAR CÓDIGO
       ═══════════════════════════════════════════ */
    async function manejarVerificarOTP() {
        var codigo = inputOTP.value.trim();

        var btn = formOTP.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = '⏳ Verificando...';

        var resultado = await Auth.verificarOTP(codigo);

        btn.disabled = false;
        btn.textContent = '✅ ¡Verificar Código!';

        if (!resultado.ok) {
            mostrarErrorLogin(resultado.mensaje);
            return;
        }

        loginError.classList.remove('visible');
        formLogin.reset();
        inputOTP.value = '';

        await actualizarVista();
        mostrarExplosion('¡BIENVENIDO!', '¡Ya eres parte del Club ChesKoretos, @' + resultado.usuario.username + '!', 'exito');
    }

    function mostrarErrorLogin(msg) {
        loginError.textContent = '💥 ' + msg;
        loginError.classList.add('visible');
    }

    /* ═══════════════════════════════════════════
       5. REGISTRAR VISITA (desde botón del perfil)
       ═══════════════════════════════════════════ */
    async function manejarRegistroVisita() {
        var resultado = await Loyalty.registrarMiVisita();
        await manejarResultadoVisita(resultado);
    }

    /**
     * Procesar el resultado de una visita (común para auto y escáner).
     */
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
       6. FLUJO ESCÁNER QR
       ═══════════════════════════════════════════ */

    /**
     * Manejar el escaneo de un QR por un admin/empleado.
     * @param {string} targetUserId - UUID del usuario escaneado
     */
    async function manejarEscaneoQR(targetUserId) {
        /* Verificar que quien escanea es admin o empleado */
        if (!Auth.esStaff()) {
            mostrarAlerta(
                '🚫',
                'Acceso Denegado',
                'Solo los admins y empleados pueden validar visitas. Tu rol: ' + (Auth.obtenerRol() || 'ninguno'),
                'error'
            );
            setTimeout(function() {
                window.location.href = 'perfil.html';
            }, 3000);
            return;
        }

        /* Obtener datos del usuario escaneado */
        var datos = await DataStore.obtenerUsuarioCompleto(targetUserId);
        if (!datos || !datos.perfil) {
            mostrarAlerta('❌', 'Usuario No Encontrado', 'El código QR no corresponde a un usuario válido.', 'error');
            return;
        }

        /* Llenar el modal de escáner */
        _targetUserId = targetUserId;
        scannerUsername.textContent = '@' + datos.perfil.username;
        scannerRacha.textContent   = (datos.lealtad ? datos.lealtad.racha_actual : 0) + ' / ' + Loyalty.RACHA_MAX;
        scannerMedallas.textContent = datos.lealtad ? datos.lealtad.medallas_ganadas : 0;

        modalScanner.classList.add('activo');
    }

    /**
     * Confirmar la visita desde el modal del escáner.
     */
    async function confirmarVisitaEscaneada() {
        if (!_targetUserId) return;

        btnConfirmarVisita.disabled = true;
        btnConfirmarVisita.textContent = '⏳ Registrando...';

        var resultado = await Loyalty.registrarVisita(_targetUserId);

        btnConfirmarVisita.disabled = false;
        btnConfirmarVisita.textContent = '✅ Confirmar Visita';

        modalScanner.classList.remove('activo');
        _targetUserId = null;

        /* Limpiar URL */
        window.history.replaceState({}, '', window.location.pathname);

        await manejarResultadoVisita(resultado);
        await actualizarVista();
    }

    /* ═══════════════════════════════════════════
       7. ACTUALIZAR VISTA COMPLETA
       ═══════════════════════════════════════════ */
    async function actualizarVista() {
        var logueado = Auth.obtenerUsuarioActual() !== null;

        /* Mostrar/ocultar secciones */
        vistaLogin.style.display    = logueado ? 'none' : 'block';
        vistaPerfil.style.display   = logueado ? 'block' : 'none';
        seccionSellos.style.display = logueado ? 'block' : 'none';
        seccionAlbum.style.display  = logueado ? 'block' : 'none';
        if (seccionQR) seccionQR.style.display = logueado ? 'block' : 'none';

        if (!logueado) return;

        var usuario = Auth.obtenerUsuarioActual();
        var lealtad = usuario.lealtad;

        /* Perfil */
        renderizarPerfil(usuario.perfil);

        /* Sellos / Racha */
        renderizarSellos(lealtad);
        actualizarBotonVisita(lealtad);
        renderizarCuponGratis(lealtad);

        /* QR */
        generarQR(usuario.authUser.id);

        /* Álbum */
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
        /* Resetear formularios */
        if (formLogin) { formLogin.style.display = 'block'; formLogin.reset(); }
        if (formOTP) { formOTP.style.display = 'none'; formOTP.reset(); }
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

        /* Estadísticas */
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
       9. RENDERIZAR SELLOS / RACHA
       ═══════════════════════════════════════════ */
    function renderizarSellos(lealtad) {
        if (!sellosGrid || !lealtad) return;

        var racha      = lealtad.racha_actual || 0;
        var gratisAct  = lealtad.chesko_gratis_activo || false;
        var max        = Loyalty.RACHA_MAX;
        var html       = '';

        for (var i = 1; i <= max; i++) {
            if (i === max) {
                html += '<div class="sello-separador">→</div>';
            }

            var ganado = i <= racha;
            var esGratis = (i === max);
            var clases = 'sello-item';

            if (esGratis) {
                clases += ' sello-gratis';
                if (gratisAct) clases += ' activo';
            }
            if (ganado && !esGratis) {
                clases += ' ganado';
            }

            var contenido = esGratis
                ? '<span class="sello-numero">🥤<br>¡GRATIS!</span>'
                : '<span class="sello-numero">' + (ganado ? '🥤' : i) + '</span>';

            html += '<div class="' + clases + '" style="animation-delay: ' + (i * 0.08) + 's;">' + contenido + '</div>';
        }

        sellosGrid.innerHTML = html;
    }

    /* ═══════════════════════════════════════════
       10. BOTÓN DE REGISTRAR VISITA
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
       12. GENERAR CÓDIGO QR
       ═══════════════════════════════════════════ */
    function generarQR(userId) {
        if (!qrContainer) return;

        var url = AppConfig.URL_BASE + '/perfil.html?validar_usuario_id=' + userId;

        /* Mostrar la URL */
        if (qrUrl) qrUrl.textContent = url;

        /* Generar QR con la librería qrcode-generator */
        if (typeof qrcode !== 'undefined') {
            qrContainer.innerHTML = '';
            var qr = qrcode(0, 'M');
            qr.addData(url);
            qr.make();

            /* Crear imagen */
            var img = document.createElement('img');
            img.src = qr.createDataURL(6, 8);
            img.alt = 'Código QR de validación';
            img.style.maxWidth = '200px';
            img.style.borderRadius = '10px';
            img.style.border = '3px solid #000';
            img.style.boxShadow = '5px 5px 0 #000';
            qrContainer.appendChild(img);
        } else {
            /* Fallback: mostrar solo la URL */
            qrContainer.innerHTML = '<p style="font-family: monospace; font-size: 0.7rem; color: #aaa; word-break: break-all;">' + url + '</p>';
        }
    }

    /* ═══════════════════════════════════════════
       13. MODALES
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
