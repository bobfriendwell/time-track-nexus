
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  BarChart3, 
  Users, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-time-bg">
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
        } fixed inset-y-0 left-0 z-10 w-64 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 bg-white shadow-md`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-time-purple">TimeTrack Nexus</h1>
          </div>
          
          {user && (
            <div className="p-4 border-b">
              <p className="text-sm text-time-gray">Logged in as</p>
              <p className="font-medium">{user.username}</p>
              <p className="text-xs text-time-gray">{user.isAdmin ? 'Administrator' : 'Regular User'}</p>
            </div>
          )}
          
          <nav className="flex-1 p-4 space-y-1">
            <NavLink 
              to="/" 
              className={({ isActive }) => `flex items-center px-4 py-2 text-sm rounded-lg ${
                isActive 
                  ? 'bg-time-light-purple text-white' 
                  : 'text-time-gray hover:bg-gray-100'
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
                  ? 'bg-time-light-purple text-white' 
                  : 'text-time-gray hover:bg-gray-100'
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
                    ? 'bg-time-light-purple text-white' 
                    : 'text-time-gray hover:bg-gray-100'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Users size={18} className="mr-2" />
                Admin Panel
              </NavLink>
            )}
          </nav>
          
          <div className="p-4 mt-auto border-t">
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
      <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
    </div>
  );
};

export default Layout;
