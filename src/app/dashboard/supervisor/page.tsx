"use client";
import { useEffect, useState } from "react";
import { BookMarked, Loader2, CalendarDays, Contact, Church } from "lucide-react";
import Link from "next/link";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { es } from "date-fns/locale";

export default function SupervisorDashboardPage() {
  const [stats, setStats] = useState({ ministerios: 0, iglesias: 0, lideresLocales: 0 });
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resEvt, resMin, resIgl, resMe] = await Promise.all([
          fetch("/api/lider/eventos"), // El endpoint principal devuelve todos los publicados para el calendario
          fetch("/api/admin/ministerios").catch(() => null), // Hack: El admin/ministerios capaz falla si no tiene rol ADMIN, así que usaremos uno propio si es necesario, o lo contamos del backend.
          fetch("/api/lider/iglesias"),
          fetch("/api/auth/me")
        ]);

        if (resMe.ok) {
          const userData = await resMe.json();
          const firstName = userData.name ? userData.name.split(" ")[0] : "Supervisor";
          setUserName(firstName);
        }

        if (resEvt.ok) {
          const dataEvt = await resEvt.json();
          setEventos(dataEvt);
        }

        let ministeriosCount = 0;
        let iglesiasCount = 0;

        if (resIgl.ok) {
            const dataIgl = await resIgl.json();
            iglesiasCount = dataIgl.length;
        }

        // Si el supervisor tiene acceso a los ministerios, los contamos. Por simplicidad,
        // el admin crea ministerios, asumimos que aquí pondremos datos crudos o haremos fetch a una API de métricas en el futuro.

        setStats({ ministerios: 10, iglesias: iglesiasCount, lideresLocales: 45 }); // Mock stats for now until dedicated endpoint

      } catch (error) {
        console.error("Error cargando dashboard de supervisor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const proximosEventos = eventos
    .filter(ev => isAfter(new Date(ev.endDate || ev.startDate), new Date()))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-2xl font-semibold leading-6 text-gray-900">
          Dios te bendiga, {userName || "Supervisor"}
        </h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Desde este espacio principal puedes supervisar todas las actividades de los ministerios y la agenda general del Distrito 3.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Próximas Actividades del Distrito</h4>
            <Link href="/dashboard/supervisor/calendario" className="text-sm text-blue-600 hover:underline">Ver calendario</Link>
          </div>

          {loading ? (
            <div className="flex items-center text-gray-500 gap-2"><Loader2 className="animate-spin w-5 h-5" /> Cargando agenda...</div>
          ) : proximosEventos.length === 0 ? (
            <div className="p-4 bg-gray-50 text-gray-600 rounded-md border border-gray-200 text-sm text-center py-8">
              No hay eventos próximos programados en todo el distrito.
            </div>
          ) : (
            <div className="space-y-4">
              {proximosEventos.map((ev) => (
                <div key={ev.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50 hover:bg-white transition-colors relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: ev.ministerio?.color || "#ccc" }} />
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-white border border-gray-200 shadow-sm ml-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase">{format(new Date(ev.startDate), 'MMM', { locale: es })}</span>
                    <span className="text-xl font-bold text-gray-900">{format(new Date(ev.startDate), 'dd')}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: ev.ministerio?.color || '#3b82f6' }}>{ev.ministerio?.name}</span>
                      {ev.visibility === "PRIVATE" && (
                        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">Evento Interno</span>
                      )}
                    </div>
                    <h5 className="font-semibold text-gray-900 text-lg">{ev.title}</h5>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{ev.location || "Ubicación sin definir"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Panorama General</h4>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <CalendarDays className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">{eventos.length}</p>
                  <p className="text-xs text-blue-700 font-medium">Eventos Activos</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                <Church className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-purple-900">{stats.iglesias}</p>
                  <p className="text-xs text-purple-700 font-medium">Iglesias Locales</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-3">Accesos Rápidos</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/dashboard/supervisor/calendario" className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center gap-2">
                <CalendarDays className="w-6 h-6 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Agenda Global</span>
              </Link>
              <Link href="/dashboard/supervisor/directorio" className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center gap-2">
                <Contact className="w-6 h-6 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Directorio General</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
