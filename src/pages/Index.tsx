
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate('/time-entry');
      } else {
        navigate('/login');
      }
    }
  }, [user, isLoading, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-gray-900">
      <div className="text-center p-10 rounded-lg bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex justify-center mb-6">
          <img 
            src="/lovable-uploads/fdabcd51-e672-48a0-8d38-6f7260604af5.png" 
            alt="White Rock Logo" 
            className="h-24" 
          />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-blue-600 dark:text-blue-400">TimeTrack Nexus</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
