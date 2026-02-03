
import React from 'react';
import { LayoutDashboard, MessageSquare, FileText, Settings, LogOut, ShieldCheck, User, Menu, X, ChevronLeft, ChevronRight, FolderClock, ShoppingBag, Share2, Database } from 'lucide-react';
import { AppStep, ThemeMode } from '../types';
import InstallAppButton from './InstallAppButton';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  currentStep: AppStep;
  onNavigate: (step: AppStep) => void;
  themeMode: ThemeMode;
  user: any;
  onLogout: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentStep, onNavigate, themeMode, user, onLogout, isOpen, onToggle }) => {
  const { itemCount } = useCart();
  const { t } = useTranslation();

  // Charte graphique stricte : Fond Navy (#051229)
  const bgClass = 'bg-[#051229] border-r border-white/5';
  const textClass = 'text-white';

  // État actif : Orange Vibrant (#FF9F1C) avec texte Navy, Design Flat
  const activeItemClass = 'bg-[#FF9F1C] text-[#051229] font-bold shadow-lg shadow-[#FF9F1C]/20';
  const inactiveItemClass = 'text-slate-400 hover:text-white hover:bg-white/5 font-medium';

  const menuItems = [
    { step: AppStep.DASHBOARD, label: t('sidebar.dashboard'), icon: <LayoutDashboard size={20} /> },
    { step: AppStep.APPLICATIONS, label: t('sidebar.tracking'), icon: <FolderClock size={20} /> },
    { step: AppStep.SHOP, label: t('sidebar.shop'), icon: <ShoppingBag size={20} />, badge: itemCount > 0 ? itemCount : null },
    { step: AppStep.DOCUMENTS, label: t('sidebar.documents'), icon: <FileText size={20} /> },
    { step: AppStep.WIDGET, label: t('sidebar.widget'), icon: <Share2 size={20} /> },
    { step: AppStep.SECURITY, label: t('sidebar.security'), icon: <ShieldCheck size={20} /> },
    // DEV SHORTCUT
    { step: AppStep.QUALIFICATION, label: 'DEV: Formulaire', icon: <FileText size={20} className="text-red-400" /> },
    { step: AppStep.DB_AUDIT, label: 'Audit / DB', icon: <Database size={20} className="text-emerald-400" /> },
    { step: 'EXTERNAL_COPY' as AppStep, label: 'Audit AI Copy', icon: <Share2 size={20} className="text-blue-400" />, href: 'http://localhost:5174' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg shadow-lg cursor-pointer bg-[#051229] text-[#FF9F1C] border border-white/10" onClick={onToggle}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </div>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[50] md:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed md:relative top-0 left-0 h-full z-[55] transition-all duration-300 ease-in-out flex flex-col justify-between
        ${isOpen ? 'translate-x-0 w-72 md:w-72' : '-translate-x-full md:translate-x-0 md:w-24'}
        ${bgClass}
      `}>

        {/* Desktop Toggle Button */}
        <button
          onClick={onToggle}
          className="hidden md:flex absolute -right-3 top-9 w-6 h-6 rounded-full items-center justify-center border shadow-sm z-50 transition-colors bg-[#051229] border-white/20 text-white hover:bg-[#FF9F1C] hover:text-[#051229]"
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Header / Logo / Settings */}
        <div className={`px-6 pt-8 pb-4 ${!isOpen && 'md:px-4 md:py-8'}`}>

          <div className={`flex items-center mb-6 transition-all duration-300 ${isOpen ? 'justify-between' : 'justify-center flex-col gap-4 mb-8'}`}>
            {/* Logo Group */}
            <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
              <div className="w-10 h-10 min-w-[2.5rem] rounded-xl flex items-center justify-center bg-[#FF9F1C] text-[#051229] shadow-lg">
                <ShieldCheck size={22} strokeWidth={2.5} />
              </div>
              <div className={`${!isOpen && 'md:hidden'} transition-opacity duration-200`}>
                <h1 className={`text-xl leading-none ${textClass}`}>
                  <span className="font-sans font-bold tracking-tight">SiamVisa</span><span className="font-serif font-normal text-[#FF9F1C]">Pro</span>
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-sans mt-1">
                  {t('sidebar.member_area')}
                </p>
              </div>
            </div>

            {/* Settings Button (Top Right Interface) */}
            <button
              onClick={() => { onNavigate(AppStep.SETTINGS); if (window.innerWidth < 768) onToggle(); }}
              className={`p-2 rounded-xl text-slate-400 hover:text-[#FF9F1C] hover:bg-white/5 transition-all ${currentStep === AppStep.SETTINGS ? 'bg-white/10 text-[#FF9F1C] shadow-sm' : ''
                }`}
              title={t('sidebar.settings')}
            >
              <Settings size={20} />
            </button>
          </div>

          {/* BOUTON SUPANSA */}
          <button
            onClick={() => { onNavigate(AppStep.CHAT); if (window.innerWidth < 768) onToggle(); }}
            className={`w-full mb-6 group relative overflow-hidden flex items-center gap-3 p-1 pr-4 rounded-full transition-all duration-300 
              ${currentStep === AppStep.CHAT
                ? 'bg-white text-[#051229] shadow-lg ring-2 ring-[#FF9F1C]'
                : 'bg-[#FF9F1C] text-[#051229] hover:bg-white hover:shadow-xl'
              }
              ${!isOpen && 'md:justify-center md:p-1 md:w-12 md:h-12 md:rounded-full md:pr-0'}
            `}
            title={t('sidebar.talk_supansa')}
          >
            <div className="w-10 h-10 rounded-full border-2 border-[#051229] overflow-hidden flex-shrink-0 relative z-10">
              <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Supansa" />
            </div>

            <div className={`flex-1 text-left ${!isOpen && 'md:hidden'}`}>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{t('sidebar.concierge')}</p>
              <p className="text-xs font-bold leading-tight">{t('sidebar.talk_supansa')}</p>
            </div>

            <div className={`relative z-10 ${!isOpen && 'md:hidden'}`}>
              <MessageSquare size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide font-sans">
          <p className={`px-4 text-[9px] font-bold uppercase tracking-[0.2em] mb-2 opacity-40 ${textClass} ${!isOpen && 'md:hidden'}`}>
            {t('sidebar.menu_main')}
          </p>
          {menuItems.map((item: any) => {
            const isExternal = !!item.href;
            const content = (
              <>
                <span className={`transition-transform duration-300 flex-shrink-0`}>
                  {item.icon}
                </span>
                <span className={`${!isOpen && 'md:hidden'}`}>{item.label}</span>

                {item.badge && item.badge > 0 && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full`}>
                    {item.badge}
                  </span>
                )}
              </>
            );

            if (isExternal) {
              return (
                <a
                  key={item.step}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm transition-all duration-200 group relative ${inactiveItemClass} ${!isOpen && 'md:justify-center md:px-0'}`}
                  title={!isOpen ? item.label : ''}
                >
                  {content}
                </a>
              );
            }

            return (
              <button
                key={item.step}
                onClick={() => { onNavigate(item.step); if (window.innerWidth < 768) onToggle(); }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm transition-all duration-200 group relative ${currentStep === item.step ? activeItemClass : inactiveItemClass
                  } ${!isOpen && 'md:justify-center md:px-0'}`}
                title={!isOpen ? item.label : ''}
              >
                {content}
              </button>
            )
          })}

          {/* LANGUAGE SELECTOR IN SIDEBAR */}
          {isOpen && <LanguageSelector />}
        </nav>

        {/* Footer Actions (Profile + Logout) */}
        <div className="p-4 border-t border-white/5 space-y-2">

          {/* User Mini Profile */}
          <div className={`p-3 rounded-2xl flex items-center gap-3 bg-white/5 border border-white/5 mb-4 ${!isOpen && 'md:justify-center md:p-2 md:bg-transparent md:border-0'}`}>
            <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-gradient-to-br from-[#FF9F1C] to-orange-600 flex items-center justify-center text-white font-bold text-sm border-2 border-[#051229]">
              {user?.photoURL ? <img src={user.photoURL} className="w-full h-full rounded-full object-cover" /> : <User size={18} />}
            </div>
            <div className={`overflow-hidden ${!isOpen && 'md:hidden'}`}>
              <p className={`text-sm font-bold truncate ${textClass} font-sans`}>{user?.displayName || t('sidebar.guest_user')}</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] opacity-60 font-medium uppercase tracking-wider text-slate-400 font-sans">
                  {t('sidebar.connected')}
                </p>
              </div>
            </div>
          </div>

          {/* Install App Button */}
          <div className={`${!isOpen && 'hidden'}`}>
            <InstallAppButton themeMode={themeMode} />
          </div>

          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm transition-all duration-200 text-slate-400 hover:text-red-400 hover:bg-red-500/10 group ${!isOpen && 'md:justify-center md:px-0'}`}
            title={t('sidebar.logout')}
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className={`${!isOpen && 'md:hidden'}`}>{t('sidebar.logout')}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
