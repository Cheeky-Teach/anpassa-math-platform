// src/utils/exportSVG.js

/**
 * Syncs live DOM <input> and <textarea> values onto their HTML attributes
 * before cloneNode(true) so user-typed edits are preserved in the clone.
 */
function syncLiveFormValues(rootElement) {
    if (!rootElement) return;
    rootElement.querySelectorAll('input').forEach(inp => {
        inp.setAttribute('value', inp.value ?? '');
    });
    rootElement.querySelectorAll('textarea').forEach(ta => {
        ta.textContent = ta.value ?? '';
    });
}

export async function downloadSvgAsImage(svgElement, {
    width = 1920,
    height = 1080,
    fileName = 'whiteboard.png',
    backgroundColor = '#ffffff'
} = {}) {
    if (!svgElement) return;

    // 1. Sync user-typed values onto DOM attributes, then deep clone
    syncLiveFormValues(svgElement);
    const clonedSvg = svgElement.cloneNode(true);

    // 2. Clean overlays and vectorize foreignObjects
    sanitizeClonedSvg(clonedSvg);

    // 3. Ensure SVG namespaces and dimensions
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    clonedSvg.setAttribute('width', String(width));
    clonedSvg.setAttribute('height', String(height));
    if (!clonedSvg.getAttribute('viewBox')) {
        clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }

    // 4. Inject clean system font definitions into <defs>
    let defs = clonedSvg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        clonedSvg.insertBefore(defs, clonedSvg.firstChild);
    }
    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleEl.textContent = `
        text, tspan {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
    `;
    defs.appendChild(styleEl);

    // 5. Serialize and encode
    const serializer = new XMLSerializer();
    let xmlString = serializer.serializeToString(clonedSvg);
    xmlString = xmlString.replace(/<(input|img|br|hr)([^>]*?)(?<!\/)>/gi, '<$1$2 />');

    const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xmlString);
    const img = new Image();

    await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (err) => {
            console.error("SVG rasterization failed:", err);
            reject(err);
        };
        img.src = svgDataUrl;
    });

    // 6. Render to canvas and trigger download
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(img, 0, 0, width, height);

    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
}

/**
 * Exports a single element from the canvas by elementId with a tight bounding box.
 */
export async function downloadElementAsImage(svgElement, elementId, {
    padding = 24,
    fileName = `tool-${elementId}.png`,
    backgroundColor = 'transparent'
} = {}) {
    if (!svgElement || !elementId) return;

    // 1. Locate the live element node and sync typed input values
    const liveTarget = svgElement.querySelector(`[data-id="${elementId}"]`);
    if (!liveTarget) {
        console.warn(`Element with id ${elementId} not found in SVG`);
        return;
    }
    syncLiveFormValues(liveTarget);

    // Measure live geometry
    let bbox;
    try {
        bbox = liveTarget.getBBox();
    } catch {
        bbox = { x: 0, y: 0, width: 400, height: 400 };
    }

    // 2. Clone the target element
    const clonedTarget = liveTarget.cloneNode(true);

    // 3. Construct a virtual SVG container fitted tightly around the element
    const cropX = Math.floor(bbox.x - padding);
    const cropY = Math.floor(bbox.y - padding);
    const cropW = Math.ceil(bbox.width + padding * 2);
    const cropH = Math.ceil(bbox.height + padding * 2);

    const virtualSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    virtualSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    virtualSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    virtualSvg.setAttribute('viewBox', `${cropX} ${cropY} ${cropW} ${cropH}`);
    virtualSvg.setAttribute('width', String(cropW));
    virtualSvg.setAttribute('height', String(cropH));

    // 4. Inject typography into virtual <defs>
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleEl.textContent = `
        text, tspan {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            user-select: none;
        }
    `;
    defs.appendChild(styleEl);
    virtualSvg.appendChild(defs);
    virtualSvg.appendChild(clonedTarget);

    // 5. Run cleanup & vectorization passes
    sanitizeClonedSvg(virtualSvg);

    // 6. Serialize to image data URL
    const serializer = new XMLSerializer();
    let xmlString = serializer.serializeToString(virtualSvg);
    xmlString = xmlString.replace(/<(input|img|br|hr)([^>]*?)(?<!\/)>/gi, '<$1$2 />');

    const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xmlString);
    const img = new Image();

    await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (err) => {
            console.error("Single element export failed:", err);
            reject(err);
        };
        img.src = svgDataUrl;
    });

    // 7. Render to HTML5 canvas sized to the cropped object
    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d');

    if (backgroundColor && backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, cropW, cropH);
    }

    ctx.drawImage(img, 0, 0, cropW, cropH);

    // 8. Download
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
}

