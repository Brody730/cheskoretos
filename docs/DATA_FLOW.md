# Flujos de datos end-to-end

## 1. Registro de cuenta nueva

```mermaid
sequenceDiagram
    participant U as Usuario (perfil.html)
    participant App as app.js
    participant Auth as Auth (auth.js)
    participant Data as DataStore (data.js)
    participant DB as Supabase

    U->>App: submit #formRegistro (nickname, teléfono, PIN)
    App->>App: manejarRegistro() — valida largo de campos
    App->>Auth: registrarUsuario(username, telefono, pin)
    Auth->>DB: RPC register_user(p_username, p_phone, p_pin)
    DB-->>Auth: { ok:false, mensaje } si teléfono/username ya existen
    DB-->>Auth: { ok:true, id, username, telefono, rol } si se creó
    Auth->>Data: obtenerLealtad(id) / crearLealtad(id) si no existe
    Auth->>Auth: guardarSesion() → localStorage['chesko_session']
    Auth-->>App: { ok, usuario, mensaje }
    App->>U: actualizarVista() + mostrarExplosion("¡BIENVENIDO!")
```

## 2. Login con PIN

Igual que el registro pero vía `login_with_pin(p_phone, p_pin)`; si el
teléfono+PIN no coinciden exactamente, la función devuelve
`{ ok:false, mensaje:"Teléfono o PIN incorrectos." }` sin distinguir cuál de
los dos falló (por diseño, para no filtrar si un teléfono existe).

## 3. Restaurar sesión al abrir la app

```mermaid
sequenceDiagram
    participant U as Usuario (nueva visita/reload)
    participant App as app.js (init)
    participant Auth as Auth
    participant Data as DataStore
    participant DB as Supabase

    App->>Auth: restaurarSesion()
    Auth->>Auth: lee localStorage['chesko_session']
    alt no hay sesión guardada
        Auth-->>App: false
        App->>U: mostrarVistaLogin()
    else hay sesión guardada
        Auth->>U: (restaura _perfil de inmediato, sin esperar red)
        Auth->>Data: obtenerLealtad(id) (best-effort)
        alt sesión con menos de 30 min
            Auth-->>App: true (confía en el caché tal cual)
        else sesión con más de 30 min
            Auth->>Data: obtenerPerfil(id) — re-verifica contra la BD
            alt el usuario ya NO existe (confirmado)
                Auth->>Auth: limpiarSesion()
                Auth-->>App: false
            else existe, o error transitorio de red
                Auth->>Auth: guardarSesion(perfil) (refresca timestamp)
                Auth-->>App: true
            end
        end
    end
```

Diseño clave: un error de red/servidor **nunca** cierra la sesión por sí
solo — solo una confirmación explícita de "0 filas" (`PGRST116`) lo hace.
Esto evita que un CDN lento o un hiccup de conexión deslogueen al usuario en
medio del parque sin señal.

## 4. Registrar visita — escaneo QR por el staff

Este es el flujo central del negocio: el cliente muestra su QR (parte de su
CheskoCard en `perfil.html`), el staff (rol `admin`/`empleado`) lo escanea
con su propio celular, y el sistema decide si suma un sello, da el Chesko
gratis, o rechaza el registro.

```mermaid
sequenceDiagram
    participant Cliente as Cliente (celular, perfil.html)
    participant Staff as Staff (celular, perfil.html, rol admin/empleado)
    participant App as app.js
    participant Loy as Loyalty
    participant Data as DataStore
    participant DB as Supabase (RPC registrar_visita)

    Cliente->>Cliente: abre CheskoCard → se muestra su QR\n(URL: perfil.html?validar_usuario_id=ID)
    Staff->>Staff: toca "📷 Escanear QR de cliente"
    Staff->>Staff: BarcodeDetector (o fallback html5-qrcode) lee el QR
    Staff->>App: manejarEscaneoQR(targetUserId)
    App->>App: ¿Auth.esStaff()? si no, "Acceso Denegado" y redirige
    App->>Data: obtenerUsuarioCompleto(targetUserId) → RPC obtener_usuario_para_escaner
    DB-->>App: { perfil, lealtad } | null | undefined(error transitorio)
    App->>Staff: muestra modal "VALIDAR VISITA" con username/racha/medallas
    Staff->>App: toca "✅ Confirmar Visita"
    App->>App: valida que HOY sea sábado (client-side, doble-check de la validación del servidor)
    App->>App: valida que el cliente no haya registrado ya hoy
    App->>Loy: registrarVisita(targetUserId)
    Loy->>Data: registrarVisita(targetUserId)
    Data->>DB: RPC registrar_visita(target_user_id)
    DB-->>Data: { tipo: visita_registrada | chesko_gratis | ya_registro_hoy | error, mensaje, ... }
    Data-->>Loy: resultado
    Loy->>Loy: si el usuario afectado es el que tiene sesión actual, refresca su caché
    Loy-->>App: resultado
    App->>Staff: manejarResultadoVisita(resultado) → modal/confeti según tipo
    App->>Data: crearNotificacion(clienteId, tipo, ...) → INSERT en tabla notificaciones
    Note over Data,DB: Ese INSERT dispara el Database Webhook →\napi/send-push.js → notificación push real al Cliente
    App->>App: actualizarVista() (refresca la vista del staff)
```

