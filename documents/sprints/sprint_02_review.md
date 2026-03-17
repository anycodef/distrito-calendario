# Sprint 2: Gestión Administrativa y Catálogos - Review

El Sprint 2 ha sido completado y entregado. Este sprint se enfocó en dotar al Súper Administrador de todas las herramientas necesarias para construir y gestionar la estructura organizativa de la plataforma.

## 1. Entregables Funcionales
*   **Seguridad y Accesos (Middleware):** Se implementó un middleware (`src/middleware.ts`) que intercepta todas las peticiones a rutas protegidas (`/dashboard/*`), validando el JWT firmado con la librería Edge-compatible `jose`. Además, implementa autorización estricta en base al rol de usuario (Admin, Supervisor, Líder).
*   **UI/UX del Panel Administrativo:** Se diseñó el `AdminLayout` con una barra lateral (Sidebar) 100% responsiva y profesional usando iconos `lucide-react` y los colores requeridos (Azules/Blancos).
*   **Gestión Paramétrica (CRUDs Básicos):**
    *   **Iglesias Locales:** API y vista completas. Permite soft-delete/hard-delete y edición rápida de nombres.
    *   **Categorías de Ministerios:** Igual que Iglesias, necesario para la agrupación lógica futura.
*   **Gestión de Usuarios (Credenciales):**
    *   Creación de cuentas, definición de nombre de usuario y roles (LÍDER, SUPERVISOR, ADMIN).
    *   La encriptación de contraseñas de los usuarios creados se maneja con `bcrypt`.
    *   Capacidad para que el administrador inhabilité cuentas (soft-delete).
    *   **Restablecimiento de Contraseñas:** El administrador puede editar un usuario existente y sobrescribir su contraseña. El backend (`PUT /api/admin/usuarios/[id]`) encripta la nueva contraseña sin necesidad de verificar o pedir la anterior, resolviendo casos de pérdida de credenciales por parte de los líderes.
*   **Gestión de Ministerios e Historial Avanzado:**
    *   La vista `/dashboard/admin/ministerios` permite crear ministerios asociándoles un color, una Categoría paramétrica y opcionalmente un Líder.
    *   **Lógica de Historial (Business Rule):** Al reasignar o quitar un líder, el backend (`PUT /api/admin/ministerios/[id]`) ubica al líder saliente, cierra su historial añadiendo la fecha de fin (`endDate`), y verifica si le quedan otros ministerios a su cargo. Si no le quedan, su credencial se inhabilita automáticamente. Por el contrario, si se asigna un nuevo líder, se le abre un nuevo registro de historial y se reactiva su cuenta si estaba suspendida.

## 2. Decisiones Técnicas
*   **Gestión de Estado (UI):** Para mantener las dependencias reducidas y una gran velocidad en Next.js App Router, las vistas de administración utilizan APIs estándar `fetch()` de React bajo componentes del lado del cliente (`"use client"`), logrando actualizaciones instantáneas post-mutación.
*   **Manejo de Multiministerios en Interfaz:** Aunque la base de datos soporta `Muchos a Muchos`, se optó por una UX simplificada en el dashboard del Administrador, donde la selección asigna un "Líder Activo" por ministerio (creando una relación N:1 en UI pero guardándola como N:M en Prisma). Esto garantiza estabilidad funcional para este sprint, posibilitando a un líder ser asignado desde diferentes ministerios.

## 3. Guía de Ejecución Local
*Al igual que en el Sprint 1, debes tener configurado tu `.env` con las variables y haber corrido el `npx prisma db seed`*.

1. Arranca el proyecto con `npm run dev`.
2. Inicia sesión con tus credenciales de `ADMIN` (Las puestas en el `.env`).
3. Accederás al panel de control `/dashboard/admin`.
4. Navega por las secciones en la barra lateral izquierda.
5. Crea al menos un Líder en "Usuarios y Credenciales", y luego ve a "Ministerios" y asígnaselo. Prueba la lógica cambiando al líder de ese ministerio por otro.
