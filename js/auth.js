/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - MÓDULO DE AUTENTICACIÓN
 * ═══════════════════════════════════════════
 * Autenticación real vía Supabase Phone OTP.
 * Gestiona roles: admin, empleado, usuario.
 *
 * FLUJO:
 * 1. enviarOTP(telefono) → Supabase envía SMS con código
 * 2. verificarOTP(telefono, codigo) → sesión activa
 * 3. obtenerUsuarioActual() → { authUser, perfil, lealtad }
 */
var Auth = (function() {
    'use strict';

    /* ── Estado en memoria ── */
    var _usuarioActual = null;   /* Cache del usuario completo */
    var _perfil        = null;   /* Cache del perfil */
    var _lealtad       = null;   /* Cache de lealtad */
    var _otpPending    = false;  /* OTP enviado, esperando verificación */
    var _telefonoOTP   = '';     /* Teléfono al que se envió el OTP */
    var _usernameTemp  = '';     /* Nickname ingresado antes del OTP */

    function sb() { return AppConfig.getClient(); }

    /* ═══════════════════════════════════════════
       1. ENVIAR OTP
       ═══════════════════════════════════════════ */

    /**
     * Envía un código OTP al teléfono indicado.
     * @param {string} telefono - Teléfono con código de país (ej: +525512345678)
     * @param {string} username - Nickname que se guardará después de verificar
     * @returns {object} { ok: boolean, esNuevo: boolean, mensaje: string }
     */
    async function enviarOTP(telefono, username) {
        telefono = (telefono || '').trim();
        username = (username || '').trim().replace(/^@/, '');

        if (username.length < 2) {
            return { ok: false, mensaje: 'El nickname debe tener al menos 2 caracteres.' };
        }
        if (telefono.length < 10) {
            return { ok: false, mensaje: 'El teléfono debe incluir código de país (mín. 10 dígitos).' };
        }

        /* Asegurar formato E.164 (+ al inicio) */
        if (!telefono.startsWith('+')) {
            telefono = '+52' + telefono; /* México por defecto */
        }

        _usernameTemp = username;
        _telefonoOTP  = telefono;

        /* Enviar OTP vía Supabase */
        var { data, error } = await sb().auth.signInWithOtp({ phone: telefono });

        if (error) {
            console.error('enviarOTP error:', error);
            return { ok: false, mensaje: 'No se pudo enviar el SMS. Verifica tu número. ' + error.message };
        }

        _otpPending = true;
        return { ok: true, esNuevo: true, mensaje: 'Código enviado a ' + telefono };
    }

    /* ═══════════════════════════════════════════
       2. VERIFICAR OTP
       ═══════════════════════════════════════════ */

    /**
     * Verifica el código OTP ingresado por el usuario.
     * @param {string} codigo - Código de 6 dígitos
     * @returns {object} { ok: boolean, usuario: object|null, mensaje: string }
     */
    async function verificarOTP(codigo) {
        codigo = (codigo || '').trim();

        if (!_otpPending || !_telefonoOTP) {
            return { ok: false, mensaje: 'No hay un código pendiente. Solicita uno nuevo.' };
        }
        if (codigo.length !== 6) {
            return { ok: false, mensaje: 'El código debe tener 6 dígitos.' };
        }

        var { data, error } = await sb().auth.verifyOtp({
            phone: _telefonoOTP,
            token: codigo,
            type:  'sms'
        });

        if (error) {
            console.error('verificarOTP error:', error);
            return { ok: false, mensaje: 'Código incorrecto o expirado. Intenta de nuevo.' };
        }

        _otpPending = false;
        var authUser = data.user;

        /* Buscar o crear perfil */
        var perfil = await DataStore.obtenerPerfil(authUser.id);

        if (!perfil) {
            /* Perfil nuevo → crear */
            perfil = await DataStore.crearPerfil(authUser.id, _usernameTemp, _telefonoOTP);
        } else if (perfil.username === 'Sin Nombre' && _usernameTemp) {
            /* Perfil creado por trigger con nombre default → actualizar */
            perfil = await DataStore.actualizarPerfil(authUser.id, { username: _usernameTemp });
        }

        /* Buscar o crear lealtad */
        var lealtad = await DataStore.obtenerLealtad(authUser.id);
        if (!lealtad) {
            lealtad = await DataStore.crearLealtad(authUser.id);
        }

        /* Guardar en caché */
        _usuarioActual = authUser;
        _perfil        = perfil;
        _lealtad       = lealtad;

        return { ok: true, usuario: perfil, mensaje: '¡Sesión iniciada!' };
    }

    /* ═══════════════════════════════════════════
       3. SESIÓN
       ═══════════════════════════════════════════ */

    /**
     * Verificar si hay sesión activa y cargar datos.
     * Llamar al inicio de la app.
     * @returns {boolean} true si hay sesión activa
     */
    async function restaurarSesion() {
        var { data } = await sb().auth.getSession();
        if (!data.session) return false;

        _usuarioActual = data.session.user;

        /* Cargar perfil y lealtad */
        _perfil  = await DataStore.obtenerPerfil(_usuarioActual.id);
        _lealtad = await DataStore.obtenerLealtad(_usuarioActual.id);

        /* Si el perfil no existe (borrado manualmente), crearlo */
        if (!_perfil) {
            var phone = _usuarioActual.phone || '';
            _perfil = await DataStore.crearPerfil(
                _usuarioActual.id,
                _usuarioActual.user_metadata?.username || 'Sin Nombre',
                phone
            );
        }
        if (!_lealtad) {
            _lealtad = await DataStore.crearLealtad(_usuarioActual.id);
        }

        return true;
    }

    /**
     * Cerrar sesión.
     */
    async function logout() {
        await sb().auth.signOut();
        _usuarioActual = null;
        _perfil        = null;
        _lealtad       = null;
        _otpPending    = false;
        _telefonoOTP   = '';
        _usernameTemp  = '';
    }

    /**
     * Obtener el usuario completo (perfil + lealtad).
     * @returns {object|null} { authUser, perfil, lealtad }
     */
    function obtenerUsuarioActual() {
        if (!_usuarioActual || !_perfil) return null;
        return {
            authUser: _usuarioActual,
            perfil:   _perfil,
            lealtad:  _lealtad
        };
    }

    /**
     * Obtener solo el perfil.
     * @returns {object|null}
     */
    function obtenerPerfil() {
        return _perfil;
    }

    /**
     * Refrescar la caché de datos del usuario desde Supabase.
     */
    async function refrescarDatos() {
        if (!_usuarioActual) return;
        _perfil  = await DataStore.obtenerPerfil(_usuarioActual.id);
        _lealtad = await DataStore.obtenerLealtad(_usuarioActual.id);
    }

    /* ═══════════════════════════════════════════
       4. ROLES
       ═══════════════════════════════════════════ */

    function esAdmin()      { return _perfil && _perfil.rol === 'admin'; }
    function esEmpleado()   { return _perfil && _perfil.rol === 'empleado'; }
    function esStaff()      { return esAdmin() || esEmpleado(); }
    function esUsuario()    { return _perfil && _perfil.rol === 'usuario'; }

    function obtenerRol()   { return _perfil ? _perfil.rol : null; }

    /**
     * Verificar si hay OTP pendiente (para mostrar/ocultar input).
     * @returns {boolean}
     */
    function hayOTPPendiente() { return _otpPending; }
    function obtenerTelefonoPendiente() { return _telefonoOTP; }

    /* ── API pública ── */
    return {
        enviarOTP:              enviarOTP,
        verificarOTP:           verificarOTP,
        restaurarSesion:        restaurarSesion,
        logout:                 logout,
        obtenerUsuarioActual:   obtenerUsuarioActual,
        obtenerPerfil:          obtenerPerfil,
        refrescarDatos:         refrescarDatos,
        esAdmin:                esAdmin,
        esEmpleado:             esEmpleado,
        esStaff:                esStaff,
        esUsuario:              esUsuario,
        obtenerRol:             obtenerRol,
        hayOTPPendiente:        hayOTPPendiente,
        obtenerTelefonoPendiente: obtenerTelefonoPendiente
    };

})();
