import AdminSidebar from "@/components/admin/AdminSidebar";
import RoleSwitcher from "@/components/RoleSwitcher";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans antialiased text-gray-900">
      <AdminSidebar />
      <div className="pl-64 flex flex-1 flex-col transition-all duration-300">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
              Panel de Administración
            </h2>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <RoleSwitcher />
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
