/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - MÓDULO DE AUTENTICACIÓN (PIN)
 * ═══════════════════════════════════════════
 * Auth por PIN de 4 dígitos. Sin SMS, sin email,
 * sin proveedores externos. Gratis y rápido.
 *
 * FLUJO:
 * 1. registrarUsuario(nick, tel, pin) → crea cuenta
 * 2. loginConPin(tel, pin) → sesión activa
 * 3. restaurarSesion() → recupera de localStorage
 */
var Auth = (function() {
    'use strict';

    var STORAGE_KEY = 'chesko_session';

    /* ── Estado en memoria ── */
    var _usuarioActual = null;   /* { id, username, telefono, rol, ... } */
    var _perfil        = null;
    var _lealtad       = null;

    function db() { return AppConfig.getClient(); }

    /* ═══════════════════════════════════════════
       1. REGISTRAR USUARIO
       ═══════════════════════════════════════════ */

    /**
     * Crear cuenta nueva con PIN.
     * @param {string} username - Nickname (min 2 chars)
     * @param {string} telefono - Teléfono (min 8 dígitos)
     * @param {string} pin - PIN de 4 dígitos
     * @returns {object} { ok, mensaje, usuario? }
     */
    async function registrarUsuario(username, telefono, pin) {
        username = (username || '').trim().replace(/^@/, '');
        telefono = (telefono || '').trim();
        pin      = (pin || '').trim();

        if (username.length < 2) {
            return { ok: false, mensaje: 'El nickname debe tener al menos 2 caracteres.' };
        }
        if (telefono.length < 8) {
            return { ok: false, mensaje: 'El teléfono debe tener al menos 8 dígitos.' };
        }
        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            return { ok: false, mensaje: 'El PIN debe ser exactamente 4 números.' };
        }

        var { data, error } = await db().rpc('register_user', {
            p_username: username,
            p_phone:    telefono,
            p_pin:      pin
        });

        if (error) {
            console.error('register_user error:', error);
            return { ok: false, mensaje: 'Error de conexión. Intenta de nuevo.' };
        }

        if (!data || !data.ok) {
            return { ok: false, mensaje: data ? data.mensaje : 'Error desconocido.' };
        }

        /* Guardar sesión en memoria y localStorage */
        var usuario = {
            id:       data.id,
            username: data.username,
            telefono: data.telefono,
            rol:      data.rol
        };
        _usuarioActual = usuario;
        _perfil = usuario;

        /* Cargar lealtad */
        _lealtad = await DataStore.obtenerLealtad(usuario.id);
        if (!_lealtad) {
            _lealtad = await DataStore.crearLealtad(usuario.id);
        }

        guardarSesion(usuario);

        return { ok: true, usuario: usuario, mensaje: data.mensaje };
    }

    /* ═══════════════════════════════════════════
       2. LOGIN CON PIN
       ═══════════════════════════════════════════ */

    /**
     * Iniciar sesión con teléfono + PIN.
     * @param {string} telefono
     * @param {string} pin
     * @returns {object} { ok, mensaje, usuario? }
     */
    async function loginConPin(telefono, pin) {
        telefono = (telefono || '').trim();
        pin      = (pin || '').trim();

        if (telefono.length < 8) {
            return { ok: false, mensaje: 'El teléfono debe tener al menos 8 dígitos.' };
        }
        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            return { ok: false, mensaje: 'El PIN debe ser exactamente 4 números.' };
        }

        var { data, error } = await db().rpc('login_with_pin', {
            p_phone: telefono,
            p_pin:   pin
        });

        if (error) {
            console.error('login_with_pin error:', error);
            return { ok: false, mensaje: 'Error de conexión. Intenta de nuevo.' };
        }

        if (!data || !data.ok) {
            return { ok: false, mensaje: data ? data.mensaje : 'Teléfono o PIN incorrectos.' };
        }

        var usuario = {
            id:       data.id,
            username: data.username,
            telefono: data.telefono,
            rol:      data.rol
        };
        _usuarioActual = usuario;
        _perfil = usuario;

        _lealtad = await DataStore.obtenerLealtad(usuario.id);
        if (!_lealtad) {
            _lealtad = await DataStore.crearLealtad(usuario.id);
        }

        guardarSesion(usuario);

        return { ok: true, usuario: usuario, mensaje: data.mensaje };
    }

    /* ═══════════════════════════════════════════
       3. SESIÓN (localStorage)
       ═══════════════════════════════════════════ */

    function guardarSesion(usuario) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
        } catch (e) { /* storage lleno, ignora */ }
    }

    function limpiarSesion() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) { /* ignora */ }
    }

    /**
     * Restaurar sesión desde localStorage.
     * @returns {boolean} true si hay sesión válida
     */
    async function restaurarSesion() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return false;

            var usuario = JSON.parse(raw);
            if (!usuario || !usuario.id) return false;

            /* Verificar que el usuario sigue existiendo en la DB */
            var perfil = await DataStore.obtenerPerfil(usuario.id);
            if (!perfil) {
                limpiarSesion();
                return false;
            }

            _usuarioActual = perfil;
            _perfil = perfil;
            _lealtad = await DataStore.obtenerLealtad(perfil.id);

            return true;
        } catch (e) {
            limpiarSesion();
            return false;
        }
    }

    /**
     * Cerrar sesión.
     */
    function logout() {
        _usuarioActual = null;
        _perfil        = null;
        _lealtad       = null;
        limpiarSesion();
    }

    /* ═══════════════════════════════════════════
       4. GETTERS
       ═══════════════════════════════════════════ */

    function obtenerUsuarioActual() {
        if (!_perfil) return null;
        return {
            authUser: { id: _perfil.id },
            perfil:   _perfil,
            lealtad:  _lealtad
        };
    }

    function obtenerPerfil() {
        return _perfil;
    }

    async function refrescarDatos() {
        if (!_perfil) return;
        _perfil  = await DataStore.obtenerPerfil(_perfil.id);
        _lealtad = await DataStore.obtenerLealtad(_perfil.id);
    }

    /* ═══════════════════════════════════════════
       5. ROLES
       ═══════════════════════════════════════════ */

    function esAdmin()    { return _perfil && _perfil.rol === 'admin'; }
    function esEmpleado() { return _perfil && _perfil.rol === 'empleado'; }
    function esStaff()    { return esAdmin() || esEmpleado(); }
    function esUsuario()  { return _perfil && _perfil.rol === 'usuario'; }
    function obtenerRol() { return _perfil ? _perfil.rol : null; }

    /* ── API pública ── */
    return {
        registrarUsuario:       registrarUsuario,
        loginConPin:            loginConPin,
        restaurarSesion:        restaurarSesion,
        logout:                 logout,
        obtenerUsuarioActual:   obtenerUsuarioActual,
        obtenerPerfil:          obtenerPerfil,
        refrescarDatos:         refrescarDatos,
        esAdmin:                esAdmin,
        esEmpleado:             esEmpleado,
        esStaff:                esStaff,
        esUsuario:              esUsuario,
        obtenerRol:             obtenerRol
    };

})();
