"use client";

import { useState, useEffect } from "react";
import { Edit2, Plus, Loader2, Link2Off } from "lucide-react";

type Ministerio = {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  categoriaId: string;
  categoria: { name: string };
  lideresActivos: { id: string; name: string; username: string }[];
};

export default function MinisteriosAdminPage() {
  const [ministerios, setMinisterios] = useState<Ministerio[]>([]);
  const [categorias, setCategorias] = useState<{id: string, name: string}[]>([]);
  const [usuarios, setUsuarios] = useState<{id: string, name: string, role: string}[]>([]);
  const [loading, setLoading] = useState(true);

  // Formularios
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#FFFFFF");
  const [categoriaId, setCategoriaId] = useState("");
  const [liderId, setLiderId] = useState(""); // Líder principal asignado (Select unificado en Admin)
  const [isActive, setIsActive] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    const [resMin, resCat, resUsr] = await Promise.all([
      fetch("/api/admin/ministerios"),
      fetch("/api/admin/categorias"),
      fetch("/api/admin/usuarios")
    ]);

    setMinisterios(await resMin.json());
    setCategorias(await resCat.json());
    setUsuarios((await resUsr.json()).filter((u: any) => u.role !== "ADMIN")); // Solo líderes o supervisores
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setColor("#FFFFFF");
    setCategoriaId("");
    setLiderId("");
    setIsActive(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoriaId) return;

    const payload = {
      name,
      color,
      categoriaId,
      liderId: liderId || null,
      isActive
    };

    const url = editId ? `/api/admin/ministerios/${editId}` : "/api/admin/ministerios";
    const method = editId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    resetForm();
    fetchData();
  };

  const handleEdit = (min: Ministerio) => {
    setEditId(min.id);
    setName(min.name);
    setColor(min.color || "#FFFFFF");
    setCategoriaId(min.categoriaId);
    setLiderId(min.lideresActivos[0]?.id || "");
    setIsActive(min.isActive);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">
          Gestión de Ministerios
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Crea ministerios, asígnalos a categorías y delega líderes distritales.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Ministerio</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 sm:text-sm text-black"
                placeholder="Ej. Ministerio de Niños"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Categoría</label>
              <select
                required
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 sm:text-sm text-black"
              >
                <option value="">-- Seleccionar Categoría --</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Líder Asignado (Opcional)</label>
              <select
                value={liderId}
                onChange={(e) => setLiderId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 sm:text-sm text-black"
              >
                <option value="">-- Sin Líder Asignado --</option>
                {usuarios.map(usr => (
                  <option key={usr.id} value={usr.id}>{usr.name} ({usr.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Color Representativo</label>
              <div className="mt-1 flex gap-2 items-center">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-12 rounded border border-gray-300 p-0"
                />
                <span className="text-sm text-gray-500 uppercase">{color}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-between pt-2">
            {editId ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Ministerio Activo</span>
              </label>
            ) : <div/>}

            <div className="flex items-center gap-2">
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                {editId ? <Edit2 size={16} /> : <Plus size={16} />}
                {editId ? "Actualizar Ministerio" : "Crear Ministerio"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Lista de Ministerios Agrupados por Categoría (Estilo Visual Requerido) */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center text-gray-500">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ministerio y Categoría</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Líder Activo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {ministerios.map((min) => (
                  <tr key={min.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: min.color || "#fff" }} />
                        <div>
                          <div className="font-medium text-gray-900">{min.name}</div>
                          <div className="text-gray-500 text-xs mt-0.5">{min.categoria.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {min.lideresActivos.length > 0 ? (
                        <div className="text-sm text-gray-900 font-medium">
                          {min.lideresActivos[0].name}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          <Link2Off size={12} /> Sin Líder
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${min.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {min.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(min)}
                        className="text-blue-600 hover:text-blue-900 flex items-center justify-end w-full gap-1"
                      >
                        <Edit2 size={16} /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
