import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Phone,
  Car,
  Key,
  Lock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  Eye,
  EyeOff,
  FileText,
  CreditCard,
} from 'lucide-react';
import { formatPlateDisplay } from '../../utils/formatters';

export const MyDriversTab: React.FC = () => {
  const { currentSession, drivers, vehicles, registerDriver, openDriverModal } = useApp();

  // Filter vehicles of this owner
  const myVehicles = vehicles.filter((v) => v.ownerId === currentSession?.userId);
  // Filter drivers of this owner
  const myDrivers = drivers.filter((d) => d.ownerId === currentSession?.userId);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedVehicleId, setAssignedVehicleId] = useState('');
  const [createOwnAccess, setCreateOwnAccess] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Ingresa el nombre completo del conductor.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Ingresa el número de contacto del conductor.');
      return;
    }

    if (createOwnAccess) {
      if (!assignedVehicleId) {
        setErrorMsg('Para habilitar acceso propio al conductor, es obligatorio asignarle un vehículo primero.');
        return;
      }
      if (!username.trim()) {
        setErrorMsg('Ingresa un nombre de usuario para el inicio de sesión del conductor.');
        return;
      }
    }

    const res = registerDriver({
      name: name.trim(),
      phone: phone.trim(),
      assignedVehicleId: assignedVehicleId || undefined,
      createOwnAccess,
      username: createOwnAccess ? username.trim().toLowerCase() : undefined,
      password: createOwnAccess ? password : undefined,
    });

    if (!res.success) {
      setErrorMsg(res.message || 'Error al registrar conductor.');
      return;
    }

    setSuccessMsg(`¡Conductor ${name} registrado correctamente!`);
    setName('');
    setPhone('');
    setUsername('');
    setCreateOwnAccess(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Gestión de Mis Conductores</h2>
        <p className="text-xs text-slate-500">
          Asigna vehículos a tus conductores y permíteles ingresar con sus propias credenciales para aceptar servicios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form to Register Driver */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs h-fit">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 text-[#1e3a5f]">
            <PlusCircle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm">Registrar Conductor</h3>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-2 text-xs text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Julián Ruiz Pineda"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono de Contacto *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="3138899112"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vehículo Asignado
              </label>
              <div className="relative">
                <Car className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <select
                  value={assignedVehicleId}
                  onChange={(e) => setAssignedVehicleId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none bg-white font-medium"
                >
                  <option value="">Sin vehículo asignado por ahora</option>
                  {myVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {formatPlateDisplay(v.plate)} - {v.type} ({v.brand})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkbox: Crear Acceso Propio */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createOwnAccess}
                  onChange={(e) => {
                    setCreateOwnAccess(e.target.checked);
                    if (!assignedVehicleId && e.target.checked && myVehicles.length > 0) {
                      setAssignedVehicleId(myVehicles[0].id);
                    }
                  }}
                  className="mt-1 rounded border-slate-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Crear acceso propio para este conductor
                  </span>
                  <span className="text-[11px] text-slate-500 block leading-tight">
                    Podrá ingresar por su cuenta a la app usando usuario y contraseña.
                  </span>
                </div>
              </label>
            </div>

            {/* Fields when createOwnAccess is true */}
            {createOwnAccess && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Key className="w-4 h-4 text-amber-600" />
                  <span>Credenciales del Conductor</span>
                </div>

                {!assignedVehicleId && (
                  <p className="text-[11px] text-rose-600 font-semibold">
                    * Debes seleccionar un vehículo asignado arriba para habilitar el acceso.
                  </p>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre de Usuario *
                  </label>
                  <input
                    type="text"
                    required={createOwnAccess}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej. julian.ruiz"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={createOwnAccess}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="123"
                      className="w-full pl-9 pr-9 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1.5 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                      title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Guardar Conductor</span>
            </button>
          </form>
        </div>

        {/* Drivers List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Conductores Vinculados ({myDrivers.length})
            </h3>
            <span className="text-xs text-slate-500">
              {myDrivers.filter((d) => d.hasOwnAccess).length} con acceso propio activo
            </span>
          </div>

          {myDrivers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
              No tienes conductores vinculados. Puedes usar el formulario de la izquierda para registrar a tus conductores.
            </div>
          ) : (
            <div className="space-y-3">
              {myDrivers.map((driver) => {
                const assignedVehicle = vehicles.find((v) => v.id === driver.assignedVehicleId);

                return (
                  <div
                    key={driver.id}
                    className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold shrink-0 mt-0.5 overflow-hidden">
                        {driver.profilePhoto ? (
                          <img
                            src={driver.profilePhoto}
                            alt={driver.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <User className="w-5 h-5 text-[#1e3a5f]" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-900">{driver.name}</h4>
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
                            Cat. {driver.licenseCategory || 'C2'}
                          </span>
                          {driver.hasOwnAccess ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <Key className="w-3 h-3 text-emerald-600" />
                              <span>Acceso propio activo</span>
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              Sin acceso propio
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {driver.phone}
                          </span>

                          {assignedVehicle ? (
                            <span className="flex items-center gap-1 font-semibold text-slate-800">
                              <Car className="w-3.5 h-3.5 text-amber-600" />
                              <span>Placa: {formatPlateDisplay(assignedVehicle.plate)}</span>
                              <span className="text-slate-400 font-normal">
                                ({assignedVehicle.brand})
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">
                              Sin vehículo asignado
                            </span>
                          )}
                        </div>

                        {driver.hasOwnAccess && driver.username && (
                          <div className="text-[11px] text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded w-fit">
                            Usuario: <span className="font-bold text-[#1e3a5f]">{driver.username}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action: Ver Ficha Técnica */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openDriverModal(driver.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-[#1e3a5f] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Ver ficha técnica, cédula y licencia por ambos lados"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ficha Técnica y Documentos</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
