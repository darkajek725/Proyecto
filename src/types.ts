export type Role = 'empresa' | 'propietario' | 'conductor' | 'coordinador';

export type PaymentTerm = 'De contado' | 'En 1 semana' | 'En 15 días' | 'En 1 mes';

export type VehicleType = 'Buseta' | 'Microbús' | 'Bus' | 'Van' | 'Camioneta';

export type RequestStatus = 'disponible' | 'aceptada' | 'cancelada';

export type ServiceCategory = 'fijo' | 'fija' | 'ocasional';

export type ServiceType = 'escolar' | 'empresarial' | 'turismo_expreso' | 'transfer' | 'otro';

export type SchoolPaymentModality = 'por_estudiante' | 'cupo_completo';

export type CorporatePaymentModality = 'por_pasajero' | 'cupo_completo';

export interface Coordinator {
  id: string;
  companyId: string;
  companyName: string;
  companyNit: string;
  name: string;
  phone: string;
  email: string;
  username: string;
  password?: string;
  assignedZone?: string; // ej: 'Zona Norte - Colegios', 'Sede Industrial Yumbo', 'División Corporativa Bogotá'
  isActive: boolean;
  createdAt: string; // ISO
  avatar?: string;
  notes?: string;
}

export interface SchoolRouteDetails {
  schoolName: string;
  schoolLocation: string; // Dirección o sede del colegio
  schoolCity?: string;
  studentCount: number;
  paymentModality: SchoolPaymentModality; // 'por_estudiante' o 'cupo_completo'
  feePerStudent?: number; // COP mensual o quincenal por estudiante (ej: 220000)
  totalVehicleRate?: number; // COP total por el cupo completo del vehículo
  shift: 'manana' | 'tarde' | 'completa';
  morningPickupTime?: string; // Hora de inicio recolección estudiantes (ej: '06:00')
  morningSchoolArrivalTime?: string; // Hora de llegada al colegio (ej: '07:00')
  afternoonDepartureTime?: string; // Hora de salida del colegio (ej: '15:15')
  routeStartNeighborhood?: string; // Barrio o punto donde inicia la ruta (ej: 'Suba / Rincón')
  coverageSectors?: string; // Sectores o paradas intermedias
  requiresAssistant?: boolean; // Requiere monitora o acompañante escolar
}

export interface CorporateRouteDetails {
  clientCompanyName: string; // Nombre de la empresa cliente
  workplaceLocation: string; // Sede, planta industrial o dirección de la empresa
  workplaceCity?: string;
  employeeCount: number;
  paymentModality: CorporatePaymentModality; // 'por_pasajero' o 'cupo_completo'
  feePerEmployee?: number; // COP por empleado
  totalVehicleRate?: number; // COP total por vehículo
  shiftName?: string; // ej: 'Turno Mañana (06:00 - 14:00)', 'Turno Noche (22:00)'
  shiftType: 'turno_manana' | 'turno_tarde' | 'turno_noche' | 'rotativo';
  routeOrigin: string; // Dónde inicia la ruta de recolección de trabajadores
  routeDestination: string; // Sede / Planta de la empresa
  routeStartTime: string; // Hora en que el vehículo inicia la recolección
  workplaceArrivalTime: string; // Hora en que deben estar en la empresa
  returnDepartureTime?: string; // Hora de retorno al terminar el turno
  intermediateStops?: string; // Paradas intermedias / puntos de acopio
}

export interface CompanyReview {
  id: string;
  companyId: string;
  authorId: string;
  authorName: string;
  authorRole: 'conductor' | 'propietario';
  authorPlate?: string;
  rating: number; // 1 to 5
  comment: string;
  paymentPunctualityScore?: number; // 1 to 5
  coordinationScore?: number; // 1 to 5
  fairPricingScore?: number; // 1 to 5
  createdAt: string; // ISO
}

export interface Company {
  id: string;
  nit: string;
  name: string;
  password?: string;
  phone: string;
  email: string;
  city: string;
  address?: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  habilitacionMintransporte?: string;
  website?: string;
  servicesOffered?: string[];
  establishedYear?: number;
  subscription?: SubscriptionInfo;
}

export interface VehicleDocumentInfo {
  documentNumber: string;
  entityName?: string; // e.g., 'Seguros del Estado', 'CDA Diagnostiya', 'Ministerio de Transporte'
  issueDate?: string;
  expirationDate: string; // YYYY-MM-DD
  scannedUrl?: string; // URL of the scanned certificate / image
  status: 'vigente' | 'proximo_a_vencer' | 'vencido';
  policyNumber?: string;
  notes?: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  plate: string;
  brand: string;
  lineModel?: string; // e.g. 'NPR 75L', 'Sprinter 516 CDI', 'Paradiso 1200 G7'
  modelYear: number;
  type: VehicleType;
  capacity: number;
  affiliatedCompany: string; // Empresa de transporte habilitada por Mintransporte
  operatingCardNumber: string; // Número de tarjeta de operación
  isAvailable: boolean;
  coverImage: string;
  profileImage: string;
  
