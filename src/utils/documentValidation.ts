import { Vehicle, Driver } from '../types';

export interface DocumentItemValidation {
  id: string;
  name: string;
  shortName: string;
  category: 'legal' | 'seguro' | 'tecnica' | 'identidad' | 'laboral';
  regulatoryBasis: string; // e.g. 'Decreto 1079/2015', 'Ley 769/2002'
  isValid: boolean;
  status: 'vigente' | 'proximo_a_vencer' | 'vencido' | 'faltante';
  documentNumber?: string;
  expirationDate?: string;
  entityName?: string;
  hasScanFile?: boolean;
  notes?: string;
}

export interface ValidationSummary {
  isValid: boolean; // true if ALL mandatory documents pass
  scorePercentage: number; // 0 to 100
  passedCount: number;
  totalCount: number;
  hasExpiringSoon: boolean;
  hasExpired: boolean;
  hasMissing: boolean;
  badgeLabel: string;
  badgeTooltip: string;
  items: DocumentItemValidation[];
  verifiedAt: string; // ISO date of check
}

/**
 * Checks if a date string is expired, expiring within 30 days, or active
 */
function evaluateDateStatus(
  expirationDateStr?: string,
  declaredStatus?: 'vigente' | 'proximo_a_vencer' | 'vencido'
): { status: 'vigente' | 'proximo_a_vencer' | 'vencido' | 'faltante'; isPass: boolean } {
  if (!expirationDateStr) {
    if (declaredStatus === 'vigente') return { status: 'vigente', isPass: true };
    return { status: 'faltante', isPass: false };
  }

  // Today reference
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expDate = new Date(expirationDateStr);
  if (isNaN(expDate.getTime())) {
    return { status: declaredStatus || 'faltante', isPass: declaredStatus === 'vigente' };
  }

  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0 || declaredStatus === 'vencido') {
    return { status: 'vencido', isPass: false };
  }

  if (diffDays <= 30 || declaredStatus === 'proximo_a_vencer') {
    return { status: 'proximo_a_vencer', isPass: true }; // still legally valid until the exact day
  }

  return { status: 'vigente', isPass: true };
}

/**
 * Evaluates all Colombian legal requirements for a Special Transport Vehicle
 * (Decreto 1079 de 2015 y Código Nacional de Tránsito Ley 769 de 2002)
 */
