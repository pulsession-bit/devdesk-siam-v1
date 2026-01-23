
import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, CheckCircle2, Clock, Download, Scan, Cloud, X, Briefcase, Check, File, Loader2, Wallet, FileSearch, LayoutGrid, List as ListIcon, Trash2, Search, UserSquare, Globe, FolderOpen } from 'lucide-react';
import { ThemeMode, VisaType, FileAttachment } from '../types';
import { performDocumentAudit } from '../services/geminiService';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

interface DocumentEntry {
  id: string;
  name: string;
  category: 'IDENTITY' | 'FINANCIAL' | 'PROJECT' | 'OTHER' | 'TRAVEL' | 'SUPPORTING';
  status: 'VERIFIED' | 'ANALYZING' | 'MISSING' | 'REJECTED';
  date?: string;
  type: string;
  data?: string;
  analysis?: string;
  size?: string;
  expiryDate?: string;
}

interface DocumentsPageProps {
  themeMode: ThemeMode;
  visaType: VisaType;
  uploadedFiles?: FileAttachment[];
  onCallAgent?: () => void;
  onClose?: () => void;
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ themeMode, visaType, uploadedFiles = [], onCallAgent, onClose }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth(); // Get authenticated user
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'UPLOAD' | 'CATEGORIES' | 'WALLET'>('UPLOAD');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'REJECTED'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [isScanning, setIsScanning] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentEntry | null>(null);

  const [docs, setDocs] = useState<DocumentEntry[]>([
    { id: '1', name: 'Passport_Bio_Page.pdf', category: 'IDENTITY', status: 'VERIFIED', date: '12 Dec 2025', type: 'application/pdf', size: '2.4 MB', expiryDate: '15 Jun 2030', data: 'https://images.unsplash.com/photo-1544642899-f0d6e5f6ed6f?q=80&w=800&auto=format&fit=crop', analysis: 'Conforme aux normes OACI.' },
    { id: '2', name: 'Passport_Photo.jpg', category: 'IDENTITY', status: 'VERIFIED', date: '12 Dec 2025', type: 'image/jpeg', size: '1.2 MB', data: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop' },
    { id: '3', name: 'Flight_Tickets.pdf', category: 'TRAVEL', status: 'VERIFIED', date: '13 Dec 2025', type: 'application/pdf', size: '856 KB', data: 'https://images.unsplash.com/photo-1524592714635-d77511a4834d?q=80&w=800&auto=format&fit=crop' },
    { id: '4', name: 'Bank_Statement_Nov.pdf', category: 'FINANCIAL', status: 'ANALYZING', date: '14 Dec 2025', type: 'application/pdf', size: '3.1 MB', data: 'https://plus.unsplash.com/premium_photo-1681487767138-ddf2d67b35c1?q=80&w=800&auto=format&fit=crop' },
    { id: '5', name: 'Hotel_Booking.pdf', category: 'TRAVEL', status: 'REJECTED', date: '14 Dec 2025', type: 'application/pdf', size: '1.8 MB', data: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop', analysis: 'Document illisible.' },
  ]);

  useEffect(() => {
    if (uploadedFiles.length > 0) {
      setDocs(prevDocs => {
        const existingNames = new Set(prevDocs.map(d => d.name));
        const newEntries = uploadedFiles
          .filter(file => !existingNames.has(file.name))
          .map((file, idx) => ({
            id: `chat-file-${Date.now()}-${idx}`,
            name: file.name,
            category: detectCategory(file.name),
            status: 'ANALYZING' as const,
            date: new Date().toLocaleDateString(i18n.language, { day: '2-digit', month: 'short', year: 'numeric' }),
            type: file.type,
            size: 'Unknown',
            data: file.data
          }));
        return [...prevDocs, ...newEntries];
      });
    }
  }, [uploadedFiles, i18n.language]);

  const detectCategory = (filename: string): DocumentEntry['category'] => {
    const lower = filename.toLowerCase();
    if (lower.includes('pass') || lower.includes('id') || lower.includes('cni') || lower.includes('photo')) return 'IDENTITY';
    if (lower.includes('bank') || lower.includes('relev') || lower.includes('fund') || lower.includes('tax') || lower.includes('income')) return 'FINANCIAL';
    if (lower.includes('flight') || lower.includes('hotel') || lower.includes('insurance') || lower.includes('ticket')) return 'TRAVEL';
    if (lower.includes('letter') || lower.includes('invitation') || lower.includes('cover')) return 'SUPPORTING';
    if (lower.includes('cv') || lower.includes('portf') || lower.includes('work')) return 'PROJECT';
    return 'OTHER';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Déterminer l'ID utilisateur : soit authentifié, soit temporaire "guest"
    const userId = user?.uid || 'guest-temp-' + Date.now();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const category = detectCategory(file.name);

        // UPLOAD CLOUD VERS FIREBASE STORAGE
        // Note: import { uploadUserDocument } from '../services/firebase' doit être ajouté
        // Mais nous allons l'importer dynamiquement ou supposer qu'il est dispo pour éviter trop de modifs
        // Pour cet exemple propre, j'utilise la fonction importée du service
        const { uploadUserDocument } = await import('../services/firebase');

        // Afficher un "loading" ou ajouter un état temporaire ici serait bien, mais on fait simple
        const downloadUrl = await uploadUserDocument(userId, file, category);

        if (downloadUrl) {
          const newDoc: DocumentEntry = {
            id: `upload-${Date.now()}-${i}`,
            name: file.name,
            category: category,
            status: 'ANALYZING',
            date: new Date().toLocaleDateString(i18n.language, { day: '2-digit', month: 'short', year: 'numeric' }),
            type: file.type,
            size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
            data: downloadUrl // URL distante Firebasse
          };
          setDocs(prev => [...prev, newDoc]);
        }
      } catch (err) { console.error("Erreur upload:", err); }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveTab('WALLET');
  };

  const handleScanOCR = async () => {
    const docsToScan = docs.filter(d => d.status !== 'MISSING' && (d.data || d.type === 'link'));
    if (docsToScan.length === 0) return;
    setIsScanning(true);
    setDocs(prev => prev.map(d => docsToScan.some(s => s.id === d.id) ? { ...d, status: 'ANALYZING' } : d));
    try {
      const results = await performDocumentAudit(docsToScan);
      setDocs(prev => prev.map(d => {
        const res = results.find(r => r.id === d.id);
        if (res) return { ...d, status: res.status as any, analysis: res.analysis };
        if (docsToScan.some(s => s.id === d.id)) return { ...d, status: 'REJECTED', analysis: "Analyse échouée." };
        return d;
      }));
    } catch (err) {
      setDocs(prev => prev.map(d => docsToScan.some(s => s.id === d.id) ? { ...d, status: 'REJECTED', analysis: "Erreur technique." } : d));
    } finally { setIsScanning(false); }
  };

  const downloadFile = (doc: DocumentEntry) => {
    if (!doc.data) return;
    if (doc.type === 'link') { window.open(doc.data, '_blank'); return; }
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteFile = (id: string) => { setDocs(prev => prev.filter(d => d.id !== id)); };

  const totalDocs = docs.length;
  const verifiedDocs = docs.filter(d => d.status === 'VERIFIED').length;
  const pendingDocs = docs.filter(d => d.status === 'ANALYZING' || d.status === 'MISSING').length;

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || (filterStatus === 'VERIFIED' && doc.status === 'VERIFIED') || (filterStatus === 'PENDING' && (doc.status === 'ANALYZING' || doc.status === 'MISSING')) || (filterStatus === 'REJECTED' && doc.status === 'REJECTED');
    return matchesSearch && matchesFilter;
  });

  const categoryConfig = [
    { id: 'IDENTITY', title: t('documents.cat_identity'), icon: <UserSquare size={24} />, required: 2, items: [{ name: 'Passport Bio Page', required: true, size: 'PDF/JPG • 5MB' }, { name: 'Passport Photo', required: true, size: 'JPG • 2MB' }] },
    { id: 'FINANCIAL', title: t('documents.cat_financial'), icon: <Wallet size={24} />, required: 2, items: [{ name: 'Bank Statement', required: true, size: 'PDF • 10MB' }, { name: 'Proof of Income', required: true, size: 'PDF • 5MB' }] },
    { id: 'TRAVEL', title: t('documents.cat_travel'), icon: <Globe size={24} />, required: 3, items: [{ name: 'Flight Tickets', required: true, size: 'PDF • 5MB' }, { name: 'Hotel Booking', required: true, size: 'PDF • 5MB' }] },
    { id: 'SUPPORTING', title: t('documents.cat_supporting'), icon: <FileText size={24} />, required: 0, items: [{ name: 'Cover Letter', required: false, size: 'PDF • 5MB' }] }
  ];

  const getCategoryProgress = (catId: string, totalItems: number) => {
    let matchCount = 0;
    const catConfig = categoryConfig.find(c => c.id === catId);
    if (catConfig) { catConfig.items.forEach(item => { if (docs.some(d => d.name.toLowerCase().includes(item.name.toLowerCase()) || d.name === item.name)) matchCount++; }); }
    const percentage = Math.min(100, Math.round((matchCount / totalItems) * 100));
    return { count: matchCount, percentage };
  };

  const isDocUploaded = (itemName: string) => docs.some(d => (d.name.toLowerCase().includes(itemName.toLowerCase()) || d.name === itemName) && d.status !== 'MISSING');

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8FAFC] min-h-0 scroll-container font-sans">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />
      <div className="w-full max-w-6xl mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="relative rounded-[2rem] overflow-hidden p-8 md:p-10 shadow-2xl shadow-slate-900/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#051229] to-[#0F264A] z-0" /><div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Cloud size={200} color="white" /></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-start gap-5"><div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 text-[#FF9F1C] shadow-lg"><Cloud size={28} /></div><div><h1 className="text-4xl font-serif font-normal text-white mb-1 tracking-tight">{t('documents.title')}</h1><p className="text-blue-100 text-sm font-medium opacity-90 font-sans">{t('documents.subtitle')}</p></div></div>
              <div className="flex items-center gap-3"><button onClick={handleScanOCR} disabled={isScanning || docs.length === 0} className="bg-[#FF9F1C] text-[#051229] px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-amber-400 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-80">{isScanning ? <Loader2 size={18} className="animate-spin" /> : <Scan size={18} />}{isScanning ? t('documents.scanning') : t('documents.scan_btn')}</button>{onClose && (<button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"><X size={20} /></button>)}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between"><div><p className="text-[#FF9F1C] text-[10px] font-bold uppercase tracking-widest mb-1">{t('documents.total')}</p><p className="text-3xl font-bold text-white">{totalDocs}</p></div><div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50"><File size={18} /></div></div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between"><div><p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t('documents.verified')}</p><p className="text-3xl font-bold text-white">{verifiedDocs}</p></div><div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50"><CheckCircle2 size={18} /></div></div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between"><div><p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t('documents.pending')}</p><p className="text-3xl font-bold text-white">{pendingDocs}</p></div><div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50"><Clock size={18} /></div></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex items-center gap-2 mb-8 max-w-6xl mx-auto font-sans">
          <button onClick={() => setActiveTab('UPLOAD')} className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'UPLOAD' ? 'bg-[#051229] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><Cloud size={16} /> {t('documents.tab_upload')}</button>
          <button onClick={() => setActiveTab('CATEGORIES')} className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'CATEGORIES' ? 'bg-[#051229] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><Briefcase size={16} /> {t('documents.tab_cat')}</button>
          <button onClick={() => setActiveTab('WALLET')} className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'WALLET' ? 'bg-[#051229] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><Wallet size={16} /> {t('documents.tab_wallet')}</button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto space-y-8 pb-20 font-sans">
        {activeTab === 'UPLOAD' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-12 md:p-20 text-center relative group hover:border-[#FF9F1C] transition-colors"><div className="absolute inset-0 bg-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" /><div className="relative z-10 flex flex-col items-center"><div className="w-16 h-16 bg-[#051229] text-[#FF9F1C] rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform"><Cloud size={32} /></div><h3 className="text-xl font-bold text-slate-900 mb-2">{t('documents.drag_drop')}</h3><button onClick={() => fileInputRef.current?.click()} className="bg-[#051229] hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-slate-900/10 flex items-center gap-2 transition-all active:scale-95"><FolderOpen size={18} /> {t('documents.browse')}</button></div></div>
            <div className="flex justify-center"><p className="text-xs text-slate-400 font-medium">{t('documents.formats')}</p></div>
            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 md:p-10 shadow-sm"><h3 className="font-bold text-lg text-slate-900 mb-8">{t('documents.guidelines')}</h3></div>
          </div>
        )}
        {activeTab === 'CATEGORIES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {categoryConfig.map((cat) => {
              const stats = getCategoryProgress(cat.id, cat.items.length);
              return (
                <div key={cat.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-6"><div className="flex gap-4"><div className="w-12 h-12 bg-slate-50 text-[#051229] rounded-2xl flex items-center justify-center border border-slate-100">{cat.icon}</div><div><h3 className="font-bold text-slate-900 text-lg">{cat.title}</h3></div></div><div className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100 flex-shrink-0"><span className="text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">{stats.count}/{cat.required}</span></div></div>
                  <div className="mb-8"><div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#051229] rounded-full transition-all duration-1000" style={{ width: `${stats.percentage}%` }} /></div></div>
                  <div className="space-y-4 flex-1 mb-8">{cat.items.map((item, idx) => { const uploaded = isDocUploaded(item.name); return (<div key={idx} className="flex items-center justify-between group"><div className="flex items-center gap-3">{uploaded ? (<div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0"><Check size={10} strokeWidth={4} /></div>) : (<File size={16} className="text-slate-300 flex-shrink-0" />)}<span className={`text-sm font-medium ${uploaded ? 'text-slate-900' : 'text-slate-600'}`}>{item.name}{item.required && !uploaded && <span className="text-red-500 ml-1">*</span>}</span></div><span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{item.size}</span></div>); })}</div>
                  <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 rounded-xl bg-[#051229] text-white font-bold text-sm shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-colors active:scale-[0.98]">{t('documents.tab_upload')}</button>
                </div>
              );
            })}
          </div>
        )}
        {activeTab === 'WALLET' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between"><div><div className="flex items-center gap-3 mb-1"><h3 className="font-bold text-slate-900 text-xl">{t('documents.tab_wallet')}</h3><span className="text-sm font-medium text-slate-500">{docs.length} documents</span></div></div><div className="flex items-center gap-2"><button onClick={() => setViewMode('GRID')} className={`p-2 rounded-lg transition-colors ${viewMode === 'GRID' ? 'bg-[#051229] text-white' : 'bg-white text-slate-400 hover:bg-slate-50'}`}><LayoutGrid size={18} /></button><button onClick={() => setViewMode('LIST')} className={`p-2 rounded-lg transition-colors ${viewMode === 'LIST' ? 'bg-[#051229] text-white' : 'bg-white text-slate-400 hover:bg-slate-50'}`}><ListIcon size={18} /></button></div></div>
            <div className="flex flex-col md:flex-row gap-4"><div className="relative flex-1"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder={t('documents.search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-2 ring-[#FF9F1C]/20 shadow-sm" /></div><div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">{['ALL', 'VERIFIED', 'PENDING', 'REJECTED'].map((status) => (<button key={status} onClick={() => setFilterStatus(status as any)} className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filterStatus === status ? 'bg-[#051229] text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>{status === 'ALL' ? t('documents.filter_all') : status}</button>))}</div></div>
            {filteredDocs.length === 0 ? (<div className="p-20 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm"><FileSearch size={48} className="mx-auto mb-4 text-slate-300" /><p className="font-bold text-slate-700">{t('documents.no_docs')}</p></div>) : (<div className={viewMode === 'GRID' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>{filteredDocs.map((doc) => (viewMode === 'GRID' ? (
              <div key={doc.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col"><div className="h-40 bg-slate-50 relative overflow-hidden group">{doc.data && (doc.type.startsWith('image/') || doc.type === 'application/pdf') ? (<img src={doc.data} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" alt={doc.name} />) : (<div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300"><FileText size={48} /></div>)}<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" /><div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${doc.status === 'VERIFIED' ? 'bg-emerald-500/90 text-white' : doc.status === 'ANALYZING' ? 'bg-amber-500/90 text-white' : doc.status === 'REJECTED' ? 'bg-red-500/90 text-white' : 'bg-slate-500/90 text-white'}`}>{doc.status.toLowerCase()}</div></div><div className="p-5 flex-1 flex flex-col"><h4 className="font-bold text-slate-900 text-sm truncate mb-1" title={doc.name}>{doc.name}</h4><div className="flex gap-2"><button onClick={() => downloadFile(doc)} className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors">{t('documents.download')}</button><button onClick={() => deleteFile(doc.id)} className="p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><Trash2 size={16} /></button></div></div></div>
            ) : (
              <div key={doc.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow"><div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 text-slate-400">{doc.type.includes('image') ? <FileText size={20} /> : <FileText size={20} />}</div><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><h4 className="font-bold text-slate-900 text-sm truncate">{doc.name}</h4></div><p className="text-xs text-slate-400">{doc.category} • {doc.date} • {doc.size}</p></div><div className="flex items-center gap-2"><button onClick={() => downloadFile(doc)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><Download size={18} /></button><button onClick={() => deleteFile(doc.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button></div></div>
            )
            ))}</div>)}
          </div>
        )}
      </div>
      {previewDoc && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-blue-50 text-[#1E3A8A] rounded-xl flex items-center justify-center"><FileText size={20} /></div><div><h3 className="text-slate-900 font-bold text-lg truncate max-w-xs md:max-w-md">{previewDoc.name}</h3><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{previewDoc.category}</p></div></div><button onClick={() => setPreviewDoc(null)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><X size={20} /></button></div>
            <div className="flex-1 bg-slate-50 p-8 flex items-center justify-center">{previewDoc.data && previewDoc.type.startsWith('image/') ? (<img src={previewDoc.data} className="max-w-full max-h-full object-contain shadow-lg rounded-lg" alt="Preview" />) : (<div className="text-center"><FileText size={64} className="mx-auto text-slate-300 mb-4" /><p className="text-slate-500 font-medium">{t('documents.preview_unavailable')}</p><button onClick={() => downloadFile(previewDoc)} className="mt-4 text-[#1E3A8A] font-bold text-sm hover:underline">{t('documents.download')}</button></div>)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
