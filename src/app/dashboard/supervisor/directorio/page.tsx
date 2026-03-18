"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, Loader2, Phone, Copy, Check } from "lucide-react";

type Contacto = {
  id: string;
  name: string;
  phone: string;
  roleLocal: string;
  isActive: boolean;
  iglesiaId: string;
  ministerioId: string;
  iglesia: { name: string };
  ministerio: { name: string; color: string };
};

export default function DirectorioLocalPage() {
  const [directorio, setDirectorio] = useState<Contacto[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [iglesias, setIglesias] = useState<any[]>([]);
  const [ministerios, setMinisterios] = useState<any[]>([]);
  const [lideresDistritales, setLideresDistritales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PROPIO" | "DISTRITAL">("PROPIO");
  const [formError, setFormError] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [roleLocal, setRoleLocal] = useState("");
  const [iglesiaId, setIglesiaId] = useState("");
  const [ministerioId, setMinisterioId] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Opciones predefinidas + Custom
  const rolesOpciones = ["Pastor", "Secretario Distrital", "Tesorero Distrital", "Asistente Distrital", "Vocal"];
  const [isCustomRole, setIsCustomRole] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [resDir, resLid] = await Promise.all([
      fetch("/api/lider/directorio?context=supervisor"),
      fetch("/api/supervisor/lideres")
    ]);

    if (resLid.ok) {
      setLideresDistritales(await resLid.json());
    }

    // Obtenemos los ministerios del lider para el select
    const resMin = await fetch("/api/lider/ministerios?context=supervisor");

    if (resDir.ok) setDirectorio(await resDir.json());
    if (resMin.ok) {
        const mins = await resMin.json();
        setMinisterios(mins);
        if (mins.length > 0) setMinisterioId(mins[0].id); // Preseleccionar
    }

    // Solución temporal rápida para iglesias: Las buscamos en un nuevo endpoint `/api/lider/iglesias`
    const resIgl = await fetch("/api/lider/iglesias");
    if (resIgl.ok) {
        const igls = await resIgl.json();
        setIglesias(igls);
        if (igls.length > 0) setIglesiaId(igls[0].id);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "Custom") {
      setIsCustomRole(true);
      setRoleLocal("");
    } else {
      setIsCustomRole(false);
      setRoleLocal(val);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setPhone("");
    setRoleLocal("");
    setIsCustomRole(false);
    setIsActive(true);
    if (iglesias.length > 0) setIglesiaId(iglesias[0].id);
    if (ministerios.length > 0) setMinisterioId(ministerios[0].id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !roleLocal.trim() || !iglesiaId || !ministerioId) {
      setFormError("Completa todos los campos obligatorios");
      return;
    }

    const payload = { name, phone, roleLocal, iglesiaId, ministerioId, isActive };
    const url = editId ? `/api/lider/directorio/${editId}?context=supervisor` : "/api/lider/directorio?context=supervisor";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
       const d = await res.json();
       setFormError(d.message);
       return;
    }

    resetForm();
    fetchData();
  };

  const handleEdit = (c: Contacto) => {
    setEditId(c.id);
    setName(c.name);
    setPhone(c.phone || "");

    if (rolesOpciones.includes(c.roleLocal)) {
      setIsCustomRole(false);
      setRoleLocal(c.roleLocal);
    } else {
      setIsCustomRole(true);
      setRoleLocal(c.roleLocal);
    }

    setIglesiaId(c.iglesiaId);
    setMinisterioId(c.ministerioId);
    setIsActive(c.isActive);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Desactivar este contacto del directorio local?")) return;
    await fetch(`/api/lider/directorio/${id}?context=supervisor`, { method: "DELETE" });
    fetchData();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5 gap-4">
        <div>
          <h3 className="text-2xl font-semibold leading-6 text-gray-900">
            Directorio Distrital
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Visualiza a todos los líderes de distrito y gestiona tu propio equipo o directiva.
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("PROPIO")}
            className={`${
              activeTab === "PROPIO"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Mi Directorio (Directiva / Equipo)
          </button>
          <button
            onClick={() => setActiveTab("DISTRITAL")}
            className={`${
              activeTab === "DISTRITAL"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Líderes Distritales ({lideresDistritales.length})
          </button>
        </nav>
      </div>

      {activeTab === "PROPIO" ? (
      <>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
             <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">{formError}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <input
                type="text" required value={name} onChange={e => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 sm:text-sm text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="text" value={phone} onChange={e => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 sm:text-sm text-black"
                placeholder="Ej. +51 999 888 777"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ministerio Distrital</label>
              <select
                required value={ministerioId} onChange={e => setMinisterioId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 sm:text-sm text-black"
              >
                {ministerios.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Iglesia Local</label>
              <select
                required value={iglesiaId} onChange={e => setIglesiaId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 sm:text-sm text-black"
              >
                {iglesias.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>

            <div className="lg:col-span-2">
               <label className="block text-sm font-medium text-gray-700">Cargo / Rol Local</label>
               <div className="flex gap-2 mt-1">
                 <select
                   required={!isCustomRole}
                   value={isCustomRole ? "Custom" : roleLocal}
                   onChange={handleRoleChange}
                   className="block w-1/3 rounded-md border border-gray-300 px-3 py-2 sm:text-sm text-black"
                 >
                   <option value="" disabled>Selecciona...</option>
                   {rolesOpciones.map(r => <option key={r} value={r}>{r}</option>)}
                   <option value="Custom">Otro (Personalizado)</option>
                 </select>

                 {isCustomRole && (
                    <input
                      type="text" required value={roleLocal} onChange={e => setRoleLocal(e.target.value)}
                      placeholder="Especifica el cargo"
                      className="block w-2/3 rounded-md border border-gray-300 px-3 py-2 sm:text-sm text-black"
                    />
                 )}
               </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
             {editId ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded border-gray-300"/>
                  <span className="text-sm font-medium text-gray-700">Contacto Activo</span>
                </label>
             ) : <div/>}

             <div className="flex gap-2">
               {editId && <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50">Cancelar</button>}
               <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
                 {editId ? <Edit2 size={16}/> : <Plus size={16}/>}
                 {editId ? "Actualizar" : "Agregar al Directorio"}
               </button>
             </div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {loading ? (
           <div className="p-8 text-center text-gray-500"><Loader2 className="animate-spin inline w-6 h-6"/></div>
        ) : (
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-300">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Contacto</th>
                   <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cargo</th>
                   <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ubicación</th>
                   <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Acciones</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-200 bg-white">
                 {directorio.map(c => (
                   <tr key={c.id} className={!c.isActive ? "opacity-50 bg-gray-50" : ""}>
                     <td className="px-6 py-4">
                       <div className="font-medium text-gray-900">{c.name} {c.isActive ? "" : "(Inactivo)"}</div>
                       <div className="flex items-center text-gray-500 text-sm mt-1 gap-2">
                         <div className="flex items-center gap-1">
                           <Phone size={14}/> {c.phone || "Sin teléfono"}
                         </div>
                         {c.phone && (
                           <button
                             type="button"
                             onClick={() => copyToClipboard(c.phone, c.id)}
                             className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                             title="Copiar número"
                           >
                             {copiedId === c.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                           </button>
                         )}
                       </div>
                     </td>
                     <td className="px-6 py-4 text-sm text-gray-900">{c.roleLocal}</td>
                     <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">{c.iglesia.name}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.ministerio.color }}/>
                          {c.ministerio.name}
                        </div>
                     </td>
                     <td className="px-6 py-4 text-right text-sm font-medium">
                       <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-900 mr-3"><Edit2 size={16}/></button>
                       {c.isActive && (
                         <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-900"><Trash2 size={16}/></button>
                       )}
                     </td>
                   </tr>
                 ))}
                 {directorio.length === 0 && (
                   <tr><td colSpan={4} className="p-6 text-center text-gray-500">Tu directorio está vacío.</td></tr>
                 )}
               </tbody>
             </table>
           </div>
        )}
      </div>
      </>
      ) : (
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {loading ? (
           <div className="p-8 text-center text-gray-500"><Loader2 className="animate-spin inline w-6 h-6"/></div>
        ) : (
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-300">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Líder</th>
                   <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ministerios a Cargo</th>
                   <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Iglesia Local</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-200 bg-white">
                 {lideresDistritales.map(l => (
                   <tr key={l.id}>
                     <td className="px-6 py-4">
                       <div className="font-medium text-gray-900">{l.name}</div>
                       <div className="text-gray-500 text-xs">@{l.username}</div>
                     </td>
                     <td className="px-6 py-4 text-sm">
                        {l.ministerios.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {l.ministerios.map((m: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-1 text-xs text-gray-700">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color || '#ccc' }}/>
                                {m.name}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Sin asignar</span>
                        )}
                     </td>
                     <td className="px-6 py-4 text-sm text-gray-700">
                        {l.iglesia ? l.iglesia.name : <span className="text-gray-400 italic text-xs">Sin iglesia</span>}
                     </td>
                   </tr>
                 ))}
                 {lideresDistritales.length === 0 && (
                   <tr><td colSpan={3} className="p-6 text-center text-gray-500">No hay líderes distritales registrados.</td></tr>
                 )}
               </tbody>
             </table>
           </div>
        )}
      </div>
      )}
    </div>
  );
}
