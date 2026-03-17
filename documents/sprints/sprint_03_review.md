# Sprint 3: Directorio Local e Identidad Ministerial - Review

El Sprint 3 ha sido concluido exitosamente. En esta iteración construimos el entorno de trabajo del `LIDER` (y aplicable también al `SUPERVISOR`), dándole control sobre sus ministerios asignados y equipo local.

## 1. Entregables Funcionales
*   **Dashboard del Líder:** Se creó un layout (`LiderLayout` y `LiderSidebar`) específico que despliega las opciones disponibles para la gestión. La página principal ofrece un resumen de todos los ministerios (uno o varios) que le fueron asignados por el administrador.
*   **Perfil y Cambio de Contraseña:** Los líderes tienen una sección "Mi Perfil" (`/dashboard/lider/perfil`) que consume el endpoint `/api/lider/perfil`. Esto les permite cambiar de forma autónoma su contraseña, fortaleciendo la seguridad delegada.
*   **Personalización de Identidad Ministerial:**
    *   La página "Mis Ministerios" permite ver las categorías de los ministerios asignados.
    *   Permite editar *únicamente* el **Color Representativo** de cada ministerio. No pueden cambiar nombres ni borrar los ministerios (eso es potestad del Admin), salvaguardando las reglas de la Matriz de Roles.
*   **Directorio Local:**
    *   Implementación del CRUD completo (`/api/lider/directorio`).
    *   Un líder añade miembros locales indicando su Nombre, Teléfono y Cargo (Líder local, Secretario, Asistente, Tesorero, Custom).
    *   El formulario inteligentemente despliega la lista de "Iglesias Locales" (disponibles en el sistema) y un selector cruzado de los **propios Ministerios** que el líder tiene bajo su cargo (por si maneja más de uno, ej. Jóvenes y Oración, para ubicar al contacto en su rama correspondiente).
    *   Implementado Soft Delete en el directorio.

## 2. Decisiones Técnicas
*   **Múltiples Endpoints en lugar de acoplar:** Se decidió aislar las funciones del Admin y del Lider creando los subdirectorios en `/api/admin/...` y `/api/lider/...`. Por ejemplo, para poblar el selector de "Iglesias Locales" del líder se creó `/api/lider/iglesias` (que sólo devuelve los ids y nombres de iglesias activas) porque el endpoint `/api/admin/iglesias` está severamente bloqueado en el `middleware.ts` únicamente para usuarios "ADMIN".
*   **Cruce de Seguridad en APIs del Líder:** Cada endpoint (`PUT /api/lider/ministerios`, `POST /api/lider/directorio`, etc.) valida en backend no solo el ID del Líder vía JWT, sino que realiza una consulta SQL/Prisma adicional garantizando que el Ministerio que se intenta alterar o asignar pertenezca legítimamente a ese Líder. Esto bloquea totalmente alteraciones indebidas por inspección de red.

## 3. Pruebas Locales (Guía del Sprint 3)
1. Para probar esto, entra a `http://localhost:3000/login` con la cuenta de un **Líder Distrital** que hayas creado en el Sprint 2 con el Admin.
2. Ve a "Mi Perfil" e intenta cambiar tu propia contraseña. Cierra sesión y verifica que la nueva contraseña funciona.
3. Ve a "Mis Ministerios". Si no tienes ninguno, deberás entrar con tu cuenta de Admin y asignarle uno a este usuario. Una vez asignado, prueba cambiarle el color.
4. Entra a "Directorio Local", agrega varios contactos. Selecciona cargos "Custom" y mira cómo se comporta la UI. Prueba desactivar a uno (Eliminar).
