import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Star,
  Heart,
  UserX,
  X,
  Calendar,
  Clock,
  DollarSign,
  Send,
  MessageSquare,
  CheckCircle2,
  Edit3,
  Save,
  Briefcase,
  Layers,
  Award,
  AlertCircle,
  ThumbsUp,
  User,
} from 'lucide-react';
import { Company, TransportRequest } from '../types';

interface CompanyProfileModalProps {
  companyId: string | null;
  onClose: () => void;
}

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({
  companyId,
  onClose,
}) => {
  const {
    companies,
    companyReviews,
    currentSession,
    requests,
    toggleFollowCompany,
    isFollowingCompany,
    addCompanyReview,
    updateCompanyProfile,
    getCompanyRating,
    acceptRequest,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'info' | 'solicitudes' | 'opiniones'>('opiniones');
  const [isEditing, setIsEditing] = useState(false);

  // Review form state
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [paymentScore, setPaymentScore] = useState<number>(5);
  const [coordinationScore, setCoordinationScore] = useState<number>(5);
  const [pricingScore, setPricingScore] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Edit form state
  const company = companies.find((c) => c.id === companyId);

  const [editFormData, setEditFormData] = useState<Partial<Company>>({
    name: company?.name || '',
    phone: company?.phone || '',
    email: company?.email || '',
    city: company?.city || '',
    address: company?.address || '',
    logo: company?.logo || '',
    coverImage: company?.coverImage || '',
    description: company?.description || '',
    habilitacionMintransporte: company?.habilitacionMintransporte || '',
    website: company?.website || '',
  });

  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  if (!company) return null;

  const isCompanyOwner = currentSession?.role === 'empresa' && currentSession?.userId === company.id;
  const isDriverOrOwner = currentSession && (currentSession.role === 'conductor' || currentSession.role === 'propietario');
  const isFollowing = isFollowingCompany(company.id);

  const ratingData = getCompanyRating(company.id);
  const reviews = companyReviews.filter((r) => r.companyId === company.id);
  const activeCompanyRequests = requests.filter(
    (r) => r.companyId === company.id && r.status === 'disponible'
  );

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewMessage({ type: 'error', text: 'Por favor escribe tu opinión sobre esta empresa.' });
      return;
    }

    setIsSubmittingReview(true);
    setReviewMessage(null);

    const res = addCompanyReview({
      companyId: company.id,
      rating,
      comment,
      paymentPunctualityScore: paymentScore,
      coordinationScore,
      fairPricingScore: pricingScore,
    });

    setIsSubmittingReview(false);

    if (res.success) {
      setReviewMessage({ type: 'success', text: res.message || '¡Opinión publicada exitosamente!' });
      setComment('');
      setTimeout(() => setReviewMessage(null), 4000);
    } else {
      setReviewMessage({ type: 'error', text: res.message || 'Error al enviar calificación.' });
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateCompanyProfile(company.id, editFormData);
    if (res.success) {
      setEditSuccessMsg('Perfil actualizado con éxito');
      setIsEditing(false);
      setTimeout(() => setEditSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto z-10 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header Cover Banner */}
        <div className="relative h-36 sm:h-44 bg-gradient-to-r from-[#1e3a5f] to-[#142842] overflow-hidden shrink-0">
          {company.coverImage ? (
            <img
              src={company.coverImage}
              alt="Banner de Empresa"
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#1e3a5f] via-[#244b7a] to-[#142842] opacity-80" />
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-xs cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Mintransporte qualification pill */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Empresa Habilitada Mintransporte</span>
          </div>
        </div>

        {/* Company Identity Row */}
        <div className="px-5 sm:px-8 pt-0 pb-4 bg-white border-b border-slate-100 shrink-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-3">
            {/* Logo */}
            <div className="flex items-end gap-3.5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1.5 shadow-xl border-2 border-white ring-1 ring-slate-200 shrink-0 overflow-hidden">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-full object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#142842] flex items-center justify-center text-amber-400">
                    <Building2 className="w-10 h-10" />
                  </div>
                )}
              </div>

              <div className="pb-1">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {company.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-700">
                    NIT: {company.nit}
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {company.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Follow / Edit) */}
            <div className="flex items-center gap-2 self-start sm:self-end">
              {isCompanyOwner ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3.5 py-1.5 bg-[#1e3a5f] hover:bg-[#142842] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEditing ? 'Ver Perfil' : 'Editar Mi Perfil'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleFollowCompany(company.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    isFollowing
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isFollowing ? 'fill-rose-600 text-rose-600' : 'text-slate-950'
                    }`}
                  />
                  <span>{isFollowing ? 'Siguiendo' : 'Seguir Empresa'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Rating Badge & Tabs Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            {/* Global Rating Score Pill */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span className="font-extrabold text-sm text-slate-900">
                  {ratingData.average}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  / 5.0 ({ratingData.count} {ratingData.count === 1 ? 'opinión' : 'opiniones'})
                </span>
              </div>

              {company.establishedYear && (
                <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Fundada en {company.establishedYear}</span>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('opiniones');
                  setIsEditing(false);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'opiniones' && !isEditing
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Calificaciones ({reviews.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('info');
                  setIsEditing(false);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'info' && !isEditing
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Información
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('solicitudes');
                  setIsEditing(false);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'solicitudes' && !isEditing
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Viajes Activos ({activeCompanyRequests.length})
              </button>
            </div>
          </div>

          {editSuccessMsg && (
            <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{editSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* EDIT FORM (When editing mode is active) */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#1e3a5f]" />
                  Editar Datos de la Empresa y Logotipo
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre Comercial</label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ciudad Principal</label>
                  <input
                    type="text"
                    value={editFormData.city || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono / PBX</label>
                  <input
                    type="tel"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dirección de Operaciones</label>
                  <input
                    type="text"
                    value={editFormData.address || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sitio Web (Opcional)</label>
                  <input
                    type="url"
                    value={editFormData.website || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">URL de Logotipo</label>
                  <input
                    type="url"
                    value={editFormData.logo || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, logo: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none font-mono text-[11px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">URL de Banner / Portada</label>
                  <input
                    type="url"
                    value={editFormData.coverImage || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, coverImage: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none font-mono text-[11px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Resolución de Habilitación Mintransporte</label>
                  <input
                    type="text"
                    value={editFormData.habilitacionMintransporte || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, habilitacionMintransporte: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Descripción y Trayectoria Institucional</label>
                  <textarea
                    rows={3}
                    value={editFormData.description || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          ) : null}

          {/* TAB 1: CALIFICACIONES Y OPINIONES */}
          {!isEditing && activeTab === 'opiniones' && (
            <div className="space-y-6">
              {/* Summary Rating Scorecard */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Big Number */}
                  <div className="md:col-span-4 text-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
                    <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-1">
                      <span>{ratingData.average}</span>
                      <Star className="w-8 h-8 fill-amber-400 text-amber-500 inline" />
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-1">
                      Promedio general de {ratingData.count} {ratingData.count === 1 ? 'opinión' : 'opiniones'}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Empresa Confiable</span>
                    </div>
                  </div>

                  {/* Sub-Criteria Progress Bars */}
                  <div className="md:col-span-8 space-y-2.5 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Puntualidad en Pagos</span>
                        <span className="font-bold text-[#1e3a5f]">
                          {ratingData.punctualityAvg} / 5.0
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${(ratingData.punctualityAvg / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Trato y Claridad de Coordinadores</span>
                        <span className="font-bold text-[#1e3a5f]">
                          {ratingData.coordinationAvg} / 5.0
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${(ratingData.coordinationAvg / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>Tarifas y Condiciones Justas</span>
                        <span className="font-bold text-[#1e3a5f]">
                          {ratingData.pricingAvg} / 5.0
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${(ratingData.pricingAvg / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RATING SUBMISSION FORM (For logged-in drivers and owners) */}
              {isDriverOrOwner ? (
                <div className="bg-gradient-to-br from-amber-50/60 via-white to-blue-50/40 rounded-2xl p-5 sm:p-6 border border-amber-200/80 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-200/50 mb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      Calificar y dejar opinión sobre {company.name}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                      Como {currentSession.name} ({currentSession.role === 'conductor' ? 'Conductor' : 'Propietario'})
                    </span>
                  </div>

                  <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                    {/* Primary Star Rating Selector */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1.5">
                        Calificación General:
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-1 text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-7 h-7 ${
                                star <= (hoverRating ?? rating)
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 font-bold text-sm text-slate-800">
                          {rating === 5
                            ? '⭐ Excelente (5/5)'
                            : rating === 4
                            ? '⭐ Muy Buena (4/5)'
                            : rating === 3
                            ? '⭐ Aceptable (3/5)'
                            : rating === 2
                            ? '⭐ Regular (2/5)'
                            : '⭐ Deficiente (1/5)'}
                        </span>
                      </div>
                    </div>

                    {/* Sub-Criteria Selectors */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                        <label className="block font-semibold text-slate-700 mb-1">
                          Puntualidad en pagos:
                        </label>
                        <select
                          value={paymentScore}
                          onChange={(e) => setPaymentScore(Number(e.target.value))}
                          className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                        >
                          <option value={5}>5 ★ - Cumplen a cabalidad</option>
                          <option value={4}>4 ★ - Buen cumplimiento</option>
                          <option value={3}>3 ★ - Aceptable</option>
                          <option value={2}>2 ★ - Retrasos frecuentes</option>
                          <option value={1}>1 ★ - No recomendado</option>
                        </select>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                        <label className="block font-semibold text-slate-700 mb-1">
                          Trato y coordinación:
                        </label>
                        <select
                          value={coordinationScore}
                          onChange={(e) => setCoordinationScore(Number(e.target.value))}
                          className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                        >
                          <option value={5}>5 ★ - Comunicación impecable</option>
                          <option value={4}>4 ★ - Buena atención</option>
                          <option value={3}>3 ★ - Normal</option>
                          <option value={2}>2 ★ - Poca claridad</option>
                          <option value={1}>1 ★ - Mala comunicación</option>
                        </select>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                        <label className="block font-semibold text-slate-700 mb-1">
                          Precios y condiciones:
                        </label>
                        <select
                          value={pricingScore}
                          onChange={(e) => setPricingScore(Number(e.target.value))}
                          className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                        >
                          <option value={5}>5 ★ - Tarifas justas</option>
                          <option value={4}>4 ★ - Buenas condiciones</option>
                          <option value={3}>3 ★ - Estándar</option>
                          <option value={2}>2 ★ - Ajustado</option>
                          <option value={1}>1 ★ - Tarifas bajas</option>
                        </select>
                      </div>
                    </div>

                    {/* Comment text */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Tu experiencia trabajando con esta empresa:
                      </label>
                      <textarea
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Comparte detalles sobre el cumplimiento en pagos, el trato de los coordinadores, rutas asignadas..."
                        className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                        required
                      />
                    </div>

                    {reviewMessage && (
                      <div
                        className={`p-2.5 rounded-xl flex items-center gap-2 ${
                          reviewMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {reviewMessage.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{reviewMessage.text}</span>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="px-5 py-2.5 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Send className="w-4 h-4 text-amber-400" />
                        <span>Publicar Calificación</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : isCompanyOwner ? (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-xl flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>
                    Estás viendo tu propio perfil institucional. Los conductores y propietarios asociados pueden calificar tus servicios y cumplimiento aquí.
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-slate-100 text-slate-600 text-xs rounded-xl text-center">
                  Inicia sesión como conductor o propietario para publicar una calificación.
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Opiniones Publicadas ({reviews.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Ordenadas por fecha más reciente
                  </span>
                </div>

                {reviews.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Aún no hay opiniones registradas</p>
                    <p className="mt-0.5 text-slate-400">
                      ¡Sé el primero en calificar tu experiencia con esta empresa!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                              <User className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-slate-900">
                                  {rev.authorName}
                                </span>
                                <span className="text-[10px] font-semibold bg-blue-50 text-blue-800 px-2 py-0.2 rounded-full border border-blue-200/60 capitalize">
                                  {rev.authorRole}
                                </span>
                                {rev.authorPlate && (
                                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">
                                    {rev.authorPlate}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {new Date(rev.createdAt).toLocaleDateString('es-CO', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Star rating */}
                          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-xl shrink-0 self-start sm:self-auto">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= rev.rating
                                      ? 'fill-amber-400 text-amber-500'
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-bold text-xs text-slate-800 ml-1">
                              {rev.rating}.0
                            </span>
                          </div>
                        </div>

                        {/* Comment text */}
                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                          "{rev.comment}"
                        </p>

                        {/* Sub ratings badges */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                          {rev.paymentPunctualityScore && (
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                              Pago: <strong className="text-emerald-700">{rev.paymentPunctualityScore}★</strong>
                            </span>
                          )}
                          {rev.coordinationScore && (
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                              Coordinación: <strong className="text-blue-700">{rev.coordinationScore}★</strong>
                            </span>
                          )}
                          {rev.fairPricingScore && (
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                              Tarifa: <strong className="text-amber-700">{rev.fairPricingScore}★</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: INFORMACIÓN Y SERVICIOS */}
          {!isEditing && activeTab === 'info' && (
            <div className="space-y-5">
              {/* Description Card */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#1e3a5f]" />
                  Perfil Institucional y Trayectoria
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {company.description ||
                    'Empresa prestadora de servicio público de transporte especial habilitada ante el Ministerio de Transporte de Colombia, especializada en movilización de pasajeros, turismo y convenios corporativos.'}
                </p>

                {company.servicesOffered && company.servicesOffered.length > 0 && (
                  <div className="pt-2">
                    <span className="block text-xs font-semibold text-slate-500 mb-2">
                      Modalidades de Servicio Habilitadas:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {company.servicesOffered.map((srv, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl bg-blue-50 text-[#1e3a5f] text-xs font-bold border border-blue-200/60"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Legal & Contact Info Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Habilitación Legal
                  </h4>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[11px]">NIT Oficial:</span>
                      <span className="font-mono font-bold text-slate-800">{company.nit}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Habilitación Mintransporte:</span>
                      <span className="font-medium text-slate-800">
                        {company.habilitacionMintransporte || 'Resolución Habilitación de Transporte Especial'}
                      </span>
                    </div>

                    {company.establishedYear && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Año de Constitución:</span>
                        <span className="font-medium text-slate-800">{company.establishedYear}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#1e3a5f]" />
                    Contacto Directo
                  </h4>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <a href={`tel:${company.phone}`} className="font-bold text-slate-800 hover:text-blue-600">
                        {company.phone}
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                      <a href={`mailto:${company.email}`} className="text-slate-700 hover:text-blue-600 truncate">
                        {company.email}
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{company.address ? `${company.address}, ${company.city}` : company.city}</span>
                    </div>

                    {company.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline truncate"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VIAJES ACTIVOS DE ESTA EMPRESA */}
          {!isEditing && activeTab === 'solicitudes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Solicitudes Disponibles de {company.name} ({activeCompanyRequests.length})
                </h4>
                <span className="text-[11px] text-slate-500">
                  Publicadas en la cartelera nacional
                </span>
              </div>

              {activeCompanyRequests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No hay viajes disponibles en este momento</p>
                  <p className="mt-0.5 text-slate-400">
                    Sigue a esta empresa para recibir notificaciones instantáneas cuando publiquen nuevas rutas.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeCompanyRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-amber-300 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-blue-50 text-[#1e3a5f] font-bold text-xs rounded-lg">
                            {req.pickupLocation} ➔ {req.destinationLocation}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-700">
                            $ {req.paymentAmount.toLocaleString('es-CO')} COP
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Pago: {req.paymentTerm}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{req.serviceDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{req.serviceTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700">{req.passengerCount} Pasajeros</span>
                        </div>
                      </div>

                      {currentSession?.role === 'conductor' && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const res = acceptRequest(req.id);
                              if (res.success) {
                                onClose();
                              }
                            }}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            Aceptar Viaje
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
