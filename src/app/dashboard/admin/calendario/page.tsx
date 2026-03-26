"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { Loader2, CalendarDays } from "lucide-react";
import { EventDetailModal, EventDetail } from "@/components/EventDetailModal";

export default function CalendarioAdminPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);

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
    const { event } = clickInfo;
    setSelectedEvent({
      title: event.title,
      start: event.start,
      end: event.end,
      backgroundColor: event.backgroundColor,
      ministerio: event.extendedProps.ministerio,
      location: event.extendedProps.location,
      mapLink: event.extendedProps.mapLink,
      publicDescription: event.extendedProps.publicDescription,
      privateNotes: event.extendedProps.privateNotes,
      visibility: event.extendedProps.visibility
    });
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
            eventDisplay="block"
            eventClick={handleEventClick}
            eventContent={(arg) => {
              return (
                <div title={arg.event.title} className="w-full overflow-hidden text-ellipsis whitespace-nowrap px-1.5 py-0.5 cursor-pointer flex items-center">
                  {arg.timeText && <span className="font-semibold text-[10px] opacity-90 mr-1.5">{arg.timeText}</span>}
                  <span className="font-medium text-xs sm:text-sm">{arg.event.title}</span>
                </div>
              );
            }}
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
        <EventDetailModal event={selectedEvent} onClose={closeModal} />
      )}
    </div>
  );
}
