import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Shield, Briefcase, User as UserIcon } from 'lucide-react';

const DashboardSwitcher: React.FC = () => {
  const { role, perspective, setPerspective } = useUser();
  const navigate = useNavigate();

  if (role !== 'admin') return null;

  const views = [
    { 
      path: '/admin-dashboard', 
      id: 'admin',
      label: 'Admin Control', 
      icon: Shield, 
      activeBg: 'bg-blue-600',
      hoverBg: 'hover:bg-blue-50 hover:text-blue-700'
    },
    { 
      path: '/lawyer-dashboard', 
      id: 'lawyer',
      label: 'Lawyer View', 
      icon: Briefcase, 
      activeBg: 'bg-purple-600',
      hoverBg: 'hover:bg-purple-50 hover:text-purple-700'
    },
    { 
      path: '/student-dashboard', 
      id: 'user',
      label: 'Student View', 
      icon: UserIcon, 
      activeBg: 'bg-emerald-600',
      hoverBg: 'hover:bg-emerald-50 hover:text-emerald-700'
    },
  ];

  return (
    <div className="flex items-center mx-2 hidden md:flex">
      <div className="bg-gray-100 p-1 rounded-lg border border-gray-200 flex items-center space-x-1">
        {views.map((view) => {
          const isActive = perspective === view.id;
          const Icon = view.icon;
          
          return (
            <button
              key={view.id}
              onClick={() => {
                setPerspective(view.id as any);
                navigate(view.path);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${
                isActive 
                  ? `${view.activeBg} text-white shadow-sm` 
                  : `text-gray-500 hover:bg-white`
              }`}
            >
              <Icon className={`h-3 w-3 ${isActive ? 'text-white' : ''}`} />
              <span className="hidden lg:inline">{view.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardSwitcher;
