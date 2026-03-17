# Requerimientos y Lógica de Negocio

Este documento detalla los requerimientos funcionales y la lógica de negocio central para el Calendario Digital del Distrito 3.

## 1. Roles y Permisos

La plataforma funcionará bajo un modelo basado en roles (RBAC).

### Administrador (Admin)
*   Tiene control total sobre el sistema. (Sus credenciales iniciales se crearán de forma predeterminada al levantar el sistema, empleando una contraseña segura).
*   **Permisos de CRUD Completo:** Puede crear, leer, actualizar y eliminar de forma permanente ("hard delete") cualquier entidad en la base de datos (Iglesias, Ministerios, Usuarios, Eventos). Las eliminaciones duras incluyen procesos en cascada para evitar inconsistencias.
*   **Gestión de Cuentas (Multi-Rol):** Crea credenciales de usuarios. Un usuario puede tener **más de un rol simultáneamente** (Ej. ADMIN y LIDER a la vez). Al crear al usuario, el Administrador selecciona todos los roles que le apliquen mediante un sistema de opciones múltiples (checkboxes).
*   **Asociación de Iglesia:** Al momento de gestionar una cuenta, el Administrador puede asociar de forma opcional al usuario con **una iglesia local** seleccionada desde el catálogo paramétrico.

### Supervisor Distrital
*   Actúa como un Líder Distrital teniendo a su cargo el "ministerio" principal denominado "Distrito 3", lo que significa que gestiona los eventos generales a nivel de todo el distrito.
*   Tiene su propio historial de liderazgo al igual que un Líder Distrital.
*   **Gestión Limitada:** A diferencia del Administrador, el Supervisor **no** tiene permisos para crear, modificar o eliminar Ministerios, Categorías o Iglesias. Tampoco puede crear credenciales ni destituir o asignar Líderes Distritales. Todas esas tareas administrativas recaen exclusivamente en el Administrador.
*   **Visibilidad Extendida:** Su principal privilegio (además de gestionar los eventos de "Distrito 3") es que puede visualizar absolutamente todos los eventos (públicos y privados) del distrito entero en el calendario, para supervisar las actividades.

### Líder Distrital
*   Usuario a cargo de uno **o más ministerios simultáneamente** (ej. puede ser líder de Jóvenes y al mismo tiempo líder de Niños).
*   **Gestión de Eventos:** Tiene control (CRUD con soft delete) exclusivo sobre los eventos que él mismo crea para sus ministerios asignados. Al crear un evento, seleccionará a qué ministerio (de los suyos) pertenece la actividad.
*   **Configuración del Ministerio:** Puede modificar detalles estéticos de sus ministerios (como cambiar el color representativo de cada uno).
*   **Directorio Local:** Puede gestionar directorios de líderes locales separados por cada uno de los ministerios que tiene a su cargo en las 8 iglesias.
*   **Visibilidad:** Puede ver todos los eventos del calendario general, incluyendo los eventos marcados como "privados" (ya que tiene nivel de liderazgo).

---

## 2. Entidades Principales y Lógica de Negocio

### Categorías y Ministerios
*   **Categorías de Ministerios (Paramétrica):** Los ministerios se agrupan en categorías mayores. El sistema proveerá categorías por defecto (ej. "Especializados", "Departamentos", "Grupos Familiares/Adultos") pero esta lista es dinámica (CRUD exclusivo para el Administrador).
*   **Creación de Ministerios:** Al crear un ministerio, el Administrador debe registrar su nombre y asignarlo a una de las **Categorías**. También se puede seleccionar de manera opcional un logo oficial y un color inicial.
*   **Agrupación Visual:** En cualquier vista donde se listen los ministerios (como filtros del calendario o en la Landing Page), estos deben mostrarse estructurados y agrupados bajo el nombre de su categoría correspondiente usando subtítulos (encabezados de tamaño moderado).
*   **Personalización:** Posteriormente, el Líder asignado al ministerio puede cambiar el color representativo (usado para identificar sus eventos en el calendario).
*   **Historial de Liderazgo:**
    *   Un ministerio está asociado a un Líder Distrital activo, **y un Líder puede tener a su cargo múltiples ministerios.**
    *   Cuando el Administrador asigna a un nuevo líder para un ministerio, el sistema registra automáticamente la fecha de fin del líder anterior para *ese ministerio en específico*, y lo envía a su respectivo historial.
    *   **Inhabilitación de Credenciales:** Las credenciales del líder saliente solo se inhabilitarán si, al ser relevado, ya no le queda ningún otro ministerio activo asignado en la plataforma.
    *   La fecha de inicio y fin de los periodos de liderazgo pueden ser editadas manualmente después de que el sistema las haya establecido.

### Iglesias Locales (Tabla Paramétrica)
*   El sistema cuenta con un listado predefinido de las 8 iglesias que conforman el Distrito 3.
*   Esta lista es paramétrica y puede ser modificada (CRUD) exclusivamente por el Administrador, alimentando listas desplegables (select/combobox) en toda la aplicación (ej. en el Directorio Local).