function sanitizeClonedSvg(rootNode) {
    // 1. Remove grip bars
    const gripIcons = rootNode.querySelectorAll('.lucide-grip-horizontal, [data-lucide="grip-horizontal"]');
    gripIcons.forEach(icon => {
        const handleGroup = icon.closest('g');
        if (handleGroup && handleGroup.parentNode && handleGroup.parentNode.tagName.toLowerCase() === 'g') {
            handleGroup.remove();
        } else {
            icon.remove();
        }
    });

    // 2. Remove selection handles, resize rects, rotation circles, and marquee boxes
    const overlays = [
        '[data-ui="true"]',
        'circle.cursor-alias',
        'rect.cursor-nwse-resize',
        'circle.cursor-crosshair',
        'rect[stroke-dasharray="5 4"]',
        'rect[stroke-dasharray="6 4"]'
    ];
    rootNode.querySelectorAll(overlays.join(',')).forEach(el => el.remove());

    // 3. Process foreignObjects (Context menus, T-Chart cells, dimension badges, fraction shapes, calculator)
    const foreignObjects = Array.from(rootNode.querySelectorAll('foreignObject'));
    foreignObjects.forEach(fo => {
        // Menus & floating action buttons
        if (
            fo.querySelector('[data-whiteboard-interactive="true"]') || 
            fo.querySelector('.lucide-trash-2') || 
            fo.querySelector('.lucide-copy') ||
            (fo.classList.contains('ui-ignore') && fo.querySelector('button') && !fo.querySelector('.grid-cols-4'))
        ) {
            fo.remove();
            return;
        }

        const foX = parseFloat(fo.getAttribute('x') || '0');
        const foY = parseFloat(fo.getAttribute('y') || '0');
        const foW = parseFloat(fo.getAttribute('width') || '100');
        const foH = parseFloat(fo.getAttribute('height') || '100');

        // --- A. Multi-Input Containers (TChartTool Header & Data Rows) ---
        const allInputs = Array.from(fo.querySelectorAll('input'));
        if (allInputs.length > 1 && !fo.querySelector('.grid-cols-4')) {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${foX}, ${foY})`);

            const rowDivs = Array.from(fo.querySelectorAll('div.flex')).filter(
                div => div.querySelectorAll('input').length === 2
            );

            if (rowDivs.length > 1) {
                // T-Chart Body Rows Container
                const numRows = rowDivs.length;
                const cellH = foH / numRows;

                rowDivs.forEach((rowDiv, rIdx) => {
                    const rowInputs = rowDiv.querySelectorAll('input');
                    const valX = rowInputs[0]?.getAttribute('value') ?? rowInputs[0]?.value ?? '';
                    const valY = rowInputs[1]?.getAttribute('value') ?? rowInputs[1]?.value ?? '';
                    const centerY = rIdx * cellH + cellH / 2;

                    // Horizontal row separator line
                    if (rIdx < numRows - 1) {
                        const rowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        rowLine.setAttribute('x1', '8');
                        rowLine.setAttribute('y1', String((rIdx + 1) * cellH));
                        rowLine.setAttribute('x2', String(foW - 8));
                        rowLine.setAttribute('y2', String((rIdx + 1) * cellH));
                        rowLine.setAttribute('stroke', '#e2e8f0');
                        rowLine.setAttribute('stroke-width', '1.5');
                        g.appendChild(rowLine);
                    }

                    // Left Column (X) Value
                    const txtX = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    txtX.setAttribute('x', String(foW * 0.25));
                    txtX.setAttribute('y', String(centerY));
                    txtX.setAttribute('text-anchor', 'middle');
                    txtX.setAttribute('dominant-baseline', 'central');
                    txtX.setAttribute('fill', '#1e293b');
                    txtX.setAttribute('font-size', '18');
                    txtX.setAttribute('font-weight', '900');
                    txtX.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
                    txtX.textContent = valX;
                    g.appendChild(txtX);

                    // Right Column (Y) Value
                    const txtY = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    txtY.setAttribute('x', String(foW * 0.75));
                    txtY.setAttribute('y', String(centerY));
                    txtY.setAttribute('text-anchor', 'middle');
                    txtY.setAttribute('dominant-baseline', 'central');
                    txtY.setAttribute('fill', '#1e293b');
                    txtY.setAttribute('font-size', '18');
                    txtY.setAttribute('font-weight', '900');
                    txtY.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
                    txtY.textContent = valY;
                    g.appendChild(txtY);
                });
            } else {
                // T-Chart Column Headers (headerX & headerY)
                const headX = allInputs[0]?.getAttribute('value') ?? allInputs[0]?.value ?? '';
                const headY = allInputs[1]?.getAttribute('value') ?? allInputs[1]?.value ?? '';

                const txtHX = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                txtHX.setAttribute('x', String(foW * 0.25));
                txtHX.setAttribute('y', String(foH / 2));
                txtHX.setAttribute('text-anchor', 'middle');
                txtHX.setAttribute('dominant-baseline', 'central');
                txtHX.setAttribute('fill', '#0f172a');
                txtHX.setAttribute('font-size', '20');
                txtHX.setAttribute('font-weight', '900');
                txtHX.setAttribute('font-style', 'italic');
                txtHX.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
                txtHX.textContent = headX;
                g.appendChild(txtHX);

                const txtHY = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                txtHY.setAttribute('x', String(foW * 0.75));
                txtHY.setAttribute('y', String(foH / 2));
                txtHY.setAttribute('text-anchor', 'middle');
                txtHY.setAttribute('dominant-baseline', 'central');
                txtHY.setAttribute('fill', '#0f172a');
                txtHY.setAttribute('font-size', '20');
                txtHY.setAttribute('font-weight', '900');
                txtHY.setAttribute('font-style', 'italic');
                txtHY.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
                txtHY.textContent = headY;
                g.appendChild(txtHY);
            }

            fo.parentNode.replaceChild(g, fo);
            return;
        }

        // --- B. Single Dimension Badges (Shapes3DTool, BasicShapesTool, Protractor) ---
        const input = allInputs[0];
        if (input && !fo.querySelector('.grid-cols-4')) {
            const val = input.getAttribute('value') ?? input.value ?? '';
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${foX}, ${foY})`);

            const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bg.setAttribute('width', String(foW));
            bg.setAttribute('height', String(foH));
            bg.setAttribute('rx', '14');
            bg.setAttribute('fill', '#ffffff');
            bg.setAttribute('stroke', '#cbd5e1');
            bg.setAttribute('stroke-width', '2');

            const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            txt.setAttribute('x', String(foW / 2));
            txt.setAttribute('y', String(foH / 2));
            txt.setAttribute('text-anchor', 'middle');
            txt.setAttribute('dominant-baseline', 'central');
            txt.setAttribute('fill', '#0f172a');
            txt.setAttribute('font-size', '15');
            txt.setAttribute('font-weight', '900');
            txt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
            txt.textContent = val;

            g.appendChild(bg);
            g.appendChild(txt);
            fo.parentNode.replaceChild(g, fo);
            return;
        }

        // --- C. Fraction Capsules ---
        const fractionCol = fo.querySelector('.flex.flex-col.items-center.justify-center');
        const percentOrDecimal = fo.querySelector('.font-black.text-slate-900.leading-none');
        if (fractionCol || percentOrDecimal) {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${foX}, ${foY})`);

            const badgeW = 75;
            const badgeH = 50;
            const badgeOffsetX = foW - badgeW;

            const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bg.setAttribute('x', String(badgeOffsetX));
            bg.setAttribute('y', '0');
            bg.setAttribute('width', String(badgeW));
            bg.setAttribute('height', String(badgeH));
            bg.setAttribute('rx', '18');
            bg.setAttribute('fill', '#ffffff');
            bg.setAttribute('stroke', '#e2e8f0');
            bg.setAttribute('stroke-width', '2.5');
            g.appendChild(bg);

            const centerX = badgeOffsetX + badgeW / 2;

            if (fractionCol) {
                const spans = fractionCol.querySelectorAll('span');
                const numVal = spans[0]?.textContent || '0';
                const denVal = spans[spans.length - 1]?.textContent || '1';

                const numTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                numTxt.setAttribute('x', String(centerX));
                numTxt.setAttribute('y', String(badgeH / 2 - 11));
                numTxt.setAttribute('text-anchor', 'middle');
                numTxt.setAttribute('dominant-baseline', 'central');
                numTxt.setAttribute('fill', '#0f172a');
                numTxt.setAttribute('font-size', '17');
                numTxt.setAttribute('font-weight', '900');
                numTxt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
                numTxt.textContent = numVal;

                const barLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                barLine.setAttribute('x1', String(centerX - 16));
                barLine.setAttribute('y1', String(badgeH / 2));
                barLine.setAttribute('x2', String(centerX + 16));
                barLine.setAttribute('y2', String(badgeH / 2));
                barLine.setAttribute('stroke', '#0f172a');
                barLine.setAttribute('stroke-width', '2.5');
                barLine.setAttribute('stroke-linecap', 'round');

                const denTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                denTxt.setAttribute('x', String(centerX));
                denTxt.setAttribute('y', String(badgeH / 2 + 12));
                denTxt.setAttribute('text-anchor', 'middle');
                denTxt.setAttribute('dominant-baseline', 'central');
                denTxt.setAttribute('fill', '#0f172a');
                denTxt.setAttribute('font-size', '17');
                denTxt.setAttribute('font-weight', '900');
                denTxt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
                denTxt.textContent = denVal;

                g.appendChild(numTxt);
                g.appendChild(barLine);
                g.appendChild(denTxt);
            } else if (percentOrDecimal) {
                const singleTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                singleTxt.setAttribute('x', String(centerX));
                singleTxt.setAttribute('y', String(badgeH / 2));
                singleTxt.setAttribute('text-anchor', 'middle');
                singleTxt.setAttribute('dominant-baseline', 'central');
                singleTxt.setAttribute('fill', '#0f172a');
                singleTxt.setAttribute('font-size', '18');
                singleTxt.setAttribute('font-weight', '900');
                singleTxt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
                singleTxt.textContent = percentOrDecimal.textContent || '';
                g.appendChild(singleTxt);
            }

            fo.parentNode.replaceChild(g, fo);
            return;
        }

        // --- D. Calculator Screen + Buttons ---
        const calcButtons = fo.querySelectorAll('.grid.grid-cols-4 button');
        const calcScreenExpr = fo.querySelector('.text-slate-400.font-bold');
        const calcScreenResult = fo.querySelector('.text-emerald-400.font-black');

        if (calcButtons.length > 0) {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${foX}, ${foY})`);

            const screenPad = 16;
            const screenH = Math.max(90, Math.round(foH * 0.22));
            const screenW = foW - screenPad * 2;

            const screenBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            screenBg.setAttribute('x', String(screenPad));
            screenBg.setAttribute('y', '32');
            screenBg.setAttribute('width', String(screenW));
            screenBg.setAttribute('height', String(screenH));
            screenBg.setAttribute('rx', '14');
            screenBg.setAttribute('fill', '#020617');
            screenBg.setAttribute('stroke', '#334155');
            screenBg.setAttribute('stroke-width', '2');
            g.appendChild(screenBg);

            if (calcScreenExpr && calcScreenExpr.textContent) {
                const exprTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                exprTxt.setAttribute('x', String(screenPad + screenW - 14));
                exprTxt.setAttribute('y', '58');
                exprTxt.setAttribute('text-anchor', 'end');
                exprTxt.setAttribute('fill', '#94a3b8');
                exprTxt.setAttribute('font-size', '16');
                exprTxt.setAttribute('font-weight', '700');
                exprTxt.setAttribute('font-family', 'monospace');
                exprTxt.textContent = calcScreenExpr.textContent;
                g.appendChild(exprTxt);
            }

            const resTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            resTxt.setAttribute('x', String(screenPad + screenW - 14));
            resTxt.setAttribute('y', String(32 + screenH - 22));
            resTxt.setAttribute('text-anchor', 'end');
            resTxt.setAttribute('fill', '#34d399');
            resTxt.setAttribute('font-size', '34');
            resTxt.setAttribute('font-weight', '900');
            resTxt.setAttribute('font-family', 'monospace');
            resTxt.textContent = calcScreenResult ? (calcScreenResult.textContent || '0') : '0';
            g.appendChild(resTxt);

            const gridTop = 32 + screenH + 16;
            const gridH = foH - gridTop - 16;
            const cols = 4;
            const rows = 6;
            const gap = 8;
            const cellW = (screenW - gap * (cols - 1)) / cols;
            const cellH = (gridH - gap * (rows - 1)) / rows;

            calcButtons.forEach((btn, idx) => {
                const c = idx % cols;
                const r = Math.floor(idx / cols);
                const bx = screenPad + c * (cellW + gap);
                const by = gridTop + r * (cellH + gap);
                const label = btn.textContent.trim();

                let fill = '#334155';
                let textColor = '#ffffff';
                if (label === 'AC' || label === 'DEL') fill = '#e11d48';
                else if (label === '=') fill = '#4f46e5';
                else if (['÷', '×', '-', '+', '^', '%', '√'].includes(label)) {
                    fill = '#f59e0b';
                    textColor = '#0f172a';
                }

                const bRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bRect.setAttribute('x', String(bx));
                bRect.setAttribute('y', String(by));
                bRect.setAttribute('width', String(cellW));
                bRect.setAttribute('height', String(cellH));
                bRect.setAttribute('rx', '12');
                bRect.setAttribute('fill', fill);
                g.appendChild(bRect);

                const bTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                bTxt.setAttribute('x', String(bx + cellW / 2));
                bTxt.setAttribute('y', String(by + cellH / 2 + 1));
                bTxt.setAttribute('text-anchor', 'middle');
                bTxt.setAttribute('dominant-baseline', 'central');
                bTxt.setAttribute('fill', textColor);
                bTxt.setAttribute('font-size', '20');
                bTxt.setAttribute('font-weight', '900');
                bTxt.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
                bTxt.textContent = label;
                g.appendChild(bTxt);
            });

            fo.parentNode.replaceChild(g, fo);
            return;
        }
    });
}