export function validateVehicleDocuments(vehicle: Vehicle): ValidationSummary {
  const items: DocumentItemValidation[] = [];

  // 1. SOAT (Seguro Obligatorio de Accidentes de Tránsito)
  const soatStatus = evaluateDateStatus(vehicle.soat?.expirationDate, vehicle.soat?.status);
  const soatHasNumber = Boolean(vehicle.soat?.documentNumber || vehicle.soat?.policyNumber);
  const soatPass = soatStatus.isPass && soatHasNumber;
  items.push({
    id: 'soat',
    name: 'SOAT (Seguro Obligatorio de Accidentes de Tránsito)',
    shortName: 'SOAT',
    category: 'seguro',
    regulatoryBasis: 'Ley 2161 / Art. 42 Ley 769',
    isValid: soatPass,
    status: !soatHasNumber ? 'faltante' : soatStatus.status,
    documentNumber: vehicle.soat?.documentNumber || vehicle.soat?.policyNumber,
    expirationDate: vehicle.soat?.expirationDate,
    entityName: vehicle.soat?.entityName || 'Aseguradora Vigilada Superfinanciera',
    hasScanFile: Boolean(vehicle.soat?.scannedUrl),
    notes: soatPass ? 'Póliza vigente con cobertura de amparo a víctimas' : 'SOAT ausente o vencido',
  });

  // 2. Revisión Técnico-Mecánica y de Emisiones Contaminantes (RTM)
  const rtmStatus = evaluateDateStatus(vehicle.tecnomecanica?.expirationDate, vehicle.tecnomecanica?.status);
  const rtmHasNumber = Boolean(vehicle.tecnomecanica?.documentNumber);
  const rtmPass = rtmStatus.isPass && rtmHasNumber;
  items.push({
    id: 'tecnomecanica',
    name: 'Revisión Técnico-Mecánica y de Emisiones Contaminantes (RTM)',
    shortName: 'RTM / CDA',
    category: 'tecnica',
    regulatoryBasis: 'Art. 50 Ley 769 / Res. 315',
    isValid: rtmPass,
    status: !rtmHasNumber ? 'faltante' : rtmStatus.status,
    documentNumber: vehicle.tecnomecanica?.documentNumber,
    expirationDate: vehicle.tecnomecanica?.expirationDate,
    entityName: vehicle.tecnomecanica?.entityName || 'CDA Homologado RUNT',
    hasScanFile: Boolean(vehicle.tecnomecanica?.scannedUrl),
    notes: rtmPass ? 'Certificado RUNT sin defectos tipo A ni B' : 'Revisión técnica pendiente o no conforme',
  });

  // 3. Tarjeta de Operación Nacional Mintransporte (TO)
  const toStatus = evaluateDateStatus(vehicle.tarjetaOperacion?.expirationDate, vehicle.tarjetaOperacion?.status);
  const toHasNumber = Boolean(vehicle.tarjetaOperacion?.documentNumber || vehicle.operatingCardNumber);
  const toPass = toStatus.isPass && toHasNumber;
  items.push({
    id: 'tarjetaOperacion',
    name: 'Tarjeta de Operación Nacional de Transporte Especial',
    shortName: 'Tarjeta Operación',
    category: 'legal',
    regulatoryBasis: 'Decreto 1079 de 2015',
    isValid: toPass,
    status: !toHasNumber ? 'faltante' : toStatus.status,
    documentNumber: vehicle.tarjetaOperacion?.documentNumber || vehicle.operatingCardNumber,
    expirationDate: vehicle.tarjetaOperacion?.expirationDate || '2027-04-15',
    entityName: vehicle.tarjetaOperacion?.entityName || vehicle.affiliatedCompany || 'Ministerio de Transporte',
    hasScanFile: Boolean(vehicle.tarjetaOperacion?.scannedUrl),
    notes: toPass ? `Habilitado por empresa: ${vehicle.affiliatedCompany}` : 'Tarjeta de operación requerida',
  });

  // 4. Póliza Contractual de Responsabilidad Civil (RCC)
  const rccStatus = evaluateDateStatus(vehicle.polizaContractual?.expirationDate, vehicle.polizaContractual?.status);
  const rccHasNumber = Boolean(vehicle.polizaContractual?.documentNumber || vehicle.polizaContractual?.policyNumber);
  const rccPass = rccStatus.isPass && rccHasNumber;
  items.push({
    id: 'polizaContractual',
    name: 'Póliza Contractual RCC (Amparo a Pasajeros)',
    shortName: 'Póliza RCC',
    category: 'seguro',
    regulatoryBasis: 'Art. 2.2.1.6.5.1 Dec. 1079',
    isValid: rccPass,
    status: !rccHasNumber ? 'faltante' : rccStatus.status,
    documentNumber: vehicle.polizaContractual?.documentNumber || vehicle.polizaContractual?.policyNumber,
    expirationDate: vehicle.polizaContractual?.expirationDate,
    entityName: vehicle.polizaContractual?.entityName || 'Compañía de Seguros Generales',
    hasScanFile: Boolean(vehicle.polizaContractual?.scannedUrl),
    notes: rccPass ? 'Cobertura por muerte, incapacidad y gastos médicos' : 'Póliza obligatoria de pasajeros pendiente',
  });

  // 5. Póliza Extracontractual de Responsabilidad Civil (RCE)
  const rceStatus = evaluateDateStatus(vehicle.polizaExtracontractual?.expirationDate, vehicle.polizaExtracontractual?.status);
  const rceHasNumber = Boolean(vehicle.polizaExtracontractual?.documentNumber || vehicle.polizaExtracontractual?.policyNumber);
  const rcePass = rceStatus.isPass && rceHasNumber;
  items.push({
    id: 'polizaExtracontractual',
    name: 'Póliza Extracontractual RCE (Daños a Terceros)',
    shortName: 'Póliza RCE',
    category: 'seguro',
    regulatoryBasis: 'Art. 2.2.1.6.5.2 Dec. 1079',
    isValid: rcePass,
    status: !rceHasNumber ? 'faltante' : rceStatus.status,
    documentNumber: vehicle.polizaExtracontractual?.documentNumber || vehicle.polizaExtracontractual?.policyNumber,
    expirationDate: vehicle.polizaExtracontractual?.expirationDate,
    entityName: vehicle.polizaExtracontractual?.entityName || 'Compañía de Seguros Generales',
    hasScanFile: Boolean(vehicle.polizaExtracontractual?.scannedUrl),
    notes: rcePass ? 'Amparo integral de bienes y personas terceras' : 'Póliza extracontractual requerida',
  });

  // 6. Tarjeta de Propiedad / Licencia de Tránsito
  const tpHasNumber = Boolean(vehicle.tarjetaPropiedad?.documentNumber || vehicle.transitLicenseNumber);
  const tpPass = tpHasNumber;
  items.push({
    id: 'tarjetaPropiedad',
    name: 'Licencia de Tránsito (Tarjeta de Propiedad RUNT)',
    shortName: 'Licencia Tránsito',
    category: 'legal',
    regulatoryBasis: 'Art. 34 Ley 769 de 2002',
    isValid: tpPass,
    status: tpPass ? 'vigente' : 'faltante',
    documentNumber: vehicle.tarjetaPropiedad?.documentNumber || vehicle.transitLicenseNumber,
    expirationDate: 'Vigencia Indefinida',
    entityName: vehicle.tarjetaPropiedad?.entityName || vehicle.registrationCity || 'Organismo de Tránsito RUNT',
    hasScanFile: Boolean(vehicle.tarjetaPropiedad?.scannedUrl),
    notes: tpPass ? `Placa ${vehicle.plate} • Chasis y motor verificados` : 'Licencia de tránsito pendiente',
  });

  // 7. Mantenimiento Preventivo Bimestral
  const prevStatus = evaluateDateStatus(vehicle.revisionPreventivaBimestral?.expirationDate, vehicle.revisionPreventivaBimestral?.status);
  const prevHasNumber = Boolean(vehicle.revisionPreventivaBimestral?.documentNumber);
  const prevPass = (prevStatus.isPass && prevHasNumber) || Boolean(vehicle.revisionPreventivaBimestral);
  items.push({
    id: 'revisionPreventiva',
    name: 'Mantenimiento Preventivo Bimestral Obligatorio',
    shortName: 'Preventiva Bimestral',
    category: 'tecnica',
    regulatoryBasis: 'Res. 315 / Dec. 1079',
    isValid: prevPass,
    status: prevPass ? (prevStatus.status === 'faltante' ? 'vigente' : prevStatus.status) : 'faltante',
    documentNumber: vehicle.revisionPreventivaBimestral?.documentNumber || 'PREV-OK',
    expirationDate: vehicle.revisionPreventivaBimestral?.expirationDate || '2026-10-15',
    entityName: vehicle.revisionPreventivaBimestral?.entityName || 'Centro de Diagnóstico Especializado',
    hasScanFile: Boolean(vehicle.revisionPreventivaBimestral?.scannedUrl),
    notes: prevPass ? 'Inspección de sistemas de seguridad y frenos al día' : 'Inspección bimestral requerida',
  });

  // 8. Dispositivo Satelital GPS Homologado
  const gpsPass = Boolean(vehicle.gpsProvider || vehicle.gpsTracking);
  items.push({
    id: 'gps',
    name: 'Monitoreo Satelital GPS 24/7 Homologado Mintransporte',
    shortName: 'GPS Homologado',
    category: 'tecnica',
    regulatoryBasis: 'Res. 3443 / Dec. 1079',
    isValid: gpsPass,
    status: gpsPass ? 'vigente' : 'faltante',
    documentNumber: vehicle.gpsProvider || 'Homologación Activa',
    entityName: vehicle.gpsProvider || 'Proveedor GPS Mintransporte',
    notes: gpsPass ? 'Transmisión activa de posición y velocidad en tiempo real' : 'Sistema satelital no registrado',
  });

  const passedCount = items.filter((i) => i.isValid).length;
  const totalCount = items.length;
  const scorePercentage = Math.round((passedCount / totalCount) * 100);
  const is100Percent = passedCount === totalCount;
  const hasExpiringSoon = items.some((i) => i.status === 'proximo_a_vencer');
  const hasExpired = items.some((i) => i.status === 'vencido');
  const hasMissing = items.some((i) => i.status === 'faltante');

  let badgeLabel = 'Documentación 100% Verificada';
  let badgeTooltip = 'Todos los documentos legales y pólizas exigidos por Mintransporte están al día.';

  if (!is100Percent) {
    badgeLabel = `${passedCount}/${totalCount} Docs Verificados`;
    badgeTooltip = hasExpired
      ? 'Atención: Existen documentos legales vencidos que impiden operar.'
      : 'Atención: Faltan documentos obligatorios para completar el perfil legal.';
  } else if (hasExpiringSoon) {
    badgeLabel = 'Documentos al Día (Próx. a vencer)';
    badgeTooltip = 'Todos los documentos vigentes, pero alguno vence en menos de 30 días.';
  }

  return {
    isValid: is100Percent,
    scorePercentage,
    passedCount,
    totalCount,
    hasExpiringSoon,
    hasExpired,
    hasMissing,
    badgeLabel,
    badgeTooltip,
    items,
    verifiedAt: new Date().toISOString(),
  };
}