### Directorio de Líderes Locales
*   Cada Líder Distrital puede crear y gestionar una lista de las personas que trabajan en su ministerio a nivel local (en cada una de las 8 iglesias).
*   **Datos requeridos para el directorio:**
    *   **Nombre** completo.
    *   **Teléfono.**
    *   **Iglesia** a la que pertenece (seleccionable de la tabla paramétrica de iglesias).
    *   **Cargo/Rol Local** (lista desplegable con opciones predefinidas como: "Líder local", "Secretario", "Asistente", "Tesorero", o un campo de entrada libre "Custom").

### Eventos y Calendario
*   **Creación de Eventos y Manejo de Conflictos:** Los líderes distritales crean eventos proporcionando:
    *   Título.
    *   Fecha(s).
    *   Lugar.
    *   Enlace opcional (ej. Google Maps).
    *   **Sistema de Advertencia de Conflictos:** Al momento de que el usuario seleccione una fecha, el sistema verificará en tiempo real si existen eventos previos (del mismo u otros ministerios, incluido el "Distrito 3") agendados para ese día. Si es así, mostrará una alerta rápida listando los eventos conflictivos (y sus respectivos ministerios). El usuario, tras ser advertido, tiene la total libertad de ignorar la alerta y guardar su evento de todas formas (permitiendo múltiples eventos de diferentes ministerios el mismo día).
*   **Estados del Evento (Borrador vs. Publicado):**
    *   **Estado Borrador:** Ideal para sesiones de planificación (lluvia de ideas). Un evento en borrador es invisible para el resto del distrito (no aparece en el calendario general ni choca en el sistema de advertencias de conflictos). Tendrá una vista especial o un apartado propio dentro del panel del Líder (de manera profesional y cómoda) hasta que decida publicarlo.
    *   **Estado Publicado:** El evento se vuelve activo, aparece en los calendarios (según su tipo de visibilidad) y es considerado por el sistema de conflictos.
*   **Tipos y Visibilidad de Detalles:**
    *   Un evento publicado puede tener dos tipos de notas/detalles simultáneamente: **Descripción Pública** y **Notas Privadas**.
    *   **Eventos Públicos:** Su "Descripción Pública" es visible para cualquier visitante en la Landing Page o plataforma.
    *   **Eventos Privados:** Son eventos internos de liderazgo (ej. Ayuno de líderes). Todo el evento y sus notas solo son visibles para los usuarios logueados (Líderes, Supervisor, Admin).
    *   _Opcional/Futuro:_ Capacidad de añadir notas exclusivamente visibles para el creador del evento.
*   **Visualización en el Calendario:**
    *   Los eventos publicados se mostrarán en formato calendario, pintados con el color asignado a su respectivo ministerio.
    *   Al hacer clic en el evento (cuadradito), se desplegará una cartilla (div flotante/modal) con la información completa del evento.

---

## 3. Landing Page Pública (Página de Inicio)

La plataforma contará con una página de entrada accesible para todo el público de la congregación sin necesidad de iniciar sesión.

*   **Identidad Visual:** Mostrará la bandera de la Iglesia, el logo oficial y, si es posible, una exhibición de los logos de los ministerios activos. El diseño debe ser profesional e intuitivo.
*   **Calendario Público:** Los visitantes podrán visualizar las actividades distritales públicas (clasificación mensual, semanal, anual si el rendimiento lo permite).
*   **Filtros y Agrupaciones:** Se podrá filtrar la vista del calendario general para ver únicamente los eventos de un ministerio en específico. En el panel de filtros y presentación de la lista de ministerios, estos se verán ligeramente agrupados bajo el nombre de su categoría paramétrica (ej. *Especializados*: Jóvenes, Niños, Adolescentes; *Departamentos*: Oración, Música, Educación; etc.) en letras no tan pequeñas para facilitar la lectura y búsqueda.
*   **Acceso al Sistema:** Contará con un botón o enlace (ej. "Login" o "Acceso Líderes") que redirigirá a la pantalla de autenticación para que el liderazgo ingrese al panel de gestión.

## 4. Requerimientos No Funcionales

*   **Responsive Design / Mobile First:** Dado que los líderes accederán frecuentemente desde celulares, toda la plataforma (tanto pública como el panel de administración) debe adaptarse perfectamente a pantallas pequeñas.
*   **Seguridad y Acceso:** La autenticación se manejará exclusivamente con credenciales internas (Usuario/Contraseña). Las contraseñas deben almacenarse en la base de datos de manera encriptada.
    *   **Gestión de Contraseñas:** Los usuarios (Líderes y Supervisores) podrán modificar su propia contraseña desde su perfil en el dashboard. En caso de olvido o pérdida de credenciales, el **Administrador** tiene el privilegio de ingresar al perfil del usuario y sobrescribir su contraseña (estableciendo una nueva) **sin necesidad de conocer la contraseña antigua**.
*   **Usabilidad:** Formularios y listas desplegables (como la selección de Iglesia) deben ser fáciles de usar. Las acciones destructivas (soft delete/hard delete) deben solicitar confirmación ("¿Estás seguro que deseas eliminar...?").
*   **Rendimiento:** Las consultas al calendario (especialmente vistas mensuales/anuales) deben ser ligeras y optimizadas.
