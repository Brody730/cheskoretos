# Frontend: páginas y navegación

Cinco páginas HTML independientes (sin router ni SPA). Todas comparten
`css/theme.css`; cada una además carga estilos y scripts propios de su
sección. Ninguna tiene build step: se editan y se sirven directamente.

## Mapa de páginas

| Página | Rol | Requiere sesión | Toca Supabase |
|---|---|---|---|
| `index.html` | Landing pública: hero, "quiénes somos", redes, buzón de sugerencias | No | No |
| `menu.html` | Menú de bebidas y precios (estático) | No | No |
| `retos.html` | Catálogo/galería de todos los retos posibles | No | No |
| `ruleta.html` | Ruleta interactiva que sortea un reto (motor canvas) | No (pero si hay sesión, auto-registra el resultado) | Sí, indirecto (guarda el reto cumplido si hay sesión) |
| `perfil.html` | La "app": login/registro, CheskoCard, racha, álbum, escáner staff | Sí (excepto la vista de login) | Sí, completo |

## Navegación entre páginas

```mermaid
flowchart LR
    IDX["index.html\n(Landing)"]
    MENU["menu.html"]
    RETOS["retos.html"]
    RUL["ruleta.html"]
    PERF["perfil.html"]

    IDX -- "🥤 Menú" --> MENU
    IDX -- "🎲 Retos" --> RETOS
    IDX -- "👤 Perfil" --> PERF
    IDX -. "🎡 Ruleta (interceptado)\nmuestra modal de aviso" .-> MODAL(("Modal:\n'solo sábados\nen el tianguis'"))

    MENU -- "🎲 Ver Retos" --> RETOS
    MENU -- "🎡 Ruleta (interceptado)" -.-> MODAL
    MENU -- nav --> IDX
    MENU -- nav --> PERF

    RETOS -- "🎡 Ruleta (interceptado)" -.-> MODAL
    RETOS -- nav --> IDX
    RETOS -- nav --> MENU
    RETOS -- nav --> PERF

    RUL -- nav (sin interceptar) --> IDX
    RUL -- nav --> MENU
    RUL -- nav --> RETOS
    RUL -- nav --> PERF

    PERF -- nav --> IDX
    PERF -- nav --> MENU
    PERF -- nav --> RUL
    PERF -. "?validar_usuario_id=UUID\n(desde QR escaneado)" .-> PERF
```

### El "interceptor" del enlace Ruleta

`index.html`, `menu.html` y `retos.html` cargan `js/landing.js`, cuya función
`initAvisoModal()` agrega un listener a **todos** los elementos con clase
`.btn-girar-ruleta` (los enlaces "🎡 Ruleta" del navbar y del footer) que hace
`preventDefault()` y en su lugar abre un modal (`#modalAvisoTianguis`)
avisando que la ruleta solo se gira en persona los sábados desde las 7:30pm.
Es decir: **el enlace no navega a `ruleta.html`** en esas tres páginas —
solo llega ahí quien entra por URL directa o quien ya está en el sitio y
navega manualmente. `ruleta.html` en sí **no carga `landing.js`**, así que
una vez adentro el enlace de navbar funciona normal (aunque de todos modos ya
estás en esa página). Esto es intencional (uso físico en el puesto), no un
bug — pero es fácil de confundir si no se conoce este archivo.

## Detalle por página

### `index.html`
- Secciones: hero, "Acerca de nosotros", tarjetas de redes sociales
  (WhatsApp/Instagram/Facebook), buzón de sugerencias (`#formSugerencias`,
  envío **local** — ver nota abajo), modal de aviso de tianguis.
- Scripts: `js/landing.js` + registro de `sw.js`.
- El formulario de sugerencias tiene un `action="https://formspree.io/..."`
  en el HTML, pero el listener real (`initSugerenciasForm()` en
  `landing.js`) hace `e.preventDefault()` y **nunca llega a enviarse a
  Formspree**: solo muestra el mensaje de éxito y resetea el form. Existe un
  segundo archivo, `js/buzon.js`, que sí implementaría el envío real por
  `fetch` a ese `action`, pero **no está incluido** en ningún `<script>` de
  `index.html` — es código huérfano (ver [FILE_MAP.md](./FILE_MAP.md)).

### `menu.html`
- Puramente informativo: categorías de bebidas, precios, promos por horario.
  Sin JS propio más allá de `landing.js` (luces + interceptor de ruleta).

### `retos.html`
- Renderiza `#contenedorRetos` a partir de `window.CHALLENGES`
  (`js/challenges.js`) — una tarjeta por reto con su emoji, descripción y
  descuento. No incluye la ruleta en sí (no hay `<canvas>`).

### `ruleta.html`
- Carga `js/config.js`, `js/data.js`, `js/challenges.js` y el SDK de
  Supabase (para poder guardar el resultado si hay sesión), pero **no**
  `js/auth.js` ni `js/app.js` — no hay login aquí, solo lee
  `localStorage['chesko_session']` si ya existe (puesta ahí por
  `perfil.html` en una pestaña/visita anterior).
