
import React, { useMemo } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { AuditResult, ThemeMode } from '../types';
import { useTranslation } from 'react-i18next';

interface AuditScoreProps {
  result: AuditResult;
  themeMode?: ThemeMode;
}

const AuditScore: React.FC<AuditScoreProps> = ({ result, themeMode = 'CONCORD' }) => {
  const { t } = useTranslation();
  const score = result.confidence_score || 0;
  const isExecutive = themeMode === 'EXECUTIVE';
  const isPro = themeMode === 'PRO';

  // Couleurs dynamiques basées sur la performance
  const colors = useMemo(() => {
    if (score >= 80) return { main: '#10b981', light: '#ecfdf5', glow: 'rgba(16, 185, 129, 0.4)' }; // Vert Émeraude
    if (score >= 50) return { main: '#f59e0b', light: '#fffbeb', glow: 'rgba(245, 158, 11, 0.4)' }; // Ambre
    return { main: '#ef4444', light: '#fef2f2', glow: 'rgba(239, 68, 68, 0.4)' }; // Rubis
  }, [score]);

  const data = [{ name: 'Score', value: score, fill: colors.main }];

  return (
    <div className={`w-full flex flex-col items-center ${isExecutive ? 'font-mono' : 'font-sans'}`}>
      <div className="relative w-48 h-48 md:w-56 md:h-56">
        
        {/* Glow effect intense pour le mode PRO */}
        {(isPro || !isExecutive) && (
          <div 
            className={`absolute inset-4 rounded-full transition-all duration-1000 ${isPro ? 'blur-3xl' : 'blur-2xl'}`}
            style={{ backgroundColor: colors.glow }}
          />
        )}
        
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            innerRadius="80%" 
            outerRadius="100%" 
            barSize={isPro ? 20 : 16} 
            data={data} 
            startAngle={225} 
            endAngle={-45}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: isExecutive || isPro ? '#f1f5f9' : '#f8fafc' }}
              dataKey="value"
              cornerRadius={20}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <span className={`
              text-5xl md:text-6xl font-black tracking-tighter transition-colors duration-500
              ${isExecutive || isPro ? 'text-slate-900' : 'text-brand-navy'}
            `}>
              {score}<span className="text-2xl opacity-50">%</span>
            </span>
            <div className={`
              mt-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]
              ${isExecutive ? 'bg-slate-100 text-slate-500' : isPro ? 'bg-blue-600 text-white shadow-md' : 'bg-brand-navy/5 text-brand-gold'}
            `}>
              VisaScore™
            </div>
          </div>
        </div>

        {/* Decorative markers pour les thèmes techniques */}
        {(isExecutive || isPro) && (
          <div className="absolute inset-0 pointer-events-none">
             {[0, 25, 50, 75, 100].map((m) => (
               <div 
                 key={m} 
                 className={`absolute w-0.5 h-2 ${isPro ? 'bg-blue-200' : 'bg-slate-200'}`} 
                 style={{ 
                    left: '50%', 
                    top: '50%', 
                    transform: `rotate(${225 - (m * 2.7)}deg) translateY(-100px) translateX(-50%)` 
                 }} 
               />
             ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all shadow-sm ${
          score >= 80 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
          score >= 50 ? 'bg-amber-50 border-amber-100 text-amber-700' : 
          'bg-red-50 border-red-100 text-red-700'
        }`}>
          {score >= 80 ? <CheckCircle size={16} /> : score >= 50 ? <AlertCircle size={16} /> : <XCircle size={16} />}
          <span className="text-xs font-black uppercase tracking-widest">
            {score >= 80 ? t('audit_score.high_eligibility') : score >= 50 ? t('audit_score.audit_recommended') : t('audit_score.critical_file')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuditScore;
