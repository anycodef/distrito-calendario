"use client";

import { useState, useEffect } from "react";
import { Edit2, Plus, Loader2, KeyRound } from "lucide-react";

type User = {
  id: string;
  name: string;
  username: string;
  role: "ADMIN" | "SUPERVISOR" | "LIDER";
  isActive: boolean;
};

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPERVISOR" | "LIDER">("LIDER");
  const [isActive, setIsActive] = useState(true);

  const [formError, setFormError] = useState("");

  const fetchUsuarios = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/usuarios");
    const data = await res.json();
    setUsuarios(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setUsername("");
    setPassword("");
    setRole("LIDER");
    setIsActive(true);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !username.trim()) {
      setFormError("Nombre y Usuario son obligatorios");
      return;
    }

    if (!editId && !password.trim()) {
      setFormError("La contraseña es obligatoria para nuevos usuarios");
      return;
    }

    const payload: any = { name, username, role, isActive };
    if (password.trim() !== "") {
      payload.password = password; // Se enviará para que el backend la encripte
    }

    const url = editId ? `/api/admin/usuarios/${editId}` : "/api/admin/usuarios";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setFormError(data.message || "Ocurrió un error");
      return;
    }

    resetForm();
    fetchUsuarios();
  };

  const handleEdit = (user: User) => {
    setEditId(user.id);
    setName(user.name);
    setUsername(user.username);
    setPassword(""); // Dejamos en blanco intencionalmente
    setRole(user.role);
    setIsActive(user.isActive);
    setFormError("");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">
          Gestión de Credenciales (Usuarios)
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Crea accesos y define roles para los líderes y supervisores distritales.
        </p>
      </div>

      {/* Formulario de Creación/Edición */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 sm:text-sm text-black"
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuario (Login)</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 sm:text-sm text-black"
                placeholder="Ej. jperez_jovenes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {editId ? "Nueva Contraseña (Opcional)" : "Contraseña"}
              </label>
              <input
                type="password"
                required={!editId} // Solo es required si NO estoy editando
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 sm:text-sm text-black"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rol del Sistema</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 sm:text-sm text-black"
              >
                <option value="LIDER">Líder Distrital</option>
                <option value="SUPERVISOR">Supervisor Distrital</option>
                <option value="ADMIN">Administrador</option>
              </select>
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
                <span className="text-sm font-medium text-gray-700">Cuenta Activa (Habilitada)</span>
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
                {editId ? "Actualizar Usuario" : "Crear Usuario"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Lista de Usuarios */}
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Usuario</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rol</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {usuarios.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-gray-500 text-sm">@{user.username}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 ring-purple-700/10' :
                        user.role === 'SUPERVISOR' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                        'bg-blue-50 text-blue-700 ring-blue-700/10'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {user.isActive ? "Activa" : "Inhabilitada"}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
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
