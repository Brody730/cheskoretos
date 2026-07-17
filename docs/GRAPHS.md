# Grafos del proyecto (índice visual)

Este documento reúne, en un solo lugar, todos los diagramas del proyecto.
Los diagramas están escritos en [Mermaid](https://mermaid.js.org/) — se
renderizan automáticamente en GitHub y en la mayoría de visores de Markdown
(incluyendo el propio Claude).

## 1. Grafo de inclusión de archivos (qué HTML carga qué CSS/JS)

Este es el grafo "físico": qué etiqueta `<link>`/`<script>` conecta cada
página con cada archivo estático. Las líneas punteadas son librerías por CDN
(no versionadas en este repo).

```mermaid
flowchart LR
    subgraph Paginas["Páginas HTML"]
        IDX["index.html"]
        MENU["menu.html"]
        RETOS["retos.html"]
        RUL["ruleta.html"]
        PERF["perfil.html"]
    end

    subgraph CSSF["CSS"]
        THEME["theme.css"]
        LANDCSS["landing.css"]
        PROFCSS["profile.css"]
    end

    subgraph JSF["JS internos"]
        CFG["config.js"]
        CHA["challenges.js"]
        DATA["data.js"]
        AUTH["auth.js"]
        LOY["loyalty.js"]
        ALB["retos-album.js"]
        API["api.js"]
        APP["app.js"]
        LAND["landing.js"]
    end

    subgraph CDN["Librerías CDN (no versionadas)"]
        SB["@supabase/supabase-js"]
        QR["qrcode-generator"]
        H5QR["html5-qrcode"]
        H2C["html2canvas"]
        FONTS["Google Fonts\n(Bangers, Luckiest Guy)"]
    end

    SW["sw.js\n(Service Worker, todas las páginas lo registran)"]

    IDX --> THEME & LANDCSS & LAND & FONTS
    MENU --> THEME & LANDCSS & LAND & FONTS
    RETOS --> THEME & LANDCSS & CHA & LAND & FONTS
    RUL --> THEME & LANDCSS & CFG & DATA & CHA & SB & H2C & FONTS
    PERF --> THEME & LANDCSS & PROFCSS
    PERF --> CFG & CHA & DATA & AUTH & LOY & ALB & API & APP
    PERF --> SB & QR & H5QR & H2C & FONTS

    IDX -.registra.-> SW
    MENU -.registra.-> SW
    RETOS -.registra.-> SW
    RUL -.registra.-> SW
    PERF -.registra.-> SW

    style CDN stroke-dasharray: 3 3
```

## 2. Grafo de dependencias entre módulos JS

Ver la versión detallada con la API de cada módulo en
[JS_MODULES.md](./JS_MODULES.md#grafo-de-dependencias). Resumen:

```mermaid
flowchart TB
    CFG["config.js"] --> DATA["data.js"]
    CFG --> AUTH["auth.js"]
    DATA --> AUTH
    DATA --> LOY["loyalty.js"]
    AUTH --> LOY
    DATA --> ALB["retos-album.js"]
    AUTH --> ALB
    CHA["challenges.js"] --> ALB
    DATA --> API["api.js"]
    CHA --> API
    CFG --> APP["app.js"]
    DATA --> APP
    AUTH --> APP
    LOY --> APP
    ALB --> APP
    CHA --> APP
```

## 3. Navegación entre páginas

Ver [FRONTEND.md](./FRONTEND.md#navegación-entre-páginas) para el detalle del
"interceptor" del enlace Ruleta.

## 4. Arquitectura por capas (frontend / Vercel / Supabase / Google)

Ver [ARCHITECTURE.md](./ARCHITECTURE.md#diagrama-de-capas).

## 5. Entidad-relación de la base de datos

Ver [DATABASE.md](./DATABASE.md#diagrama-entidad-relación).

## 6. Flujos de negocio (secuencia)

Ver [DATA_FLOW.md](./DATA_FLOW.md) — incluye: registro, login, restaurar
sesión, escaneo QR + racha 5+1, notificaciones (Realtime + push), y girar la
ruleta.

## 7. Lógica de la racha de sábados (árbol de decisión)

Ver [DATABASE.md](./DATABASE.md#lógica-de-registrar_visita-racha-51).
