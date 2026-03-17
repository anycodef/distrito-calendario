import LiderSidebar from "@/components/lider/LiderSidebar";

export default function LiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans antialiased text-gray-900">
      <LiderSidebar />
      <div className="pl-64 flex flex-1 flex-col transition-all duration-300">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
              Distrito 3 - Área 6
            </h2>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-700/10">
                Líder Distrital
              </span>
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
