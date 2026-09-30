/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { RoleSelector } from './components/RoleSelector';
import { AuthModals } from './components/AuthModals';
import { CompanyProfileModal } from './components/CompanyProfileModal';
import { VehicleProfileModal } from './components/VehicleProfileModal';
import { DriverDossierModal } from './components/DriverDossierModal';
import { CompanyPanel } from './components/CompanyPanel/CompanyPanel';
import { OwnerPanel } from './components/OwnerPanel/OwnerPanel';
import { DriverPanel } from './components/DriverPanel/DriverPanel';
import { CoordinatorPanel } from './components/CoordinatorPanel/CoordinatorPanel';

const AppContent: React.FC = () => {
  const {
    currentSession,
    isRoleSelectorOpen,
    selectedCompanyModalId,
    closeCompanyModal,
    selectedVehicleModalId,
    selectedVehicleRequestingCompanyId,
    closeVehicleModal,
    selectedDriverModalId,
    selectedDriverRequestingCompanyId,
    closeDriverModal,
  } = useApp();

  // If user explicitly opened the role selector or there is no session, show RoleSelector landing
  const shouldShowRoleSelector = isRoleSelectorOpen || !currentSession;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-amber-400 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {shouldShowRoleSelector ? (
          <RoleSelector />
        ) : (
          <>
            {currentSession.role === 'empresa' && <CompanyPanel />}
            {currentSession.role === 'propietario' && <OwnerPanel />}
            {currentSession.role === 'conductor' && <DriverPanel />}
            {currentSession.role === 'coordinador' && <CoordinatorPanel />}
          </>
        )}
      </main>

      <Footer />
      <AuthModals />
      {selectedCompanyModalId && (
        <CompanyProfileModal
          companyId={selectedCompanyModalId}
          onClose={closeCompanyModal}
        />
      )}
      {selectedVehicleModalId && (
        <VehicleProfileModal
          vehicleId={selectedVehicleModalId}
          requestingCompanyId={selectedVehicleRequestingCompanyId}
          onClose={closeVehicleModal}
        />
      )}
      {selectedDriverModalId && (
        <DriverDossierModal
          driverId={selectedDriverModalId}
          requestingCompanyId={selectedDriverRequestingCompanyId}
          onClose={closeDriverModal}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
