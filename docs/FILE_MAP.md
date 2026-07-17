# Mapa de archivos del repositorio

Listado completo, archivo por archivo (agrupando `assets/` y `node_modules/`
que no son código propio del proyecto). Cada fila indica si el archivo es
**código vivo** (se usa activamente) o **legacy/respaldo** (copia vieja,
prototipo abandonado, o archivo que ningún HTML/JS referencia hoy).

## Raíz del proyecto

| Archivo | Estado | Para qué sirve |
|---|---|---|
| `index.html` | ✅ Vivo | Landing pública. Ver [FRONTEND.md](./FRONTEND.md). |
| `menu.html` | ✅ Vivo | Menú de bebidas y precios. |
| `retos.html` | ✅ Vivo | Catálogo de retos (sin ruleta). |
| `ruleta.html` | ✅ Vivo | Ruleta interactiva (motor canvas). |
| `perfil.html` | ✅ Vivo | App de perfil/fidelización/escáner. Resultado de fusionar `perfil.html` + `perfil2.html` (perfil2 ya no existe, se integró todo aquí). |
| `manifest.json` | ✅ Vivo | Manifest de la PWA (`start_url: /perfil.html`). |
| `sw.js` | ✅ Vivo | Service Worker: cachea estáticos, maneja `push`/`notificationclick`. |
| `package.json` / `package-lock.json` | ✅ Vivo | Dependencias de las funciones serverless en `api/` (no del frontend, que no tiene build step). |
| `example.env` | ✅ Vivo (plantilla) | Nombres de las variables de entorno que necesita `api/send-push.js`. No trae valores reales. |
| `.gitignore` | ✅ Vivo | Ignora `.vercel/`. |
| `.claude/settings.local.json` | ⚙️ Config de tooling | Configuración local de Claude Code, no forma parte de la app. |
| `.vercel/repo.json`, `.vercel/README.txt` | ⚙️ Config de tooling | Metadata del link a Vercel (gitignored en la práctica; solo el README explicativo queda). |
| `app.js` (raíz) | 🗄️ Legacy | Copia antigua de `js/app.js` con `console.log` de diagnóstico y sin el botón de notificaciones push. **Ningún HTML lo carga** (todos usan `js/app.js`). Se conserva como referencia histórica; no editar pensando que afecta la app. |
| `challengesgithub.js` | 🗄️ Legacy | Variante de `js/challenges.js`, no referenciada por ningún HTML. |
| `ruletagithub.html` | 🗄️ Legacy | Variante antigua de `ruleta.html` (carga `js/challenges.js` pero no está enlazada desde la navegación ni de otra página). |
| `perfil` (sin extensión) | 🗄️ Legacy | Copia HTML antigua de la página de perfil (versión previa a la fusión con `perfil2.html`). No se sirve ni se referencia. |
| `sw (1).js`, `sw.jsbk`, `sw.jsbkbk` | 🗄️ Legacy | Copias/respaldos del Service Worker real (`sw.js`). |

## `js/` — módulos de frontend

Ver el detalle funcional completo en [JS_MODULES.md](./JS_MODULES.md).

