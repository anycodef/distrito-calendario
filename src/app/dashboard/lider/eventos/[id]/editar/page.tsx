"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, MapPin, AlignLeft, Lock, Save, Send, AlertTriangle, Eye, EyeOff, Loader2, ArrowLeftRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const eventoId = resolvedParams.id;

  const [ministerios, setMinisterios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [conflictos, setConflictos] = useState<any[]>([]);
  const [showConflictsModal, setShowConflictsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    ministerioId: "",
    startDate: "",
    endDate: "",
    location: "",
    mapLink: "",
    publicDescription: "",
    privateNotes: "",
    visibility: "PUBLIC",
    status: "PUBLISHED"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resMin, resEvt] = await Promise.all([
          fetch("/api/lider/ministerios?context=lider"),
          fetch(`/api/lider/eventos/mis-eventos?context=lider`) // Fetch all events created by user to find the one we need
        ]);

        if (resMin.ok) {
          const data = await resMin.json();
          setMinisterios(data);
        }

        if (resEvt.ok) {
          const eventos = await resEvt.json();
          const evento = eventos.find((e: any) => e.id === eventoId);
          if (evento) {
            setFormData({
              title: evento.title,
              ministerioId: evento.ministerioId,
              // Convert to format required by datetime-local (YYYY-MM-DDTHH:mm)
              startDate: new Date(evento.startDate).toISOString().slice(0, 16),
              endDate: new Date(evento.endDate).toISOString().slice(0, 16),
              location: evento.location || "",
              mapLink: evento.mapLink || "",
              publicDescription: evento.publicDescription || "",
              privateNotes: evento.privateNotes || "",
              visibility: evento.visibility,
              status: evento.status
            });
          } else {
            alert("Evento no encontrado o sin permisos");
            router.push("/dashboard/lider/eventos");
          }
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventoId, router]);

  useEffect(() => {
    const checkConflicts = async () => {
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);

        if (end <= start) return;

        setCheckingConflicts(true);
        try {
          const res = await fetch("/api/lider/eventos/conflictos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              startDate: start.toISOString(),
              endDate: end.toISOString(),
              ignoreEventoId: eventoId // Exclude itself from conflicts
            })
          });
          if (res.ok) {
            const data = await res.json();
            setConflictos(data);
          }
        } catch (error) {
          console.error("Error comprobando conflictos:", error);
        } finally {
          setCheckingConflicts(false);
        }
      } else {
        setConflictos([]);
      }
    };

    const timeoutId = setTimeout(() => {
      checkConflicts();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.startDate, formData.endDate, eventoId]);

  const handleDeleteConfirm = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/lider/eventos/${eventoId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/lider/eventos");
        router.refresh();
      } else {
        alert("Error al eliminar el evento");
      }
    } catch (error) {
      console.error(error);
      alert("Error de red");
    } finally {
      setSaving(false);
      setShowDeleteModal(false);
    }
  };

  const handleDraftConfirm = async () => {
    setShowDraftModal(false);
    // Para simplificar, forzamos un evento sintético ya que handleSubmit requiere uno.
    // Lo más limpio es extraer la logica de guardado, pero pasamos el e simulado.
    const e = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(e, "DRAFT");
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, newStatus: "PUBLISHED" | "DRAFT") => {
    e.preventDefault();
    setSaving(true);

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        alert("La fecha de fin debe ser posterior a la fecha de inicio.");
        setSaving(false);
        return;
    }

    try {
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        status: newStatus
      };

      const res = await fetch(`/api/lider/eventos/${eventoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/dashboard/lider/eventos");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Error al actualizar el evento");
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error inesperado");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div>
          <h3 className="text-2xl font-semibold leading-6 text-gray-900 flex items-center gap-2">
            <CalendarRange className="w-6 h-6 text-blue-600" />
            Editar Evento
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Modifica los detalles del evento seleccionado.
          </p>
        </div>
        <Link href="/dashboard/lider/eventos" className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600">
          ← Volver
        </Link>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <form className="px-4 py-6 sm:p-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

            {/* Título */}
            <div className="col-span-full">
              <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                Título del Evento <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Organizador / Ministerio */}
            <div className="sm:col-span-3">
              <label htmlFor="ministerioId" className="block text-sm font-medium leading-6 text-gray-900">
                Organizador del Evento <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                {ministerios.length === 1 ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium text-gray-800">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ministerios[0].color || '#3b82f6' }}></div>
                    {ministerios[0].name}
                  </div>
                ) : (
                  <select
                    id="ministerioId"
                    name="ministerioId"
                    required
                    value={formData.ministerioId}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  >
                    {ministerios.map((min) => (
                      <option key={min.id} value={min.id}>{min.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Visibilidad */}
            <div className="sm:col-span-3">
              <label htmlFor="visibility" className="block text-sm font-medium leading-6 text-gray-900">
                Visibilidad
              </label>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="PUBLIC"
                    checked={formData.visibility === "PUBLIC"}
                    onChange={handleChange}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <Eye className="w-4 h-4 text-blue-600" /> Público
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="PRIVATE"
                    checked={formData.visibility === "PRIVATE"}
                    onChange={handleChange}
                    className="h-4 w-4 border-gray-300 text-amber-600 focus:ring-amber-600"
                  />
                  <EyeOff className="w-4 h-4 text-amber-600" /> Privado
                </label>
              </div>
            </div>

            {/* Fechas */}
            <div className="sm:col-span-3 relative">
              <label htmlFor="startDate" className="block text-sm font-medium leading-6 text-gray-900">
                Fecha y Hora de Inicio <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 relative">
                <input
                  type="datetime-local"
                  name="startDate"
                  id="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${conflictos.length > 0 ? 'ring-red-500 focus:ring-red-600' : 'ring-gray-300 focus:ring-blue-600'} sm:text-sm sm:leading-6`}
                />
              </div>
            </div>

            <div className="sm:col-span-3 relative">
              <label htmlFor="endDate" className="block text-sm font-medium leading-6 text-gray-900">
                Fecha y Hora de Fin <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 relative">
                <input
                  type="datetime-local"
                  name="endDate"
                  id="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${conflictos.length > 0 ? 'ring-red-500 focus:ring-red-600' : 'ring-gray-300 focus:ring-blue-600'} sm:text-sm sm:leading-6`}
                />
              </div>
            </div>

            {/* Conflictos */}
            {checkingConflicts && (
                <div className="col-span-full flex items-center gap-2 text-sm text-blue-600">
                    <span className="animate-spin border-2 border-blue-600 border-t-transparent rounded-full w-4 h-4"></span>
                    Comprobando disponibilidad de fecha...
                </div>
            )}
            {!checkingConflicts && conflictos.length > 0 && (
                <div className="col-span-full rounded-md bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3 flex-1 md:flex md:justify-between">
                      <p className="text-sm text-red-700 font-medium">
                        ¡Atención! Hay {conflictos.length} evento{conflictos.length > 1 ? 's' : ''} programado{conflictos.length > 1 ? 's' : ''} en este rango de fechas.
                      </p>
                      <p className="mt-3 text-sm md:ml-6 md:mt-0">
                        <button
                          type="button"
                          onClick={() => setShowConflictsModal(true)}
                          className="whitespace-nowrap font-medium text-red-700 hover:text-red-600 underline"
                        >
                          Ver detalles
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
            )}

            {/* Ubicación */}
            <div className="sm:col-span-3">
              <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" /> Lugar
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="mapLink" className="block text-sm font-medium leading-6 text-gray-900">
                Enlace de ubicación (Google Maps)
              </label>
              <div className="mt-2">
                <input
                  type="url"
                  name="mapLink"
                  id="mapLink"
                  value={formData.mapLink}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Descripciones */}
            <div className="col-span-full">
              <label htmlFor="publicDescription" className="block text-sm font-medium leading-6 text-gray-900 flex items-center gap-1">
                <AlignLeft className="w-4 h-4 text-gray-400" /> Descripción Pública
              </label>
              <textarea
                id="publicDescription"
                name="publicDescription"
                rows={3}
                value={formData.publicDescription}
                onChange={handleChange}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="col-span-full">
              <label htmlFor="privateNotes" className="block text-sm font-medium leading-6 text-amber-800 flex items-center gap-1">
                <Lock className="w-4 h-4 text-amber-600" /> Notas Privadas
              </label>
              <textarea
                id="privateNotes"
                name="privateNotes"
                rows={2}
                value={formData.privateNotes}
                onChange={handleChange}
                className="mt-2 block w-full rounded-md border-0 py-1.5 bg-amber-50 text-amber-900 shadow-sm ring-1 ring-inset ring-amber-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-between border-t border-gray-900/10 pt-6 gap-4">
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
              {formData.status === "PUBLISHED" && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={saving}
                  className="w-full sm:w-auto rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar Evento
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 justify-end items-center">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto text-sm font-semibold leading-6 text-gray-900 px-4 py-2 hover:bg-gray-50 rounded-md transition-colors"
              >
                Cancelar
              </button>

              {formData.status === "DRAFT" ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, "DRAFT")}
                    disabled={saving}
                    className="w-full sm:w-auto rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" /> Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, "PUBLISHED")}
                    disabled={saving}
                    className="w-full sm:w-auto rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 flex items-center justify-center gap-2 transition-colors"
                  >
                    {saving ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Send className="w-4 h-4" />}
                    Publicar
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowDraftModal(true)}
                    disabled={saving}
                    className="w-full sm:w-auto rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 shadow-sm ring-1 ring-inset ring-amber-300 hover:bg-amber-100 flex items-center justify-center gap-2 transition-colors"
                  >
                    <ArrowLeftRight className="w-4 h-4" /> Devolver a Borrador
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, "PUBLISHED")}
                    disabled={saving}
                    className="w-full sm:w-auto rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 flex items-center justify-center gap-2 transition-colors"
                  >
                    {saving ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                    Actualizar Publicado
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* MODAL CONFLICTOS (Igual al de creación) */}
      {showConflictsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowConflictsModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-bold text-red-900">Eventos en la misma fecha</h3>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {conflictos.map(conf => (
                <div key={conf.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">{conf.title}</h4>
                  <p className="text-xs text-gray-500">{conf.ministerio?.name}</p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowConflictsModal(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center gap-3">
              <Trash2 className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-bold text-red-900">Cancelar Evento</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Estás a punto de eliminar permanentemente este evento del calendario distrital. Esta acción no se puede deshacer.
              </p>
              <p className="text-sm text-gray-600">
                ¿Deseas continuar?
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 flex items-center gap-2"
              >
                {saving ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Trash2 className="w-4 h-4" />}
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Devolver a Borrador */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDraftModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex items-center gap-3">
              <ArrowLeftRight className="h-6 w-6 text-amber-500" />
              <h3 className="text-lg font-bold text-amber-900">Devolver a Borrador</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Esta acción retirará el evento del calendario distrital público y lo devolverá a tu lista de borradores para seguir planificándolo.
              </p>
              <p className="text-sm text-gray-600">
                ¿Deseas continuar?
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowDraftModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDraftConfirm}
                className="px-4 py-2 bg-amber-500 border border-transparent rounded-md text-sm font-medium text-white hover:bg-amber-600 flex items-center gap-2"
              >
                {saving ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <ArrowLeftRight className="w-4 h-4" />}
                Sí, Devolver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
