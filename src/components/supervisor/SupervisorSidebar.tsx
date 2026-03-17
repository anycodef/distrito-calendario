"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  Contact,
  UserCircle
} from "lucide-react";

export default function SupervisorSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { name: "Inicio", href: "/dashboard/supervisor", icon: LayoutDashboard },
    { name: "Calendario Global", href: "/dashboard/supervisor/calendario", icon: CalendarDays },
    { name: "Gestión de Eventos", href: "/dashboard/supervisor/eventos", icon: CalendarRange },
    { name: "Directorio General", href: "/dashboard/supervisor/directorio", icon: Contact },
    { name: "Mi Perfil", href: "/dashboard/supervisor/perfil", icon: UserCircle },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 shadow-xl flex flex-col text-white z-50">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-800 bg-slate-950">
        <h1 className="text-xl font-bold tracking-tight">Supervisión</h1>
      </div>
      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard/supervisor");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-x-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-x-3 rounded-md px-3 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-red-600 hover:text-white"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
