# Sprint 3.5: Refactor Multi-Rol y Parametrización - Review

Se realizó un refactor intermedio antes del Sprint 4 para ajustar la lógica de negocio basada en nuevos requerimientos sobre los roles y la parametrización de usuarios.

## 1. Entregables y Refactor
*   **Base de Datos Multi-rol:** Se modificó `schema.prisma`. El modelo `User` ahora utiliza un arreglo de roles `Role[]` (característica soportada nativamente por PostgreSQL), permitiendo a un usuario ser simultáneamente "ADMIN" y "LIDER", o cualquier otra combinación.
*   **Asociación Local:** Se añadió el campo `iglesiaId` opcional en `User` relacionando a los usuarios con la tabla paramétrica `Iglesia`. Esto permite tener líderes o supervisores adscritos específicamente a una congregación si se desea.
*   **Ajustes de Autenticación y Middleware:**
    *   El JWT ahora firma y devuelve un array `roles` en lugar de un único string.
    *   El `middleware.ts` valida el acceso cruzando los endpoints con el array `roles.includes(...)`.
    *   El login redirige al usuario hacia el dashboard de mayor jerarquía que posea en su array.
*   **Interfaz de Administración de Usuarios:** El formulario de creación/edición de cuentas (`/dashboard/admin/usuarios`) reemplazó el Select clásico por un grupo de *Checkboxes* que envían los múltiples roles al backend, añadiendo además un selector opcional para la *Iglesia Local*.

## 2. Decisiones Técnicas
*   **Compatibilidad en BD:** Al usar PostgreSQL pudimos utilizar la sintaxis `@default([LIDER])` en Prisma para manejar arreglos nativos de un Enum, evitando crear tablas pivote adicionales para roles que sumarían carga a las consultas.
*   **Manejo de UI:** La interfaz fue refactorizada para permitir desmarcar o marcar libremente los roles, bloqueando el submit si el array de roles resultante queda vacío.

## 3. Selector Multi-Rol en Interfaz (Header)
Se implementó un nuevo componente visual `RoleSwitcher` (y su correspondiente ruta `/api/auth/me` para leer la sesión) que fue inyectado en el `header` de todos los dashboards (`/dashboard/admin/layout.tsx` y `/dashboard/lider/layout.tsx`).

*   Si el usuario solo tiene un rol asignado, el componente renderiza una pastilla estática (idéntico al diseño original).
*   Si el usuario tiene múltiples roles asignados (Ej. es Lider y Admin al mismo tiempo), la pastilla se convierte en un botón interactivo (dropdown) que le permite alternar la vista entre los distintos paneles administrativos y ministeriales a voluntad de forma cómoda.
