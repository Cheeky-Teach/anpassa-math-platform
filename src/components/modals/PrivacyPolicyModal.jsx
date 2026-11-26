import React, { useEffect, useState } from 'react';
import { ShieldCheck, Building2, FolderLock, Mail, X, CheckCircle2 } from 'lucide-react';
import { PRIVACY_POLICY_CONTENT } from '../../data/privacyPolicyContent';

const SECTION_ICONS = {
  shield: ShieldCheck,
  building: Building2,
  folder: FolderLock,
  mail: Mail
};

export function PrivacyPolicyContent({ lang = 'sv', contactEmail = '' }) {
  const copy = PRIVACY_POLICY_CONTENT[lang] || PRIVACY_POLICY_CONTENT.sv;

  return (
    <div className="space-y-5 text-[var(--text-main)]">
      {/* Header */}
      <div className="space-y-2">
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-btn)] text-xs font-semibold border"
          style={{
            backgroundColor: 'var(--brand-bg)',
            borderColor: 'var(--brand-border)',
            color: 'var(--brand-text)'
          }}
        >
          <ShieldCheck size={14} />
          <span>{copy.badge}</span>
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
          {copy.title}
        </h2>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          {copy.subtitle}
        </p>
        <p className="text-xs font-mono text-[var(--text-muted)]">
          {lang === 'sv' ? 'Senast uppdaterad:' : 'Last updated:'} {copy.lastUpdated}
        </p>
      </div>

      {/* Quick Reference Box (Uses Design System Callout) */}
      <div className="callout callout-success space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
          {copy.summaryTitle}
        </h3>
        <ul className="space-y-2">
          {copy.summaryBullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm leading-snug text-[var(--text-main)]">
              <CheckCircle2
                size={16}
                className="shrink-0 mt-0.5"
                style={{ color: 'var(--role-primary)' }}
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Detailed White Cards */}
      <div className="space-y-3.5">
        {copy.sections.map((section) => {
          const IconComponent = SECTION_ICONS[section.icon] || ShieldCheck;
          return (
            <section
              key={section.id}
              className="rounded-[var(--radius-card)] bg-[var(--bg-card)] border border-[var(--border-main)] p-4 sm:p-5 space-y-3"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="p-1.5 rounded-[var(--radius-btn)] border"
                  style={{
                    backgroundColor: 'var(--brand-bg)',
                    borderColor: 'var(--brand-border)',
                    color: 'var(--brand-text)'
                  }}
                >
                  <IconComponent size={16} />
                </div>
                <h3 className="font-display text-base font-bold text-[var(--text-main)]">
                  {section.heading}
                </h3>
              </div>

              <div className="space-y-3 pl-1">
                {section.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <p className="text-sm font-semibold text-[var(--text-main)]">
                      {item.label}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {contactEmail && (
        <p className="text-xs text-[var(--text-muted)] pt-1">
          {lang === 'sv' ? 'Kontakt för dataskyddsfrågor:' : 'Privacy contact:'}{' '}
          <a href={`mailto:${contactEmail}`} className="underline font-medium text-[var(--text-main)]">
            {contactEmail}
          </a>
        </p>
      )}
    </div>
  );
}

export function PrivacyPolicyModal({ isOpen, onClose, lang = 'sv', contactEmail = '' }) {
  const copy = PRIVACY_POLICY_CONTENT[lang] || PRIVACY_POLICY_CONTENT.sv;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[var(--radius-card)] bg-[var(--bg-canvas)] border border-[var(--border-strong)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Bar */}
        <div className="flex items-center justify-end px-5 py-3 border-b border-[var(--border-main)] bg-[var(--bg-card)]">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-btn)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-main)] transition-colors cursor-pointer"
          >
            <span>{copy.closeLabel}</span>
            <X size={14} />
          </button>
        </div>

        {/* Scrollable Policy Body */}
        <div className="overflow-y-auto p-5 sm:p-6">
          <PrivacyPolicyContent lang={lang} contactEmail={contactEmail} />
        </div>
      </div>
    </div>
  );
}

export function StudentPrivacyBadge({ lang = 'sv', contactEmail = '', compact = false }) {
  const [open, setOpen] = useState(false);
  const copy = PRIVACY_POLICY_CONTENT[lang] || PRIVACY_POLICY_CONTENT.sv;

  const shortText =
    lang === 'sv'
      ? 'Inga elevkonton • Raderas var 7:e dag'
      : 'No student accounts • Deleted every 7 days';

  const shortLink = lang === 'sv' ? 'Integritet' : 'Privacy';

  return (
    <>
      {compact ? (
        <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1.5 min-w-0 truncate">
            <ShieldCheck size={13} className="shrink-0" style={{ color: 'var(--role-primary)' }} />
            <span className="truncate">{shortText}</span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="underline underline-offset-2 font-medium shrink-0 cursor-pointer text-[var(--text-main)] hover:opacity-80"
          >
            {shortLink}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
          <ShieldCheck size={14} className="shrink-0" style={{ color: 'var(--role-primary)' }} />
          <span>{copy.studentJoinBanner}</span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="underline font-semibold text-[var(--text-main)] hover:opacity-80 cursor-pointer"
          >
            {copy.readMoreLabel}
          </button>
        </div>
      )}

      <PrivacyPolicyModal
        isOpen={open}
        onClose={() => setOpen(false)}
        lang={lang}
        contactEmail={contactEmail}
      />
    </>
  );
}