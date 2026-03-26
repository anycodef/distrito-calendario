"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({ totalUsers: 0, activeMinistries: 0, totalChurches: 0 });
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resMetrics, resMe] = await Promise.all([
          fetch("/api/admin/metrics"),
          fetch("/api/auth/me")
        ]);

        if (resMetrics.ok) {
          const data = await resMetrics.json();
          setMetrics(data);
        }

        if (resMe.ok) {
          const userData = await resMe.json();
          const firstName = userData.name ? userData.name.split(" ")[0] : "Administrador";
          setUserName(firstName);
        }
      } catch (error) {
        console.error("Error cargando dashboard de admin:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-2xl font-semibold leading-6 text-gray-900">
          Dios te bendiga, {userName || "Administrador"}
        </h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Desde este espacio principal podrás gestionar toda la estructura central del Distrito 3, incluyendo iglesias, ministerios y usuarios.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Estadísticas rápidas o accesos */}
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">
            Total Usuarios
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 flex items-center">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : metrics.totalUsers}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">
            Ministerios Activos
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 flex items-center">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : metrics.activeMinistries}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">
            Iglesias Registradas
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 flex items-center">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : metrics.totalChurches}
          </dd>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold text-blue-900">Calendario del Distrito 3</h4>
          <p className="text-sm text-blue-700 mt-1">Explora todos los eventos públicos y privados programados por los ministerios en el calendario general.</p>
        </div>
        <a href="/dashboard/admin/calendario" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors shrink-0 shadow-sm">
          Ir al Calendario
        </a>
      </div>
    </div>
  );
}
