// src/constants/manipulative_presets.js
export const MANIPULATIVE_LABS = {
  fractions: {
    id: 'fractions',
    titleSv: 'Bråklabb',
    titleEn: 'Fraction Lab',
    toolbarMode: 'fractions',
    defaultElements: [
      { id: 'f1', type: 'frac_rect', x: 260, y: 220, width: 380, height: 120, divisions: 4, sliceColors: { 0: '#6366f1', 1: '#6366f1' } },
      { id: 'f2', type: 'frac_rect', x: 260, y: 390, width: 380, height: 120, divisions: 8, sliceColors: { 0: '#6366f1', 1: '#6366f1', 2: '#6366f1', 3: '#6366f1' } },
      { id: 'f3', type: 'frac_circle', x: 800, y: 250, width: 280, height: 280, divisions: 6, sliceColors: { 0: '#10b981', 1: '#10b981' } },
      { id: 'f4', type: 'spinner', x: 1250, y: 250, width: 280, height: 280, divisions: 5, sliceColors: {} }
    ]
  },
  algebra_tiles: {
    id: 'algebra_tiles',
    titleSv: 'Algebrabrickor',
    titleEn: 'Algebra Tiles',
    toolbarMode: 'algebra_tiles',
    defaultElements: [
      { id: 'mat_line', type: 'line', x1: 960, y1: 120, x2: 960, y2: 960, stroke: '#94a3b8', strokeWidth: 4, strokeDasharray: '8 8' },
      { id: 'at_x2_1', type: 'algebra_tile', tileKind: 'x2', sign: 1, x: 300, y: 240, width: 140, height: 140 },
      { id: 'at_x2_2', type: 'algebra_tile', tileKind: 'x2', sign: -1, x: 470, y: 240, width: 140, height: 140 },
      { id: 'at_x_1', type: 'algebra_tile', tileKind: 'x', sign: 1, x: 640, y: 240, width: 45, height: 140, isRotated: false },
      { id: 'at_1_1', type: 'algebra_tile', tileKind: '1', sign: 1, x: 720, y: 240, width: 45, height: 45 },
      { id: 'at_1_2', type: 'algebra_tile', tileKind: '1', sign: -1, x: 720, y: 300, width: 45, height: 45 }
    ]
  },
  geometry: {
    id: 'geometry',
    titleSv: 'Geometri & Koordinater',
    titleEn: 'Geometry Lab',
    toolbarMode: 'geometry',
    defaultElements: [
      { id: 'coord_plane', type: 'coord', x: 220, y: 180, width: 720, height: 720, gridMin: -10, gridMax: 10, step: 1 },
      { id: 't_chart', type: 't_chart', x: 1020, y: 180, width: 260, height: 380, rows: [{ x: '-2', y: '-4' }, { x: '0', y: '0' }, { x: '2', y: '4' }] }
    ]
  }
};