| Archivo | Estado | Resumen |
|---|---|---|
| `js/config.js` | ✅ Vivo | Cliente Supabase + constantes (`AppConfig`). |
| `js/data.js` | ✅ Vivo | Toda la capa de acceso a datos (`DataStore`). |
| `js/auth.js` | ✅ Vivo | Login/registro por PIN, sesión (`Auth`). |
| `js/loyalty.js` | ✅ Vivo | Racha de sábados 5+1 (`Loyalty`). |
| `js/retos-album.js` | ✅ Vivo | Álbum de cromos con medallas (`AlbumRetos`). |
| `js/challenges.js` | ✅ Vivo | Catálogo de retos + motor de la ruleta (canvas). |
| `js/api.js` | ✅ Vivo (sin consumidor UI aún) | Endpoints JSON tipo widget (`ChescoAPI`); listo para usarse, ninguna página lo consume todavía. |
| `js/app.js` | ✅ Vivo | Controlador de `perfil.html` (el "real"; no confundir con `./app.js` de la raíz). |
| `js/landing.js` | ✅ Vivo | Efectos de landing + interceptor del enlace Ruleta + form de sugerencias (versión local). |
| `js/buzon.js` | 🟡 Huérfano | Envío real por `fetch` del buzón de sugerencias. Ningún `<script>` lo incluye; solo aparece precacheado en `sw.js`. Ver nota en [FRONTEND.md](./FRONTEND.md#indexhtml). |
| `js/app.jsbk`, `js/app.jsBK`, `js/app.jsbkbk` | 🗄️ Legacy | Respaldos históricos de `js/app.js` en distintos momentos de su evolución. |
| `js/data.jsBk` | 🗄️ Legacy | Respaldo de `js/data.js`. |

## `css/` — estilos compartidos

| Archivo | Estado | Resumen |
|---|---|---|
| `css/theme.css` | ✅ Vivo | Tema base compartido por todas las páginas (logo, botones, luces de feria). |
| `css/landing.css` | ✅ Vivo | Landing, menú, retos, ruleta (navbar, hero, canvas de ruleta, scoreboard). |
| `css/profile.css` | ✅ Vivo | Todo lo específico de `perfil.html` (login, CheskoCard, álbum, modales, escáner). |

## `api/` — funciones serverless (Vercel)

Ver contrato completo en [BACKEND_API.md](./BACKEND_API.md).

| Archivo | Estado | Resumen |
|---|---|---|
| `api/create-wallet-pass.js` | ✅ Vivo | Crea/actualiza la tarjeta de lealtad en Google Wallet. |
| `api/send-push.js` | ✅ Vivo (pendiente de validar dependencia) | Envía notificaciones push reales; requiere agregar `@supabase/supabase-js` a `package.json` (ver BACKEND_API.md). |

## `sql/` — esquema de base de datos

Ver detalle en [DATABASE.md](./DATABASE.md).

| Archivo | Estado | Resumen |
|---|---|---|
| `sql/supabase-schema.sql` | ✅ Vivo (script de instalación inicial) | Tablas + RLS deshabilitado + funciones RPC base. |
| `sql/rpc-functions-only.sql` | ✅ Vivo (script de actualización) | Solo las funciones RPC, para proyectos donde las tablas ya existen. |
| `docs/retos-inventados.txt` | 📄 Dato de usuario | Archivo de texto con retos inventados por clientes (generado por la función "Descargar .txt" de `ruleta.html`, o guardado manualmente); no es documentación ni código. |

## `bk/` — respaldos explícitos

| Archivo | Estado |
|---|---|
| `bk/index.htmlbk` | 🗄️ Legacy — respaldo antiguo de `index.html`. |
| `bk/ruleta.htmlbk` | 🗄️ Legacy — respaldo antiguo de `ruleta.html`. |

## `assets/`

Carpeta de medios (imágenes del logo/mascota, iconos de la PWA, música,
videos promocionales, PDFs del menú/stickers para imprimir). No contiene
código; se referencia desde el HTML/CSS/manifest por ruta relativa
(`assets/...`). No se detalla archivo por archivo aquí porque son binarios
sin lógica que documentar.

## `node_modules/`

Dependencias instaladas de `package.json` (usadas solo por las funciones de
`api/`). Generado por `npm install`, no se edita a mano ni se documenta
archivo por archivo.

## Convenciones de nombres de "backup" detectadas en este repo

Si en el futuro aparecen más archivos con estos patrones, trátalos como
**legacy** salvo que un `<script>`/`<link>` los referencie explícitamente:
`*bk`, `*BK`, `*bkbk`, `*.htmlbk`, `nombre (1).ext`, carpeta `bk/`, o
variantes con sufijo `github` (p. ej. `challengesgithub.js`,
`ruletagithub.html` — parecen versiones de un fork o de otra rama subidas
sueltas al repo).
