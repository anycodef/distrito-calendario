# Planificación General y Arquitectura

## 1. Visión del Proyecto
El objetivo principal es crear una plataforma web de calendario digital para gestionar las actividades a nivel distrital del Distrito 3, Área 6 de la Iglesia de Dios de la Profecía (que agrupa a 8 iglesias locales). La plataforma permitirá organizar, visibilizar y centralizar los eventos de los diferentes ministerios (Niños, Adolescentes, Jóvenes, Oración, Mayordomía, Misión Social, Cosecha, Familia, ESLIDER, entre otros).

Está pensada para ser una solución a la medida, eliminando herramientas innecesarias y enfocándose estrictamente en las necesidades del público objetivo: líderes distritales, el supervisor distrital y la visibilidad para las congregaciones.

## 2. Marco de Trabajo
El proyecto será desarrollado en solitario bajo un marco de trabajo ágil simplificado.
El desarrollo estará estructurado en **Sprints**, donde cada iteración entregará un incremento funcional y probado (entregables funcionales).
Toda la documentación inicial residirá en la carpeta `/documents`, y la narración o cambios generados post-desarrollo de cada iteración se documentarán en la carpeta `/documents/sprints/`.

## 3. Stack Tecnológico
La elección tecnológica busca un bajo costo de infraestructura, gran escalabilidad, fácil mantenimiento y excelente rendimiento y responsividad (Mobile First).

*   **Frontend y Backend (Full-stack Framework):** Next.js (React). Ideal para plataformas de este tamaño, con SSR (Server-Side Rendering) y ruteo fácil. Se desplegará de forma gratuita en Vercel.
*   **Estilos y Diseño:** Tailwind CSS. Asegura un desarrollo rápido, diseño profesional y 100% responsivo para que sea cómodo desde dispositivos móviles.
*   **Base de Datos:** PostgreSQL. Una solución relacional robusta. Se alojará en un servicio Serverless en la nube con plan gratuito (como Neon o Supabase) para evitar problemas de persistencia comunes en SQLite dentro de plataformas Vercel.
*   **Autenticación:** Sistema propio de usuario y contraseña creado a medida y encriptado (ej. usando bcrypt). No habrá integraciones externas complejas (como Google Auth) para evitar barreras tecnológicas en los usuarios.

## 4. Identidad Visual y Diseño
La interfaz de usuario deberá transmitir profesionalidad e identidad:
*   **Colores base:** Rojo, blanco, azul y púrpura. El color dominante para los fondos y espacios será el blanco, usando los demás colores para detalles, botones y acentos.
*   **Personalización de Ministerios:** Cada ministerio distrital (creado por el Administrador/Supervisor) tendrá un color distintivo elegido por el líder (que se reflejará en el calendario) y un logo.
*   **Logos:** La plataforma contemplará un catálogo de logos oficiales de la Iglesia pre-cargados que podrán seleccionarse al crear un ministerio, o bien, subirse posteriormente. En la Landing Page se exhibirá la bandera, el logo oficial y los logos de los ministerios activos.

## 5. Arquitectura de Base de Datos (Alto Nivel)
Aunque la estructura de BD evolucionará, los pilares centrales serán:
*   **Usuarios (Líderes, Supervisor, Administrador):** Nombres, credenciales (usuario y contraseña encriptada), rol, etc.
*   **Iglesias (Paramétrica):** Catálogo de las 8 iglesias del distrito para su fácil selección.
*   **Categorías de Ministerios (Paramétrica):** Agrupaciones lógicas para los ministerios (Ej. Especializados, Familia/Adultos, Departamentos). Permite organizar y filtrar los ministerios de manera jerárquica.
*   **Ministerios:** Nombre, color representativo, logo asignado, y su relación con una Categoría de Ministerio.
*   **Asignaciones / Historial de Liderazgo:** Relación entre el ministerio y el líder distrital. Se registrará fecha de inicio y fecha de fin (calculada automáticamente al hacer la transición, pero editable) para mantener un historial.
*   **Eventos de Calendario:**
    *   Título del evento, fecha(s), lugar, link opcional (ej. Google Maps).
    *   Ministerio al que pertenece (que define su color en el calendario).
    *   Detalles / Visibilidad: Puede tener una descripción pública y/o notas privadas. La visibilidad clasifica al evento como Público o Privado (interno para todo el liderazgo).
*   **Directorio Local (Líderes Locales):** Gestionado por los líderes distritales. Almacena: Nombre, Teléfono, Iglesia asignada (de la paramétrica), y Cargo (Líder local, Secretario, Asistente, Tesorero, Custom).

## 6. Manejo de Datos y "Soft Deletes"
Para mantener la integridad referencial y evitar la pérdida accidental de históricos, el sistema empleará eliminaciones lógicas (`soft deletes` o estados "en papelera") para la mayoría de los registros (Ministerios, Líderes, Eventos). Solo el rol **Administrador** tendrá la capacidad de realizar limpiezas permanentes ("hard delete") con la respectiva ejecución en cascada.
