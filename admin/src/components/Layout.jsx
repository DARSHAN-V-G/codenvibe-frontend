import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Code, Users, BarChart3, Menu, X, Activity } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: BarChart3, label: 'Dashboard' },
    { to: '/questions', icon: Code, label: 'Questions' },
    { to: '/teams', icon: Users, label: 'Teams' },
    { to: '/logs', icon: Activity, label: 'Server Logs' },
    { to: '/round2', icon: Code, label: 'Round 2' },
  ];

  const NavItem = ({ to, icon: Icon, label, mobile = false }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        } ${mobile ? 'w-full' : ''}`
      }
      onClick={() => setSidebarOpen(false)}
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white shadow-lg">
          <div className="flex items-center flex-shrink-0 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
              <Code className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-white">CodeVibe Admin</h1>
          </div>
          
          <div className="flex flex-col flex-grow px-4 py-6">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </nav>
            
            <div className="mt-auto pt-6">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-lg z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">CodeVibe Admin</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-10 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-lg transform transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full pt-16">
          <div className="flex flex-col flex-grow px-4 py-6">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavItem key={item.to} {...item} mobile />
              ))}
            </nav>
            
            <div className="mt-auto pt-6">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 flex-1 flex flex-col pt-16 lg:pt-0">
        <main className="flex-1 px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}