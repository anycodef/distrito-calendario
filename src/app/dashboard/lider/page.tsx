"use client";
import { useEffect, useState } from "react";
import { BookMarked, Loader2, CalendarDays, Contact } from "lucide-react";
import Link from "next/link";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { es } from "date-fns/locale";

export default function LiderDashboardPage() {
  const [ministerios, setMinisterios] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resMin, resEvt] = await Promise.all([
          fetch("/api/lider/ministerios?context=lider"),
          fetch("/api/lider/eventos/mis-eventos?context=lider&status=PUBLISHED")
        ]);

        if (resMin.ok) {
          const data = await resMin.json();
          setMinisterios(data);
        }
        if (resEvt.ok) {
          const dataEvt = await resEvt.json();
          setEventos(dataEvt);
        }
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const proximosEventos = eventos
    .filter(ev => isAfter(new Date(ev.endDate || ev.startDate), new Date()))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Próximos Eventos de tus Ministerios</h4>
            <Link href="/dashboard/lider/eventos" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
          </div>

          {loading ? (
            <div className="flex items-center text-gray-500 gap-2"><Loader2 className="animate-spin w-5 h-5" /> Cargando...</div>
          ) : proximosEventos.length === 0 ? (
            <div className="p-4 bg-gray-50 text-gray-600 rounded-md border border-gray-200 text-sm text-center py-8">
              No tienes eventos próximos programados.
            </div>
          ) : (
            <div className="space-y-4">
              {proximosEventos.map((ev) => (
                <div key={ev.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50 hover:bg-white transition-colors">
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-white border border-gray-200 shadow-sm">
                    <span className="text-xs font-semibold text-gray-500 uppercase">{format(new Date(ev.startDate), 'MMM', { locale: es })}</span>
                    <span className="text-xl font-bold text-gray-900">{format(new Date(ev.startDate), 'dd')}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ev.ministerio?.color || '#3b82f6' }}></div>
                      <span className="text-xs font-medium text-gray-500">{ev.ministerio?.name}</span>
                    </div>
                    <h5 className="font-semibold text-gray-900 text-lg">{ev.title}</h5>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{ev.location || "Sin ubicación específica"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Resumen</h4>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <BookMarked className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">{ministerios.length}</p>
                  <p className="text-xs text-blue-700 font-medium">Ministerios a cargo</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                <CalendarDays className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-purple-900">{eventos.length}</p>
                  <p className="text-xs text-purple-700 font-medium">Eventos Publicados</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-3">Accesos Rápidos</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/dashboard/lider/calendario" className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center gap-2">
                <CalendarDays className="w-6 h-6 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Calendario</span>
              </Link>
              <Link href="/dashboard/lider/directorio" className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center gap-2">
                <Contact className="w-6 h-6 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Directorio</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
