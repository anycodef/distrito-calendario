# Planificación de Sprints

El desarrollo de la plataforma se dividirá en iteraciones (Sprints), enfocadas en entregar valor funcional continuo. Dado que es un desarrollo en solitario, el marco ágil se adapta para mantener un flujo de trabajo simple pero estructurado.

> **Nota:** Al finalizar o durante cada Sprint, se creará un archivo específico en la carpeta `/documents/sprints/` (ej. `sprint_01_review.md`) para documentar los cambios técnicos reales, ajustes sobre la marcha y lecciones aprendidas.

---

## Sprint 1: Fundación y Base de Datos (Core)
**Objetivo:** Establecer la infraestructura base del proyecto, el esquema de la base de datos y el sistema de autenticación fundamental.
*   **Tareas:**
    *   Inicializar el proyecto en Next.js con Tailwind CSS.
    *   Configurar la conexión a la base de datos PostgreSQL (Neon/Supabase) y el ORM (ej. Prisma o Drizzle).
    *   Crear los esquemas iniciales (Usuarios, Iglesias, Ministerios).
    *   Desarrollar la lógica de autenticación (Login) usando usuario y contraseña encriptada (bcrypt) y gestión de sesiones/tokens.
    *   Crear el "Súper Administrador" inicial por defecto mediante scripts (seed).
*   **Entregable:** Aplicación levantada, base de datos conectada, pantalla de login funcional que autentica al usuario administrador.

## Sprint 2: Gestión Administrativa y Catálogos
**Objetivo:** Permitir al Administrador gestionar las entidades y estructura base del sistema.
*   **Tareas:**
    *   Crear el panel de administración (Dashboard base, accesible exclusivamente para el Administrador).
    *   Implementar el CRUD para la tabla paramétrica de "Iglesias" (8 iglesias por defecto).
    *   Implementar el CRUD para las "Categorías de Ministerios" (Especializados, Departamentos, Grupos Familiares, etc.).
    *   Implementar el CRUD de "Usuarios" (creación de credenciales para Supervisores y Líderes Distritales).
    *   Implementar el CRUD de "Ministerios" (vinculado a una Categoría) y la asignación/destitución de Líderes (incluyendo la lógica de "Historial de Liderazgo" con fechas de inicio y fin).
    *   Implementar lógica de "Soft Delete" para estas entidades (Hard delete es exclusivo del Admin).
*   **Entregable:** El Administrador puede gestionar independientemente las categorías, credenciales, ministerios e iglesias de todo el sistema, y asignar/remover líderes generando el historial correspondiente.

## Sprint 3: Directorio Local e Identidad Ministerial
**Objetivo:** Darle herramientas al Líder Distrital para gestionar su equipo local y personalizar su ministerio.
*   **Tareas:**
    *   Crear la vista específica para el Líder Distrital al iniciar sesión.
    *   Implementar la funcionalidad para que el Líder Distrital elija/cambie el color de su ministerio.
    *   Desarrollar el CRUD del "Directorio Local" (Añadir líder local, teléfono, selección de iglesia del catálogo, y asignación de cargo).
*   **Entregable:** Cada líder puede personalizar el color de su ministerio y mantener su agenda telefónica/directorio de líderes locales de las 8 iglesias.

## Sprint 4: El Motor del Calendario y Gestión de Eventos
**Objetivo:** Construir la funcionalidad central de la plataforma: el calendario interactivo y la creación de eventos, incluyendo manejos de conflictos y estados de publicación.
*   **Tareas:**
    *   Integrar o construir un componente de calendario (vista mensual/semanal).
    *   Desarrollar el formulario de creación de Eventos (Título, Fecha, Lugar, Link).
    *   Implementar el "Sistema de Advertencia de Conflictos" (revisión en tiempo real de eventos existentes en la fecha seleccionada y mostrar advertencia).
    *   Añadir la lógica de "Estados" (Guardar como Borrador vs. Publicar). Crear una vista profesional para listar y gestionar los borradores de un líder.
    *   Implementar la lógica de visibilidad: Campos para "Descripción Pública" y "Notas Privadas", y el interruptor para marcar el evento publicado como Público o Privado.
    *   Renderizar los eventos publicados en el calendario utilizando el color del ministerio correspondiente.
    *   Crear el modal/cartilla flotante que muestra los detalles del evento al hacer clic.
*   **Entregable:** Los líderes pueden crear eventos de manera informada (recibiendo alertas de choques de fecha), guardar eventos como borradores sin afectar el calendario global y, al publicarlos, visualizarlos correctamente en el sistema interno.

## Sprint 5: Landing Page y Visibilidad Pública
**Objetivo:** Construir la cara pública del proyecto para que la congregación pueda ver las actividades.
*   **Tareas:**
    *   Diseñar y maquetar la Landing Page (profesional, responsiva, aplicando los colores corporativos: blanco, rojo, azul, púrpura).
    *   Mostrar el logo de la iglesia y, de forma dinámica, los logos de los ministerios activos estructurados y agrupados por su Categoría correspondiente.
    *   Integrar una versión de "solo lectura" del calendario en la Landing Page que muestre únicamente los eventos marcados como "Públicos".
    *   Implementar los filtros por "Ministerio" permitiendo una búsqueda fácil y cómoda, agrupando las opciones visualmente bajo el título de su Categoría Paramétrica en la UI.
    *   Asegurar que el botón de "Login para Líderes" esté claramente posicionado.
*   **Entregable:** Portal web completo donde la congregación puede consultar y filtrar actividades públicas, con los listados y menús de ministerios claramente organizados por sus categorías mayores.

## Sprint 6: Pulido, Testing y Despliegue (Release)
**Objetivo:** Asegurar la calidad, el rendimiento y desplegar a producción.
*   **Tareas:**
    *   Revisión exhaustiva de usabilidad en dispositivos móviles (Mobile First).
    *   Pruebas de flujos completos (crear un líder -> asignar ministerio -> crear evento -> ver en landing).
    *   Ajustes de UI/UX, animaciones de carga, modales de confirmación para acciones destructivas.
    *   Despliegue de la base de datos y la aplicación en Vercel (con custom domain si aplica).
*   **Entregable:** Plataforma v1.0 en vivo y lista para ser utilizada por el liderazgo del Distrito 3.
