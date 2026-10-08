import React from 'react';

const e = React.createElement;

export const Icon = ({ name, className = 'w-5 h-5', ...props }) => {
  const iconProps = {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    ...props
  };

  switch (name) {
    case 'BookOpen':
      return e('svg', iconProps,
        e('path', { d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" }),
        e('path', { d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" })
      );
    case 'Calculator':
      return e('svg', iconProps,
        e('rect', { width: "16", height: "20", x: "4", y: "2", rx: "2" }),
        e('line', { x1: "8", x2: "16", y1: "6", y2: "6" }),
        e('line', { x1: "16", x2: "16", y1: "14", y2: "18" }),
        e('path', { d: "M16 10h.01" }), e('path', { d: "M12 10h.01" }), e('path', { d: "M8 10h.01" }),
        e('path', { d: "M12 14h.01" }), e('path', { d: "M8 14h.01" }),
        e('path', { d: "M12 18h.01" }), e('path', { d: "M8 18h.01" })
      );
    case 'Laptop':
      return e('svg', iconProps,
        e('path', { d: "M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55A1 1 0 0 1 20.34 20H3.66a1 1 0 0 1-.94-1.45L4 16" })
      );
    case 'Smartphone':
      return e('svg', iconProps,
        e('rect', { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2" }),
        e('path', { d: "M12 18h.01" })
      );
    case 'Bike':
      return e('svg', iconProps,
        e('circle', { cx: "5.5", cy: "17.5", r: "3.5" }), e('circle', { cx: "18.5", cy: "17.5", r: "3.5" }),
        e('path', { d: "M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 12l-3 5.5" }),
        e('path', { d: "M12 17.5V14l-3-3 4-3 2 3h4" })
      );
    case 'Armchair':
      return e('svg', iconProps,
        e('path', { d: "M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" }),
        e('path', { d: "M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0z" }),
        e('path', { d: "M5 18v2" }), e('path', { d: "M19 18v2" })
      );
    case 'Coffee':
      return e('svg', iconProps,
        e('path', { d: "M17 8h1a4 4 0 1 1 0 8h-1" }), e('path', { d: "M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" }),
        e('line', { x1: "6", x2: "6", y1: "2", y2: "4" }), e('line', { x1: "10", x2: "10", y1: "2", y2: "4" }), e('line', { x1: "14", x2: "14", y1: "2", y2: "4" })
      );
    case 'Shirt':
      return e('svg', iconProps,
        e('path', { d: "M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" })
      );
    case 'Trophy':
      return e('svg', iconProps,
        e('path', { d: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6" }),
        e('path', { d: "M18 9h1.5a2.5 2.5 0 0 0 0-5H18" }),
        e('path', { d: "M4 22h16" }), e('path', { d: "M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" }),
        e('path', { d: "M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" }),
        e('path', { d: "M18 2H6v7a6 6 0 0 0 12 0V2z" })
      );
    case 'Users':
      return e('svg', iconProps,
        e('path', { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
        e('circle', { cx: "9", cy: "7", r: "4" }),
        e('path', { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
        e('path', { d: "M16 3.13a4 4 0 0 1 0 7.75" })
      );
    case 'Search':
      return e('svg', iconProps,
        e('circle', { cx: "11", cy: "11", r: "8" }), e('line', { x1: "21", x2: "16.65", y1: "21", y2: "16.65" })
      );
    case 'GraduationCap':
      return e('svg', iconProps,
        e('path', { d: "M22 10v6M2 10l10-5 10 5-10 5z" }),
        e('path', { d: "M6 12v5c3 3 9 3 12 0v-5" })
      );
    case 'Heart':
      return e('svg', iconProps,
        e('path', { d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" })
      );
    case 'Share2':
      return e('svg', iconProps,
        e('circle', { cx: "18", cy: "5", r: "3" }), e('circle', { cx: "6", cy: "12", r: "3" }), e('circle', { cx: "18", cy: "19", r: "3" }),
        e('line', { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49" }), e('line', { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49" })
      );
    case 'MapPin':
      return e('svg', iconProps,
        e('path', { d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" }),
        e('circle', { cx: "12", cy: "10", r: "3" })
      );
    case 'Building2':
      return e('svg', iconProps,
        e('path', { d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" }),
        e('path', { d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" }),
        e('path', { d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" }),
        e('path', { d: "M10 6h4" }), e('path', { d: "M10 10h4" }), e('path', { d: "M10 14h4" }), e('path', { d: "M10 18h4" })
      );
    case 'Filter':
    case 'SlidersHorizontal':
      return e('svg', iconProps,
        e('line', { x1: "21", x2: "14", y1: "4", y2: "4" }), e('line', { x1: "10", x2: "3", y1: "4", y2: "4" }),
        e('line', { x1: "21", x2: "12", y1: "12", y2: "12" }), e('line', { x1: "8", x2: "3", y1: "12", y2: "12" }),
        e('line', { x1: "21", x2: "16", y1: "20", y2: "20" }), e('line', { x1: "12", x2: "3", y1: "20", y2: "20" }),
        e('line', { x1: "14", x2: "14", y1: "2", y2: "6" }), e('line', { x1: "8", x2: "8", y1: "10", y2: "14" }), e('line', { x1: "16", x2: "16", y1: "18", y2: "22" })
      );
    case 'PlusCircle':
      return e('svg', iconProps,
        e('circle', { cx: "12", cy: "12", r: "10" }), e('line', { x1: "12", x2: "12", y1: "8", y2: "16" }), e('line', { x1: "8", x2: "16", y1: "12", y2: "12" })
      );
    case 'User':
      return e('svg', iconProps,
        e('path', { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }), e('circle', { cx: "12", cy: "7", r: "4" })
      );
    case 'Sparkles':
      return e('svg', iconProps,
        e('path', { d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" })
      );
    case 'CheckCircle2':
      return e('svg', iconProps,
        e('circle', { cx: "12", cy: "12", r: "10" }), e('path', { d: "m9 12 2 2 4-4" })
      );
    case 'MessageCircle':
      return e('svg', iconProps,
        e('path', { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z" })
      );
    case 'X':
      return e('svg', iconProps,
        e('line', { x1: "18", x2: "6", y1: "6", y2: "18" }), e('line', { x1: "6", x2: "18", y1: "6", y2: "18" })
      );
    case 'ChevronRight':
      return e('svg', iconProps,
        e('polyline', { points: "9 18 15 12 9 6" })
      );
    case 'ChevronDown':
      return e('svg', iconProps,
        e('polyline', { points: "6 9 12 15 18 9" })
      );
    case 'ArrowLeft':
      return e('svg', iconProps,
        e('line', { x1: "19", x2: "5", y1: "12", y2: "12" }), e('polyline', { points: "12 19 5 12 12 5" })
      );
    case 'Tag':
      return e('svg', iconProps,
        e('path', { d: "M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" }),
        e('circle', { cx: "7", cy: "7", r: ".5", fill: "currentColor" })
      );
    case 'AlertCircle':
      return e('svg', iconProps,
        e('circle', { cx: "12", cy: "12", r: "10" }), e('line', { x1: "12", x2: "12", y1: "8", y2: "12" }), e('line', { x1: "12", x2: "12.01", y1: "16", y2: "16" })
      );
    case 'Trash2':
      return e('svg', iconProps,
        e('path', { d: "M3 6h18" }), e('path', { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }), e('path', { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" })
      );
    case 'LogOut':
      return e('svg', iconProps,
        e('path', { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }), e('polyline', { points: "16 17 21 12 16 7" }), e('line', { x1: "21", x2: "9", y1: "12", y2: "12" })
      );
    default:
      return e('svg', iconProps, e('circle', { cx: "12", cy: "12", r: "10" }));
  }
};
