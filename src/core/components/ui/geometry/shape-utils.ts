export interface ShapeProps {
    size?: number | string;
    className?: string;
    fillColor?: string;
}

export interface QuarterCircleProps extends ShapeProps {
    /** Direction the quarter circle faces: 'tl' | 'tr' | 'bl' | 'br' */
    direction?: 'tl' | 'tr' | 'bl' | 'br';
}

// Brand colors — keep in sync with tailwind.config.js brand.* tokens
export const BrandColors = {
    darkBlue:  '#2f567f', // hover/press states
    blue:      '#396799', // PRIMARY: text, borders, fills
    lightBlue: '#3d8ccb', // icons, links, subtle fills
    yellow:    '#fed432', // primary accent
    wine:      '#bc594f', // form error states
    red:       '#ef4444', // destructive actions
    green:     '#10b981', // success indicators
    gray:      '#97abc4', // muted / section labels
    bgLight:   '#f5f6f8', // page background
};
