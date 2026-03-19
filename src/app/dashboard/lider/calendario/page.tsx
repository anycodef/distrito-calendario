"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { Loader2, CalendarDays, MapPin, AlignLeft, Lock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function CalendarioDistritalPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await fetch("/api/lider/eventos");
        if (res.ok) {
          const data = await res.json();
          const formattedEvents = data.map((ev: any) => ({
            id: ev.id,
            title: ev.title,
            start: ev.startDate,
            end: ev.endDate,
            backgroundColor: ev.ministerio?.color || "#3b82f6",
            borderColor: ev.ministerio?.color || "#3b82f6",
            textColor: "#ffffff",
            extendedProps: {
              ministerio: ev.ministerio?.name,
              location: ev.location,
              mapLink: ev.mapLink,
              publicDescription: ev.publicDescription,
              privateNotes: ev.privateNotes,
              visibility: ev.visibility
            }
          }));
          setEventos(formattedEvents);
        }
      } catch (error) {
        console.error("Error fetching eventos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, []);

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600 mb-4" />
        <p className="text-gray-500">Cargando el calendario distrital...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-2xl font-semibold leading-6 text-gray-900 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-blue-600" />
          Calendario Distrital
        </h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Vista general de todos los eventos publicados por los ministerios del distrito.
        </p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <div className="min-w-[800px]">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay"
            }}
            locale={esLocale}
            events={eventos}
            eventClick={handleEventClick}
            height="auto"
            contentHeight={600}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
            displayEventEnd={true}
            dayMaxEvents={true}
          />
        </div>
      </div>

      {/* Modal de Detalles del Evento */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal con el color del ministerio */}
            <div
              className="px-6 py-4 flex items-center justify-between text-white"
              style={{ backgroundColor: selectedEvent.backgroundColor }}
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                  {selectedEvent.extendedProps.ministerio}
                </span>
                <h3 className="text-xl font-bold mt-1 line-clamp-2">{selectedEvent.title}</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Fechas */}
              <div className="flex items-start gap-3 text-gray-700">
                <CalendarDays className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">
                    {format(selectedEvent.start, "EEEE d 'de' MMMM, yyyy - HH:mm", { locale: es })}
                  </p>
                  {selectedEvent.end && (
                    <p className="text-sm text-gray-500">
                      Hasta: {format(selectedEvent.end, "EEEE d 'de' MMMM, yyyy - HH:mm", { locale: es })}
                    </p>
                  )}
                </div>
              </div>

              {/* Ubicación */}
              {(selectedEvent.extendedProps.location || selectedEvent.extendedProps.mapLink) && (
                <div className="flex items-start gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm">
                      {selectedEvent.extendedProps.location || "Ubicación sin especificar"}
                    </p>
                    {selectedEvent.extendedProps.mapLink && (
                      <a
                        href={selectedEvent.extendedProps.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                      >
                        Ver en Google Maps
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Descripción Pública */}
              {selectedEvent.extendedProps.publicDescription && (
                <div className="flex items-start gap-3 text-gray-700">
                  <AlignLeft className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="text-sm whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar pr-2">
                    {selectedEvent.extendedProps.publicDescription}
                  </div>
                </div>
              )}

              {/* Notas Privadas (Solo visible porque está logueado en Dashboard) */}
              {selectedEvent.extendedProps.privateNotes && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Notas Internas (Privadas)</span>
                  </div>
                  <div className="text-sm text-amber-900 whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar-amber pr-2">
                    {selectedEvent.extendedProps.privateNotes}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
