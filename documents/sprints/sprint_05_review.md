# Sprint 5: API Pública y Desacoplamiento de la Landing Page

Este sprint representa un cambio estratégico en la arquitectura de la aplicación. Originalmente planeada como un sistema monolítico que incluía la Landing Page pública, se optó por una arquitectura **Headless (API-first) para el portal público**.

Esta decisión permite a la organización eclesiástica conectar el calendario distrital a su plataforma web existente (la cual ya tienen desarrollada) sin necesidad de reescribir su sitio, y sin forzar a la plataforma de gestión interna a manejar el tráfico y renderizado SEO de su página principal.

## 1. Entregables Funcionales
*   **Endpoint Público de Ministerios (`/api/public/ministerios`):**
    *   Un endpoint GET abierto y sin autenticación que expone exclusivamente la información pública de los ministerios (nombre, color representativo, logo y categoría).
    *   Este endpoint está diseñado para alimentar filtros interactivos (dropdowns o botones) en la landing page del cliente.
    *   Se ocultan de forma estricta los datos sensibles como la asignación de líderes a los ministerios.

*   **Endpoint Público de Eventos (`/api/public/eventos`):**
    *   Un endpoint GET robusto diseñado para exponer la agenda del distrito al público.
    *   **Filtro estricto de visibilidad:** Únicamente devuelve eventos que están en estado `PUBLISHED` (ignora los borradores) y cuya visibilidad es `PUBLIC` (ignora los eventos designados como `PRIVATE` o exclusivos para el liderazgo local).
    *   **Filtro de temporalidad (Ventana de 30 días):** El endpoint rechaza eventos pasados y limita los resultados a una ventana móvil estricta de 30 días contando desde la fecha de petición. Combina lógica en Prisma (`endDate >= now` y `startDate <= next30Days`) para asegurar la frescura de los eventos expuestos.
    *   **Ordenamiento:** Devuelve los eventos ordenados cronológicamente de forma ascendente (el evento más cercano en el tiempo aparece de primero).
    *   **Privacidad absoluta:** Se configuró una proyección explícita (`select` de Prisma) para descartar radicalmente la columna `privateNotes`, asegurando que detalles logísticos y financieros del distrito jamás salgan a la red pública.
    *   **Soporte de parámetros (Query Params):** Se implementaron los parámetros `?ministerioId={uuid}` (para filtrar por organizador) y `?limit={number}` (para limitar la respuesta, ideal para una sección de "Próximos 4 eventos" en la portada web).

## 2. Documentación para Integradores
*   Se creó el documento `documents/api_publica.md` el cual actúa como la guía oficial de integración.
*   Contiene la firma de los endpoints, ejemplos de respuesta JSON en formato real y consejos técnicos (por ejemplo, cómo renderizar los textos con saltos de línea de la descripción usando `whitespace-pre-wrap` en React).

## 3. Beneficios Arquitectónicos
*   **Menor Carga y Seguridad:** La plataforma interna del distrito (`/dashboard/...`) queda aislada de los ataques públicos y del tráfico de la landing page.
*   **Separación de Intereses (SoC):** El administrador o los líderes se dedican exclusivamente a cargar los datos y el equipo de diseño y web de la congregación puede diseñar e iterar la Landing Page independientemente, consumiendo el JSON.
*   **Flexibilidad a Futuro:** El uso de una API Headless abre la puerta al futuro desarrollo de una aplicación móvil (App) para la congregación usando exactamente los mismos endpoints sin costo extra.
