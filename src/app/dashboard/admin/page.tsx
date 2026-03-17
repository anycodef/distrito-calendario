export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-2xl font-semibold leading-6 text-gray-900">
          Bienvenido al Dashboard
        </h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Aquí podrás gestionar toda la estructura central del Distrito 3, incluyendo iglesias, ministerios y usuarios.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Estadísticas rápidas o accesos (Se poblarán luego) */}
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">
            Total Usuarios
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            --
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">
            Ministerios Activos
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            --
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
          <dt className="truncate text-sm font-medium text-gray-500">
            Iglesias Registradas
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            --
          </dd>
        </div>
      </div>
    </div>
  );
}
