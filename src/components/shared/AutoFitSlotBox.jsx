// src/components/shared/AutoFitSlotBox.jsx
import React, { useState, useEffect, useRef } from 'react';

export const SHEET_PADDING_PX = 38; // ~10mm at 96 DPI

export function AutoFitSlotBox({
  maxHeightPx,
  minScale = 0.55,
  disabled = false,
  preserveWidth = false,
  recalcKey = null,
  className = '',
  children
}) {
  const outerRef = useRef(null);
  const measureRef = useRef(null);
  const contentRef = useRef(null);
  const [fitScale, setFitScale] = useState(1);

  const stateRef = useRef({
    scale: 1,
    lastUnscaledH: 0,
    rafId: null
  });

  useEffect(() => {
    if (disabled || !maxHeightPx || maxHeightPx <= 0) {
      stateRef.current.scale = 1;
      stateRef.current.lastUnscaledH = 0;
      setFitScale(1);
      return;
    }

    const el = measureRef.current;
    const contentEl = contentRef.current;
    if (!el || !contentEl) return;

    const recalc = (force = false) => {
      const curScale = stateRef.current.scale;
      const currentH = Math.max(el.scrollHeight, contentEl.scrollHeight);
      if (!currentH) return;

      const estimatedUnscaledH =
        curScale < 1 ? currentH / Math.sqrt(curScale) : currentH;

      if (
        !force &&
        stateRef.current.lastUnscaledH > 0 &&
        Math.abs(estimatedUnscaledH - stateRef.current.lastUnscaledH) < 6
      ) {
        return;
      }

      stateRef.current.lastUnscaledH = estimatedUnscaledH;

      if (estimatedUnscaledH <= maxHeightPx + 2) {
        if (curScale !== 1) {
          stateRef.current.scale = 1;
          setFitScale(1);
        }
        return;
      }

      const raw = maxHeightPx / currentH;
      const damped = curScale < 1 ? curScale * Math.sqrt(raw) : raw;
      const clamped = Math.max(minScale, Math.min(1, Number(damped.toFixed(3))));

      if (force || Math.abs(clamped - curScale) >= 0.015) {
        stateRef.current.scale = clamped;
        setFitScale(clamped);
      }
    };

    stateRef.current.lastUnscaledH = 0;
    recalc(true);

    let cancelled = false;
    const raf1 = requestAnimationFrame(() => {
      if (!cancelled) {
        requestAnimationFrame(() => {
          if (!cancelled) recalc(true);
        });
      }
    });
    const t1 = setTimeout(() => {
      if (!cancelled) recalc(true);
    }, 120);
    const t2 = setTimeout(() => {
      if (!cancelled) recalc(true);
    }, 400);
    const t3 = setTimeout(() => {
      if (!cancelled) recalc(true);
    }, 800);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) recalc(true);
      });
    }

    const ro = new ResizeObserver(() => {
      if (stateRef.current.rafId) cancelAnimationFrame(stateRef.current.rafId);
      stateRef.current.rafId = requestAnimationFrame(() => recalc(true));
    });

    ro.observe(contentEl);
    Array.from(contentEl.children).forEach((child) => ro.observe(child));

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      ro.disconnect();
      if (stateRef.current.rafId) cancelAnimationFrame(stateRef.current.rafId);
    };
  }, [maxHeightPx, minScale, disabled, preserveWidth, recalcKey]);

  if (disabled || !maxHeightPx) {
    return <div className={`w-full min-w-0 ${className}`}>{children}</div>;
  }

  const measureStyle =
    fitScale < 1
      ? {
          width: `${(100 / fitScale).toFixed(3)}%`,
          transform: `scale(${fitScale})`,
          transformOrigin: 'top left',
          '--slot-inv-scale': (1 / fitScale).toFixed(4)
        }
      : {
          width: '100%',
          '--slot-inv-scale': 1
        };

  return (
    <div
      ref={outerRef}
      style={{ height: `${Math.floor(maxHeightPx)}px` }}
      className={`relative w-full min-w-0 overflow-hidden ${
        preserveWidth ? 'print:!h-full' : ''
      } ${className}`}
    >
      <div
        ref={measureRef}
        style={measureStyle}
        className={`min-w-0 ${
          preserveWidth || fitScale >= 1 ? 'h-full flex flex-col' : ''
        }`}
      >
        <div
          ref={contentRef}
          className={`w-full min-w-0 ${
            preserveWidth || fitScale >= 1 ? 'flex-1 flex flex-col min-h-0' : ''
          }`}
        >
          {children}
        </div>
      </div>

      {fitScale < 0.99 && (
        <span
          aria-hidden="true"
          className="print:hidden pointer-events-none absolute bottom-1 right-1.5 px-1.5 py-0.5 rounded bg-stone-900/75 text-white font-mono text-[10px] font-bold"
        >
          {Math.round(fitScale * 100)}%
        </span>
      )}
    </div>
  );
}

export function SheetArtboard({
  idx,
  totalPages,
  activePaper,
  zoom,
  isActive,
  onSelect,
  children
}) {
  const scaledWidth = Math.round(activePaper.widthPx * zoom);
  const scaledHeight = Math.round(activePaper.heightPx * zoom);

  return (
    <div
      data-sheet-index={idx}
      style={{
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`
      }}
      className="poster-sheet-sizer relative shrink-0 transition-[width,height] duration-150"
    >
      <div
        onClick={onSelect}
        style={{
          width: `${activePaper.widthPx}px`,
          height: `${activePaper.heightPx}px`,
          padding: `${SHEET_PADDING_PX}px`,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          '--sheet-w-mm': `${activePaper.widthMm}mm`,
          '--sheet-h-mm': `${activePaper.heightMm}mm`
        }}
        className={`poster-sheet-artboard whiteboard-protect bg-white text-stone-900 shadow-xl print:shadow-none border print:border-0 flex flex-col justify-between gap-2 relative overflow-hidden ${
          isActive
            ? 'ring-2 ring-sky-600/60 print:ring-0 border-stone-300'
            : 'border-stone-200'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0">{children}</div>

        <div
          aria-hidden="true"
          className="print:hidden pointer-events-none absolute bottom-1.5 right-3 text-[10px] font-mono font-bold text-stone-400"
        >
          {idx + 1} / {totalPages}
        </div>
      </div>
    </div>
  );
}