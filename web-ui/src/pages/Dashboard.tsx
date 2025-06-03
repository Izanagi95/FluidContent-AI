
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConsumerDashboard from "./Dashboards/ConsumerDashboard";
import MakerDashboard from "./Dashboards/MakerDashboard";
import ProviderDashboard from "./Dashboards/ProviderDashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>('consumer');

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'consumer';
    setUserRole(role);

    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Welcome back!</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {userRole === 'consumer' && "Discover content tailored just for you"}
            {userRole === 'maker' && "Create amazing content that adapts to your audience"}
            {userRole === 'provider' && "Share your authentic media and earn from it"}
          </p>
        </div>

        {userRole === 'consumer' && <ConsumerDashboard />}
        {userRole === 'maker' && <MakerDashboard />}
        {userRole === 'provider' && <ProviderDashboard />}
      </div>
    </div>
  );
};


export default Dashboard;
