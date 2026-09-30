import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Coordinator } from '../../types';
import {
  UserCheck,
  PlusCircle,
  Phone,
  Mail,
  Key,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Power,
  Shield,
  Send,
  Building2,
  Clock,
  Route,
  MessageSquare,
} from 'lucide-react';

export const CoordinatorsTab: React.FC = () => {
  const {
    currentSession,
    companies,
    coordinators,
    requests,
    registerCoordinator,
    deleteCoordinator,
    toggleCoordinatorStatus,
  } = useApp();

  const currentCompanyId = currentSession?.role === 'empresa' ? currentSession.userId : companies[0]?.id;
  const currentCompany = companies.find((c) => c.id === currentCompanyId);

  // Filter coordinators for this company
  const companyCoordinators = coordinators.filter(
    (c) => c.companyId === currentCompanyId
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');
  const [assignedZone, setAssignedZone] = useState('Coordinación Rutas Escolares y Empresariales');
  const [notes, setNotes] = useState('');

  const handleOpenModal = () => {
    setName('');
    setPhone('');
    setEmail('');
    setUsername('');
    setPassword('123');
    setAssignedZone('Coordinación Rutas Escolares y Empresariales');
    setNotes('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleCreateCoordinator = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !phone.trim() || !username.trim()) {
      setErrorMsg('Por favor completa el nombre, teléfono y usuario de acceso.');
      return;
    }

    const res = registerCoordinator({
      companyId: currentCompanyId,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      username: username.trim(),
      password: password.trim() || '123',
      assignedZone: assignedZone.trim(),
      notes: notes.trim(),
    });

    if (!res.success) {
      setErrorMsg(res.message || 'Error al registrar el coordinador.');
      return;
    }

    setSuccessMsg(res.message || 'Coordinador autorizado exitosamente.');
    setTimeout(() => setSuccessMsg(null), 4000);
    setIsModalOpen(false);
  };

  const handleCopyCredentials = (coord: Coordinator) => {
    const text = `*ACCESO COORDINADOR AUTORIZADO - ${currentCompany?.name || 'Transporte Especial'}*\n\nHola ${coord.name}, se ha habilitado tu acceso como Coordinador de Transporte.\n\n• *Empresa:* ${coord.companyName}\n• *Usuario:* ${coord.username}\n• *Contraseña inicial:* ${coord.password || '123'}\n• *Zona / Asignación:* ${coord.assignedZone}\n\nPuedes ingresar desde la plataforma oficial para crear y publicar solicitudes de rutas fijas (escolares/empresariales) y servicios ocasionales a nombre de la empresa.`;

    navigator.clipboard.writeText(text);
    setCopiedId(coord.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleWhatsAppCredentials = (coord: Coordinator) => {
    const cleanPhone = coord.phone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hola ${coord.name}, te comparto tus credenciales oficiales de Coordinador de Transporte para ${coord.companyName}:\n\n- Usuario: ${coord.username}\n- Contraseña: ${coord.password || '123'}\n- Asignación: ${coord.assignedZone}\n\nYa puedes ingresar a la plataforma y publicar rutas fijas (escolares y empresariales) u ocasionales a nombre de la empresa.`
    );
    window.open(`https://wa.me/57${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-amber-500" />
            <span>Gestión de Accesos Delegados</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Coordinadores Autorizados de la Empresa
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">
            Crea accesos individuales para tus coordinadores de ruta, logística o colegios. Los coordinadores autorizados pueden publicar solicitudes de servicio en el tablero oficial a nombre de <strong className="text-slate-700">{currentCompany?.name}</strong> tanto para <strong>rutas fijas</strong> (escolares con cupo/estudiante, empresariales) como <strong>servicios ocasionales</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>+ Crear Acceso para Coordinador</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Coordinators Grid */}
      {companyCoordinators.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No tienes coordinadores delegados registrados
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Agrega coordinadores para que puedan ingresar con su propio usuario y contraseña, y gestionar solicitudes de rutas fijas o viajes ocasionales.
          </p>
          <button
            type="button"
            onClick={handleOpenModal}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear Primer Coordinador</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companyCoordinators.map((coord) => {
            const coordRequests = requests.filter(
              (r) => r.createdByCoordinatorId === coord.id || r.coordinatorName.toLowerCase().includes(coord.name.toLowerCase())
            );

            return (
              <div
                key={coord.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                        coord.isActive
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          coord.isActive ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'
                        }`}
                      />
                      <span>{coord.isActive ? 'Acceso Activo' : 'Acceso Desactivado'}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleCoordinatorStatus(coord.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer text-xs ${
                          coord.isActive
                            ? 'bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                        title={coord.isActive ? 'Suspender acceso temporalmente' : 'Reactivar acceso'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`¿Estás seguro de eliminar el acceso de ${coord.name}?`)) {
                            deleteCoordinator(coord.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                        title="Eliminar coordinador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Coordinator Identity */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#1e3a5f] flex items-center justify-center font-bold text-base shrink-0">
                      {coord.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                        {coord.name}
                      </h3>
                      <p className="text-xs text-amber-700 font-medium">
                        {coord.assignedZone || 'Coordinador General'}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{coord.companyName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-[#1e3a5f]" />
                      <span className="font-semibold">{coord.phone}</span>
                    </div>
                    {coord.email && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{coord.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Credentials Box */}
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-amber-600" />
                        Credenciales de Acceso
                      </span>
                      <span className="font-mono text-slate-500 text-[10px]">
                        Contraseña: {coord.password || '123'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-amber-200 text-xs font-mono font-bold text-slate-800">
                      <span>Usuario: {coord.username}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyCredentials(coord)}
                          className="text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-100 transition-colors"
                          title="Copiar credenciales completas"
                        >
                          {copiedId === coord.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWhatsAppCredentials(coord)}
                          className="text-emerald-600 hover:text-emerald-700 p-1 rounded hover:bg-emerald-50 transition-colors"
                          title="Enviar credenciales por WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Route statistics */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-600">
                    <span className="flex items-center gap-1">
                      <Route className="w-3.5 h-3.5 text-blue-600" />
                      <span>Rutas creadas:</span>
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {coordRequests.length}
                    </span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppCredentials(coord)}
                    className="flex-1 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(coord)}
                    className="flex-1 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedId === coord.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === coord.id ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to register new Coordinator */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#1e3a5f] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base">Crear Acceso para Coordinador</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoordinator} className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-[#1e3a5f] flex items-start gap-2">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Este coordinador quedará vinculado a <strong className="font-bold">{currentCompany?.name}</strong> y podrá crear solicitudes de servicio (rutas fijas u ocasionales) con respaldo oficial de la empresa.
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Completo del Coordinador *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Rodrigo Mendoza"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. 3154879900"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ej. coord@empresa.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Usuario de Acceso (Login) *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="Ej. rodrigo.coord"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contraseña Inicial
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ej. 123"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Zona o Asignación Operativa
                </label>
                <input
                  type="text"
                  value={assignedZone}
                  onChange={(e) => setAssignedZone(e.target.value)}
                  placeholder="Ej. Rutas Escolares Bogotá Norte / Rutas Empresariales Sabana"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notas Internas
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones sobre colegios o empresas que coordina este usuario..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Crear y Autorizar Coordinador</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
