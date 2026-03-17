"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, Loader2 } from "lucide-react";

type Iglesia = {
  id: string;
  name: string;
  isActive: boolean;
};

export default function IglesiasAdminPage() {
  const [iglesias, setIglesias] = useState<Iglesia[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const fetchIglesias = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/iglesias");
    const data = await res.json();
    setIglesias(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchIglesias();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editId) {
      await fetch(`/api/admin/iglesias/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    } else {
      await fetch("/api/admin/iglesias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    }

    setName("");
    setEditId(null);
    fetchIglesias();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta iglesia permanentemente?")) return;
    await fetch(`/api/admin/iglesias/${id}`, { method: "DELETE" });
    fetchIglesias();
  };

  const handleEdit = (iglesia: Iglesia) => {
    setName(iglesia.name);
    setEditId(iglesia.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">
          Gestión de Iglesias Locales
        </h3>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              {editId ? "Editar nombre de iglesia" : "Nueva iglesia local"}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-black"
              placeholder="Ej. Iglesia Local 9"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {editId ? <Edit2 size={18} /> : <Plus size={18} />}
            {editId ? "Actualizar" : "Añadir"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setName("");
              }}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center text-gray-500">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {iglesias.map((iglesia) => (
                <tr key={iglesia.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {iglesia.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${iglesia.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {iglesia.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(iglesia)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(iglesia.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {iglesias.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No hay iglesias registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
