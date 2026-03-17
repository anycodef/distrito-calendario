"use client";
import { useEffect, useState } from "react";
import { BookMarked, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LiderDashboardPage() {
  const [ministerios, setMinisterios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMinisterios = async () => {
      const res = await fetch("/api/lider/ministerios");
      if (res.ok) {
        const data = await res.json();
        setMinisterios(data);
      }
      setLoading(false);
    };
    fetchMinisterios();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-2xl font-semibold leading-6 text-gray-900">
          Hola, bienvenido
        </h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Desde este panel puedes gestionar el calendario y los contactos de tus ministerios asignados.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Tus Ministerios Activos</h4>

        {loading ? (
           <div className="flex items-center text-gray-500 gap-2"><Loader2 className="animate-spin w-5 h-5" /> Cargando...</div>
        ) : ministerios.length === 0 ? (
           <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200 text-sm">
             Aún no tienes ningún ministerio asignado. Contacta al Administrador.
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ministerios.map((min) => (
              <div key={min.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: min.color || "#ccc" }} />
                <div className="pl-3">
                  <div className="flex items-center gap-2 mb-2 text-gray-800 font-semibold">
                     <BookMarked size={18} style={{ color: min.color || "#ccc" }}/>
                     {min.name}
                  </div>
                  <p className="text-xs text-gray-500 mb-4">Categoría: {min.categoria?.name}</p>
                  <Link href="/dashboard/lider/ministerios" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Personalizar →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
