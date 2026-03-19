import { CalendarDays, MapPin, AlignLeft, Lock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface EventDetail {
  title: string;
  start: Date | string;
  end?: Date | string;
  backgroundColor: string;
  ministerio: string;
  location?: string | null;
  mapLink?: string | null;
  publicDescription?: string | null;
  privateNotes?: string | null;
  visibility: string;
}

interface EventDetailModalProps {
  event: EventDetail;
  onClose: () => void;
}

export function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal con el color del ministerio */}
        <div
          className="px-6 py-4 flex items-center justify-between text-white"
          style={{ backgroundColor: event.backgroundColor }}
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
              {event.ministerio}
            </span>
            <h3 className="text-xl font-bold mt-1 break-words">{event.title}</h3>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Fechas */}
          <div className="flex items-start gap-3 text-gray-700">
            <CalendarDays className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div className="break-words w-full overflow-hidden">
              <p className="font-medium text-sm">
                {format(new Date(event.start), "EEEE d 'de' MMMM, yyyy - HH:mm", { locale: es })}
              </p>
              {event.end && (
                <p className="text-sm text-gray-500">
                  Hasta: {format(new Date(event.end), "EEEE d 'de' MMMM, yyyy - HH:mm", { locale: es })}
                </p>
              )}
            </div>
          </div>

          {/* Ubicación */}
          {(event.location || event.mapLink) && (
            <div className="flex items-start gap-3 text-gray-700">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div className="break-words w-full overflow-hidden">
                <p className="text-sm">
                  {event.location || "Ubicación sin especificar"}
                </p>
                {event.mapLink && (
                  <a
                    href={event.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                  >
                    Enlace de ubicación (Google Maps)
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Descripción Pública */}
          {event.publicDescription && (
            <div className="flex items-start gap-3 text-gray-700">
              <AlignLeft className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div className="text-sm whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar pr-2 break-words w-full overflow-x-hidden">
                {event.publicDescription}
              </div>
            </div>
          )}

          {/* Notas Privadas (Solo visible porque está logueado en Dashboard) */}
          {event.privateNotes && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
                <Lock className="w-4 h-4 shrink-0" />
                <span className="text-xs uppercase tracking-wider">Notas Internas (Privadas)</span>
              </div>
              <div className="text-sm text-amber-900 whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar-amber pr-2 break-words w-full overflow-x-hidden">
                {event.privateNotes}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
