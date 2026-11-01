// src/components/whiteboard/utils/whiteboardExportHelper.js

/**
 * Deeply inlines computed visual styles (colors, stroke widths, fonts)
 * so elements retain their appearance outside of the React/Tailwind DOM.
 */
function cloneWithComputedStyles(source) {
    const clone = source.cloneNode(false);

    if (source.nodeType === Node.ELEMENT_NODE) {
        const computed = window.getComputedStyle(source);
        const styleProps = [
            'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-dasharray',
            'stroke-linecap', 'stroke-linejoin', 'opacity', 'font-family', 
            'font-size', 'font-weight', 'text-anchor', 'dominant-baseline',
            'color', 'visibility'
        ];

        let styleStr = '';
        styleProps.forEach(prop => {
            const val = computed.getPropertyValue(prop);
            if (val && val !== 'none' && val !== 'normal') {
                styleStr += `${prop}:${val};`;
            }
        });

        if (styleStr) {
            clone.setAttribute('style', styleStr);
        }
    }

    for (const child of source.childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE) {
            // Strip interactive menus, selection outlines, and handle pills
            if (
                child.classList?.contains('ui-ignore') || 
                child.getAttribute('data-ui') === 'true' ||
                child.tagName.toLowerCase() === 'foreignobject' ||
                (child.tagName.toLowerCase() === 'rect' && child.getAttribute('stroke-dasharray')) ||
                (child.tagName.toLowerCase() === 'g' && child.querySelector('rect[rx="10"], rect[rx="8"]'))
            ) {
                continue;
            }
            clone.appendChild(cloneWithComputedStyles(child));
        } else if (child.nodeType === Node.TEXT_NODE) {
            clone.appendChild(child.cloneNode(true));
        }
    }

    return clone;
}

/**
 * Serializes the clean SVG XML using the live viewport transform and layout.
 */
function serializeCleanSvg(svgRootRef, elements, selectedIds, padding = 18) {
    if (!svgRootRef || !selectedIds || selectedIds.length === 0) return null;

    const ctm = svgRootRef.getScreenCTM();
    if (!ctm) return null;

    let minClientX = Infinity;
    let maxClientX = -Infinity;
    let minClientY = Infinity;
    let maxClientY = -Infinity;

    const liveNodes = [];

    selectedIds.forEach(id => {
        const liveNode = svgRootRef.querySelector(`[data-id="${id}"]`);
        if (liveNode) {
            liveNodes.push(liveNode);
            const rect = liveNode.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                minClientX = Math.min(minClientX, rect.left);
                maxClientX = Math.max(maxClientX, rect.right);
                minClientY = Math.min(minClientY, rect.top);
                maxClientY = Math.max(maxClientY, rect.bottom);
            }
        }
    });

    if (liveNodes.length === 0 || minClientX === Infinity) return null;

    // Convert screen coordinates back into SVG user coordinate space
    const pt1 = svgRootRef.createSVGPoint();
    pt1.x = minClientX;
    pt1.y = minClientY;
    const svgPt1 = pt1.matrixTransform(ctm.inverse());

    const pt2 = svgRootRef.createSVGPoint();
    pt2.x = maxClientX;
    pt2.y = maxClientY;
    const svgPt2 = pt2.matrixTransform(ctm.inverse());

    const minX = Math.min(svgPt1.x, svgPt2.x);
    const maxX = Math.max(svgPt1.x, svgPt2.x);
    const minY = Math.min(svgPt1.y, svgPt2.y);
    const maxY = Math.max(svgPt1.y, svgPt2.y);

    const width = Math.max(maxX - minX, 40) + padding * 2;
    const height = Math.max(maxY - minY, 40) + padding * 2;
    const viewBoxX = minX - padding;
    const viewBoxY = minY - padding;

    // Clone defs (filters, gradients, markers)
    const defsNode = svgRootRef.querySelector('defs');
    const clonedDefs = defsNode ? defsNode.cloneNode(true) : null;

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    liveNodes.forEach(liveNode => {
        const cloned = cloneWithComputedStyles(liveNode);
        group.appendChild(cloned);
    });

    const serializer = new XMLSerializer();
    const defsXml = clonedDefs ? serializer.serializeToString(clonedDefs) : '';
    const contentXml = serializer.serializeToString(group);

    const svgXml = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="${viewBoxX} ${viewBoxY} ${width} ${height}">
    <style>
        text { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    </style>
    ${defsXml}
    ${contentXml}
</svg>`;

    return { svgXml, width, height };
}

/**
 * Loads the SVG directly via a data URI to satisfy CSP constraints.
 */
function svgToImage(svgXml) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        // Safe URI encoding replaces Blob URLs, respecting "img-src 'self' data:"
        const encoded = encodeURIComponent(svgXml)
            .replace(/'/g, '%27')
            .replace(/"/g, '%22');
        const dataUri = `data:image/svg+xml;charset=utf-8,${encoded}`;

        img.onload = () => resolve(img);
        img.onerror = (err) => reject(new Error('Browser failed to parse SVG data URI'));
        img.src = dataUri;
    });
}

/**
 * Rasterizes the SVG to a high-DPI PNG blob on an in-memory canvas.
 */
async function svgToPngBlob(svgXml, width, height, scale = 2) {
    const img = await svgToImage(svgXml);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas toBlob conversion failed'));
        }, 'image/png');
    });
}

/**
 * Copies the selected elements to the clipboard as a high-DPI PNG.
 */
export async function copyObjectToClipboard(svgRootRef, elements, selectedIds, padding = 18) {
    if (!svgRootRef || !selectedIds || selectedIds.length === 0) return false;

    try {
        const serialized = serializeCleanSvg(svgRootRef, elements, selectedIds, padding);
        if (!serialized) return false;

        const pngBlob = await svgToPngBlob(serialized.svgXml, serialized.width, serialized.height, 2);

        if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': pngBlob })
            ]);
            return true;
        }
        return false;
    } catch (err) {
        console.error('Failed to copy whiteboard object to clipboard:', err);
        return false;
    }
}

/**
 * Triggers a file download of the selected element(s) as a transparent PNG.
 */
export async function downloadObjectAsPng(svgRootRef, elements, selectedIds, filename = 'matematik-figur.png', padding = 18) {
    if (!svgRootRef || !selectedIds || selectedIds.length === 0) return false;

    try {
        const serialized = serializeCleanSvg(svgRootRef, elements, selectedIds, padding);
        if (!serialized) return false;

        const pngBlob = await svgToPngBlob(serialized.svgXml, serialized.width, serialized.height, 2);

        const url = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        return true;
    } catch (err) {
        console.error('Failed to download whiteboard object:', err);
        return false;
    }
}