"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

export default function RoleSwitcher() {
  const [roles, setRoles] = useState<string[]>([]);
  const [currentRole, setCurrentRole] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Determinar el rol visual actual según la URL
    if (pathname.startsWith("/dashboard/admin")) setCurrentRole("ADMIN");
    else if (pathname.startsWith("/dashboard/supervisor")) setCurrentRole("SUPERVISOR");
    else if (pathname.startsWith("/dashboard/lider")) setCurrentRole("LIDER");

    // Fetch los roles del usuario autenticado
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return { roles: [] };
      })
      .then((data) => {
        if (data.roles && Array.isArray(data.roles)) {
          setRoles(data.roles);
        }
      })
      .catch(() => setRoles([]));
  }, [pathname]);

  const handleSwitch = (newRole: string) => {
    setIsOpen(false);
    if (newRole === currentRole) return;

    // Redirigir al dashboard base del rol elegido
    if (newRole === "ADMIN") router.push("/dashboard/admin");
    if (newRole === "SUPERVISOR") router.push("/dashboard/supervisor");
    if (newRole === "LIDER") router.push("/dashboard/lider");
  };

  const roleLabels: Record<string, { label: string; colorClass: string }> = {
    "ADMIN": { label: "Administrador", colorClass: "bg-blue-50 text-blue-700 ring-blue-700/10 hover:bg-blue-100" },
    "SUPERVISOR": { label: "Supervisor Distrital", colorClass: "bg-yellow-50 text-yellow-800 ring-yellow-600/20 hover:bg-yellow-100" },
    "LIDER": { label: "Líder Distrital", colorClass: "bg-slate-100 text-slate-700 ring-slate-700/10 hover:bg-slate-200" },
  };

  const getRoleStyle = (role: string) => roleLabels[role] || roleLabels["LIDER"];

  // Si solo tiene un rol, o si todavía no carga, mostramos pastilla estática
  if (roles.length <= 1) {
    const style = getRoleStyle(currentRole);
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${style.colorClass}`}>
        {style.label}
      </span>
    );
  }

  // Si tiene múltiples roles, mostramos el Dropdown
  const currentStyle = getRoleStyle(currentRole);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset transition-colors ${currentStyle.colorClass}`}
      >
        {currentStyle.label}
        <ChevronDown size={14} className="opacity-70" />
      </button>

      {isOpen && (
        <>
          {/* Overlay invisible para cerrar al clickear fuera */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                Cambiar Vista a:
              </div>
              {roles.map((roleKey) => {
                const style = getRoleStyle(roleKey);
                const isSelected = roleKey === currentRole;
                return (
                  <button
                    key={roleKey}
                    onClick={() => handleSwitch(roleKey)}
                    className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors ${
                      isSelected
                        ? "bg-gray-50 text-gray-900 font-semibold border-l-2 border-blue-500"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${isSelected ? "bg-blue-500" : "bg-gray-300"}`} />
                    {style.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
