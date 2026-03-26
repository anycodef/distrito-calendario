"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  Users,
  Building2,
  FolderTree,
  BookMarked,
  CalendarDays
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { name: "Inicio / Panel", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Calendario Distrital", href: "/dashboard/admin/calendario", icon: CalendarDays },
    { name: "Usuarios y Credenciales", href: "/dashboard/admin/usuarios", icon: Users },
    { name: "Ministerios", href: "/dashboard/admin/ministerios", icon: BookMarked },
    { name: "Categorías", href: "/dashboard/admin/categorias", icon: FolderTree },
    { name: "Iglesias Locales", href: "/dashboard/admin/iglesias", icon: Building2 },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-blue-900 shadow-xl flex flex-col text-white z-50">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-blue-800 bg-blue-950">
        <h1 className="text-xl font-bold tracking-tight">Admin Distrito 3</h1>
      </div>
      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard/admin");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-x-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-blue-100 hover:bg-blue-800 hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-blue-300"}`} aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-blue-800 bg-blue-950">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-x-3 rounded-md px-3 py-2.5 text-sm font-semibold text-blue-100 transition-all hover:bg-red-600 hover:text-white"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
