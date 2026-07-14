/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - CAPA DE ABSTRACCIÓN DE DATOS
 * ═══════════════════════════════════════════
 * Todas las operaciones CRUD contra Supabase pasan por aquí.
 * Ningún otro módulo toca Supabase directamente.
 *
 * Todas las funciones son ASYNC y devuelven Promises.
 */
var DataStore = (function() {
    'use strict';

    function db() { return AppConfig.getClient(); }

    /* ═══════════════════════════════════════════
       PROFILES
       ═══════════════════════════════════════════ */

    /**
     * Obtener perfil por ID de usuario.
     * @param {string} userId
     * @returns {object|null} perfil o null
     */
    async function obtenerPerfil(userId) {
        var { data, error } = await db()
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) { console.error('obtenerPerfil:', error); return null; }
        return data;
    }

    /**
     * Obtener perfil por teléfono (para check previo al OTP).
     * @param {string} telefono
     * @returns {object|null}
     */
    async function obtenerPerfilPorTelefono(telefono) {
        var { data, error } = await db()
            .from('profiles')
            .select('*')
            .eq('telefono', telefono)
            .maybeSingle();
        if (error) { console.error('obtenerPerfilPorTelefono:', error); return null; }
        return data;
    }

    /**
     * Crear perfil nuevo (post-OTP).
     * @param {string} userId - UUID de auth.users
     * @param {string} username
     * @param {string} telefono
     * @returns {object|null}
     */
    async function crearPerfil(userId, username, telefono) {
        var { data, error } = await db()
            .from('profiles')
            .insert({ id: userId, username: username, telefono: telefono })
            .select()
            .single();
        if (error) { console.error('crearPerfil:', error); return null; }
        return data;
    }

    /**
     * Actualizar perfil existente.
     * @param {string} userId
     * @param {object} campos - { username?, telefono?, rol? }
     * @returns {object|null}
     */
    async function actualizarPerfil(userId, campos) {
        var { data, error } = await db()
            .from('profiles')
            .update(campos)
            .eq('id', userId)
            .select()
            .single();
        if (error) { console.error('actualizarPerfil:', error); return null; }
        return data;
    }

    /* ═══════════════════════════════════════════
       LEALTAD
       ═══════════════════════════════════════════ */

    /**
     * Obtener registro de lealtad.
     * @param {string} userId
     * @returns {object|null}
     */
    async function obtenerLealtad(userId) {
        var { data, error } = await db()
            .from('lealtad')
            .select('*')
            .eq('usuario_id', userId)
            .maybeSingle();
        if (error) { console.error('obtenerLealtad:', error); return null; }
        return data;
    }

    /**
     * Crear registro de lealtad nuevo (default).
     * @param {string} userId
     * @returns {object|null}
     */
    async function crearLealtad(userId) {
        var { data, error } = await db()
            .from('lealtad')
            .insert({ usuario_id: userId })
            .select()
            .single();
        if (error) { console.error('crearLealtad:', error); return null; }
        return data;
    }

    /**
     * Actualizar lealtad.
     * @param {string} userId
     * @param {object} campos
     * @returns {object|null}
     */
    async function actualizarLealtad(userId, campos) {
        var { data, error } = await db()
            .from('lealtad')
            .update(campos)
            .eq('usuario_id', userId)
            .select()
            .single();
        if (error) { console.error('actualizarLealtad:', error); return null; }
        return data;
    }

    /* ═══════════════════════════════════════════
       HISTORIAL DE RETOS
       ═══════════════════════════════════════════ */

    /**
     * Insertar un reto en el historial.
     * @param {string} userId
     * @param {string} retoId
     * @param {boolean} cumplio
     * @returns {object|null}
     */
    async function registrarReto(userId, retoId, cumplio) {
        var { data, error } = await db()
            .from('historial_retos')
            .insert({ usuario_id: userId, reto_id: retoId, cumplio: cumplio })
            .select()
            .single();
        if (error) { console.error('registrarReto:', error); return null; }
        return data;
    }

    /**
     * Obtener retos completados de un usuario.
     * @param {string} userId
     * @returns {string[]} array de reto_id
     */
    async function obtenerRetosCompletados(userId) {
        var { data, error } = await db()
            .from('historial_retos')
            .select('reto_id')
            .eq('usuario_id', userId)
            .eq('cumplio', true);
        if (error) { console.error('obtenerRetosCompletados:', error); return []; }
        return (data || []).map(function(r) { return r.reto_id; });
    }

    /**
     * Verificar si un usuario ya completó un reto específico.
     * @param {string} userId
     * @param {string} retoId
     * @returns {boolean}
     */
    async function retoYaCompletado(userId, retoId) {
        var { data, error } = await db()
            .from('historial_retos')
            .select('id')
            .eq('usuario_id', userId)
            .eq('reto_id', retoId)
            .eq('cumplio', true)
            .maybeSingle();
        if (error) return false;
        return data !== null;
    }

    /* ═══════════════════════════════════════════
       VERIFICACIÓN DE TELÉFONO (RPC)
       ═══════════════════════════════════════════ */

    /**
     * Verificar si un teléfono ya tiene cuenta en profiles.
     * Usa la función RPC del SQL.
     * @param {string} telefono
     * @returns {boolean}
     */
    async function telefonoExiste(telefono) {
        var { data, error } = await db().rpc('check_phone_exists', { phone_number: telefono });
        if (error) { console.error('telefonoExiste:', error); return false; }
        return data === true;
    }

    /* ═══════════════════════════════════════════
       REGISTRAR VISITA (RPC — lógica en servidor)
       ═══════════════════════════════════════════ */

    /**
     * Llamar a la función RPC registrar_visita del SQL.
     * La lógica de racha se ejecuta en el servidor por seguridad.
     * @param {string} targetUserId - UUID del usuario que recibe la visita
     * @returns {object} resultado con tipo, mensaje, etc.
     */
    async function registrarVisita(targetUserId) {
        var { data, error } = await db().rpc('registrar_visita', { target_user_id: targetUserId });
        if (error) { console.error('registrarVisita:', error); return { tipo: 'error', mensaje: 'Error de conexión.' }; }
        return data;
    }

    /* ═══════════════════════════════════════════
       PROMOCIONES
       ═══════════════════════════════════════════ */

    /**
     * Obtener la promoción activa más reciente.
     * @returns {object|null}
     */
    async function obtenerPromoActiva() {
        var { data, error } = await db()
            .from('promociones')
            .select('*')
            .eq('activa', true)
            .order('creado_en', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) { console.error('obtenerPromoActiva:', error); return null; }
        return data;
    }

    /**
     * Obtener todas las promociones activas.
     * @returns {object[]}
     */
    async function obtenerPromosActivas() {
        var { data, error } = await db()
            .from('promociones')
            .select('*')
            .eq('activa', true)
            .order('creado_en', { ascending: false });
        if (error) { console.error('obtenerPromosActivas:', error); return []; }
        return data || [];
    }

    /* ═══════════════════════════════════════════
       RANKING / WIDGETS
       ═══════════════════════════════════════════ */

    /**
     * Top 5 usuarios con más retos cumplidos.
     * @returns {object[]}
     */
    async function obtenerRankingUsuarios() {
        var { data, error } = await db()
            .from('historial_retos')
            .select('usuario_id, profiles(username, telefono)')
            .eq('cumplio', true);
        if (error) { console.error('obtenerRankingUsuarios:', error); return []; }

        /* Agrupar por usuario y contar */
        var conteo = {};
        (data || []).forEach(function(row) {
            var uid = row.usuario_id;
            if (!conteo[uid]) {
                conteo[uid] = {
                    usuario_id: uid,
                    username: row.profiles ? row.profiles.username : '???',
                    total_retos: 0
                };
            }
            conteo[uid].total_retos++;
        });

        /* Ordenar y tomar top 5 */
        return Object.values(conteo)
            .sort(function(a, b) { return b.total_retos - a.total_retos; })
            .slice(0, 5);
    }

    /**
     * Obtener cromos (retos) de un usuario específico.
     * @param {string} userId
     * @returns {object[]}
     */
    async function obtenerCromosUsuario(userId) {
        var { data, error } = await db()
            .from('historial_retos')
            .select('reto_id, cumplio, fecha')
            .eq('usuario_id', userId)
            .order('fecha', { ascending: false });
        if (error) { console.error('obtenerCromosUsuario:', error); return []; }
        return data || [];
    }

    /**
     * Obtener perfil + lealtad de un usuario por ID (para escáner).
     * @param {string} userId
     * @returns {object|null} { perfil, lealtad }
     */
    async function obtenerUsuarioCompleto(userId) {
        var perfil = await obtenerPerfil(userId);
        if (!perfil) return null;
        var lealtad = await obtenerLealtad(userId);
        return { perfil: perfil, lealtad: lealtad };
    }

    /* ── API pública ── */
    return {
        /* Profiles */
        obtenerPerfil:          obtenerPerfil,
        obtenerPerfilPorTelefono: obtenerPerfilPorTelefono,
        crearPerfil:            crearPerfil,
        actualizarPerfil:       actualizarPerfil,
        /* Lealtad */
        obtenerLealtad:         obtenerLealtad,
        crearLealtad:           crearLealtad,
        actualizarLealtad:      actualizarLealtad,
        /* Historial retos */
        registrarReto:          registrarReto,
        obtenerRetosCompletados: obtenerRetosCompletados,
        retoYaCompletado:       retoYaCompletado,
        /* Verificaciones RPC */
        telefonoExiste:         telefonoExiste,
        registrarVisita:        registrarVisita,
        /* Promos */
        obtenerPromoActiva:     obtenerPromoActiva,
        obtenerPromosActivas:   obtenerPromosActivas,
        /* Widgets */
        obtenerRankingUsuarios: obtenerRankingUsuarios,
        obtenerCromosUsuario:   obtenerCromosUsuario,
        obtenerUsuarioCompleto: obtenerUsuarioCompleto
    };

})();
