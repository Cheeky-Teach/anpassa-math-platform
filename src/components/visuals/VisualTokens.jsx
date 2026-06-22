// src/components/visuals/VisualTokens.js

export const VISUAL_TOKENS = {
    // 1. Unified Coordinate System
    CANVAS: {
        WIDTH: 400,
        HEIGHT: 300,
        VIEWBOX: "0 0 400 300"
    },

    // 2. Stroke & Line Thickness
    STROKE: {
        THICK: 4,      // Primary shapes
        MEDIUM: 2,     // Secondary shapes / axes
        THIN: 1,       // Grid lines / guides
        DASHED: "6, 6" // For hidden lines or projections
    },

    // 3. Typography
    FONT: {
        FAMILY: "Inter, sans-serif",
        SIZE: {
            TITLE: 24,
            LABEL: 18,
            SMALL: 12
        },
        WEIGHT: {
            BOLD: "900",
            NORMAL: "500"
        }
    },

    // 4. Color Palette
    COLORS: {
        PRIMARY: {
            FILL: "#ecfdf5",   // Light emerald
            STROKE: "#10b981", // Emerald 500
        },
        SECONDARY: {
            FILL: "#eff6ff",   // Light blue
            STROKE: "#3b82f6", // Blue 500
        },
        NEUTRAL: {
            FILL: "#f8fafc",
            STROKE: "#cbd5e1", // Slate 300
            GRID: "#e2e8f0"    // Slate 200
        },
        TEXT: {
            MAIN: "#334155",   // Slate 700
            MUTED: "#94a3b8"   // Slate 400
        },
        ACCENT: {
            RED: "#ef4444",
            AMBER: "#f59e0b"
        }
    }
};