La validación de "solo sábado" y "ya registró hoy" ocurre **dos veces**: una
vez en `confirmarVisitaEscaneada()` (JS, para dar feedback rápido sin ni
llamar al servidor) y otra dentro de la función SQL `registrar_visita`
(la autoridad real — el cliente JS nunca debe considerarse la fuente de
verdad de una regla de negocio).

## 5. Notificación al cliente (en vivo + push real)

```mermaid
sequenceDiagram
    participant DB as Supabase (tabla notificaciones)
    participant RT as Supabase Realtime
    participant Cliente as perfil.html del cliente (si está abierto)
    participant Hook as Database Webhook
    participant Fn as api/send-push.js
    participant SW as Service Worker del cliente

    DB->>RT: INSERT en notificaciones (usuario_id = cliente)
    par En vivo (pestaña abierta)
        RT-->>Cliente: postgres_changes event (canal suscrito en actualizarVista())
        Cliente->>Cliente: mostrarToastNotificacion() + mostrarNotificacionNativa() (si hay permiso)
    and Push real (aunque la pestaña esté cerrada)
        DB->>Hook: fila insertada
        Hook->>Fn: POST { record }
        Fn->>DB: RPC obtener_push_subscriptions(usuario_id)
        Fn->>SW: web-push.sendNotification(...)
        SW->>Cliente: showNotification() del sistema operativo
    end
```

La suscripción Realtime (`DataStore.suscribirNotificaciones`) solo funciona
mientras la pestaña de `perfil.html` está abierta; el push real (VAPID) es
lo único que llega con la app cerrada o el celular bloqueado — por eso
`perfil.html` ofrece el botón "🔔 ACTIVAR NOTIFICACIONES" además de la
suscripción Realtime automática.

## 6. Girar la ruleta y guardar el reto

```mermaid
sequenceDiagram
    participant U as Usuario (ruleta.html)
    participant Wheel as motor de ruleta (challenges.js)
    participant LS as localStorage
    participant Data as DataStore (si hay sesión)
    participant DB as Supabase

    U->>Wheel: toca "¡GIRAR!" (o barra espaciadora)
    Wheel->>Wheel: selectWinner() — sorteo ponderado por CHALLENGE_WEIGHTS\n(Fácil=5, Intermedio=4, Difícil=3, Especial=2, Extremo=1)
    Wheel->>Wheel: anima el giro, muestra modal de resultado + confeti + sonido
    Wheel->>LS: lee 'chesko_session' (¿hay usuario logueado en este navegador?)
    alt hay sesión
        Wheel->>Wheel: autoRegistrarParticipante() → agrega fila al scoreboard del día
        Wheel->>Data: registrarReto(usuario.id, reto.id, true) (best-effort, sin bloquear la UI)
        Data->>DB: INSERT historial_retos
    else no hay sesión
        Wheel->>Wheel: el resultado solo se muestra en pantalla; el staff puede\nregistrar manualmente el username en el formulario del scoreboard
    end
```

El "scoreboard" (`#scoreboardBody`) es **puramente local** a
`localStorage` (clave `cheskoretos_scoreboard_<fecha-de-hoy>`) — no se
sincroniza entre dispositivos ni se guarda en Supabase; es una pizarra del
día para el puesto físico, se resetea sola al cambiar de fecha.
