"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarRange, MapPin, AlignLeft, Lock, Save, Send, AlertTriangle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function NuevoEventoPage() {
  const router = useRouter();
  const [ministerios, setMinisterios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [conflictos, setConflictos] = useState<any[]>([]);
  const [showConflictsModal, setShowConflictsModal] = useState(false);
  const [formError, setFormError] = useState("");

  // Form State
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
  });

  useEffect(() => {
    const fetchMinisterios = async () => {
      const res = await fetch("/api/lider/ministerios?context=supervisor");
      if (res.ok) {
        const data = await res.json();
        setMinisterios(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, ministerioId: data[0].id }));
        }
      }
    };
    fetchMinisterios();
  }, []);

  // Effect para comprobar conflictos cuando cambian las fechas
  useEffect(() => {
    const checkConflicts = async () => {
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);

        if (end <= start) return; // Fechas inválidas, el backend o el form fallarán

        setCheckingConflicts(true);
        try {
          const res = await fetch("/api/lider/eventos/conflictos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              startDate: start.toISOString(),
              endDate: end.toISOString()
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

    // Pequeño debounce para no saturar si el usuario tipea rápido (aunque siendo inputs de datetime-local es menos frecuente)
    const timeoutId = setTimeout(() => {
      checkConflicts();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.startDate, formData.endDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, status: "PUBLISHED" | "DRAFT") => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    if (!formData.title || !formData.ministerioId || !formData.startDate || !formData.endDate) {
      setFormError("Por favor completa todos los campos obligatorios (*). El organizador debe estar cargado.");
      setLoading(false);
      return;
    }

    // Validación básica de fechas
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        setFormError("La fecha de fin debe ser posterior a la fecha de inicio.");
        setLoading(false);
        return;
    }

    try {
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        status
      };

      const res = await fetch("/api/lider/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/dashboard/supervisor/eventos");
        router.refresh();
      } else {
        const err = await res.json();
        setFormError(err.error || "Error al crear el evento");
      }
    } catch (error) {
      console.error(error);
      setFormError("Ocurrió un error de red inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div>
          <h3 className="text-2xl font-semibold leading-6 text-gray-900 flex items-center gap-2">
            <CalendarRange className="w-6 h-6 text-blue-600" />
            Crear Nuevo Evento
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Completa los detalles de la actividad para agendarla en el calendario distrital.
          </p>
        </div>
        <Link href="/dashboard/supervisor/eventos" className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600">
          ← Volver
        </Link>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <form className="px-4 py-6 sm:p-8">
          {formError && (
             <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md font-medium">
               {formError}
             </div>
          )}

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
                  placeholder="Ej. Ayuno Distrital de Jóvenes"
                />
              </div>
            </div>

            {/* Organizador - Estático para el Supervisor */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-700">
                Organizador del Evento <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm font-medium text-blue-800">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#1e40af' }}></div>
                {ministerios.length > 0 ? ministerios[0].name : "Distrito"}
              </div>
            </div>

            {/* Visibilidad */}
            <div className="sm:col-span-6">
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
                  <EyeOff className="w-4 h-4 text-amber-600" /> Privado (Solo Liderazgo)
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

            {/* MÓDULO DE ADVERTENCIA DE CONFLICTOS */}
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="Ej. Iglesia Local 1"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="mapLink" className="block text-sm font-medium leading-6 text-gray-900">
                Enlace de ubicación (Google Maps) (Opcional)
              </label>
              <div className="mt-2">
                <input
                  type="url"
                  name="mapLink"
                  id="mapLink"
                  value={formData.mapLink}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>

            {/* Descripciones */}
            <div className="col-span-full">
              <label htmlFor="publicDescription" className="block text-sm font-medium leading-6 text-gray-900 flex items-center gap-1">
                <AlignLeft className="w-4 h-4 text-gray-400" /> Descripción Pública
              </label>
              <p className="text-xs text-gray-500 mb-2">Visible para todos en el calendario distrital y página principal (si el evento es público).</p>
              <textarea
                id="publicDescription"
                name="publicDescription"
                rows={3}
                value={formData.publicDescription}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="col-span-full">
              <label htmlFor="privateNotes" className="block text-sm font-medium leading-6 text-amber-800 flex items-center gap-1">
                <Lock className="w-4 h-4 text-amber-600" /> Notas Privadas / Uso Interno
              </label>
              <p className="text-xs text-amber-700 mb-2">Solo visible para Líderes, Supervisores y Administradores al hacer clic en el evento.</p>
              <textarea
                id="privateNotes"
                name="privateNotes"
                rows={2}
                value={formData.privateNotes}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 bg-amber-50 text-amber-900 shadow-sm ring-1 ring-inset ring-amber-300 placeholder:text-amber-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                placeholder="Detalles logísticos, presupuestos, etc."
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-x-4 border-t border-gray-900/10 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto text-sm font-semibold leading-6 text-gray-900 px-4 py-2 hover:bg-gray-50 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <div className="flex w-full sm:w-auto gap-3">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, "DRAFT")}
                disabled={loading}
                className="w-full sm:w-auto rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> Guardar Borrador
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, "PUBLISHED")}
                disabled={loading}
                className="w-full sm:w-auto rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? <span className="animate-spin">⌛</span> : <Send className="w-4 h-4" />}
                Publicar Evento
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* MODAL DE CONFLICTOS */}
      {showConflictsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowConflictsModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-bold text-red-900">Eventos en la misma fecha</h3>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                El sistema no bloquea la creación, pero ten en cuenta que los siguientes eventos ya están agendados y publicados en las fechas que seleccionaste:
              </p>
              {conflictos.map(conf => (
                <div key={conf.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: conf.ministerio?.color || '#3b82f6' }}></div>
                    <span className="text-xs font-semibold text-gray-600 uppercase">{conf.ministerio?.name}</span>
                  </div>
                  <h4 className="font-medium text-gray-900">{conf.title}</h4>
                  <div className="mt-2 text-xs text-gray-500 flex flex-col gap-1">
                    <span>Inicio: {format(new Date(conf.startDate), "dd/MM/yyyy HH:mm")}</span>
                    <span>Fin: {format(new Date(conf.endDate), "dd/MM/yyyy HH:mm")}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowConflictsModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Entendido, cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