  // Assigned Drivers (Owner can assign 1 or 2 drivers: Principal y Relevo)
  assignedDriverId?: string;
  assignedDriverName?: string;
  secondaryDriverId?: string;
  secondaryDriverName?: string;

  // Technical & Regulatory Identification
  internalNumber?: string; // Número Interno (ej: '412', '108')
  color?: string; // Color de carrocería (ej: 'Blanco / Azul Turquesa')
  chassisNumber?: string; // VIN / Número de Chasis (ej: '93FBK64M8P0028471')
  engineNumber?: string; // Número de Motor (ej: '4HK1-TC54921')
  cylinderCapacity?: string; // Cilindraje (ej: '5.193 cc')
  fuelType?: 'Diésel' | 'Gasolina' | 'GNV / Gasolina' | 'Híbrido' | 'Eléctrico';
  bodyType?: string; // Tipo de carrocería (ej: 'Cerrada Pasajeros / Navitrans')
  transitLicenseNumber?: string; // Licencia de Tránsito / Tarjeta de Propiedad
  registrationCity?: string; // Organismo de Tránsito (ej: 'Bogotá D.C. - Ventanilla Única de Movilidad')
  gpsProvider?: string; // Proveedor Satelital Homologado (ej: 'Navisat GPS Colombia - Transmisión Mintransporte 24/7')

  // Equipment & Comfort Amenities
  airConditioning?: boolean;
  recliningSeats?: boolean;
  wifi?: boolean;
  usbChargers?: boolean;
  screenTv?: boolean;
  soundSystem?: boolean;
  readingLights?: boolean;
  luggageRack?: boolean;
  tintedWindows?: boolean;
  bathroom?: boolean;

  // Safety Equipment & Mintransporte Compliance
  seatbeltsOnAllSeats?: boolean;
  firstAidKit?: boolean;
  emergencyExit?: boolean;
  fireExtinguisherDue?: string;
  absBrakes?: boolean;
  speedLimiter?: boolean;
  gpsTracking?: boolean;
  dualAirbags?: boolean;
  roadKit?: boolean;
  additionalEquipmentNotes?: string;

  // Gallery Photos
  galleryImages?: string[];

  // Scanned Official Documents Dossier
  soat?: VehicleDocumentInfo;
  tecnomecanica?: VehicleDocumentInfo;
  tarjetaOperacion?: VehicleDocumentInfo;
  polizaContractual?: VehicleDocumentInfo;
  polizaExtracontractual?: VehicleDocumentInfo;
  tarjetaPropiedad?: VehicleDocumentInfo;
  revisionPreventivaBimestral?: VehicleDocumentInfo;
  driverLicense?: VehicleDocumentInfo;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  identification?: string; // Cédula de Ciudadanía
  ownerId: string;
  assignedVehicleId?: string; // ID del vehículo asignado (Principal)
  assignedVehiclePlate?: string;
  secondaryVehicleId?: string; // Si está asignado como relevo en otro vehículo
  secondaryVehiclePlate?: string;
  hasOwnAccess: boolean;
  username?: string;
  password?: string;

  // Driver Profile Imagery & Personal Presentation
  profilePhoto?: string; // Foto de perfil del conductor
  coverPhoto?: string; // Foto de portada
  bio?: string; // Reseña profesional / experiencia
  yearsOfExperience?: number; // Años de experiencia en servicio especial
  city?: string; // Ciudad base de residencia
  bloodType?: string; // Grupo sanguíneo y factor RH (ej. 'O+', 'A+')

  // Healthcare, Security & Social Security Compliance
  eps?: string; // Entidad Promotora de Salud (ej. 'Sanitas EPS', 'Sura EPS')
  arl?: string; // Administradora de Riesgos Laborales (ej. 'Positiva ARL', 'Sura ARL')
  emergencyContactName?: string;
  emergencyContactPhone?: string;

  // Driver License Information
  licenseCategory?: 'C1' | 'C2' | 'C3'; // Categoría de servicio público/especial
  licenseNumber?: string;
  licenseExpirationDate?: string; // YYYY-MM-DD
  licenseStatus?: 'vigente' | 'proximo_a_vencer' | 'vencido';

  // Scanned Official Identity & License Documents (Front and Back)
  cedulaFrontUrl?: string; // Cédula Cara Frontal (Anverso)
  cedulaBackUrl?: string; // Cédula Cara Posterior (Reverso)
  licenseFrontUrl?: string; // Licencia Cara Frontal (Anverso)
  licenseBackUrl?: string; // Licencia Cara Posterior (Reverso)
  medicalCertificateUrl?: string; // Examen médico ocupacional
  socialSecurityProofUrl?: string; // Planilla PILA / Certificado de afiliación
  bankInfo?: {
    bankName: string;
    accountType: 'Ahorros' | 'Corriente';
    accountNumber: string;
    holderName: string;
    holderId: string;
  };
}

export interface Owner {
  id: string;
  name: string;
  phone: string;
  username: string;
  email?: string;
  password?: string;
  identification: string;
  profileImage?: string;
  coverImage?: string;
  subscription?: SubscriptionInfo;
  bankInfo?: {
    bankName: string;
    accountType: 'Ahorros' | 'Corriente';
    accountNumber: string;
    holderName: string;
    holderId: string;
  };
}

