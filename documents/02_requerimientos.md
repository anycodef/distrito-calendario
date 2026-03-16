# Requerimientos y Lógica de Negocio

Este documento detalla los requerimientos funcionales y la lógica de negocio central para el Calendario Digital del Distrito 3.

## 1. Roles y Permisos

La plataforma funcionará bajo un modelo basado en roles (RBAC).

### Administrador (Admin)
*   Tiene control total sobre el sistema. (Sus credenciales iniciales se crearán de forma predeterminada al levantar el sistema, empleando una contraseña segura).
*   **Permisos de CRUD Completo:** Puede crear, leer, actualizar y eliminar de forma permanente ("hard delete") cualquier entidad en la base de datos (Iglesias, Ministerios, Usuarios, Eventos). Las eliminaciones duras incluyen procesos en cascada para evitar inconsistencias.
*   **Gestión de Cuentas:** Crea y asigna credenciales (usuario/contraseña) para Supervisores Distritales y Líderes Distritales.

### Supervisor Distrital
*   Actúa como un Líder Distrital con privilegios elevados, teniendo a su cargo el ministerio principal denominado "Distrito 3".
*   Tiene su propio historial de liderazgo similar al de un Líder Distrital.
*   **Gestión de Ministerios y Líderes:** Puede crear y modificar ministerios. Puede crear credenciales para nuevos líderes distritales y asignarlos a un ministerio. Al realizar una reasignación, el líder saliente pasa al "historial de liderazgo" inhabilitando sus credenciales automáticamente (aunque es posible editar manualmente las fechas de inicio y fin).
*   **Permisos de Eliminación Lógica:** Las eliminaciones realizadas por este rol son únicamente "soft deletes" (enviar a papelera / ocultar del sistema) para evitar pérdida de información histórica. Puede recuperar elementos en papelera.
*   **Visibilidad:** Puede visualizar todos los eventos públicos y privados del distrito (ya que pertenece al liderazgo).

### Líder Distrital
*   Usuario a cargo de un ministerio específico (ej. Jóvenes, Niños, etc.).
*   **Gestión de Eventos:** Tiene control (CRUD con soft delete) exclusivo sobre los eventos que él mismo crea para su ministerio.
*   **Configuración del Ministerio:** Puede modificar detalles estéticos de su ministerio, como elegir el color representativo que se usará en el calendario.
*   **Directorio Local:** Puede gestionar su propio directorio de líderes locales correspondientes a su ministerio en las 8 iglesias.
*   **Visibilidad:** Puede ver todos los eventos del calendario general, incluyendo los eventos marcados como "privados" (ya que tiene nivel de liderazgo).

---

## 2. Entidades Principales y Lógica de Negocio

### Categorías y Ministerios
*   **Categorías de Ministerios (Paramétrica):** Los ministerios se agrupan en categorías mayores. El sistema proveerá categorías por defecto (ej. "Especializados", "Departamentos", "Grupos Familiares/Adultos") pero esta lista es dinámica (CRUD para Admin/Supervisor).
*   **Creación de Ministerios:** Al crear un ministerio, el Admin o Supervisor debe registrar su nombre y asignarlo a una de las **Categorías**. También se puede seleccionar de manera opcional un logo oficial y un color inicial.
*   **Agrupación Visual:** En cualquier vista donde se listen los ministerios (como filtros del calendario o en la Landing Page), estos deben mostrarse estructurados y agrupados bajo el nombre de su categoría correspondiente usando subtítulos (encabezados de tamaño moderado).
*   **Personalización:** Posteriormente, el Líder asignado al ministerio puede cambiar el color representativo (usado para identificar sus eventos en el calendario).
*   **Historial de Liderazgo:**
    *   Un ministerio está asociado a un Líder Distrital activo.
    *   Cuando el Admin/Supervisor asigna a un nuevo líder, el sistema registra automáticamente la fecha de fin del líder anterior y lo envía al historial, inhabilitando sus credenciales de acceso.
    *   La fecha de inicio y fin de estos periodos pueden ser editadas manualmente después de que el sistema las haya establecido.

### Iglesias Locales (Tabla Paramétrica)
*   El sistema cuenta con un listado predefinido de las 8 iglesias que conforman el Distrito 3.
*   Esta lista es paramétrica y puede ser modificada (CRUD) por el Admin o el Supervisor Distrital, alimentando listas desplegables (select/combobox) en toda la aplicación (ej. en el Directorio Local).

### Directorio de Líderes Locales
*   Cada Líder Distrital puede crear y gestionar una lista de las personas que trabajan en su ministerio a nivel local (en cada una de las 8 iglesias).
*   **Datos requeridos para el directorio:**
    *   **Nombre** completo.
    *   **Teléfono.**
    *   **Iglesia** a la que pertenece (seleccionable de la tabla paramétrica de iglesias).
    *   **Cargo/Rol Local** (lista desplegable con opciones predefinidas como: "Líder local", "Secretario", "Asistente", "Tesorero", o un campo de entrada libre "Custom").

### Eventos y Calendario
*   **Creación de Eventos:** Los líderes distritales crean eventos proporcionando:
    *   Título.
    *   Fecha(s).
    *   Lugar.
    *   Enlace opcional (ej. Google Maps).
*   **Tipos y Visibilidad de Detalles:**
    *   Un evento puede tener dos tipos de notas/detalles simultáneamente: **Descripción Pública** y **Notas Privadas**.
    *   **Eventos Públicos:** Su "Descripción Pública" es visible para cualquier visitante en la Landing Page o plataforma.
    *   **Eventos Privados:** Son eventos internos de liderazgo (ej. Ayuno de líderes). Todo el evento y sus notas solo son visibles para los usuarios logueados (Líderes, Supervisor, Admin).
    *   _Opcional/Futuro:_ Capacidad de añadir notas exclusivamente visibles para el creador del evento.
*   **Visualización en el Calendario:**
    *   Los eventos se mostrarán en formato calendario, pintados con el color asignado a su respectivo ministerio.
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
*   **Usabilidad:** Formularios y listas desplegables (como la selección de Iglesia) deben ser fáciles de usar. Las acciones destructivas (soft delete/hard delete) deben solicitar confirmación ("¿Estás seguro que deseas eliminar...?").
*   **Rendimiento:** Las consultas al calendario (especialmente vistas mensuales/anuales) deben ser ligeras y optimizadas.
