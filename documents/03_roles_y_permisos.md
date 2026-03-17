# Matriz de Roles y Permisos

El sistema de calendario digital del Distrito 3 cuenta con una arquitectura de control de acceso basada en roles (RBAC).
Existen **tres roles** base en el sistema, pero **un mismo usuario puede poseer múltiples roles simultáneamente** (por ejemplo, ser `ADMIN` y `LIDER` al mismo tiempo). A continuación se detallan las capacidades y restricciones asociadas a cada rol individualmente:

---

## 1. Administrador (Súper Usuario)
Es el rol de máxima jerarquía. Se encarga de la configuración estructural de todo el sistema y la gestión del personal.

**Permisos Exclusivos:**
*   **Gestión de Cuentas:** Crear, editar credenciales, destituir a cualquier usuario (Supervisor o Líder Distrital) y **restablecer contraseñas** perdidas forzando una nueva sin conocer la contraseña anterior.
*   **Gestión de Entidades Paramétricas:** Crear, modificar o eliminar Categorías de Ministerios (Ej. Especializados, Departamentos) y la lista de Iglesias Locales.
*   **Gestión de Ministerios:** Crear y eliminar Ministerios Distritales y asignar/remover al líder distrital correspondiente. Esta acción genera de manera automática el registro en el "Historial de Liderazgo".
*   **Borrado Permanente (Hard Delete):** Único rol con capacidad de purgar definitivamente registros de la base de datos y ejecutar limpiezas en cascada.

---

## 2. Supervisor Distrital
Actúa como la máxima autoridad de liderazgo y supervisión, pero a nivel de sistema se comporta como un líder de amplio alcance enfocado en la *observación y gestión de los eventos distritales*, no en la configuración técnica de la plataforma.

**Permisos:**
*   **Gestión de Eventos de "Distrito 3":** Posee y administra un "Ministerio" virtual llamado "Distrito 3". Dentro de él puede crear, modificar y archivar (soft delete) los eventos generales del distrito.
*   **Visibilidad Extendida (Lectura Global):** Puede visualizar en el calendario **todos** los eventos creados por cualquier ministerio. Esto incluye los eventos "Públicos" y los eventos internos/exclusivos ("Privados") de todos los líderes.
*   **Historial Propio:** Cuenta con su propio registro de Historial de Liderazgo.

**Restricciones:**
*   **NO puede** crear credenciales o gestionar usuarios.
*   **NO puede** destituir líderes.
*   **NO puede** crear, modificar o eliminar Ministerios, Categorías o la tabla de Iglesias.
*   **NO puede** hacer borrados permanentes (Hard deletes).

---

## 3. Líder Distrital
Es el rol asignado a los encargados de los diferentes ministerios (Ej. Jóvenes, Niños, Educación, Familia, etc.). **Un mismo usuario Líder Distrital puede tener a su cargo uno o múltiples ministerios de forma simultánea.**

**Permisos:**
*   **Gestión de Eventos Propios:** Puede crear, modificar y archivar (soft delete) eventos exclusivos para los ministerios que tiene a su cargo.
*   **Identidad Ministerial:** Puede seleccionar y cambiar el "color" representativo individual de cada uno de sus ministerios asignados.
*   **Directorio Local:** Tiene control total (CRUD) para gestionar directorios de trabajo separados por ministerio. Puede registrar a los líderes locales de las 8 iglesias para cada área.
*   **Manejo de Multiministerios:** El dashboard y panel de control del Líder permitirá alternar de forma fluida entre sus ministerios asignados para gestionar eventos y equipos de manera organizada.
*   **Visibilidad de Liderazgo:** Puede visualizar el calendario general, incluyendo los eventos "Privados" (notas internas de liderazgo) creados por los demás líderes y el Supervisor.

**Restricciones:**
*   **NO puede** editar ni eliminar eventos creados por otros ministerios o por el Supervisor.
*   **NO puede** modificar el nombre oficial de su ministerio o cambiar la categoría a la que pertenece (esto es tarea del Administrador).
*   **NO puede** gestionar credenciales de otros líderes o supervisores. (Sin embargo, sí podrá editar y actualizar su **propia** contraseña personal a través de la sección "Mi Perfil" de su dashboard).
