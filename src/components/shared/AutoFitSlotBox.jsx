// src/components/shared/AutoFitSlotBox.jsx
import React, { useState, useEffect, useRef } from 'react';

export const SHEET_PADDING_PX = 38; // ~10mm at 96 DPI

/**
 * Measures the natural height of a card inside a strict allotted slot height.
 * Uses a hysteresis deadband + rAF guard to prevent ResizeObserver width-unwrapping
 * oscillation loops when `width: 100% / fitScale` causes text to unwrap onto fewer lines.
 */
export function AutoFitSlotBox({
  maxHeightPx,
  minScale = 0.52,
  disabled = false,
  className = '',
  children
}) {
  const outerRef = useRef(null);
  const measureRef = useRef(null);
  const contentRef = useRef(null);
  const [fitScale, setFitScale] = useState(1);

  // Track last scale and canonical unscaled height to break feedback loops
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

      // Estimate what the unscaled height would be at scale = 1
      const estimatedUnscaledH =
        curScale < 1 ? currentH / Math.sqrt(curScale) : currentH;

      // If content barely changed (< 6px) and not forced, keep current scale to prevent jitter
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

    // Initial measurement + delayed settle passes for KaTeX, web fonts & Framer Motion entrance
    stateRef.current.lastUnscaledH = 0;
    recalc(true);

    let cancelled = false;
    const t1 = setTimeout(() => {
      if (!cancelled) recalc(true);
    }, 120);
    const t2 = setTimeout(() => {
      if (!cancelled) recalc(true);
    }, 400);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) recalc(true);
      });
    }

    const ro = new ResizeObserver(() => {
      if (stateRef.current.rafId) cancelAnimationFrame(stateRef.current.rafId);
      stateRef.current.rafId = requestAnimationFrame(() => recalc(false));
    });

    ro.observe(contentEl);
    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
      if (stateRef.current.rafId) cancelAnimationFrame(stateRef.current.rafId);
    };
  }, [maxHeightPx, minScale, disabled]);

  if (disabled || !maxHeightPx) {
    return <div className={`w-full ${className}`}>{children}</div>;
  }

  return (
    <div
      ref={outerRef}
      style={{ height: `${Math.floor(maxHeightPx)}px` }}
      className={`relative w-full overflow-hidden ${className}`}
    >
      <div
        ref={measureRef}
        style={
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
              }
        }
      >
        <div ref={contentRef} className="w-full">
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

/**
 * Canonical 96-DPI paper artboard wrapped in a scaled layout-box sizer
 * so multi-page scrolling works cleanly without clipping Sheet 2+.
 */
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
        className={`poster-sheet-artboard whiteboard-protect bg-white text-stone-900 shadow-xl print:shadow-none border print:border-0 flex flex-col justify-between gap-2 relative overflow-hidden break-after-page last:break-after-auto ${
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