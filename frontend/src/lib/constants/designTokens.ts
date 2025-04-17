// Color palette for the ChainSight components
export const DNA_COLORS = {
  primary: "#00FFFF", // Electric Cyan
  secondary: "#FF00FF", // Vibrant Magenta
  tertiary: "#00FF7F", // Bioluminescent Green
  accent: "#4B0082", // Deep Indigo
  background: {
    dark: "#080828", // Dark Navy
    darker: "#05051A", // Deeper Navy
  },
  text: {
    primary: "#FFFFFF", // White
    secondary: "#B8B8D0", // Light Lavender
    muted: "#6E6E9A", // Muted Purple
  },
  status: {
    success: "#00FF7F", // Bioluminescent Green
    warning: "#FFD700", // Gold
    error: "#FF355E", // Bright Red
  },
  gradients: {
    primary: "linear-gradient(135deg, #00FFFF 0%, #0080FF 100%)", // Cyan to Blue
    secondary: "linear-gradient(135deg, #FF00FF 0%, #9000FF 100%)", // Magenta to Purple
    tertiary: "linear-gradient(135deg, #00FF7F 0%, #00BFFF 100%)", // Green to Cyan
  },
};

// Shadows and glows for UI elements
export const EFFECTS = {
  glassMorphism: {
    background: "rgba(8, 8, 40, 0.7)",
    backdropFilter: "blur(10px)",
    border: `1px solid rgba(255, 255, 255, 0.1)`,
  },
  shadows: {
    small: "0 2px 10px rgba(0, 0, 0, 0.2)",
    medium: "0 4px 20px rgba(0, 0, 0, 0.25)",
    large: "0 10px 30px rgba(0, 0, 0, 0.3)",
  },
  glows: {
    cyan: `0 0 15px rgba(0, 255, 255, 0.5)`,
    magenta: `0 0 15px rgba(255, 0, 255, 0.5)`,
    green: `0 0 15px rgba(0, 255, 127, 0.5)`,
  },
};

// Animation presets
export const ANIMATIONS = {
  transitions: {
    fast: { duration: 0.2, ease: "easeOut" },
    medium: { duration: 0.5, ease: "easeOut" },
    slow: { duration: 0.8, ease: "easeInOut" },
  },
  hover: {
    grow: { scale: 1.05 },
    glow: (color: string) => ({ boxShadow: `0 0 15px ${color}` }),
    float: { y: -5 },
  },
};

// Responsive breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

// Z-index layers
export const Z_LAYERS = {
  background: -10,
  content: 10,
  overlay: 20,
  modal: 30,
  tooltip: 40,
  highest: 50,
}; 