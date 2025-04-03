
import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { 
  Clock, 
  BarChart3, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Moon,
  Sun
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-time-bg dark:bg-gray-900">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-20 m-4">
        <Button variant="outline" size="icon" onClick={toggleSidebar}>
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-10 w-64 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 bg-white dark:bg-gray-800 shadow-md`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b dark:border-gray-700 flex items-center">
            <img 
              src="/lovable-uploads/fdabcd51-e672-48a0-8d38-6f7260604af5.png" 
              alt="White Rock Logo" 
              className="h-10 mr-2" 
            />
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">TimeTrack Nexus</h1>
          </div>
          
          {user && (
            <div className="p-4 border-b dark:border-gray-700">
              <p className="text-sm text-time-gray dark:text-gray-400">Logged in as</p>
              <p className="font-medium dark:text-white">{user.username}</p>
              <p className="text-xs text-time-gray dark:text-gray-400">{user.isAdmin ? 'Administrator' : 'Regular User'}</p>
            </div>
          )}
          
          <nav className="flex-1 p-4 space-y-1">
            <NavLink 
              to="/" 
              className={({ isActive }) => `flex items-center px-4 py-2 text-sm rounded-lg ${
                isActive 
                  ? 'bg-blue-500 text-white' 
                  : 'text-time-gray dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Clock size={18} className="mr-2" />
              Time Entry
            </NavLink>
            
            <NavLink 
              to="/analysis" 
              className={({ isActive }) => `flex items-center px-4 py-2 text-sm rounded-lg ${
                isActive 
                  ? 'bg-blue-500 text-white' 
                  : 'text-time-gray dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <BarChart3 size={18} className="mr-2" />
              Time Analysis
            </NavLink>
            
            {user?.isAdmin && (
              <NavLink 
                to="/admin" 
                className={({ isActive }) => `flex items-center px-4 py-2 text-sm rounded-lg ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : 'text-time-gray dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Users size={18} className="mr-2" />
                Admin Panel
              </NavLink>
            )}
          </nav>
          
          <div className="p-4 mt-auto border-t dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-time-gray dark:text-gray-300">Dark Mode</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-blue-600 dark:text-blue-400"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
            </div>
            <Button 
              variant="ghost" 
              className="w-full flex items-center text-red-500"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto dark:bg-gray-900 dark:text-white">{children}</main>
    </div>
  );
};

export default Layout;
