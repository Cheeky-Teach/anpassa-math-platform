import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { runTranslationAudit } from '../../../core/utils/devTools/translationAuditor';

export default function TranslationMatrixTab() {
    // Run exactly once when tab mounts
    const translationData = useMemo(() => runTranslationAudit(), []);

    return (
        <div className="space-y-6">
            <div className="border-b border-[var(--border-main)] pb-4 flex justify-between items-end">
                <div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-[var(--text-main)] mb-1">Translation & Content Matrix</h3>
                    <p className="text-xs text-[var(--text-muted)] font-medium">Scanning localization constants for missing strings and broken template variables.</p>
                </div>
                <div className="text-right">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Strings Scanned</span>
                    <span className="text-xl font-black text-[var(--text-main)]">{translationData.totalChecked}</span>
                </div>
            </div>

            {translationData.issues.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] bg-emerald-50/10 border-2 border-emerald-500/20 rounded-xl">
                    <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest text-emerald-600">All translations perfectly synced!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 bg-rose-100 text-rose-700 w-fit">
                        <AlertTriangle size={12}/> {translationData.issues.length} Issues Found
                    </div>
                    
                    <div className="border border-[var(--border-main)] rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--bg-surface)] border-b border-[var(--border-main)]">
                                    <th className="p-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] w-1/4">Location</th>
                                    <th className="p-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] w-1/4">Issue</th>
                                    <th className="p-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] w-1/4 border-l border-[var(--border-main)]">SV</th>
                                    <th className="p-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] w-1/4 border-l border-[var(--border-main)]">EN</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--bg-card)]">
                                {translationData.issues.map((issue, i) => (
                                    <tr key={i} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                                        <td className="p-3 text-xs font-bold text-[var(--text-main)]">{issue.type}</td>
                                        <td className="p-3">
                                            <span className="bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">
                                                {issue.issue}
                                            </span>
                                        </td>
                                        <td className="p-3 text-[11px] font-medium text-[var(--text-muted)] border-l border-[var(--border-subtle)] font-mono">
                                            {issue.sv || <span className="text-rose-400 italic">undefined</span>}
                                        </td>
                                        <td className="p-3 text-[11px] font-medium text-[var(--text-muted)] border-l border-[var(--border-subtle)] font-mono">
                                            {issue.en || <span className="text-rose-400 italic">undefined</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}