"use client";
import { useState, useEffect } from "react";
import { Loader2, Palette } from "lucide-react";

export default function LiderMinisteriosPage() {
  const [ministerios, setMinisterios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para el modal/edición rápida
  const [editMin, setEditMin] = useState<any | null>(null);
  const [color, setColor] = useState("#FFFFFF");
  const [saving, setSaving] = useState(false);

  const fetchMinisterios = async () => {
    setLoading(true);
    const res = await fetch("/api/lider/ministerios?context=lider");
    if (res.ok) setMinisterios(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchMinisterios();
  }, []);

  const handleEdit = (min: any) => {
    setEditMin(min);
    setColor(min.color || "#FFFFFF");
  };

  const handleSaveColor = async () => {
    if (!editMin) return;
    setSaving(true);

    await fetch("/api/lider/ministerios?context=lider", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editMin.id, color })
    });

    setEditMin(null);
    fetchMinisterios();
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">
          Personalización de Mis Ministerios
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Personaliza el color representativo de tus ministerios. Este color será usado para pintar tus actividades en el calendario distrital general.
        </p>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center text-gray-500">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : ministerios.length === 0 ? (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200 text-sm">
          No tienes ministerios activos asignados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ministerios.map((min) => (
            <div key={min.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                 <div>
                   <h4 className="text-lg font-bold text-gray-900">{min.name}</h4>
                   <span className="text-xs font-medium text-gray-500 px-2 py-0.5 bg-gray-100 rounded-md">
                     {min.categoria.name}
                   </span>
                 </div>
                 <div
                   className="w-12 h-12 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white"
                   style={{ backgroundColor: min.color || "#fff" }}
                 >
                   <Palette size={20} />
                 </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4">
                {editMin?.id === min.id ? (
                   <div className="flex items-center gap-3">
                     <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-10 w-16 rounded border border-gray-300 p-1 cursor-pointer"
                      />
                      <span className="text-sm text-gray-500 uppercase w-16">{color}</span>
                      <div className="flex-1 flex justify-end gap-2">
                        <button onClick={() => setEditMin(null)} className="text-xs font-medium px-3 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md">Cancelar</button>
                        <button onClick={handleSaveColor} disabled={saving} className="text-xs font-medium px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50">Guardar</button>
                      </div>
                   </div>
                ) : (
                  <button
                    onClick={() => handleEdit(min)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 w-full text-left"
                  >
                    Cambiar Color Representativo
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
