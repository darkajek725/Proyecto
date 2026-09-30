import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Company,
  Owner,
  Driver,
  Vehicle,
  TransportRequest,
  AppNotification,
  UserSession,
  VehicleType,
  PaymentTerm,
  ServiceModificationProposal,
  CompanyReview,
  Coordinator,
  ServiceCategory,
  ServiceType,
  SchoolRouteDetails,
  CorporateRouteDetails,
  SubscriptionInfo,
} from '../types';
import {
  SEED_COMPANIES,
  SEED_OWNERS,
  SEED_DRIVERS,
  SEED_VEHICLES,
  SEED_REQUESTS,
  SEED_NOTIFICATIONS,
  SEED_REVIEWS,
  SEED_COORDINATORS,
} from '../data/seedData';

interface AppContextType {
  // State
  companies: Company[];
  companyReviews: CompanyReview[];
  owners: Owner[];
  drivers: Driver[];
  coordinators: Coordinator[];
  vehicles: Vehicle[];
  requests: TransportRequest[];
  notifications: AppNotification[];
  followedCompanyIds: { [userId: string]: string[] };
  currentSession: UserSession | null;
  
  // Modals & navigation
  isRoleSelectorOpen: boolean;
  setIsRoleSelectorOpen: (open: boolean) => void;
  selectedCompanyModalId: string | null;
  openCompanyModal: (companyId: string) => void;
  closeCompanyModal: () => void;
  selectedVehicleModalId: string | null;
  selectedVehicleRequestingCompanyId: string | null;
  openVehicleModal: (vehicleIdOrPlate: string, requestingCompanyId?: string) => void;
  closeVehicleModal: () => void;
  selectedDriverModalId: string | null;
  selectedDriverRequestingCompanyId: string | null;
  openDriverModal: (driverId: string, requestingCompanyId?: string) => void;
  closeDriverModal: () => void;
  authModal: {
    isOpen: boolean;
    role: 'empresa' | 'propietario_conductor' | 'coordinador' | null;
    initialMode: 'login' | 'register';
  };
  openAuthModal: (role: 'empresa' | 'propietario_conductor' | 'coordinador', mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  
  // Auth methods
  loginCompany: (nit: string, password?: string) => { success: boolean; message?: string };
  registerCompany: (data: { nit: string; name: string; phone: string; email: string; city: string; password?: string }) => { success: boolean; message?: string };
  loginUnified: (username: string, password?: string) => { success: boolean; role?: 'propietario' | 'conductor' | 'coordinador'; message?: string };
  loginCoordinator: (username: string, password?: string) => { success: boolean; message?: string };
  registerOwner: (data: { name: string; phone: string; username: string; password?: string; identification: string }) => { success: boolean; message?: string };
  resetUserPassword: (role: 'empresa' | 'propietario' | 'conductor' | 'coordinador', identifier: string, newPassword?: string) => { success: boolean; message?: string; email?: string };
  logout: () => void;
  quickSwitchUser: (role: 'empresa' | 'propietario' | 'conductor' | 'coordinador', id?: string) => void;

  // Coordinator management (by companies or direct registration)
  registerCoordinator: (data: {
    companyId?: string;
    name: string;
    phone: string;
    email: string;
    username: string;
    password?: string;
    assignedZone?: string;
    notes?: string;
  }) => { success: boolean; message?: string; coordinator?: Coordinator };
  updateCoordinator: (coordinatorId: string, updates: Partial<Coordinator>) => { success: boolean; message?: string };
  deleteCoordinator: (coordinatorId: string) => { success: boolean; message?: string };
  toggleCoordinatorStatus: (coordinatorId: string) => void;

  // Company profile & reviews
  updateCompanyProfile: (companyId: string, updates: Partial<Company>) => { success: boolean; message?: string };
  addCompanyReview: (data: {
    companyId: string;
    rating: number;
    comment: string;
    paymentPunctualityScore?: number;
    coordinationScore?: number;
    fairPricingScore?: number;
  }) => { success: boolean; message?: string };
  getCompanyRating: (companyId: string) => {
    average: number;
    count: number;
    breakdown: { 5: number; 4: number; 3: number; 2: number; 1: number };
    punctualityAvg: number;
    coordinationAvg: number;
    pricingAvg: number;
  };

  // Company / Coordinator actions
  publishRequest: (data: {
    serviceCategory?: ServiceCategory;
    serviceType?: ServiceType;
    routeDays?: string[];
    schoolInfo?: SchoolRouteDetails;
    corporateInfo?: CorporateRouteDetails;
    serviceDate: string;
    serviceTime: string;
    pickupLocation: string;
    destinationLocation: string;
    passengerCount: number;
    returnDate?: string;
    paymentAmount: number;
    paymentTerm: 'De contado' | 'En 1 semana' | 'En 15 días' | 'En 1 mes';
    coordinatorName: string;
    coordinatorPhone: string;
  }) => void;
  updateRequest: (
    requestId: string,
    data: {
      serviceDate?: string;
      serviceTime?: string;
      pickupLocation?: string;
      destinationLocation?: string;
      passengerCount?: number;
      returnDate?: string;
      paymentAmount?: number;
      paymentTerm?: 'De contado' | 'En 1 semana' | 'En 15 días' | 'En 1 mes';
      coordinatorName?: string;
      coordinatorPhone?: string;
      reason?: string;
    }
  ) => { success: boolean; message?: string; isPendingApproval?: boolean };
  respondRequestModification: (
    requestId: string,
    action: 'aceptar' | 'rechazar' | 'cancelar_servicio',
    cancelReason?: string
  ) => { success: boolean; message?: string };
  cancelRequestModification: (requestId: string) => { success: boolean; message?: string };
  deleteRequest: (requestId: string) => { success: boolean; message?: string };
  respondCounterOffer: (requestId: string, counterOfferId: string, action: 'aceptar' | 'rechazar') => void;
  
  // Driver / Owner actions
  acceptRequest: (requestId: string) => { success: boolean; message?: string };
  submitCounterOffer: (requestId: string, proposedAmount: number, note?: string) => { success: boolean; message?: string };
  ignoreRequest: (requestId: string) => void;
  toggleFollowCompany: (companyId: string) => void;
  isFollowingCompany: (companyId: string) => boolean;

  // Vehicle management
  toggleVehicleAvailability: (vehicleId: string) => void;
  registerVehicle: (data: {
    plate: string;
    brand: string;
    modelYear: number;
    type: VehicleType;
    capacity: number;
    affiliatedCompany: string;
    operatingCardNumber: string;
    coverImage: string;
    profileImage: string;
  }) => { success: boolean; message?: string };
  updateVehicle: (vehicleId: string, data: Partial<Vehicle>) => void;
  deleteVehicle: (vehicleId: string) => { success: boolean; message?: string };
  updateOwnerProfile: (ownerId: string, data: Partial<Owner>) => void;
  
  // Driver management (by owner & driver)
  registerDriver: (data: {
    name: string;
    phone: string;
    email?: string;
    identification?: string;
    assignedVehicleId?: string;
    createOwnAccess: boolean;
    username?: string;
    password?: string;
    bio?: string;
    yearsOfExperience?: number;
    city?: string;
    bloodType?: string;
    eps?: string;
    arl?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    licenseCategory?: 'C1' | 'C2' | 'C3';
    licenseNumber?: string;
    licenseExpirationDate?: string;
    profilePhoto?: string;
    coverPhoto?: string;
    cedulaFrontUrl?: string;
    cedulaBackUrl?: string;
    licenseFrontUrl?: string;
    licenseBackUrl?: string;
  }) => { success: boolean; message?: string };
  updateDriverProfile: (driverId: string, updates: Partial<Driver>) => { success: boolean; message?: string };
  assignDriversToVehicle: (
    vehicleId: string,
    primaryDriverId?: string,
    secondaryDriverId?: string
  ) => { success: boolean; message?: string };

  // Driving mode toggle
  startDrivingAsOwner: (vehicleId: string) => void;
  returnToOwnerPanel: () => void;

  // Notifications
  markNotificationsAsRead: (recipientId: string) => void;
  getUnreadNotificationsCount: (recipientId: string) => number;
  
  // Driver feed navigation & filtering
  driverActiveTab: 'disponibles' | 'aceptados' | 'historial' | 'perfil' | 'vehiculo' | 'siguiendo' | 'notificaciones';
  setDriverActiveTab: (tab: 'disponibles' | 'aceptados' | 'historial' | 'perfil' | 'vehiculo' | 'siguiendo' | 'notificaciones') => void;
  driverFeedFilter: 'todos' | 'seguidos';
  setDriverFeedFilter: (filter: 'todos' | 'seguidos') => void;
  goToFollowedServicesFeed: () => void;

  // Subscription management
  updateSubscription: (
    role: 'empresa' | 'propietario',
    targetId: string,
    updates: Partial<SubscriptionInfo>
  ) => void;

  // Real-time Service Status Tracking
  updateServiceTracking: (
    requestId: string,
    isActive: boolean,
    currentStatus?: string,
    proofPhotoUrl?: string
  ) => { success: boolean; message?: string };

  // Reset demo
  resetDataToSeed: () => void;
}

const STORAGE_KEY = 'transporte_especial_co_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or seed
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_companies`);
      return saved ? JSON.parse(saved) : SEED_COMPANIES;
    } catch {
      return SEED_COMPANIES;
    }
  });

  const [companyReviews, setCompanyReviews] = useState<CompanyReview[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_reviews`);
      return saved ? JSON.parse(saved) : SEED_REVIEWS;
    } catch {
      return SEED_REVIEWS;
    }
  });

  const [owners, setOwners] = useState<Owner[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_owners`);
      return saved ? JSON.parse(saved) : SEED_OWNERS;
    } catch {
      return SEED_OWNERS;
    }
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_drivers`);
      return saved ? JSON.parse(saved) : SEED_DRIVERS;
    } catch {
      return SEED_DRIVERS;
    }
  });

  const [coordinators, setCoordinators] = useState<Coordinator[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_coordinators`);
      return saved ? JSON.parse(saved) : SEED_COORDINATORS;
    } catch {
      return SEED_COORDINATORS;
    }
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_vehicles`);
      return saved ? JSON.parse(saved) : SEED_VEHICLES;
    } catch {
      return SEED_VEHICLES;
    }
  });

  const [requests, setRequests] = useState<TransportRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_requests`);
      return saved ? JSON.parse(saved) : SEED_REQUESTS;
    } catch {
      return SEED_REQUESTS;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
      return saved ? JSON.parse(saved) : SEED_NOTIFICATIONS;
    } catch {
      return SEED_NOTIFICATIONS;
    }
  });

  const [followedCompanyIds, setFollowedCompanyIds] = useState<{ [userId: string]: string[] }>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_followed`);
      return saved ? JSON.parse(saved) : { 'drv-1': ['comp-1', 'comp-2'], 'own-1': ['comp-1'] };
    } catch {
      return { 'drv-1': ['comp-1', 'comp-2'], 'own-1': ['comp-1'] };
    }
  });

  // Current session (initially null to show the role selector / welcome screen)
  const [currentSession, setCurrentSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_session`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState<boolean>(!currentSession);

  // Driver navigation and feed filtering state
  const [driverActiveTab, setDriverActiveTab] = useState<
    'disponibles' | 'aceptados' | 'historial' | 'vehiculo' | 'siguiendo' | 'notificaciones'
  >('disponibles');
  const [driverFeedFilter, setDriverFeedFilter] = useState<'todos' | 'seguidos'>('seguidos');

  const goToFollowedServicesFeed = () => {
    // If no active session or role is not conductor, switch to driver (Julián) so user sees followed services immediately
    if (!currentSession || currentSession.role !== 'conductor') {
      quickSwitchUser('conductor');
    }
    setIsRoleSelectorOpen(false);
    setDriverActiveTab('disponibles');
    setDriverFeedFilter('seguidos');
  };

  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    role: 'empresa' | 'propietario_conductor' | null;
    initialMode: 'login' | 'register';
  }>({
    isOpen: false,
    role: null,
    initialMode: 'login',
  });

  const [selectedCompanyModalId, setSelectedCompanyModalId] = useState<string | null>(null);

  const openCompanyModal = (companyId: string) => {
    setSelectedCompanyModalId(companyId);
  };

  const closeCompanyModal = () => {
    setSelectedCompanyModalId(null);
  };

  const [selectedVehicleModalId, setSelectedVehicleModalId] = useState<string | null>(null);
  const [selectedVehicleRequestingCompanyId, setSelectedVehicleRequestingCompanyId] = useState<string | null>(null);

  const openVehicleModal = (vehicleIdOrPlate: string, requestingCompanyId?: string) => {
    // If passed a plate instead of ID, resolve it
    const found = vehicles.find((v) => v.id === vehicleIdOrPlate || v.plate.toUpperCase() === vehicleIdOrPlate.toUpperCase());
    setSelectedVehicleModalId(found ? found.id : vehicleIdOrPlate);
    if (requestingCompanyId) {
      setSelectedVehicleRequestingCompanyId(requestingCompanyId);
    } else if (currentSession?.role === 'empresa') {
      setSelectedVehicleRequestingCompanyId(currentSession.userId);
    } else {
      setSelectedVehicleRequestingCompanyId(null);
    }
  };

  const closeVehicleModal = () => {
    setSelectedVehicleModalId(null);
    setSelectedVehicleRequestingCompanyId(null);
  };

  const [selectedDriverModalId, setSelectedDriverModalId] = useState<string | null>(null);
  const [selectedDriverRequestingCompanyId, setSelectedDriverRequestingCompanyId] = useState<string | null>(null);

  const openDriverModal = (driverId: string, requestingCompanyId?: string) => {
    setSelectedDriverModalId(driverId);
    if (requestingCompanyId) {
      setSelectedDriverRequestingCompanyId(requestingCompanyId);
    } else if (currentSession?.role === 'empresa') {
      setSelectedDriverRequestingCompanyId(currentSession.userId);
    } else {
      setSelectedDriverRequestingCompanyId(null);
    }
  };

  const closeDriverModal = () => {
    setSelectedDriverModalId(null);
    setSelectedDriverRequestingCompanyId(null);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_companies`, JSON.stringify(companies));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [companies]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_reviews`, JSON.stringify(companyReviews));
    } catch (e) {
      console.warn('LocalStorage save error for reviews:', e);
    }
  }, [companyReviews]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_owners`, JSON.stringify(owners));
    } catch (e) {
      console.warn(e);
    }
  }, [owners]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_drivers`, JSON.stringify(drivers));
    } catch (e) {
      console.warn(e);
    }
  }, [drivers]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_vehicles`, JSON.stringify(vehicles));
    } catch (e) {
      console.warn(e);
    }
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_requests`, JSON.stringify(requests));
    } catch (e) {
      console.warn(e);
    }
  }, [requests]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
    } catch (e) {
      console.warn(e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_followed`, JSON.stringify(followedCompanyIds));
    } catch (e) {
      console.warn(e);
    }
  }, [followedCompanyIds]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_coordinators`, JSON.stringify(coordinators));
    } catch (e) {
      console.warn(e);
    }
  }, [coordinators]);

  useEffect(() => {
    try {
      if (currentSession) {
        localStorage.setItem(`${STORAGE_KEY}_session`, JSON.stringify(currentSession));
      } else {
        localStorage.removeItem(`${STORAGE_KEY}_session`);
      }
    } catch (e) {
      console.warn(e);
    }
  }, [currentSession]);

  const openAuthModal = (role: 'empresa' | 'propietario_conductor' | 'coordinador', mode: 'login' | 'register' = 'login') => {
    setAuthModal({
      isOpen: true,
      role,
      initialMode: mode,
    });
  };

  const closeAuthModal = () => {
    setAuthModal({
      isOpen: false,
      role: null,
      initialMode: 'login',
    });
  };

  // Auth: Company login
  const loginCompany = (nit: string, password?: string): { success: boolean; message?: string } => {
    const cleanNit = nit.trim().replace(/\s+/g, '');
    const found = companies.find(
      (c) => c.nit.replace(/[^0-9kK]/g, '') === cleanNit.replace(/[^0-9kK]/g, '')
    );

    if (!found) {
      return { success: false, message: 'NIT no encontrado. Verifica el número o crea una cuenta.' };
    }

    if (found.password && password && found.password !== password) {
      return { success: false, message: 'Contraseña incorrecta.' };
    }

    const session: UserSession = {
      role: 'empresa',
      userId: found.id,
      name: found.name,
      identifier: found.nit,
      phone: found.phone,
    };
    setCurrentSession(session);
    setIsRoleSelectorOpen(false);
    closeAuthModal();
    return { success: true };
  };

  // Auth: Company register
  const registerCompany = (data: {
    nit: string;
    name: string;
    phone: string;
    email: string;
    city: string;
    password?: string;
  }): { success: boolean; message?: string } => {
    const cleanNit = data.nit.trim();
    if (!cleanNit || !data.name.trim()) {
      return { success: false, message: 'El NIT y el Nombre de la Empresa son obligatorios.' };
    }

    const exists = companies.some(
      (c) => c.nit.replace(/[^0-9kK]/g, '') === cleanNit.replace(/[^0-9kK]/g, '')
    );
    if (exists) {
      return { success: false, message: 'Ya existe una empresa registrada con este NIT. Inicia sesión.' };
    }

    const newCompany: Company = {
      id: `comp-${Date.now()}`,
      nit: cleanNit,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      city: data.city.trim() || 'Bogotá D.C.',
      password: data.password || '123',
    };

    setCompanies((prev) => [newCompany, ...prev]);

    const session: UserSession = {
      role: 'empresa',
      userId: newCompany.id,
      name: newCompany.name,
      identifier: newCompany.nit,
      phone: newCompany.phone,
    };
    setCurrentSession(session);
    setIsRoleSelectorOpen(false);
    closeAuthModal();
    return { success: true };
  };

  // Auth: Unified (Owner, Driver or Coordinator)
  const loginUnified = (
    usernameInput: string,
    password?: string
  ): { success: boolean; role?: 'propietario' | 'conductor' | 'coordinador'; message?: string } => {
    const cleanUser = usernameInput.trim().toLowerCase();

    // 1. Check if it is an owner
    const ownerFound = owners.find((o) => o.username.toLowerCase() === cleanUser);
    if (ownerFound) {
      if (ownerFound.password && password && ownerFound.password !== password) {
        return { success: false, message: 'Contraseña incorrecta.' };
      }
      const session: UserSession = {
        role: 'propietario',
        userId: ownerFound.id,
        name: ownerFound.name,
        identifier: ownerFound.username,
        phone: ownerFound.phone,
      };
      setCurrentSession(session);
      setIsRoleSelectorOpen(false);
      closeAuthModal();
      return { success: true, role: 'propietario' };
    }

    // 2. Check if it is a driver with own access
    const driverFound = drivers.find(
      (d) => d.hasOwnAccess && d.username && d.username.toLowerCase() === cleanUser
    );
    if (driverFound) {
      if (driverFound.password && password && driverFound.password !== password) {
        return { success: false, message: 'Contraseña incorrecta.' };
      }

      // Find vehicle assigned
      const assignedVehicle = vehicles.find((v) => v.id === driverFound.assignedVehicleId);

      const session: UserSession = {
        role: 'conductor',
        userId: driverFound.id,
        name: driverFound.name,
        identifier: driverFound.username || driverFound.name,
        phone: driverFound.phone,
        assignedVehicleId: driverFound.assignedVehicleId,
        assignedPlate: assignedVehicle?.plate || driverFound.assignedVehiclePlate,
      };
      setCurrentSession(session);
      setIsRoleSelectorOpen(false);
      closeAuthModal();
      return { success: true, role: 'conductor' };
    }

    // 3. Check if it is an authorized company coordinator
    const coordinatorFound = coordinators.find(
      (coord) => coord.isActive && coord.username.toLowerCase() === cleanUser
    );
    if (coordinatorFound) {
      if (coordinatorFound.password && password && coordinatorFound.password !== password) {
        return { success: false, message: 'Contraseña de coordinador incorrecta.' };
      }

      const session: UserSession = {
        role: 'coordinador',
        userId: coordinatorFound.id,
        name: coordinatorFound.name,
        identifier: coordinatorFound.username,
        phone: coordinatorFound.phone,
        email: coordinatorFound.email,
        companyId: coordinatorFound.companyId,
        companyName: coordinatorFound.companyName,
        companyNit: coordinatorFound.companyNit,
        coordinatorZone: coordinatorFound.assignedZone,
      };
      setCurrentSession(session);
      setIsRoleSelectorOpen(false);
      closeAuthModal();
      return { success: true, role: 'coordinador' };
    }

    return {
      success: false,
      message: 'Usuario no encontrado. Verifica tu usuario de propietario, conductor o coordinador autorizado.',
    };
  };

  // Auth: Direct Coordinator login
  const loginCoordinator = (
    usernameInput: string,
    password?: string
  ): { success: boolean; message?: string } => {
    const cleanUser = usernameInput.trim().toLowerCase();
    const coord = coordinators.find((c) => c.username.toLowerCase() === cleanUser);

    if (!coord) {
      return {
        success: false,
        message: 'Usuario de coordinador no encontrado. Solicita a la empresa de transporte tu acceso.',
      };
    }

    if (!coord.isActive) {
      return {
        success: false,
        message: 'Este acceso de coordinador se encuentra temporalmente desactivado por la empresa.',
      };
    }

    if (coord.password && password && coord.password !== password) {
      return { success: false, message: 'Contraseña incorrecta.' };
    }

    const session: UserSession = {
      role: 'coordinador',
      userId: coord.id,
      name: coord.name,
      identifier: coord.username,
      phone: coord.phone,
      email: coord.email,
      companyId: coord.companyId,
      companyName: coord.companyName,
      companyNit: coord.companyNit,
      coordinatorZone: coord.assignedZone,
    };
    setCurrentSession(session);
    setIsRoleSelectorOpen(false);
    closeAuthModal();
    return { success: true };
  };

  // Coordinator CRUD management by Companies
  const registerCoordinator = (data: {
    companyId?: string;
    name: string;
    phone: string;
    email: string;
    username: string;
    password?: string;
    assignedZone?: string;
    notes?: string;
  }): { success: boolean; message?: string; coordinator?: Coordinator } => {
    const targetCompanyId = data.companyId || (currentSession?.role === 'empresa' ? currentSession.userId : companies[0].id);
    const targetCompany = companies.find((c) => c.id === targetCompanyId);

    if (!targetCompany) {
      return { success: false, message: 'Empresa no encontrada para asociar al coordinador.' };
    }

    const cleanUser = data.username.trim().toLowerCase();
    if (!cleanUser || !data.name.trim() || !data.phone.trim()) {
      return { success: false, message: 'El nombre, teléfono y usuario de acceso son obligatorios.' };
    }

    const exists = coordinators.some((c) => c.username.toLowerCase() === cleanUser);
    if (exists) {
      return { success: false, message: 'Ese nombre de usuario ya está asignado a otro coordinador. Elige uno diferente.' };
    }

    const newCoord: Coordinator = {
      id: `coord-${Date.now()}`,
      companyId: targetCompany.id,
      companyName: targetCompany.name,
      companyNit: targetCompany.nit,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      username: cleanUser,
      password: data.password || '123',
      assignedZone: data.assignedZone?.trim() || 'Coordinación General',
      notes: data.notes?.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setCoordinators((prev) => [newCoord, ...prev]);

    return { success: true, message: `Coordinador ${newCoord.name} registrado y autorizado exitosamente.`, coordinator: newCoord };
  };

  const updateCoordinator = (coordinatorId: string, updates: Partial<Coordinator>): { success: boolean; message?: string } => {
    setCoordinators((prev) =>
      prev.map((c) => (c.id === coordinatorId ? { ...c, ...updates } : c))
    );
    return { success: true, message: 'Datos del coordinador actualizados correctamente.' };
  };

  const deleteCoordinator = (coordinatorId: string): { success: boolean; message?: string } => {
    setCoordinators((prev) => prev.filter((c) => c.id !== coordinatorId));
    return { success: true, message: 'Acceso de coordinador eliminado.' };
  };

  const toggleCoordinatorStatus = (coordinatorId: string) => {
    setCoordinators((prev) =>
      prev.map((c) => (c.id === coordinatorId ? { ...c, isActive: !c.isActive } : c))
    );
  };

  // Auth: Register Owner
  const registerOwner = (data: {
    name: string;
    phone: string;
    username: string;
    password?: string;
    identification: string;
  }): { success: boolean; message?: string } => {
    const cleanUser = data.username.trim().toLowerCase();
    if (!cleanUser || !data.name.trim()) {
      return { success: false, message: 'El nombre y el usuario son obligatorios.' };
    }

    const existsInOwners = owners.some((o) => o.username.toLowerCase() === cleanUser);
    const existsInDrivers = drivers.some((d) => d.username?.toLowerCase() === cleanUser);

    if (existsInOwners || existsInDrivers) {
      return { success: false, message: 'Ese nombre de usuario ya está en uso. Elige otro.' };
    }

    const newOwner: Owner = {
      id: `own-${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      username: cleanUser,
      password: data.password || '123',
      identification: data.identification.trim(),
    };

    setOwners((prev) => [newOwner, ...prev]);

    const session: UserSession = {
      role: 'propietario',
      userId: newOwner.id,
      name: newOwner.name,
      identifier: newOwner.username,
      phone: newOwner.phone,
    };
    setCurrentSession(session);
    setIsRoleSelectorOpen(false);
    closeAuthModal();
    return { success: true };
  };

  const resetUserPassword = (
    role: 'empresa' | 'propietario_conductor' | 'coordinador',
    identifier: string,
    newPassword?: string
  ): { success: boolean; message?: string; email?: string; matchedRole?: 'propietario' | 'conductor' } => {
    const cleanId = identifier.trim().toLowerCase();
    
    if (role === 'empresa') {
      const cleanNit = cleanId.replace(/\s+/g, '');
      const found = companies.find(
        (c) => c.nit.replace(/[^0-9kK]/g, '') === cleanNit.replace(/[^0-9kK]/g, '') || c.email.toLowerCase() === cleanId
      );
      if (!found) {
        return { success: false, message: 'No se encontró ninguna empresa con ese NIT o Correo Electrónico.' };
      }
      if (newPassword) {
        setCompanies((prev) =>
          prev.map((c) => (c.id === found.id ? { ...c, password: newPassword } : c))
        );
      }
      return { success: true, email: found.email || 'operaciones@transportal.com.co' };
    }
    
    if (role === 'coordinador') {
      const found = coordinators.find(
        (c) => c.username.toLowerCase() === cleanId || c.email.toLowerCase() === cleanId
      );
      if (!found) {
        return { success: false, message: 'No se encontró ningún coordinador con ese Usuario o Correo Electrónico.' };
      }
      if (newPassword) {
        setCoordinators((prev) =>
          prev.map((c) => (c.id === found.id ? { ...c, password: newPassword } : c))
        );
      }
      return { success: true, email: found.email || 'coordinacion@transportal.com.co' };
    }

    if (role === 'propietario_conductor') {
      // Try driver first
      const drvFound = drivers.find(
        (d) => d.username?.toLowerCase() === cleanId || d.email?.toLowerCase() === cleanId
      );
      if (drvFound) {
        if (newPassword) {
          setDrivers((prev) =>
            prev.map((d) => (d.id === drvFound.id ? { ...d, password: newPassword } : d))
          );
        }
        return { success: true, email: drvFound.email || 'conductor@transportal.com.co', matchedRole: 'conductor' };
      }

      // Try owner next
      const ownFound = owners.find(
        (o) => o.username.toLowerCase() === cleanId || o.email?.toLowerCase() === cleanId
      );
      if (ownFound) {
        if (newPassword) {
          setOwners((prev) =>
            prev.map((o) => (o.id === ownFound.id ? { ...o, password: newPassword } : o))
          );
        }
        return { success: true, email: ownFound.email || 'propietario@transportal.com.co', matchedRole: 'propietario' };
      }

      return { success: false, message: 'No se encontró ningún propietario o conductor con ese Usuario o Correo Electrónico.' };
    }

    return { success: false, message: 'Rol inválido.' };
  };

  const logout = () => {
    setCurrentSession(null);
    setIsRoleSelectorOpen(true);
  };

  // Quick switch between demo roles for convenience
  const quickSwitchUser = (role: 'empresa' | 'propietario' | 'conductor' | 'coordinador', id?: string) => {
    if (role === 'empresa') {
      const comp = id ? companies.find((c) => c.id === id) || companies[0] : companies[0];
      if (comp) {
        setCurrentSession({
          role: 'empresa',
          userId: comp.id,
          name: comp.name,
          identifier: comp.nit,
          phone: comp.phone,
        });
        setIsRoleSelectorOpen(false);
      }
    } else if (role === 'coordinador') {
      const coord = id ? coordinators.find((c) => c.id === id) || coordinators[0] : coordinators[0];
      if (coord) {
        setCurrentSession({
          role: 'coordinador',
          userId: coord.id,
          name: coord.name,
          identifier: coord.username,
          phone: coord.phone,
          email: coord.email,
          companyId: coord.companyId,
          companyName: coord.companyName,
          companyNit: coord.companyNit,
          coordinatorZone: coord.assignedZone,
        });
        setIsRoleSelectorOpen(false);
      }
    } else if (role === 'propietario') {
      const own = id ? owners.find((o) => o.id === id) || owners[0] : owners[0];
      if (own) {
        setCurrentSession({
          role: 'propietario',
          userId: own.id,
          name: own.name,
          identifier: own.username,
          phone: own.phone,
        });
        setIsRoleSelectorOpen(false);
      }
    } else if (role === 'conductor') {
      const drv = id ? drivers.find((d) => d.id === id) || drivers[0] : drivers[0];
      if (drv) {
        const veh = vehicles.find((v) => v.id === drv.assignedVehicleId);
        setCurrentSession({
          role: 'conductor',
          userId: drv.id,
          name: drv.name,
          identifier: drv.username || drv.name,
          phone: drv.phone,
          assignedVehicleId: drv.assignedVehicleId,
          assignedPlate: veh?.plate || drv.assignedVehiclePlate,
        });
        setIsRoleSelectorOpen(false);
      }
    }
  };

  // Company or Coordinator: Publish new request
  const publishRequest = (data: {
    serviceCategory?: ServiceCategory;
    serviceType?: ServiceType;
    routeDays?: string[];
    schoolInfo?: SchoolRouteDetails;
    corporateInfo?: CorporateRouteDetails;
    serviceDate: string;
    serviceTime: string;
    pickupLocation: string;
    destinationLocation: string;
    passengerCount: number;
    returnDate?: string;
    paymentAmount: number;
    paymentTerm: 'De contado' | 'En 1 semana' | 'En 15 días' | 'En 1 mes';
    coordinatorName: string;
    coordinatorPhone: string;
  }) => {
    if (!currentSession || (currentSession.role !== 'empresa' && currentSession.role !== 'coordinador')) return;

    let targetCompanyId = currentSession.userId;
    let targetCompanyName = currentSession.name;
    let targetCompanyNit = currentSession.identifier;

    if (currentSession.role === 'coordinador') {
      targetCompanyId = currentSession.companyId || companies[0].id;
      targetCompanyName = currentSession.companyName || companies[0].name;
      targetCompanyNit = currentSession.companyNit || companies[0].nit;
    } else {
      const comp = companies.find((c) => c.id === currentSession.userId);
      if (comp) {
        targetCompanyName = comp.name;
        targetCompanyNit = comp.nit;
      }
    }

    const newReqId = `req-${Date.now()}`;

    const newReq: TransportRequest = {
      id: newReqId,
      companyId: targetCompanyId,
      companyName: targetCompanyName,
      companyNit: targetCompanyNit,
      serviceCategory: data.serviceCategory || 'ocasional',
      serviceType: data.serviceType || 'turismo_expreso',
      routeDays: data.routeDays,
      schoolInfo: data.schoolInfo,
      corporateInfo: data.corporateInfo,
      createdByCoordinatorId: currentSession.role === 'coordinador' ? currentSession.userId : undefined,
      createdByCoordinatorName: currentSession.role === 'coordinador' ? currentSession.name : undefined,
      createdByRole: currentSession.role === 'coordinador' ? 'coordinador' : 'empresa',
      serviceDate: data.serviceDate,
      serviceTime: data.serviceTime,
      pickupLocation: data.pickupLocation,
      destinationLocation: data.destinationLocation,
      passengerCount: Number(data.passengerCount),
      returnDate: data.returnDate,
      paymentAmount: Number(data.paymentAmount),
      paymentTerm: data.paymentTerm,
      coordinatorName: data.coordinatorName || (currentSession.role === 'coordinador' ? currentSession.name : data.coordinatorName),
      coordinatorPhone: data.coordinatorPhone || (currentSession.role === 'coordinador' ? (currentSession.phone || '') : data.coordinatorPhone),
      status: 'disponible',
      createdAt: new Date().toISOString(),
      counterOffers: [],
      ignoredByDriverIds: [],
    };

    // Prepend to requests list (newest first)
    setRequests((prev) => [newReq, ...prev]);

    // Send notification to all drivers/owners who follow this company
    const newNotifs: AppNotification[] = [];
    Object.entries(followedCompanyIds).forEach(([followerId, followedList]) => {
      const list = Array.isArray(followedList) ? followedList : [];
      if (list.includes(currentSession.userId)) {
        newNotifs.push({
          id: `notif-${Date.now()}-${followerId}`,
          recipientType: 'conductor',
          recipientId: followerId,
          title: `Nuevo servicio publicado por ${newReq.companyName}`,
          message: `Ruta: ${newReq.pickupLocation} ➔ ${newReq.destinationLocation} (${newReq.passengerCount} pas.) por $ ${new Intl.NumberFormat('es-CO').format(newReq.paymentAmount)} COP.`,
          date: new Date().toISOString(),
          isRead: false,
          relatedRequestId: newReqId,
          type: 'new_service',
        });
      }
    });

    if (newNotifs.length > 0) {
      setNotifications((prev) => [...newNotifs, ...prev]);
    }
  };

  // Company: Update an existing request (requires mutual agreement if accepted)
  const updateRequest = (
    requestId: string,
    data: {
      serviceDate?: string;
      serviceTime?: string;
      pickupLocation?: string;
      destinationLocation?: string;
      passengerCount?: number;
      returnDate?: string;
      paymentAmount?: number;
      paymentTerm?: 'De contado' | 'En 1 semana' | 'En 15 días' | 'En 1 mes';
      coordinatorName?: string;
      coordinatorPhone?: string;
      reason?: string;
    }
  ): { success: boolean; message?: string; isPendingApproval?: boolean } => {
    if (!currentSession || (currentSession.role !== 'empresa' && currentSession.role !== 'coordinador')) {
      return { success: false, message: 'Solo las empresas o sus coordinadores pueden editar solicitudes.' };
    }

    const req = requests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, message: 'Solicitud no encontrada.' };
    }

    const authorizedCompanyId = currentSession.role === 'empresa' ? currentSession.userId : currentSession.companyId;
    if (req.companyId !== authorizedCompanyId) {
      return { success: false, message: 'No tienes permiso para editar esta solicitud.' };
    }

    // SI EL SERVICIO ESTÁ DISPONIBLE: Se puede modificar directamente
    if (req.status === 'disponible') {
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          return {
            ...r,
            serviceDate: data.serviceDate !== undefined ? data.serviceDate : r.serviceDate,
            serviceTime: data.serviceTime !== undefined ? data.serviceTime : r.serviceTime,
            pickupLocation: data.pickupLocation !== undefined ? data.pickupLocation : r.pickupLocation,
            destinationLocation: data.destinationLocation !== undefined ? data.destinationLocation : r.destinationLocation,
            passengerCount: data.passengerCount !== undefined ? Number(data.passengerCount) : r.passengerCount,
            returnDate: data.returnDate !== undefined ? data.returnDate : r.returnDate,
            paymentAmount: data.paymentAmount !== undefined ? Number(data.paymentAmount) : r.paymentAmount,
            paymentTerm: data.paymentTerm !== undefined ? data.paymentTerm : r.paymentTerm,
            coordinatorName: data.coordinatorName !== undefined ? data.coordinatorName : r.coordinatorName,
            coordinatorPhone: data.coordinatorPhone !== undefined ? data.coordinatorPhone : r.coordinatorPhone,
          };
        })
      );

      return { success: true, isPendingApproval: false, message: 'Solicitud actualizada exitosamente.' };
    }

    // SI EL SERVICIO YA FUE ACEPTADO:
    // "DESPUES DE ACEPTADO EL SERVICIO NO PUEDE SER MODIFICADO A MENOS QUE SEA ACEPTADO POR LAS DOS PARTES"
    if (req.status === 'aceptada') {
      if (req.pendingModification && req.pendingModification.status === 'pendiente') {
        return {
          success: false,
          message:
            'Ya tienes una propuesta de modificación pendiente de respuesta por parte del conductor. Debes esperar su decisión o cancelar la propuesta actual antes de enviar otra.',
        };
      }

      const currentAgreed = req.acceptedBy?.agreedAmount || req.paymentAmount;
      const hasDateChange = data.serviceDate && data.serviceDate !== req.serviceDate;
      const hasTimeChange = data.serviceTime && data.serviceTime !== req.serviceTime;
      const hasPickupChange = data.pickupLocation && data.pickupLocation !== req.pickupLocation;
      const hasDestChange = data.destinationLocation && data.destinationLocation !== req.destinationLocation;
      const hasPaxChange = data.passengerCount !== undefined && Number(data.passengerCount) !== req.passengerCount;
      const hasReturnChange = data.returnDate !== undefined && data.returnDate !== (req.returnDate || '');
      const hasAmountChange = data.paymentAmount !== undefined && Number(data.paymentAmount) !== currentAgreed;
      const hasTermChange = data.paymentTerm && data.paymentTerm !== req.paymentTerm;
      const hasCoordNameChange = data.coordinatorName && data.coordinatorName !== req.coordinatorName;
      const hasCoordPhoneChange = data.coordinatorPhone && data.coordinatorPhone !== req.coordinatorPhone;

      const anyChange =
        hasDateChange ||
        hasTimeChange ||
        hasPickupChange ||
        hasDestChange ||
        hasPaxChange ||
        hasReturnChange ||
        hasAmountChange ||
        hasTermChange ||
        hasCoordNameChange ||
        hasCoordPhoneChange;

      if (!anyChange) {
        return { success: false, message: 'No modificaste ningún dato del servicio.' };
      }

      const proposal: ServiceModificationProposal = {
        id: `mod-${Date.now()}`,
        requestedAt: new Date().toISOString(),
        requestedByRole: 'empresa',
        requestedByName: currentSession.name,
        reason: data.reason?.trim() || undefined,
        proposedChanges: {
          serviceDate: data.serviceDate,
          serviceTime: data.serviceTime,
          pickupLocation: data.pickupLocation,
          destinationLocation: data.destinationLocation,
          passengerCount: data.passengerCount ? Number(data.passengerCount) : undefined,
          returnDate: data.returnDate,
          paymentAmount: data.paymentAmount ? Number(data.paymentAmount) : undefined,
          paymentTerm: data.paymentTerm,
          coordinatorName: data.coordinatorName,
          coordinatorPhone: data.coordinatorPhone,
        },
        previousValues: {
          serviceDate: req.serviceDate,
          serviceTime: req.serviceTime,
          pickupLocation: req.pickupLocation,
          destinationLocation: req.destinationLocation,
          passengerCount: req.passengerCount,
          returnDate: req.returnDate,
          paymentAmount: currentAgreed,
          paymentTerm: req.paymentTerm,
          coordinatorName: req.coordinatorName,
          coordinatorPhone: req.coordinatorPhone,
        },
        status: 'pendiente',
      };

      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          return {
            ...r,
            pendingModification: proposal,
          };
        })
      );

      // Notificar al conductor asignado
      if (req.acceptedBy) {
        const notif: AppNotification = {
          id: `notif-${Date.now()}`,
          recipientType: 'conductor',
          recipientId: req.acceptedBy.driverId,
          title: '⚠️ Solicitud de Modificación de Servicio',
          message: `La empresa ${req.companyName} ha propuesto cambios para el viaje ${req.pickupLocation} ➔ ${req.destinationLocation}. Debido a que el servicio ya fue aceptado, los cambios solo tendrán validez si los apruebas. Revisa la propuesta en tus servicios aceptados.`,
          date: new Date().toISOString(),
          isRead: false,
          relatedRequestId: req.id,
          type: 'modification_request',
        };
        setNotifications((prev) => [notif, ...prev]);
      }

      return {
        success: true,
        isPendingApproval: true,
        message:
          'Propuesta de modificación enviada al conductor. De acuerdo con las normas, los cambios solo se aplicarán cuando el conductor los apruebe.',
      };
    }

    return { success: false, message: 'No se puede modificar una solicitud en este estado.' };
  };

  // Driver/Owner: Respond to modification proposal
  const respondRequestModification = (
    requestId: string,
    action: 'aceptar' | 'rechazar' | 'cancelar_servicio',
    cancelReason?: string
  ): { success: boolean; message?: string } => {
    if (!currentSession) {
      return { success: false, message: 'Debes iniciar sesión.' };
    }

    const req = requests.find((r) => r.id === requestId);
    if (!req || !req.pendingModification || req.pendingModification.status !== 'pendiente') {
      return { success: false, message: 'No hay ninguna modificación pendiente para este servicio.' };
    }

    const isAssignedDriver =
      req.acceptedBy &&
      (req.acceptedBy.driverId === currentSession.userId ||
        req.acceptedBy.driverName === currentSession.name);

    if (!isAssignedDriver) {
      return { success: false, message: 'Solo el conductor asignado al servicio puede responder a esta propuesta.' };
    }

    const mod = req.pendingModification;
    const p = mod.proposedChanges;

    if (action === 'aceptar') {
      const resolvedProposal: ServiceModificationProposal = {
        ...mod,
        status: 'aceptada',
      };

      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          const updatedAcceptedBy = r.acceptedBy
            ? {
                ...r.acceptedBy,
                agreedAmount: p.paymentAmount !== undefined ? p.paymentAmount : r.acceptedBy.agreedAmount,
              }
            : undefined;

          return {
            ...r,
            serviceDate: p.serviceDate !== undefined ? p.serviceDate : r.serviceDate,
            serviceTime: p.serviceTime !== undefined ? p.serviceTime : r.serviceTime,
            pickupLocation: p.pickupLocation !== undefined ? p.pickupLocation : r.pickupLocation,
            destinationLocation: p.destinationLocation !== undefined ? p.destinationLocation : r.destinationLocation,
            passengerCount: p.passengerCount !== undefined ? p.passengerCount : r.passengerCount,
            returnDate: p.returnDate !== undefined ? p.returnDate : r.returnDate,
            paymentAmount: p.paymentAmount !== undefined ? p.paymentAmount : r.paymentAmount,
            paymentTerm: p.paymentTerm !== undefined ? p.paymentTerm : r.paymentTerm,
            coordinatorName: p.coordinatorName !== undefined ? p.coordinatorName : r.coordinatorName,
            coordinatorPhone: p.coordinatorPhone !== undefined ? p.coordinatorPhone : r.coordinatorPhone,
            acceptedBy: updatedAcceptedBy,
            pendingModification: undefined,
            modificationHistory: [...(r.modificationHistory || []), resolvedProposal],
          };
        })
      );

      // Notificar a la empresa
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        recipientType: 'empresa',
        recipientId: req.companyId,
        title: '✅ Modificación Aceptada por el Conductor',
        message: `El conductor ${req.acceptedBy?.driverName} (Placa ${req.acceptedBy?.vehiclePlate}) ha ACEPTADO las modificaciones del servicio ${req.pickupLocation} ➔ ${req.destinationLocation}. Los nuevos términos han entrado en vigor.`,
        date: new Date().toISOString(),
        isRead: false,
        relatedRequestId: req.id,
        type: 'modification_response',
      };
      setNotifications((prev) => [notif, ...prev]);

      return {
        success: true,
        message: '¡Has aceptado las modificaciones! El servicio ha sido actualizado de mutuo acuerdo.',
      };
    } else if (action === 'cancelar_servicio') {
      const reasonText = cancelReason?.trim() || 'Incompatibilidad con los nuevos términos y condiciones propuestos por la empresa contratante.';
      const resolvedProposal: ServiceModificationProposal = {
        ...mod,
        status: 'cancelada_por_conductor',
      };

      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          return {
            ...r,
            status: 'cancelada' as const,
            cancellationReason: `Cancelado por el conductor tras recibir propuesta de modificación: ${reasonText}`,
            cancelledBy: currentSession.name,
            pendingModification: undefined,
            modificationHistory: [...(r.modificationHistory || []), resolvedProposal],
          };
        })
      );

      // Notificar a la empresa
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        recipientType: 'empresa',
        recipientId: req.companyId,
        title: '🚨 Servicio Cancelado por la Contraparte',
        message: `El conductor ${req.acceptedBy?.driverName} (Placa ${req.acceptedBy?.vehiclePlate}) ha CANCELADO el servicio ${req.pickupLocation} ➔ ${req.destinationLocation} tras recibir la propuesta de modificación. Motivo: ${reasonText}`,
        date: new Date().toISOString(),
        isRead: false,
        relatedRequestId: req.id,
        type: 'modification_response',
      };
      setNotifications((prev) => [notif, ...prev]);

      return {
        success: true,
        message: 'Has cancelado el servicio debido a la propuesta de modificación. La empresa ha sido notificada de inmediato.',
      };
    } else {
      const resolvedProposal: ServiceModificationProposal = {
        ...mod,
        status: 'rechazada',
      };

      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          return {
            ...r,
            pendingModification: undefined,
            modificationHistory: [...(r.modificationHistory || []), resolvedProposal],
          };
        })
      );

      // Notificar a la empresa
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        recipientType: 'empresa',
        recipientId: req.companyId,
        title: '❌ Modificación Rechazada por el Conductor',
        message: `El conductor ${req.acceptedBy?.driverName} (Placa ${req.acceptedBy?.vehiclePlate}) ha RECHAZADO la propuesta de modificación para el servicio ${req.pickupLocation} ➔ ${req.destinationLocation}. El servicio se mantendrá bajo los términos pactados originalmente.`,
        date: new Date().toISOString(),
        isRead: false,
        relatedRequestId: req.id,
        type: 'modification_response',
      };
      setNotifications((prev) => [notif, ...prev]);

      return {
        success: true,
        message: 'Has rechazado la propuesta de modificación. El servicio se mantendrá bajo los términos pactados originalmente.',
      };
    }
  };

  // Company or Coordinator: Cancel a pending modification proposal
  const cancelRequestModification = (requestId: string): { success: boolean; message?: string } => {
    if (!currentSession || (currentSession.role !== 'empresa' && currentSession.role !== 'coordinador')) {
      return { success: false, message: 'Solo la empresa o su coordinador pueden cancelar esta propuesta.' };
    }

    const req = requests.find((r) => r.id === requestId);
    if (!req || !req.pendingModification || req.pendingModification.status !== 'pendiente') {
      return { success: false, message: 'No hay ninguna propuesta de modificación activa para cancelar.' };
    }

    const authorizedCompanyId = currentSession.role === 'empresa' ? currentSession.userId : currentSession.companyId;
    if (req.companyId !== authorizedCompanyId) {
      return { success: false, message: 'No tienes permiso para cancelar esta propuesta.' };
    }

    const cancelledProposal: ServiceModificationProposal = {
      ...req.pendingModification,
      status: 'cancelada',
    };

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          pendingModification: undefined,
          modificationHistory: [...(r.modificationHistory || []), cancelledProposal],
        };
      })
    );

    return { success: true, message: 'La propuesta de modificación ha sido cancelada.' };
  };

  // Company or Coordinator: Delete / Cancel a request
  const deleteRequest = (requestId: string): { success: boolean; message?: string } => {
    if (!currentSession || (currentSession.role !== 'empresa' && currentSession.role !== 'coordinador')) {
      return { success: false, message: 'Solo las empresas o sus coordinadores pueden eliminar solicitudes.' };
    }

    const req = requests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, message: 'Solicitud no encontrada.' };
    }

    const authorizedCompanyId = currentSession.role === 'empresa' ? currentSession.userId : currentSession.companyId;
    if (req.companyId !== authorizedCompanyId) {
      return { success: false, message: 'No tienes permiso para eliminar esta solicitud.' };
    }

    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    return { success: true };
  };

  // Driver: Accept a request directly
  const acceptRequest = (requestId: string): { success: boolean; message?: string } => {
    if (!currentSession) return { success: false, message: 'Debes iniciar sesión.' };

    const req = requests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Solicitud no encontrada.' };
    if (req.status === 'aceptada') return { success: false, message: 'Esta solicitud ya fue aceptada por otro conductor.' };

    // Get vehicle for this driver
    let vehicle = vehicles.find((v) => v.id === currentSession.assignedVehicleId);
    if (!vehicle && currentSession.isOwnerActingAsDriver) {
      vehicle = vehicles.find((v) => v.ownerId === currentSession.originalOwnerId);
    }
    if (!vehicle) {
      // Fallback to first available vehicle or mock profile
      vehicle = vehicles[0];
    }

    const acceptedAt = new Date().toISOString();
    const updatedRequest: TransportRequest = {
      ...req,
      status: 'aceptada',
      acceptedBy: {
        driverId: currentSession.userId,
        driverName: currentSession.name,
        driverPhone: currentSession.phone || '3100000000',
        vehiclePlate: vehicle ? vehicle.plate : (currentSession.assignedPlate || 'WEO-412'),
        vehicleBrand: vehicle ? vehicle.brand : 'Vehículo Especial',
        vehicleModel: vehicle ? vehicle.modelYear : 2023,
        vehicleType: vehicle ? vehicle.type : 'Buseta',
        vehiclePhoto: vehicle ? vehicle.coverImage || vehicle.profileImage : undefined,
        agreedAmount: req.paymentAmount,
        acceptedAt,
      },
    };

    setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedRequest : r)));

    // Notify company
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      recipientType: 'empresa',
      recipientId: req.companyId,
      title: '¡Servicio Aceptado!',
      message: `El conductor ${currentSession.name} (Placa ${updatedRequest.acceptedBy?.vehiclePlate}) ha aceptado tu servicio "${req.pickupLocation} ➔ ${req.destinationLocation}".`,
      date: acceptedAt,
      isRead: false,
      relatedRequestId: req.id,
      type: 'accepted',
    };
    setNotifications((prev) => [notif, ...prev]);

    return { success: true };
  };

  // Driver: Submit a counteroffer
  const submitCounterOffer = (
    requestId: string,
    proposedAmount: number,
    note?: string
  ): { success: boolean; message?: string } => {
    if (!currentSession) return { success: false, message: 'Debes iniciar sesión.' };

    const req = requests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Solicitud no encontrada.' };
    if (req.status === 'aceptada') return { success: false, message: 'Esta solicitud ya fue aceptada.' };

    let vehicle = vehicles.find((v) => v.id === currentSession.assignedVehicleId);
    if (!vehicle && currentSession.isOwnerActingAsDriver) {
      vehicle = vehicles.find((v) => v.ownerId === currentSession.originalOwnerId);
    }
    if (!vehicle) {
      vehicle = vehicles[0];
    }

    const newOfferId = `co-${Date.now()}`;
    const newOffer = {
      id: newOfferId,
      requestId,
      driverId: currentSession.userId,
      driverName: currentSession.name,
      vehiclePlate: vehicle ? vehicle.plate : (currentSession.assignedPlate || 'WEO-412'),
      vehicleModel: vehicle ? `${vehicle.modelYear} - ${vehicle.brand}` : '2023 Especial',
      vehicleType: vehicle ? vehicle.type : ('Buseta' as VehicleType),
      vehiclePhoto: vehicle ? vehicle.profileImage || vehicle.coverImage : undefined,
      proposedAmount: Number(proposedAmount),
      note: note?.trim(),
      createdAt: new Date().toISOString(),
      status: 'pendiente' as const,
    };

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          counterOffers: [newOffer, ...r.counterOffers],
        };
      })
    );

    // Notify company
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      recipientType: 'empresa',
      recipientId: req.companyId,
      title: 'Nueva contraoferta recibida',
      message: `El conductor ${currentSession.name} (${newOffer.vehiclePlate}) ofertó $ ${new Intl.NumberFormat('es-CO').format(proposedAmount)} COP para el servicio a ${req.destinationLocation}.`,
      date: new Date().toISOString(),
      isRead: false,
      relatedRequestId: req.id,
      type: 'counteroffer',
    };
    setNotifications((prev) => [notif, ...prev]);

    return { success: true };
  };

  // Company: Accept or reject counteroffer
  const respondCounterOffer = (requestId: string, counterOfferId: string, action: 'aceptar' | 'rechazar') => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const offer = req.counterOffers.find((co) => co.id === counterOfferId);
    if (!offer) return;

    const now = new Date().toISOString();

    if (action === 'aceptar') {
      // Find driver phone if possible
      const driver = drivers.find((d) => d.id === offer.driverId);
      const owner = owners.find((o) => o.id === offer.driverId);

      const updatedRequest: TransportRequest = {
        ...req,
        status: 'aceptada',
        acceptedBy: {
          driverId: offer.driverId,
          driverName: offer.driverName,
          driverPhone: driver?.phone || owner?.phone || '3104567890',
          vehiclePlate: offer.vehiclePlate,
          vehicleBrand: offer.vehicleModel,
          vehicleModel: 2023,
          vehicleType: offer.vehicleType,
          vehiclePhoto: offer.vehiclePhoto,
          agreedAmount: offer.proposedAmount,
          acceptedAt: now,
        },
        counterOffers: req.counterOffers.map((co) =>
          co.id === counterOfferId ? { ...co, status: 'aceptada' } : { ...co, status: 'rechazada' }
        ),
      };

      setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedRequest : r)));

      // Notify driver
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        recipientType: 'conductor',
        recipientId: offer.driverId,
        title: '¡Contraoferta Aceptada!',
        message: `La empresa ${req.companyName} ACEPTÓ tu contraoferta de $ ${new Intl.NumberFormat('es-CO').format(offer.proposedAmount)} COP para el servicio a ${req.destinationLocation}. Contacta al coordinador.`,
        date: now,
        isRead: false,
        relatedRequestId: req.id,
        type: 'counteroffer_response',
      };
      setNotifications((prev) => [notif, ...prev]);
    } else {
      // Reject counteroffer
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          return {
            ...r,
            counterOffers: r.counterOffers.map((co) =>
              co.id === counterOfferId ? { ...co, status: 'rechazada' } : co
            ),
          };
        })
      );

      // Notify driver
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        recipientType: 'conductor',
        recipientId: offer.driverId,
        title: 'Contraoferta no aceptada',
        message: `La empresa ${req.companyName} ha declinado tu contraoferta para el servicio "${req.pickupLocation} ➔ ${req.destinationLocation}".`,
        date: now,
        isRead: false,
        relatedRequestId: req.id,
        type: 'counteroffer_response',
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Driver: Ignore request ("No me interesa")
  const ignoreRequest = (requestId: string) => {
    if (!currentSession) return;
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        if (r.ignoredByDriverIds.includes(currentSession.userId)) return r;
        return {
          ...r,
          ignoredByDriverIds: [...r.ignoredByDriverIds, currentSession.userId],
        };
      })
    );

    // Notify company
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      recipientType: 'empresa',
      recipientId: req.companyId,
      title: 'Servicio descartado por un conductor',
      message: `El conductor ${currentSession.name} (${currentSession.assignedPlate || 'Vehículo especial'}) marcó "No me interesa" en tu servicio a ${req.destinationLocation}.`,
      date: new Date().toISOString(),
      isRead: false,
      relatedRequestId: req.id,
      type: 'rejected',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Driver: Follow/unfollow company
  const toggleFollowCompany = (companyId: string) => {
    if (!currentSession) return;
    const userId = currentSession.userId;
    setFollowedCompanyIds((prev) => {
      const currentList = prev[userId] || [];
      const isFollowing = currentList.includes(companyId);
      const updated = isFollowing
        ? currentList.filter((id) => id !== companyId)
        : [...currentList, companyId];
      return {
        ...prev,
        [userId]: updated,
      };
    });
  };

  const isFollowingCompany = (companyId: string): boolean => {
    if (!currentSession) return false;
    const currentList = followedCompanyIds[currentSession.userId] || [];
    return currentList.includes(companyId);
  };

  // Owner: Toggle vehicle availability
  const toggleVehicleAvailability = (vehicleId: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return { ...v, isAvailable: !v.isAvailable };
        }
        return v;
      })
    );
  };

  // Owner: Register new vehicle
  const registerVehicle = (data: {
    plate: string;
    brand: string;
    modelYear: number;
    type: VehicleType;
    capacity: number;
    affiliatedCompany: string;
    operatingCardNumber: string;
    coverImage: string;
    profileImage: string;
  }): { success: boolean; message?: string } => {
    if (!currentSession) return { success: false, message: 'Debes iniciar sesión.' };

    const cleanPlaca = data.plate.trim().toUpperCase();
    if (!cleanPlaca) return { success: false, message: 'La placa es obligatoria.' };
    if (!data.affiliatedCompany.trim()) {
      return { success: false, message: 'La empresa afiliada es obligatoria según normativa colombiana.' };
    }
    if (!data.operatingCardNumber.trim()) {
      return { success: false, message: 'El número de tarjeta de operación es obligatorio.' };
    }

    const exists = vehicles.some((v) => v.plate.replace(/[^A-Z0-9]/g, '') === cleanPlaca.replace(/[^A-Z0-9]/g, ''));
    if (exists) {
      return { success: false, message: 'Ya existe un vehículo registrado con esta placa.' };
    }

    const newVehicle: Vehicle = {
      id: `veh-${Date.now()}`,
      ownerId: currentSession.userId,
      plate: cleanPlaca,
      brand: data.brand.trim(),
      modelYear: Number(data.modelYear) || new Date().getFullYear(),
      type: data.type,
      capacity: Number(data.capacity) || 16,
      affiliatedCompany: data.affiliatedCompany.trim(),
      operatingCardNumber: data.operatingCardNumber.trim(),
      isAvailable: true,
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
      profileImage: data.profileImage || 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=300&q=80',
    };

    setVehicles((prev) => [newVehicle, ...prev]);
    return { success: true };
  };

  // Update vehicle profile
  const updateVehicle = (vehicleId: string, data: Partial<Vehicle>) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, ...data } : v))
    );
  };

  // Owner: Delete vehicle
  const deleteVehicle = (vehicleId: string): { success: boolean; message?: string } => {
    if (!currentSession) return { success: false, message: 'Debes iniciar sesión.' };

    const targetVehicle = vehicles.find((v) => v.id === vehicleId);
    if (!targetVehicle) {
      return { success: false, message: 'El vehículo no fue encontrado.' };
    }

    // Permission check: must be owner of the vehicle
    if (currentSession.role === 'propietario' && targetVehicle.ownerId !== currentSession.userId) {
      return { success: false, message: 'No tienes permisos para eliminar este vehículo.' };
    }

    // Unassign driver from this vehicle if any
    setDrivers((prev) =>
      prev.map((d) =>
        d.assignedVehicleId === vehicleId
          ? { ...d, assignedVehicleId: undefined, assignedPlate: undefined }
          : d
      )
    );

    // If modal is open for this vehicle, close it
    if (selectedVehicleModalId === vehicleId) {
      setSelectedVehicleModalId(null);
      setSelectedVehicleRequestingCompanyId(null);
    }

    // Remove vehicle from list
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));

    return {
      success: true,
      message: `Vehículo con placa ${targetVehicle.plate} eliminado exitosamente.`,
    };
  };

  // Owner: Register driver & optionally create own access
  const registerDriver = (data: {
    name: string;
    phone: string;
    email?: string;
    identification?: string;
    assignedVehicleId?: string;
    createOwnAccess: boolean;
    username?: string;
    password?: string;
    bio?: string;
    yearsOfExperience?: number;
    city?: string;
    bloodType?: string;
    eps?: string;
    arl?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    licenseCategory?: 'C1' | 'C2' | 'C3';
    licenseNumber?: string;
    licenseExpirationDate?: string;
    profilePhoto?: string;
    coverPhoto?: string;
    cedulaFrontUrl?: string;
    cedulaBackUrl?: string;
    licenseFrontUrl?: string;
    licenseBackUrl?: string;
  }): { success: boolean; message?: string } => {
    if (!currentSession) return { success: false, message: 'Debes iniciar sesión.' };
    if (!data.name.trim()) return { success: false, message: 'El nombre del conductor es requerido.' };

    if (data.createOwnAccess) {
      if (!data.assignedVehicleId) {
        return {
          success: false,
          message: 'Para crear acceso propio al conductor, es obligatorio asignarle un vehículo primero.',
        };
      }
      if (!data.username?.trim()) {
        return {
          success: false,
          message: 'Debes especificar un nombre de usuario para el acceso del conductor.',
        };
      }

      const cleanUser = data.username.trim().toLowerCase();
      const inOwners = owners.some((o) => o.username.toLowerCase() === cleanUser);
      const inDrivers = drivers.some((d) => d.username?.toLowerCase() === cleanUser);
      if (inOwners || inDrivers) {
        return { success: false, message: 'Ese usuario ya existe. Por favor usa otro.' };
      }
    }

    const assignedVeh = vehicles.find((v) => v.id === data.assignedVehicleId);

    const newDriverId = `drv-${Date.now()}`;
    const newDriver: Driver = {
      id: newDriverId,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim(),
      identification: data.identification?.trim(),
      ownerId: currentSession.userId,
      assignedVehicleId: data.assignedVehicleId,
      assignedVehiclePlate: assignedVeh?.plate,
      hasOwnAccess: !!data.createOwnAccess,
      username: data.createOwnAccess ? data.username?.trim().toLowerCase() : undefined,
      password: data.createOwnAccess ? data.password || '123' : undefined,
      bio: data.bio?.trim(),
      yearsOfExperience: data.yearsOfExperience ? Number(data.yearsOfExperience) : undefined,
      city: data.city?.trim() || 'Colombia',
      bloodType: data.bloodType || 'O+',
      eps: data.eps?.trim() || 'Sura EPS',
      arl: data.arl?.trim() || 'Positiva ARL',
      emergencyContactName: data.emergencyContactName?.trim(),
      emergencyContactPhone: data.emergencyContactPhone?.trim(),
      licenseCategory: data.licenseCategory || 'C2',
      licenseNumber: data.licenseNumber?.trim(),
      licenseExpirationDate: data.licenseExpirationDate || '2028-12-31',
      licenseStatus: 'vigente',
      profilePhoto: data.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      coverPhoto: data.coverPhoto || 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80',
      cedulaFrontUrl: data.cedulaFrontUrl || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
      cedulaBackUrl: data.cedulaBackUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      licenseFrontUrl: data.licenseFrontUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      licenseBackUrl: data.licenseBackUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    };

    setDrivers((prev) => [...prev, newDriver]);

    // Update vehicle's assigned driver if vehicle selected
    if (data.assignedVehicleId) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === data.assignedVehicleId
            ? { ...v, assignedDriverId: newDriverId, assignedDriverName: newDriver.name }
            : v
        )
      );
    }

    return { success: true };
  };

  // Driver / Owner: Update driver profile (photos, bio, documents, etc.)
  const updateDriverProfile = (
    driverId: string,
    updates: Partial<Driver>
  ): { success: boolean; message?: string } => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          return { ...d, ...updates };
        }
        return d;
      })
    );

    // If driver's name was changed, sync to vehicles where they are primary or secondary driver
    if (updates.name) {
      setVehicles((prev) =>
        prev.map((v) => {
          let updated = { ...v };
          if (v.assignedDriverId === driverId) {
            updated.assignedDriverName = updates.name;
          }
          if (v.secondaryDriverId === driverId) {
            updated.secondaryDriverName = updates.name;
          }
          return updated;
        })
      );

      // If current session is this driver, update session name
      if (currentSession && currentSession.userId === driverId) {
        setCurrentSession((prev) => (prev ? { ...prev, name: updates.name! } : null));
      }
    }

    return { success: true, message: 'Perfil del conductor actualizado exitosamente.' };
  };

  // Owner: Assign 1 or 2 drivers to a vehicle (Conductor Principal y Conductor de Relevo)
  const assignDriversToVehicle = (
    vehicleId: string,
    primaryDriverId?: string,
    secondaryDriverId?: string
  ): { success: boolean; message?: string } => {
    const targetVeh = vehicles.find((v) => v.id === vehicleId);
    if (!targetVeh) return { success: false, message: 'Vehículo no encontrado.' };

    const primaryDriver = drivers.find((d) => d.id === primaryDriverId);
    const secondaryDriver = drivers.find((d) => d.id === secondaryDriverId);

    // Update vehicle
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return {
            ...v,
            assignedDriverId: primaryDriverId || undefined,
            assignedDriverName: primaryDriver?.name || undefined,
            secondaryDriverId: secondaryDriverId || undefined,
            secondaryDriverName: secondaryDriver?.name || undefined,
          };
        }
        return v;
      })
    );

    // Update driver references
    setDrivers((prev) =>
      prev.map((d) => {
        let updated = { ...d };
        if (d.id === primaryDriverId) {
          updated.assignedVehicleId = vehicleId;
          updated.assignedVehiclePlate = targetVeh.plate;
        } else if (d.assignedVehicleId === vehicleId && d.id !== secondaryDriverId) {
          // was assigned as primary to this vehicle but replaced
          updated.assignedVehicleId = undefined;
          updated.assignedVehiclePlate = undefined;
        }

        if (d.id === secondaryDriverId) {
          updated.secondaryVehicleId = vehicleId;
          updated.secondaryVehiclePlate = targetVeh.plate;
        } else if (d.secondaryVehicleId === vehicleId && d.id !== primaryDriverId) {
          updated.secondaryVehicleId = undefined;
          updated.secondaryVehiclePlate = undefined;
        }

        return updated;
      })
    );

    return { success: true, message: 'Conductores asignados correctamente al vehículo.' };
  };

  // Owner: "Conducir yo mismo"
  const startDrivingAsOwner = (vehicleId: string) => {
    if (!currentSession || currentSession.role !== 'propietario') return;
    const veh = vehicles.find((v) => v.id === vehicleId);

    setCurrentSession({
      role: 'conductor',
      userId: currentSession.userId, // keep owner ID or use for session
      name: currentSession.name,
      identifier: currentSession.identifier,
      phone: currentSession.phone,
      isOwnerActingAsDriver: true,
      originalOwnerId: currentSession.userId,
      assignedVehicleId: vehicleId,
      assignedPlate: veh?.plate,
    });
  };

  // Return to owner panel
  const returnToOwnerPanel = () => {
    if (!currentSession) return;
    setCurrentSession({
      role: 'propietario',
      userId: currentSession.originalOwnerId || currentSession.userId,
      name: currentSession.name,
      identifier: currentSession.identifier,
      phone: currentSession.phone,
      isOwnerActingAsDriver: false,
    });
  };

  // Update company profile
  const updateCompanyProfile = (
    companyId: string,
    updates: Partial<Company>
  ): { success: boolean; message?: string } => {
    setCompanies((prev) =>
      prev.map((comp) => (comp.id === companyId ? { ...comp, ...updates } : comp))
    );

    // If current session is this company, update currentSession name if name changed
    if (currentSession && currentSession.userId === companyId && updates.name) {
      setCurrentSession((prev) => (prev ? { ...prev, name: updates.name! } : null));
    }

    return { success: true, message: 'Perfil de la empresa actualizado correctamente.' };
  };

  // Add review / rating to company
  const addCompanyReview = (data: {
    companyId: string;
    rating: number;
    comment: string;
    paymentPunctualityScore?: number;
    coordinationScore?: number;
    fairPricingScore?: number;
  }): { success: boolean; message?: string } => {
    if (!currentSession) {
      return { success: false, message: 'Debes iniciar sesión para calificar a esta empresa.' };
    }

    if (currentSession.role === 'empresa') {
      return { success: false, message: 'Las empresas no pueden auto-calificarse.' };
    }

    if (data.rating < 1 || data.rating > 5) {
      return { success: false, message: 'La calificación debe estar entre 1 y 5 estrellas.' };
    }

    if (!data.comment.trim()) {
      return { success: false, message: 'Por favor escribe un comentario sobre tu experiencia.' };
    }

    // Plate info if available
    let authorPlate = currentSession.assignedPlate;
    if (!authorPlate && currentSession.role === 'propietario') {
      const ownerVehs = vehicles.filter((v) => v.ownerId === currentSession.userId);
      if (ownerVehs.length > 0) {
        authorPlate = ownerVehs.map((v) => v.plate).join(' / ');
      }
    }

    const newReview: CompanyReview = {
      id: `rev-${Date.now()}`,
      companyId: data.companyId,
      authorId: currentSession.userId,
      authorName: currentSession.name,
      authorRole: currentSession.role as 'conductor' | 'propietario',
      authorPlate,
      rating: data.rating,
      comment: data.comment.trim(),
      paymentPunctualityScore: data.paymentPunctualityScore || data.rating,
      coordinationScore: data.coordinationScore || data.rating,
      fairPricingScore: data.fairPricingScore || data.rating,
      createdAt: new Date().toISOString(),
    };

    setCompanyReviews((prev) => [newReview, ...prev]);

    // Send notification to the company
    const notifId = `notif-${Date.now()}`;
    const newNotif: AppNotification = {
      id: notifId,
      recipientType: 'empresa',
      recipientId: data.companyId,
      title: '¡Nueva calificación recibida! ⭐',
      message: `${currentSession.name} (${currentSession.role === 'conductor' ? 'Conductor' : 'Propietario'}) ha calificado a tu empresa con ${data.rating} estrellas: "${data.comment.trim().slice(0, 90)}..."`,
      date: new Date().toISOString(),
      isRead: false,
      type: 'counteroffer', // uses standard notification display
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return { success: true, message: '¡Calificación y opinión publicada exitosamente!' };
  };

  // Calculate rating stats for a company
  const getCompanyRating = (companyId: string) => {
    const reviews = companyReviews.filter((r) => r.companyId === companyId);
    if (reviews.length === 0) {
      return {
        average: 5.0,
        count: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        punctualityAvg: 5.0,
        coordinationAvg: 5.0,
        pricingAvg: 5.0,
      };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = Number((sum / reviews.length).toFixed(1));

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      breakdown[star] = (breakdown[star] || 0) + 1;
    });

    const punctualitySum = reviews.reduce(
      (acc, r) => acc + (r.paymentPunctualityScore || r.rating),
      0
    );
    const coordinationSum = reviews.reduce(
      (acc, r) => acc + (r.coordinationScore || r.rating),
      0
    );
    const pricingSum = reviews.reduce(
      (acc, r) => acc + (r.fairPricingScore || r.rating),
      0
    );

    return {
      average,
      count: reviews.length,
      breakdown,
      punctualityAvg: Number((punctualitySum / reviews.length).toFixed(1)),
      coordinationAvg: Number((coordinationSum / reviews.length).toFixed(1)),
      pricingAvg: Number((pricingSum / reviews.length).toFixed(1)),
    };
  };

  // Notifications: Mark as read
  const markNotificationsAsRead = (recipientId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.recipientId === recipientId ? { ...n, isRead: true } : n))
    );
  };

  const getUnreadNotificationsCount = (recipientId: string): number => {
    return notifications.filter((n) => n.recipientId === recipientId && !n.isRead).length;
  };

  // Subscription management
  const updateSubscription = (
    role: 'empresa' | 'propietario',
    targetId: string,
    updates: Partial<SubscriptionInfo>
  ) => {
    if (role === 'empresa') {
      setCompanies((prev) =>
        prev.map((c) => {
          if (c.id === targetId) {
            const currentSub = c.subscription || {
              isActive: false,
              tier: 'free',
              pricePerUser: 11900,
              userCount: 1,
              totalMonthlyAmount: 11900,
              nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              billingHistory: [],
            };
            const newSub = { ...currentSub, ...updates } as SubscriptionInfo;
            newSub.totalMonthlyAmount = newSub.userCount * newSub.pricePerUser;
            return { ...c, subscription: newSub };
          }
          return c;
        })
      );
    } else {
      setOwners((prev) =>
        prev.map((o) => {
          if (o.id === targetId) {
            const currentSub = o.subscription || {
              isActive: false,
              tier: 'free',
              pricePerUser: 11900,
              userCount: 1,
              totalMonthlyAmount: 11900,
              nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              billingHistory: [],
            };
            const newSub = { ...currentSub, ...updates } as SubscriptionInfo;
            newSub.totalMonthlyAmount = newSub.userCount * newSub.pricePerUser;
            return { ...o, subscription: newSub };
          }
          return o;
        })
      );
    }
  };

  // Real-time Service Status Tracking
  const updateServiceTracking = (
    requestId: string,
    isActive: boolean,
    currentStatus?: string,
    proofPhotoUrl?: string
  ) => {
    let message = 'Servicio actualizado';
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          const nowIso = new Date().toISOString();
          const currentTracking = r.trackingState || {
            isActive: false,
            statusHistory: [],
          };

          const newStatusHistory = [...(currentTracking.statusHistory || [])];
          if (currentStatus) {
            newStatusHistory.push({ status: currentStatus, timestamp: nowIso });
          }

          const nextTracking = {
            ...currentTracking,
            isActive,
            currentStatus: currentStatus || currentTracking.currentStatus || 'en camino a punto de recogida',
            statusHistory: newStatusHistory,
            startedAt: currentTracking.startedAt || (isActive ? nowIso : undefined),
            proofPhotoUrl: proofPhotoUrl || currentTracking.proofPhotoUrl,
          };

          if (currentStatus === 'servicio terminado' || currentStatus === 'finalizado el servicio') {
            nextTracking.isActive = false;
            message = 'El servicio ha sido finalizado con éxito.';
          }

          return {
            ...r,
            trackingState: nextTracking,
          };
        }
        return r;
      })
    );

    return { success: true, message };
  };

  // Reset demo data
  const resetDataToSeed = () => {
    localStorage.clear();
    setCompanies(SEED_COMPANIES);
    setCompanyReviews(SEED_REVIEWS);
    setOwners(SEED_OWNERS);
    setDrivers(SEED_DRIVERS);
    setVehicles(SEED_VEHICLES);
    setRequests(SEED_REQUESTS);
    setNotifications(SEED_NOTIFICATIONS);
    setFollowedCompanyIds({ 'drv-1': ['comp-1', 'comp-2'], 'own-1': ['comp-1'] });
    setCurrentSession(null);
    setIsRoleSelectorOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        companies,
        companyReviews,
        owners,
        drivers,
        coordinators,
        vehicles,
        requests,
        notifications,
        followedCompanyIds,
        currentSession,
        isRoleSelectorOpen,
        setIsRoleSelectorOpen,
        selectedCompanyModalId,
        openCompanyModal,
        closeCompanyModal,
        selectedVehicleModalId,
        selectedVehicleRequestingCompanyId,
        openVehicleModal,
        closeVehicleModal,
        selectedDriverModalId,
        selectedDriverRequestingCompanyId,
        openDriverModal,
        closeDriverModal,
        authModal,
        openAuthModal,
        closeAuthModal,
        loginCompany,
        registerCompany,
        loginUnified,
        loginCoordinator,
        registerOwner,
        resetUserPassword,
        logout,
        quickSwitchUser,
        registerCoordinator,
        updateCoordinator,
        deleteCoordinator,
        toggleCoordinatorStatus,
        updateCompanyProfile,
        addCompanyReview,
        getCompanyRating,
        publishRequest,
        updateRequest,
        respondRequestModification,
        cancelRequestModification,
        deleteRequest,
        respondCounterOffer,
        acceptRequest,
        submitCounterOffer,
        ignoreRequest,
        toggleFollowCompany,
        isFollowingCompany,
        toggleVehicleAvailability,
        registerVehicle,
        updateVehicle,
        deleteVehicle,
        registerDriver,
        updateDriverProfile,
        assignDriversToVehicle,
        startDrivingAsOwner,
        returnToOwnerPanel,
        markNotificationsAsRead,
        getUnreadNotificationsCount,
        driverActiveTab,
        setDriverActiveTab,
        driverFeedFilter,
        setDriverFeedFilter,
        goToFollowedServicesFeed,
        updateSubscription,
        updateServiceTracking,
        resetDataToSeed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};