export interface CounterOffer {
  id: string;
  requestId: string;
  driverId: string;
  driverName: string;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleType: VehicleType;
  vehiclePhoto?: string;
  proposedAmount: number; // en COP
  note?: string;
  createdAt: string;
  status: 'pendiente' | 'aceptada' | 'rechazada';
}

export interface ServiceModificationProposal {
  id: string;
  requestedAt: string; // ISO
  requestedByRole: 'empresa' | 'conductor';
  requestedByName: string;
  reason?: string;
  proposedChanges: {
    serviceDate?: string;
    serviceTime?: string;
    pickupLocation?: string;
    destinationLocation?: string;
    passengerCount?: number;
    returnDate?: string;
    paymentAmount?: number;
    paymentTerm?: PaymentTerm;
    coordinatorName?: string;
    coordinatorPhone?: string;
  };
  previousValues: {
    serviceDate: string;
    serviceTime: string;
    pickupLocation: string;
    destinationLocation: string;
    passengerCount: number;
    returnDate?: string;
    paymentAmount: number;
    paymentTerm: PaymentTerm;
    coordinatorName: string;
    coordinatorPhone: string;
  };
  status: 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada' | 'cancelada_por_conductor';
}

export interface TransportRequest {
  id: string;
  companyId: string;
  companyName: string;
  companyNit: string;
  
  // Categoría del servicio: Fijo (Recurrente / Contrato) u Ocasional (Expreso puntual)
  serviceCategory?: ServiceCategory; // 'fijo' | 'ocasional'
  serviceType?: ServiceType; // 'escolar' | 'empresarial' | 'turismo_expreso' | 'transfer' | 'otro'
  
  // Para Rutas Fijas: Días de operación en la semana (ej: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'])
  routeDays?: string[];
  
  // Datos específicos según el tipo de servicio
  schoolInfo?: SchoolRouteDetails;
  corporateInfo?: CorporateRouteDetails;

  // Creador / Coordinador responsable
  createdByCoordinatorId?: string;
  createdByCoordinatorName?: string;
  createdByRole?: 'empresa' | 'coordinador';

  serviceDate: string; // YYYY-MM-DD
  serviceTime: string; // HH:mm
  pickupLocation: string;
  destinationLocation: string;
  passengerCount: number;
  returnDate?: string; // YYYY-MM-DD
  paymentAmount: number; // COP
  paymentTerm: PaymentTerm;
  coordinatorName: string;
  coordinatorPhone: string;
  status: RequestStatus;
  createdAt: string; // ISO string for sorting
  cancellationReason?: string;
  cancelledBy?: string;
  
  // Si fue aceptada:
  acceptedBy?: {
    driverId: string;
    driverName: string;
    driverPhone: string;
    vehiclePlate: string;
    vehicleBrand: string;
    vehicleModel: number | string;
    vehicleType: VehicleType;
    vehiclePhoto?: string;
    agreedAmount: number;
    acceptedAt: string;
  };

  // Propuesta de modificación mutua (requerida cuando el servicio ya fue aceptado)
  pendingModification?: ServiceModificationProposal;
  modificationHistory?: ServiceModificationProposal[];
  
  // Contraofertas
  counterOffers: CounterOffer[];
  
  // Rechazos de conductores ("No me interesa")
  ignoredByDriverIds: string[];

  // Real-time service status tracking
  trackingState?: {
    isActive: boolean;
    currentStatus?: string;
    startedAt?: string;
    statusHistory?: { status: string; timestamp: string }[];
    proofPhotoUrl?: string;
  };
}

export interface AppNotification {
  id: string;
  recipientType: 'empresa' | 'conductor' | 'propietario' | 'coordinador';
  recipientId: string; // companyId, driverId, ownerId, or coordinatorId
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  relatedRequestId?: string;
  type: 'counteroffer' | 'accepted' | 'rejected' | 'new_service' | 'counteroffer_response' | 'modification_request' | 'modification_response';
}

export interface UserSession {
  role: Role;
  userId: string;
  name: string;
  identifier: string; // NIT for company, username for owner/driver/coordinator
  phone?: string;
  email?: string;
  
  // Coordinator specific linkage
  companyId?: string;
  companyName?: string;
  companyNit?: string;
  companyLogo?: string;
  coordinatorZone?: string;

  // Owner acting as driver
  isOwnerActingAsDriver?: boolean;
  originalOwnerId?: string;
  assignedVehicleId?: string;
  assignedPlate?: string;
  profileImage?: string;
}

export interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: 'pagado' | 'pendiente' | 'fallido';
  invoiceUrl?: string;
}

export interface SubscriptionInfo {
  isActive: boolean;
  tier: 'free' | 'premium';
  pricePerUser: number; // 11900
  userCount: number; // seat / driver count
  totalMonthlyAmount: number; // userCount * 11900
  nextBillingDate: string; // YYYY-MM-DD
  paymentMethod?: {
    brand: string;
    last4: string;
  };
  billingHistory: BillingHistoryItem[];
}
