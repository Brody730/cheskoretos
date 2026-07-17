# ChesKoretos — Documentación Técnica

ChesKoretos es la web/PWA de un puesto de bebidas preparadas ("chescos") en el
Parque Dr. Montes De Oca. Combina una landing pública, un menú, un catálogo de
retos, una ruleta interactiva y una app de fidelización con perfil, tarjeta
digital (CheskoCard), QR de validación y un escáner para el staff.

Esta carpeta (`/docs`) es la documentación técnica del proyecto: para qué
sirve cada archivo, cómo se conectan entre sí, cómo fluyen los datos y qué
partes del repo son código vivo vs. respaldos/legacy. Está pensada para que
cualquier humano o modelo de IA que entre al repo por primera vez pueda
orientarse rápido, sin tener que leer los ~11 500 líneas de código fuente.

## Cómo navegar esta documentación

| Documento | Contenido |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Visión general del stack, despliegue (Vercel), y cómo se relacionan frontend / backend / base de datos. |
| [FRONTEND.md](./FRONTEND.md) | Cada página HTML: para qué sirve, qué scripts carga y en qué orden, y comportamientos no obvios (p. ej. el modal que intercepta el enlace "Ruleta"). |
| [JS_MODULES.md](./JS_MODULES.md) | Cada módulo de `js/*.js`: su API pública, de qué depende y quién lo consume. Incluye el grafo de dependencias. |
| [BACKEND_API.md](./BACKEND_API.md) | Las funciones serverless de `api/*.js` (Vercel Functions): contrato de entrada/salida, variables de entorno y quién las llama. |
| [DATABASE.md](./DATABASE.md) | Esquema de Supabase/Postgres: tablas, funciones RPC, y qué falta versionado en el repo. |
| [DATA_FLOW.md](./DATA_FLOW.md) | Flujos completos end-to-end (registro, login, registrar visita/racha, escaneo QR, notificaciones) con diagramas de secuencia. |
| [GRAPHS.md](./GRAPHS.md) | Todos los diagramas (mermaid) en un solo lugar: grafo de archivos, navegación entre páginas, entidad-relación de la base de datos. |
| [FILE_MAP.md](./FILE_MAP.md) | Listado archivo por archivo de todo el repositorio, incluyendo qué carpetas/archivos son respaldos (`bk/`, `*bk`, `*BK`, `*bkbk`) y no deben tomarse como código vigente. |

## Resumen ultra-rápido (30 segundos)

- **Frontend**: HTML + CSS + JavaScript "vanilla" (sin framework, sin build
  step). Cada página (`index.html`, `menu.html`, `retos.html`, `ruleta.html`,
  `perfil.html`) es un archivo independiente que comparte `css/theme.css` y
  módulos de `js/`.
- **Backend de datos**: [Supabase](https://supabase.com) (Postgres + API
  autogenerada + Realtime). El frontend nunca hace SQL directo: todo pasa por
  el cliente `supabase-js` en `js/data.js`, y la lógica de negocio sensible
  (rachas, login) vive en funciones **RPC** de Postgres (`sql/*.sql`).
- **Backend propio**: dos funciones serverless en `api/` desplegadas en
  **Vercel** (Google Wallet y notificaciones push).
- **Autenticación**: PIN de 4 dígitos + teléfono. No usa Supabase Auth, ni
  SMS, ni email — es un sistema propio implementado con funciones RPC
  (`register_user`, `login_with_pin`).
- **Sin build step**: no hay bundler, transpilador ni framework de frontend.
  Se despliega tal cual a Vercel como sitio estático + funciones serverless.
