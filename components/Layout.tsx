
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Box, 
  ShoppingCart, 
  Users, 
  Ticket,
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  ChevronDown,
  Monitor
} from 'lucide-react';
import { NAVIGATION } from '../constants';
import { User, Role } from '../types';

// Map icon names from constants to Lucide components
const IconMap: Record<string, any> = {
  LayoutDashboard, 
  Box, 
  ShoppingCart, 
  Users, 
  Ticket, 
  Settings
};

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activePath: string;
  onNavigate: (path: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activePath, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Safely filter navigation based on user roles
  const filteredNav = NAVIGATION.filter(item => 
    item.roles && item.roles.includes(user.role)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-[150] bg-black/50 lg:hidden backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[200] w-72 bg-slate-900 text-white transition-transform duration-500 ease-in-out border-r border-white/5
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-8 py-10">
            <div className="flex flex-col">
              <span className="serif text-3xl italic font-bold text-rose-500">Seoul Muse</span>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 mt-1 uppercase">Control Console</span>
            </div>
            <button className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
            {filteredNav.map((item) => {
              const Icon = IconMap[item.icon] || LayoutDashboard; 
              const isActive = activePath === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    onNavigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group
                    ${isActive 
                      ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} className={isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                  <span className="font-bold text-[11px] uppercase tracking-widest uppercase">{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6">
            <div className="bg-white/5 rounded-3xl p-6 mb-4">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 uppercase">System Verified</span>
               </div>
               <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">
                 "Architecture is frozen music." - Seongsu Atelier
               </p>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 text-rose-400 hover:bg-rose-500 hover:text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest uppercase"
            >
              <LogOut size={18} />
              Terminate Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-20 sm:h-24 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 sm:px-10 sticky top-0 z-[100]">
          <div className="flex items-center gap-4 sm:gap-6">
            <button className="lg:hidden p-2 sm:p-3 bg-slate-50 text-slate-900 rounded-xl sm:rounded-2xl" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-4 bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl w-full max-w-[400px] focus-within:ring-4 focus-within:ring-rose-500/5 focus-within:bg-white transition-all group">
              <Search size={18} className="text-slate-300 group-focus-within:text-rose-500" />
              <input 
                type="text" 
                placeholder="UNIVERSAL REGISTRY SEARCH..." 
                className="bg-transparent border-none focus:outline-none w-full text-[10px] font-bold text-slate-900 tracking-widest uppercase placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-8">
            <div className="hidden lg:flex items-center gap-4 border-r border-slate-100 pr-8">
                <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 uppercase">Live Engine</span>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest uppercase">Normal</span>
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    </div>
                </div>
            </div>

            <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-900 tracking-widest uppercase uppercase">{user.name}</span>
                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                </div>
                <span className="text-[9px] font-bold text-slate-300 tracking-widest uppercase uppercase">{user.role.replace('_', ' ')}</span>
            </div>
            
            <button 
                className="relative group shrink-0"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`} 
                  alt="Profile" 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border-2 border-slate-50 shadow-md group-hover:scale-105 transition-transform"
                />
            </button>
          </div>
        </header>

        {/* Viewport content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-10 lg:p-16 scroll-smooth bg-[#fafafa]">
          <div className="max-w-7xl mx-auto pb-32">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
