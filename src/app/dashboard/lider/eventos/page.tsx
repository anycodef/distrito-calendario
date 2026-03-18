"use client";

import { useState, useEffect } from "react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarRange, Plus, Edit2, Trash2, MapPin, Loader2, Search, CalendarDays, AlignLeft, Lock, Send, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function MisEventosPage() {
  const [activeTab, setActiveTab] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "UPCOMING" | "PAST">("UPCOMING");
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [eventToPublish, setEventToPublish] = useState<any | null>(null);
  const [eventToDelete, setEventToDelete] = useState<any | null>(null);

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lider/eventos/mis-eventos?context=lider&status=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setEventos(data);
      }
    } catch (error) {
      console.error("Error fetching mis eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, [activeTab]);

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    try {
      const res = await fetch(`/api/lider/eventos/${eventToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setEventos(eventos.filter(ev => ev.id !== eventToDelete.id));
      } else {
        alert("Error al eliminar el evento");
      }
    } catch (error) {
      console.error(error);
      alert("Error de red");
    } finally {
      setEventToDelete(null);
    }
  };

  const now = new Date();

  const handlePublishConfirm = async () => {
    if(!eventToPublish) return;

    try {
      const res = await fetch(`/api/lider/eventos/${eventToPublish.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...eventToPublish, status: "PUBLISHED" }),
      });
      if (res.ok) {
        setEventos(eventos.filter(e => e.id !== eventToPublish.id));
      } else {
        alert("Error al publicar el evento");
      }
    } catch (error) {
      console.error(error);
      alert("Error de red");
    } finally {
      setEventToPublish(null);
    }
  };

  const filteredEventos = eventos.filter((ev) => {
    // Filtro por término de búsqueda (título)
    if (searchTerm && !ev.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filtro temporal solo aplica para PUBLICADOS
    if (activeTab === "PUBLISHED") {
      const isPast = isBefore(new Date(ev.endDate), now);
      if (filterType === "UPCOMING" && isPast) return false;
      if (filterType === "PAST" && !isPast) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5 gap-4">
        <div>
          <h3 className="text-2xl font-semibold leading-6 text-gray-900 flex items-center gap-2">
            <CalendarRange className="w-6 h-6 text-blue-600" />
            Mis Eventos
          </h3>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Gestiona los eventos de tus ministerios. Publica nuevas actividades o revisa tus borradores.
          </p>
        </div>
        <Link
          href="/dashboard/lider/eventos/nuevo"
          className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
        >
          <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Crear Nuevo Evento
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("PUBLISHED")}
              className={`${
                activeTab === "PUBLISHED"
                  ? "border-blue-500 text-blue-600 bg-blue-50/50"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
              } w-1/2 flex items-center justify-center border-b-2 py-4 px-1 text-center text-sm font-medium transition-colors`}
            >
              Eventos Publicados
            </button>
            <button
              onClick={() => setActiveTab("DRAFT")}
              className={`${
                activeTab === "DRAFT"
                  ? "border-amber-500 text-amber-600 bg-amber-50/50"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
              } w-1/2 flex items-center justify-center border-b-2 py-4 px-1 text-center text-sm font-medium transition-colors`}
            >
              Borradores ({eventos.length > 0 && activeTab === "DRAFT" ? eventos.length : "..."})
            </button>
          </nav>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>

            {activeTab === "PUBLISHED" && (
              <div className="flex bg-gray-100 p-1 rounded-md">
                <button
                  onClick={() => setFilterType("UPCOMING")}
                  className={`${filterType === "UPCOMING" ? "bg-white shadow text-gray-900 font-medium" : "text-gray-500 hover:text-gray-700"} px-3 py-1.5 text-xs rounded-md transition-all`}
                >
                  Próximos
                </button>
                <button
                  onClick={() => setFilterType("PAST")}
                  className={`${filterType === "PAST" ? "bg-white shadow text-gray-900 font-medium" : "text-gray-500 hover:text-gray-700"} px-3 py-1.5 text-xs rounded-md transition-all`}
                >
                  Pasados
                </button>
                <button
                  onClick={() => setFilterType("ALL")}
                  className={`${filterType === "ALL" ? "bg-white shadow text-gray-900 font-medium" : "text-gray-500 hover:text-gray-700"} px-3 py-1.5 text-xs rounded-md transition-all`}
                >
                  Todos
                </button>
              </div>
            )}
          </div>

          {loading ? (
             <div className="flex justify-center items-center py-12"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
          ) : filteredEventos.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <CalendarRange className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No se encontraron eventos</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === "PUBLISHED"
                  ? "No tienes eventos publicados que coincidan con los filtros."
                  : "No tienes ningún evento guardado como borrador."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEventos.map((ev) => {
                const isPast = activeTab === 'PUBLISHED' && isBefore(new Date(ev.endDate), now);
                return (
                <div key={ev.id} className={`flex flex-col sm:flex-row gap-4 p-4 border rounded-xl transition-shadow hover:shadow-md cursor-pointer ${activeTab === 'DRAFT' ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200 bg-white'} ${isPast ? 'opacity-80 bg-gray-50/50' : ''}`} onClick={() => setSelectedEvent(ev)}>
                  <div className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-lg border shadow-sm self-start ${isPast ? 'bg-gray-200 border-gray-300 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
                    <span className={`text-xs font-semibold uppercase ${isPast ? 'text-gray-500' : 'text-gray-500'}`}>{format(new Date(ev.startDate), 'MMM', { locale: es })}</span>
                    <span className={`text-2xl font-bold ${isPast ? 'text-gray-600' : 'text-gray-900'}`}>{format(new Date(ev.startDate), 'dd')}</span>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${isPast ? 'opacity-50' : ''}`} style={{ backgroundColor: ev.ministerio?.color || '#3b82f6' }}></div>
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">{ev.ministerio?.name}</span>
                      {ev.visibility === "PRIVATE" && (
                        <span className="ml-2 inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Privado</span>
                      )}
                      {isPast && (
                        <span className="ml-auto inline-flex items-center rounded-md bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-500/10">Finalizado</span>
                      )}
                    </div>
                    <h4 className={`text-lg font-bold leading-tight ${isPast ? 'text-gray-600 line-through decoration-gray-400' : 'text-gray-900'}`}>{ev.title}</h4>
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarRange className="w-4 h-4" />
                        {format(new Date(ev.startDate), "HH:mm")} - {format(new Date(ev.endDate), "HH:mm")}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">{ev.location}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {!isPast && (
                    <div className={`flex sm:flex-col justify-end gap-2 sm:border-l sm:pl-4 pt-4 sm:pt-0 mt-4 sm:mt-0 border-t sm:border-t-0 ${isPast ? 'sm:border-gray-200 border-gray-200' : 'sm:border-gray-100 border-gray-100'}`} onClick={(e) => e.stopPropagation()}>
                      {activeTab === 'DRAFT' && (
                        <button onClick={() => setEventToPublish(ev)} className="flex-1 sm:flex-none inline-flex justify-center items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors">
                          <Send className="w-4 h-4" /> Publicar
                        </button>
                      )}
                      <Link href={`/dashboard/lider/eventos/${ev.id}/editar`} className="flex-1 sm:flex-none inline-flex justify-center items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        <Edit2 className="w-4 h-4" /> Editar
                      </Link>
                      <button onClick={() => setEventToDelete(ev)} className="flex-1 sm:flex-none inline-flex justify-center items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              )})}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalles del Evento */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal con el color del ministerio */}
            <div
              className="px-6 py-4 flex items-center justify-between text-white"
              style={{ backgroundColor: selectedEvent.ministerio?.color || "#3b82f6" }}
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                  {selectedEvent.ministerio?.name}
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
                    {format(new Date(selectedEvent.startDate), "EEEE d 'de' MMMM, yyyy - HH:mm", { locale: es })}
                  </p>
                  {selectedEvent.endDate && (
                    <p className="text-sm text-gray-500">
                      Hasta: {format(new Date(selectedEvent.endDate), "EEEE d 'de' MMMM, yyyy - HH:mm", { locale: es })}
                    </p>
                  )}
                </div>
              </div>

              {/* Ubicación */}
              {(selectedEvent.location || selectedEvent.mapLink) && (
                <div className="flex items-start gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm">
                      {selectedEvent.location || "Ubicación sin especificar"}
                    </p>
                    {selectedEvent.mapLink && (
                      <a
                        href={selectedEvent.mapLink}
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
              {selectedEvent.publicDescription && (
                <div className="flex items-start gap-3 text-gray-700">
                  <AlignLeft className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="text-sm whitespace-pre-wrap">
                    {selectedEvent.publicDescription}
                  </div>
                </div>
              )}

              {/* Notas Privadas */}
              {selectedEvent.privateNotes && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Notas Internas (Privadas)</span>
                  </div>
                  <p className="text-sm text-amber-900 whitespace-pre-wrap">
                    {selectedEvent.privateNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Publicación */}
      {eventToPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setEventToPublish(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 flex items-center gap-3">
              <Send className="h-6 w-6 text-blue-500" />
              <h3 className="text-lg font-bold text-blue-900">Publicar Evento</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Estás a punto de publicar el evento <strong>{eventToPublish.title}</strong>.
                Una vez publicado, será visible en el calendario según la visibilidad que configuraste.
              </p>
              <p className="text-sm text-gray-600">
                ¿Deseas continuar?
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setEventToPublish(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handlePublishConfirm}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Sí, Publicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setEventToDelete(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center gap-3">
              <Trash2 className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-bold text-red-900">Eliminar Evento</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Estás a punto de eliminar el evento <strong>{eventToDelete.title}</strong>.
                Esta acción lo quitará del calendario y de tu lista de eventos.
              </p>
              <p className="text-sm text-gray-600">
                ¿Deseas continuar?
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
