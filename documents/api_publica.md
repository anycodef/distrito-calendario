# API Pública del Calendario Distrital

Para integrar la funcionalidad del Calendario y los Eventos a tu **Landing Page actual (desacoplada)**, la plataforma provee dos endpoints completamente públicos y seguros (solo lectura). No es necesario generar un token ni enviar cookies de autenticación.

La base URL para realizar las peticiones es tu dominio principal (Ej. `https://mi-calendario-distrital.vercel.app`).

---

## 1. Endpoint: Ministerios Activos
**Ruta:** `GET /api/public/ministerios`

Este endpoint retorna la lista de ministerios activos del Distrito. Es ideal para que armes dinámicamente un `<select>` o menú de botones en tu Landing Page que le permita al usuario final filtrar los eventos por ministerio.

### Respuesta (Ejemplo 200 OK)
```json
[
  {
    "id": "cb1c73a8-8e65-4f34-a292-6a6c0ef6a2bb",
    "name": "Distrito 3 (General)",
    "color": "#1e40af",
    "logoUrl": null,
    "categoria": {
      "name": "Organización General"
    }
  },
  {
    "id": "e2a229b4-ab90-4a8b-a4db-10a1b9f71c4c",
    "name": "Ministerio de Jóvenes",
    "color": "#eab308",
    "logoUrl": "https://url-del-logo.com/img.png",
    "categoria": {
      "name": "Departamentos"
    }
  }
]
```

---

## 2. Endpoint: Próximos Eventos Públicos
**Ruta:** `GET /api/public/eventos`

Este endpoint devuelve únicamente los eventos marcados como `PUBLIC`, que ya están en estado `PUBLISHED` (Borradores ignorados) y que se realizarán dentro de una **ventana de 30 días** a partir de la fecha y hora de la consulta. Los resultados vienen ordenados cronológicamente (el más próximo a realizarse aparece primero).

*Nota de seguridad:* Por diseño, este endpoint jamás expone el campo `privateNotes` (Notas Internas), preservando la privacidad del liderazgo.

### Parámetros de Consulta (Query Params) Opcionales
Puedes combinarlos para enriquecer tu Landing Page:
*   `?ministerioId={uuid}`: Filtra los eventos para mostrar únicamente los creados por un ministerio en específico (usa el ID devuelto por el endpoint anterior).
*   `?limit={numero}`: Restringe el resultado a los próximos `N` eventos. Muy útil para mostrar una sección de *"Próximos 4 eventos"* en la portada principal de tu landing.

**Ejemplo de Petición con Parámetros:**
`GET /api/public/eventos?ministerioId=e2a229b4-ab90-4a8b-a4db-10a1b9f71c4c&limit=4`

### Respuesta (Ejemplo 200 OK)
```json
[
  {
    "id": "d9812736-21aa-4927-9c8b-5bd1ca7a2b91",
    "title": "Concierto Distrital de Verano",
    "startDate": "2025-05-15T18:00:00.000Z",
    "endDate": "2025-05-15T21:00:00.000Z",
    "location": "Auditorio Principal - Sede Distrito 3",
    "mapLink": "https://maps.google.com/...",
    "publicDescription": "¡Ven y acompáñanos a un tiempo especial de adoración abierta al público!",
    "ministerio": {
      "id": "cb1c73a8-8e65-4f34-a292-6a6c0ef6a2bb",
      "name": "Distrito 3 (General)",
      "color": "#1e40af",
      "logoUrl": null
    }
  }
]
```

## Tips para la Implementación en tu Landing Page (React/Next.js)
1.  **Fechas:** Las fechas (`startDate` y `endDate`) se envían en formato ISO 8601 (Ej. `2025-05-15T18:00:00.000Z`). Te sugerimos usar `date-fns` o `Intl.DateTimeFormat` nativo en tu frontend para transformarlas al formato local de tu país: `Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(evento.startDate))`.
2.  **Mapeo de Colores:** Aprovecha la propiedad `ministerio.color` que trae cada evento para pintar el borde o un distintivo en la tarjeta visual (Card) del evento, logrando consistencia visual con el calendario interno del liderazgo.
3.  **Descripción Larga:** `publicDescription` puede contener saltos de línea. En React, para que estos se rendericen usa la clase de Tailwind `whitespace-pre-wrap` o `whitespace-pre-line` en el contenedor del texto.
