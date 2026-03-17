"use client";
import { useState, useEffect } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

export default function LiderPerfilPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/lider/perfil")
      .then(r => r.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: "Las contraseñas no coinciden.", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: "La contraseña debe tener al menos 6 caracteres.", type: "error" });
      return;
    }

    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/lider/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage({ text: "Tu contraseña ha sido actualizada con éxito.", type: "success" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ text: err.message || "Error al actualizar.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2"/>Cargando perfil...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">
          Mi Perfil
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Revisa tu información personal y actualiza tu credencial de acceso.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 sm:p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-2xl font-bold">
              {profile?.name?.charAt(0)}
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">{profile?.name}</h4>
              <p className="text-sm text-gray-500">@{profile?.username} • {profile?.roles?.join(', ')}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 sm:p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="text-green-600" size={20}/> Seguridad y Acceso
          </h4>

          {message.text && (
             <div className={`p-3 mb-4 rounded-md text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
               {message.text}
             </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 sm:text-sm text-black"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 sm:text-sm text-black"
                placeholder="Repite la contraseña"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Actualizar Contraseña"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