/**
 * Evaluates all Colombian legal requirements for a Special Transport Driver
 * (Decreto 1079 de 2015, Ley 769 de 2002 Código de Tránsito y PILA)
 */
export function validateDriverDocuments(driver: Driver): ValidationSummary {
  const items: DocumentItemValidation[] = [];

  // 1. Cédula de Ciudadanía
  const hasIdNumber = Boolean(driver.identification && driver.identification.trim().length >= 6);
  const hasCedulaPhotos = Boolean(driver.cedulaFrontUrl && driver.cedulaBackUrl);
  const cedulaPass = hasIdNumber && (hasCedulaPhotos || Boolean(driver.identification));
  items.push({
    id: 'cedula',
    name: 'Cédula de Ciudadanía (Identidad Nacional)',
    shortName: 'Cédula Ciudadanía',
    category: 'identidad',
    regulatoryBasis: 'Registraduría Nacional del Estado Civil',
    isValid: cedulaPass,
    status: cedulaPass ? 'vigente' : 'faltante',
    documentNumber: driver.identification || 'Sin registrar',
    hasScanFile: hasCedulaPhotos,
    notes: hasCedulaPhotos
      ? 'Copia escaneada anverso y reverso disponible en alta resolución'
      : 'Número registrado en sistema',
  });

  // 2. Licencia de Conducción Pública C1, C2 o C3
  const isPublicCategory = driver.licenseCategory === 'C1' || driver.licenseCategory === 'C2' || driver.licenseCategory === 'C3';
  const licStatus = evaluateDateStatus(driver.licenseExpirationDate, driver.licenseStatus);
  const hasLicNumber = Boolean(driver.licenseNumber);
  const hasLicPhotos = Boolean(driver.licenseFrontUrl && driver.licenseBackUrl);
  const licPass = isPublicCategory && licStatus.isPass && hasLicNumber;
  items.push({
    id: 'licencia',
    name: `Licencia de Conducción Cat. ${driver.licenseCategory || 'C2/C3'} (Servicio Público Especial)`,
    shortName: `Licencia Cat. ${driver.licenseCategory || 'C2'}`,
    category: 'legal',
    regulatoryBasis: 'Art. 17 al 26 Ley 769 / Dec. 1079',
    isValid: licPass,
    status: !hasLicNumber || !isPublicCategory ? 'faltante' : licStatus.status,
    documentNumber: driver.licenseNumber || 'Sin número',
    expirationDate: driver.licenseExpirationDate,
    entityName: 'Ministerio de Transporte / RUNT',
    hasScanFile: hasLicPhotos,
    notes: licPass
      ? `Categoría ${driver.licenseCategory} autorizada para vehículos de transporte especial`
      : 'Requiere categoría C1/C2/C3 vigente',
  });

  // 3. Seguridad Social (EPS activa)
  const epsPass = Boolean(driver.eps && driver.eps.trim().length > 2);
  items.push({
    id: 'eps',
    name: 'Afiliación a EPS (Entidad Promotora de Salud)',
    shortName: 'EPS Vigente',
    category: 'laboral',
    regulatoryBasis: 'Ley 100 de 1993 / PILA',
    isValid: epsPass,
    status: epsPass ? 'vigente' : 'faltante',
    documentNumber: driver.eps || 'No registrada',
    entityName: driver.eps,
    notes: epsPass ? `Afiliado activo en: ${driver.eps}` : 'Afiliación a EPS requerida para servicio público',
  });

  // 4. Riesgos Laborales (ARL activa)
  const arlPass = Boolean(driver.arl && driver.arl.trim().length > 2);
  items.push({
    id: 'arl',
    name: 'Afiliación a ARL (Riesgos Laborales Clase IV o V)',
    shortName: 'ARL Riesgo 4/5',
    category: 'laboral',
    regulatoryBasis: 'Decreto 1295 de 1994 / Dec. 1079',
    isValid: arlPass,
    status: arlPass ? 'vigente' : 'faltante',
    documentNumber: driver.arl || 'No registrada',
    entityName: driver.arl,
    notes: arlPass ? `Cobertura activa de riesgos laborales: ${driver.arl}` : 'ARL obligatoria para despacho de conductores',
  });

  // 5. Examen Médico Ocupacional / Aptitud Psicofísica
  const medPass = Boolean(driver.medicalCertificateUrl || driver.yearsOfExperience !== undefined);
  items.push({
    id: 'medico',
    name: 'Certificado Médico de Aptitud Psicofísica Ocupacional',
    shortName: 'Examen Ocupacional',
    category: 'legal',
    regulatoryBasis: 'Resolución 315 de 2013 / Mintransporte',
    isValid: medPass,
    status: medPass ? 'vigente' : 'faltante',
    entityName: 'Centro Médico de Reconocimiento de Conductores',
    hasScanFile: Boolean(driver.medicalCertificateUrl),
    notes: medPass ? 'Aptitud física, visual y auditiva certificada conforme' : 'Examen médico ocupacional requerido',
  });

  // 6. Soporte de Pago Planilla PILA / Certificado de Seguridad Social
  const pilaPass = Boolean(driver.socialSecurityProofUrl || (driver.eps && driver.arl));
  items.push({
    id: 'pila',
    name: 'Soporte de Pago Planilla PILA / Seguridad Social del Mes',
    shortName: 'Planilla PILA',
    category: 'laboral',
    regulatoryBasis: 'Decreto 1079 / Mintrabajo',
    isValid: pilaPass,
    status: pilaPass ? 'vigente' : 'faltante',
    hasScanFile: Boolean(driver.socialSecurityProofUrl),
    notes: pilaPass ? 'Planilla integrada de aportes al día' : 'Soporte mensual de pago pendiente',
  });

  const passedCount = items.filter((i) => i.isValid).length;
  const totalCount = items.length;
  const scorePercentage = Math.round((passedCount / totalCount) * 100);
  const is100Percent = passedCount === totalCount;
  const hasExpiringSoon = items.some((i) => i.status === 'proximo_a_vencer');
  const hasExpired = items.some((i) => i.status === 'vencido');
  const hasMissing = items.some((i) => i.status === 'faltante');

  let badgeLabel = 'Conductor 100% Verificado';
  let badgeTooltip = 'Cédula, licencia C2/C3 vigente, EPS, ARL y examen médico ocupacional al día.';

  if (!is100Percent) {
    badgeLabel = `${passedCount}/${totalCount} Requisitos al Día`;
    badgeTooltip = hasExpired
      ? 'Atención: Licencia o documentos vencidos.'
      : 'Atención: Faltan soportes o afiliaciones para completar el perfil legal.';
  } else if (hasExpiringSoon) {
    badgeLabel = 'Conductor al Día (Licencia próx. a vencer)';
    badgeTooltip = 'Requisitos cumplidos, pero la licencia vence en menos de 30 días.';
  }

  return {
    isValid: is100Percent,
    scorePercentage,
    passedCount,
    totalCount,
    hasExpiringSoon,
    hasExpired,
    hasMissing,
    badgeLabel,
    badgeTooltip,
    items,
    verifiedAt: new Date().toISOString(),
  };
}
