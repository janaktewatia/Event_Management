export type ThemeType = "clean-slate" | "unified-hub" | "qrcode-generator" | "light" | "dark";

export interface Theme {
  id: ThemeType;
  name: string;
  description: string;
  colors: {
    primary: string;
    primaryForeground: string;
    background: string;
    surface: string;
    foreground: string;
    pill: string;
    pillText: string;
    tabTrack: string;
  };
}

export const THEMES: Record<ThemeType, Theme> = {
  "clean-slate": {
    id: "clean-slate",
    name: "Clean Slate (Default)",
    description: "Modern clean theme with teal accents",
    colors: {
      primary: "#0085A8",
      primaryForeground: "#ffffff",
      background: "#F7FBFE",
      surface: "#FFFFFF",
      foreground: "#40474D",
      pill: "#E8EFF5",
      pillText: "#40474D",
      tabTrack: "#EBF2F8",
    },
  },
  "unified-hub": {
    id: "unified-hub",
    name: "OrbitOps (Unified Hub)",
    description: "Professional dark theme with teal accents",
    colors: {
      primary: "#0891b2",
      primaryForeground: "#ffffff",
      background: "#0f172a",
      surface: "#1a1f2e",
      foreground: "#f1f5f9",
      pill: "#1e293b",
      pillText: "#e2e8f0",
      tabTrack: "#334155",
    },
  },
  "qrcode-generator": {
    id: "qrcode-generator",
    name: "Event Management",
    description: "Purple theme with modern design",
    colors: {
      primary: "#a855f7",
      primaryForeground: "#ffffff",
      background: "#f8fafc",
      surface: "#ffffff",
      foreground: "#1e1b4b",
      pill: "#f3e8ff",
      pillText: "#6b21a8",
      tabTrack: "#ede9fe",
    },
  },
  light: {
    id: "light",
    name: "Light",
    description: "Clean light theme",
    colors: {
      primary: "#3b82f6",
      primaryForeground: "#ffffff",
      background: "#ffffff",
      surface: "#f9fafb",
      foreground: "#000000",
      pill: "#dbeafe",
      pillText: "#1e40af",
      tabTrack: "#e0e7ff",
    },
  },
  dark: {
    id: "dark",
    name: "Dark",
    description: "Deep dark theme",
    colors: {
      primary: "#10b981",
      primaryForeground: "#ffffff",
      background: "#1f2937",
      surface: "#111827",
      foreground: "#f3f4f6",
      pill: "#064e3b",
      pillText: "#d1fae5",
      tabTrack: "#111827",
    },
  },
};

const STORAGE_KEY = "app_theme";

export function getTheme(): ThemeType {
  if (typeof window === "undefined") return "clean-slate";
  const stored = localStorage.getItem(STORAGE_KEY);
  return (stored as ThemeType) || "clean-slate";
}

export function setTheme(theme: ThemeType): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function applyTheme(theme: ThemeType): void {
  if (typeof window === "undefined") return;
  const themeConfig = THEMES[theme];
  if (!themeConfig) return;

  // Apply to both apps via sessionStorage so QRCodeGenerator can read it
  sessionStorage.setItem("active_theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);

  // Apply CSS variables for unified-hub
  const root = document.documentElement;
  root.style.setProperty("--primary", themeConfig.colors.primary);
  root.style.setProperty("--primary-foreground", themeConfig.colors.primaryForeground);
  root.style.setProperty("--background", themeConfig.colors.background);
  root.style.setProperty("--surface", themeConfig.colors.surface);
  root.style.setProperty("--foreground", themeConfig.colors.foreground);
  root.style.setProperty("--pill", themeConfig.colors.pill);
  root.style.setProperty("--pill-text", themeConfig.colors.pillText);
  root.style.setProperty("--tab-track", themeConfig.colors.tabTrack);

  // Also set as data attribute for CSS selectors
  root.setAttribute("data-theme", theme);

  // Dispatch event so both apps can listen
  window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme, config: themeConfig } }));
}

export function initTheme(): void {
  const theme = getTheme();
  applyTheme(theme);
}
