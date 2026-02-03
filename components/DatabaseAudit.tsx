import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { ArrowLeft, RefreshCw, Database, AlertCircle } from 'lucide-react';

interface DatabaseAuditProps {
    onBack: () => void;
}

const DatabaseAudit: React.FC<DatabaseAuditProps> = ({ onBack }) => {
    const [selectedCollection, setSelectedCollection] = useState<'appointments' | 'sessions' | 'users'>('appointments');
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch last 50 appointments (optionally filtered)
            let q = query(collection(db, selectedCollection), orderBy('createdAt', 'desc'), limit(50));
            // Note: In a real app we would apply a "where" clause here, but for audit purposes we simply filter client-side or assume the user wants to see everything.

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAppointments(data);
        } catch (err: any) {
            console.error("Audit Fetch Error:", err);
            setError(err.message || "Impossible de récupérer les données.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedCollection]);

    // Helper to detect potential issues
    const analyzeEntry = (entry: any) => {
        const issues = [];
        if (!entry.originCollection) issues.push("Missing originCollection");
        if (!entry.createdAt) issues.push("Missing createdAt");
        if (!entry.email) issues.push("Missing email");
        if (entry.originCollection !== 'web_leads_v2') issues.push(`Unknown origin: ${entry.originCollection}`);
        return issues;
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-3xl font-black text-[#051229] flex items-center gap-3">
                            <Database size={32} className="text-[#FF9F1C]" />
                            Audit Base de Données
                        </h1>
                    </div>
                    <div className="flex bg-slate-200 p-1 rounded-lg">
                        {['appointments', 'sessions', 'users'].map((col) => (
                            <button
                                key={col}
                                onClick={() => setSelectedCollection(col as any)}
                                className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${selectedCollection === col ? 'bg-white text-[#051229] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {col}
                            </button>
                        ))}
                    </div>
                    <button onClick={fetchData} className="flex items-center gap-2 bg-[#051229] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#0F264A]">
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Actualiser
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6 flex items-center gap-3">
                        <AlertCircle size={20} />
                        <p>{error}</p>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100/50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                                    <th className="p-4">ID / Date</th>
                                    <th className="p-4">Status / Origin</th>
                                    <th className="p-4">Client</th>
                                    <th className="p-4">Visa / Detail</th>
                                    <th className="p-4">Issues</th>
                                    <th className="p-4">Raw Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {appointments.map((apt) => {
                                    const issues = analyzeEntry(apt);
                                    return (
                                        <tr key={apt.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-4 align-top">
                                                <div className="font-mono text-xs text-slate-400 mb-1">{apt.id}</div>
                                                <div className="font-medium text-[#051229]">
                                                    {apt.createdAt?.seconds ? new Date(apt.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide mb-1 ${apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {apt.status || 'unknown'}
                                                </div>
                                                <div className="text-xs text-slate-500">{apt.originCollection || 'No Origin'}</div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="font-bold text-[#051229]">{apt.name || 'No Name'}</div>
                                                <div className="text-slate-500">{apt.email || 'No Email'}</div>
                                                <div className="text-xs text-slate-400 mt-1">{apt.contactDetail} ({apt.contactMethod})</div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="font-medium text-[#051229]">{apt.visaType}</div>
                                                <div className="text-xs text-slate-500">{apt.date} at {apt.time}</div>
                                            </td>
                                            <td className="p-4 align-top">
                                                {issues.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {issues.map((i, idx) => (
                                                            <div key={idx} className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded flex items-center gap-1">
                                                                <AlertCircle size={10} /> {i}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-emerald-500 text-xs font-bold flex items-center gap-1"><Check size={12} /> OK</span>
                                                )}
                                            </td>
                                            <td className="p-4 align-top">
                                                <details className="text-xs">
                                                    <summary className="cursor-pointer text-blue-600 hover:underline">JSON</summary>
                                                    <pre className="mt-2 bg-slate-900 text-slate-200 p-2 rounded max-w-xs overflow-auto max-h-40 text-[10px]">
                                                        {JSON.stringify(apt, null, 2)}
                                                    </pre>
                                                </details>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {appointments.length === 0 && !loading && (
                            <div className="p-12 text-center text-slate-400">
                                <Database size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Aucune donnée trouvée.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatabaseAudit;

import { Check } from 'lucide-react';
