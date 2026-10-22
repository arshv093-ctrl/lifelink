/**
 * LifeLink - Primary Application Root Component
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import React, { useState } from "react";
import { AuthProvider } from "./context/AuthContext.tsx";
import { Layout } from "./components/layout/Layout.tsx";
import { LandingPage } from "./pages/LandingPage.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { InventoryPage } from "./pages/InventoryPage.tsx";
import { RequestsPage } from "./pages/RequestsPage.tsx";
import { AllocationCenterPage } from "./pages/AllocationCenterPage.tsx";
import { LabPage } from "./pages/LabPage.tsx";
import { AuditLedgerPage } from "./pages/AuditLedgerPage.tsx";
import { TelemetryPage } from "./pages/TelemetryPage.tsx";
import { EmergencyAccessPage } from "./pages/EmergencyAccessPage.tsx";
import { HospitalsPage } from "./pages/HospitalsPage.tsx";
import { DonorsPage } from "./pages/DonorsPage.tsx";
import { ReportsPage } from "./pages/ReportsPage.tsx";
import { SettingsPage } from "./pages/SettingsPage.tsx";
import { AboutPage } from "./pages/AboutPage.tsx";

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <LandingPage onNavigate={setCurrentPage} />;
      case "dashboard":
        return <DashboardPage onNavigate={setCurrentPage} />;
      case "inventory":
        return <InventoryPage />;
      case "requests":
        return <RequestsPage onNavigate={setCurrentPage} />;
      case "allocation":
        return <AllocationCenterPage />;
      case "lab":
        return <LabPage />;
      case "audit":
        return <AuditLedgerPage />;
      case "telemetry":
        return <TelemetryPage />;
      case "emergency":
        return <EmergencyAccessPage />;
      case "hospitals":
        return <HospitalsPage />;
      case "donors":
        return <DonorsPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      case "about":
        return <AboutPage />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AuthProvider>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
    </AuthProvider>
  );
};

export default App;