- El motor de la ruleta vive al final de `js/challenges.js` (ver
  [JS_MODULES.md](./JS_MODULES.md#chesko​retos---sistema-de-la-ruleta)):
  dibuja el canvas, gira con pesos por dificultad
  (`CHALLENGE_WEIGHTS`), muestra un modal de resultado + confeti + sonido, y
  mantiene un "scoreboard" de participantes del día en `localStorage`
  (clave `cheskoretos_scoreboard_<fecha>`, se reinicia solo cada día).
- Botón "📸 COMPARTIR EN REDES" usa `html2canvas` para capturar la tabla de
  participantes como imagen y compartirla (Web Share API o descarga).

### `perfil.html`
La página más grande y con más lógica. Ver también el comentario de cabecera
del propio archivo. Resumen de sus piezas:

1. **Login/registro por PIN** (`#vistaLogin`): dos formularios (registro y
   login) que alternan con un toggle; delega en `Auth` (`js/auth.js`).
2. **Perfil** (`#vistaPerfil`): nickname, teléfono, rol, stats (racha, retos,
   medallas), avatar (foto subida por el usuario, recortada a cuadrado en
   `<canvas>` client-side).
3. **CheskoCard** (`#seccionCheskoCard`): tarjeta metálica con QR de
   validación (`qrcode-generator`), sellos de racha, cupón de Chesko gratis,
   botón "Ver mi tarjeta" (overlay a pantalla completa) y botón
   "🎨 Personalizar" que abre un bottom-sheet con:
   - **Skin** de color/animación predefinida (Clásico, Fuego, Neon, Loco,
     Hielo, Oro) o **Personalizado** (color sólido/gradiente elegido a mano,
     o foto de fondo).
   - **Animación del marco**: Ninguna / Pulso / Vibración / Brillo / Flotar
     — se aplica vía `[data-anim]` con `!important`, así que sustituye la
     animación propia del skin si el usuario elige una explícita.
   - **Avatar de la tarjeta**: 10 emojis predefinidos o **cualquier emoji
     libre** escrito a mano (validado con `\p{Extended_Pictographic}` para
     rechazar texto plano).
   - **Foto de fondo**: sube + recorta (zoom/arrastre en `<canvas>`) una
     imagen; al aplicarla, el sistema **muestrea el color dominante** de esa
     imagen (`extractDominantColor`) y ajusta automáticamente los colores
     del marco (ring/glow/acentos/pill) para que combinen con la foto.
   - Todo el estado de personalización se guarda en `localStorage`
     (`chesko_card_custom_<userId>`) y, si `DataStore` está disponible,
     también en la columna `card_custom` del perfil en Supabase.
   - Descargar/Compartir la tarjeta como imagen PNG vía `html2canvas`.
4. **Álbum de retos** (`#seccionAlbum`): cuadrícula de "cromos", uno por
   reto de `CHALLENGES`, con medalla de bronce/plata/oro según cuántas veces
   se completó (`js/retos-album.js`).
5. **Escáner QR (solo admin/empleado)**: botón que abre un overlay de
   cámara (`BarcodeDetector` nativo, con *fallback* a la librería
   `html5-qrcode` si el navegador no lo soporta) para validar la visita de
   otro usuario escaneando el QR de su CheskoCard.
6. **Notificaciones**: suscripción en vivo a la tabla `notificaciones` vía
   Supabase Realtime (toast dentro de la página) + botón para activar
   **push nativo** real (Web Push, funciona con la app cerrada).

Orden de carga de scripts en `perfil.html` (importa, cada módulo depende del
anterior): `config.js` → `challenges.js` → `data.js` → `auth.js` →
`loyalty.js` → `retos-album.js` → `api.js` → `app.js` → (script inline de
personalización de tarjeta) → (script inline de subida de avatar). Ver
[JS_MODULES.md](./JS_MODULES.md) para el detalle de cada módulo.

## CSS compartido

| Archivo | Contenido |
|---|---|
| `css/theme.css` | Variables de marca, logo, botones cómic, luces de feria, títulos de sección, footer. Base para todas las páginas. |
| `css/landing.css` | Navbar, hero, secciones de la landing/menu/retos, la ruleta completa (canvas, modal de resultado, confeti, scoreboard), utilidades y *media queries*. |
| `css/profile.css` | Todo lo específico de `perfil.html`: login/registro, tarjeta de perfil, CheskoCard, overlay fullscreen, cupón, álbum, modales, escáner. |

`perfil.html` además define un bloque `<style>` propio embebido (sistema de
skins vía `[data-skin]`, animaciones de marco vía `[data-anim]`, el modal de
personalización y el recorte de imagen) que no vive en los `.css`
compartidos porque es exclusivo de esa página.
