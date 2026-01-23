
import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminDashboard: React.FC<any> = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#051229] text-white p-10 text-center">
      <div className="mb-6 p-6 rounded-full bg-red-500/10 text-red-500 animate-pulse">
        <ShieldAlert size={64} />
      </div>
      <h1 className="text-3xl font-black uppercase tracking-widest mb-4">{t('admin.access_restricted')}</h1>
      <p className="text-slate-400 max-w-md font-medium">
        {t('admin.access_restricted_desc')}
      </p>
    </div>
  );
};

export default AdminDashboard;
