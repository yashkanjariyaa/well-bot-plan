import { useState } from "react";
import Header from "@/components/layout/Header";
import Dashboard from "@/components/dashboard/Dashboard";
import ChatInterface from "@/components/chat/ChatInterface";
import HealthProfile from "@/components/profile/HealthProfile";
import DietPlans from "@/components/plans/DietPlans";

const Index = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentSection} />;
      case 'chat':
        return <ChatInterface />;
      case 'profile':
        return <HealthProfile />;
      case 'plans':
        return <DietPlans />;
      default:
        return <Dashboard onNavigate={setCurrentSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={setCurrentSection} currentSection={currentSection} />
      <main className="container mx-auto px-4 py-8">
        {renderSection()}
      </main>
    </div>
  );
};

export default Index;
