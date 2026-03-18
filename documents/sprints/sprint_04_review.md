# Sprint 4: El Motor del Calendario y Gestión de Eventos - Review

El Sprint 4 ha sido concluido exitosamente. En esta iteración construimos la funcionalidad central y el mayor atractivo de la plataforma: la gestión y visualización de eventos de los ministerios y del distrito.

## 1. Entregables Funcionales
*   **Calendario Distrital Interactivos:**
    *   Implementación de la página `/dashboard/lider/calendario` que integra la potente librería `@fullcalendar/react`.
    *   Todos los eventos del distrito (independientemente del ministerio) que estén con estatus `PUBLISHED` se visualizan aquí de forma unificada.
    *   Se muestra cada evento en la cuadrícula de los días coloreado dinámicamente según la parametrización de identidad del ministerio al que pertenece.
    *   Al interactuar/hacer click en el evento, se despliega un Modal Responsivo mostrando los detalles, ubicación, descripción pública y un bloque restringido de Notas Privadas exclusivo para los líderes/supervisores.
*   **Gestor "Mis Eventos":**
    *   Se creó la vista en `/dashboard/lider/eventos` que utiliza pestañas (Tabs) para separar de forma limpia la visualización entre los eventos `PUBLISHED` y los `DRAFT` (Borradores).
    *   La lista cuenta con filtros visuales por eventos "Próximos", "Pasados", y un buscador en tiempo real por el título del evento, facilitando a los usuarios el uso en dispositivos móviles mediante formato tipo lista (Cards) en lugar de recargar la vista calendario con controles de gestión.
    *   Desde esta vista se puede aplicar el "Soft Delete" en cascada a los eventos.
*   **Formulario de Creación con Sistema Anti-Conflictos:**
    *   Ubicado en `/dashboard/lider/eventos/nuevo`. El usuario puede registrar múltiples campos, clasificar el evento como Público o Privado y seleccionar a qué Ministerio se asociará.
    *   **Advertencia en Tiempo Real:** En cuanto el usuario define el rango de fechas, el frontend envía en silencioso (debounce delay) una solicitud al nuevo endpoint `/api/lider/eventos/conflictos` que cruza el periodo definido contra todos los eventos `PUBLISHED` del distrito.
    *   Si se detecta un choque (ya sea un inicio superpuesto, un fin superpuesto, o un evento envolviendo al otro), se despliega una advertencia visual inmediata de color rojo sobre el formulario alertando al líder del cruce.
    *   El usuario puede pulsar "Ver detalles" lo cual abre un modal sobrepuesto temporal enseñando qué eventos son los que coinciden en fecha, permitiéndole reconsiderar o ignorar la alerta sin perder lo que ya había rellenado en el formulario.
    *   Permite guardar el estado final como "Borrador" (invisible en el calendario global) o publicar directamente.
*   **Actualizaciones del Dashboard Principal:**
    *   El panel principal `/dashboard/lider` fue refactorizado. Dejó de ser sólo un listado de ministerios para convertirse en un centro estadístico (KPIs) mostrando "Cantidad de Ministerios", "Cantidad de Eventos" y tarjetas destacadas de los próximos eventos con acceso rápido.
    *   Se agregaron los nuevos apartados al menú lateral (`LiderSidebar`).

## 1.5. Post-Sprint / Refinamientos y Bug Fixes
Durante la revisión y prueba del Sprint 4 se identificaron y solucionaron aspectos críticos de seguridad, experiencia de usuario y rendimiento:
*   **Lenguaje Pastoral y Personalizado:** Se reemplazaron términos técnicos (como "Dashboard", "Landing page", "Link") por lenguaje accesible y pastoral ("Espacio principal", "Página principal", "Enlace"). Además, el sistema ahora extrae únicamente el **primer nombre** del usuario autenticado para mostrar saludos cálidos como *"Dios te bendiga, [Nombre]"* en los paneles principales.
*   **Resolución del Error de Llave Foránea (P2003):** Se corrigió un error crítico HTTP 500 al crear eventos como Supervisor. El frontend enviaba un ID estático de fallback (`global-distrito-id`) cuando la organización "Distrito" aún no existía. El backend fue actualizado para interceptar proactivamente cualquier ID faltante, creando y resolviendo dinámicamente el UUID válido en la base de datos antes de la inserción de Prisma.
*   **Corrección del "Flash Bug" (Caché):** Al cambiar entre las pestañas de eventos Publicados y Borradores, eventos recién borrados o publicados "parpadeaban" en la lista antigua debido a las agresivas políticas de caché de Next.js y del navegador. Esto se solucionó implementando *Cache Busting* (parámetros de timestamp `_t=${ts}` y `{ cache: "no-store" }`) en los `fetch` de los clientes, asegurando que la UI siempre dibuje el estado real.
*   **Filtros Precisos de Fechas:** Se arregló un bug lógico en el dashboard principal donde los eventos pasados se seguían mostrando en la sección "Próximos Eventos" por un uso incorrecto de operadores `OR`. Ahora se filtran estrictamente comparando con `new Date()` y se ordenan de forma ascendente.
*   **Segregación de Contexto (Multi-Rol):** Se blindaron los endpoints API (`?context=lider` vs `?context=supervisor`) para asegurar que un líder que a su vez es supervisor general no mezcle sus eventos distritales con los eventos de su ministerio local. El formulario del Supervisor ahora bloquea de forma elegante la selección de organizador forzándola estáticamente a "Distrito 3 (General)".

## 2. Decisiones Técnicas
*   **Librerías de Fechas:** Se usó `date-fns` por su modularidad y capacidad para manejar zona horarias y filtrados locales frente a métodos nativos complejos en JS o frente al peso histórico de librerías como Moment.js.
*   **Filtros Anti-Conflictos en Backend:** El query de prisma en `/api/lider/eventos/conflictos` utiliza operadores lógicos anidados (`OR: [ { gte, lt }, { gt, lte }, { lte, gte } ]`) garantizando que eventos que terminan en el mismo instante en que empieza el otro no se consideren falsos positivos en el conteo de choques, asegurando una gran precisión.

## 3. Pruebas Locales (Guía del Sprint 4)
1. Para probar esto, inicia sesión con un Líder o Supervisor.
2. Ve a la pantalla **Mis Eventos**. Notarás que estará vacía. Haz clic en "Crear Nuevo Evento".
3. Intenta crear un evento llamado "Evento 1" y pon fechas superpuestas con otro que vayas a crear.
4. Una vez creado y guardado, ve a crear un **segundo** evento "Evento 2" e intencionalmente elige una fecha que choca con "Evento 1". Notarás el mensaje de advertencia y el botón modal "Ver Detalles".
5. Guarda uno de los eventos como "Borrador". Revisa la vista del **Calendario Distrital** y confirma que solo el que pusiste en estado "Publicado" se renderiza en la cuadrícula y el de borrador no aparece en ningún lado excepto en la pestaña Borradores.
