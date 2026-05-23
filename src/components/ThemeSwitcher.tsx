import { Palette } from "lucide-react";
import { ThemeType } from "../types";

interface ThemeSwitcherProps {
  currentTheme: ThemeType;
  onChangeTheme: (theme: ThemeType) => void;
}

export function ThemeSwitcher({ currentTheme, onChangeTheme }: ThemeSwitcherProps) {
  const themesList: { value: ThemeType; label: string; preview: string }[] = [
    {
      value: "dark-red-black",
      label: "Dark Red & Black",
      preview: "bg-red-700 border-black",
    },
    {
      value: "black-dark-red",
      label: "Black & Dark Red",
      preview: "bg-black border-red-900",
    },
    {
      value: "dark-red-green",
      label: "Dark Red & Classic Green",
      preview: "bg-red-700 border-emerald-900",
    },
  ];

  const handleCycleTheme = () => {
    const currentIndex = themesList.findIndex((t) => t.value === currentTheme);
    const nextIndex = (currentIndex + 1) % themesList.length;
    onChangeTheme(themesList[nextIndex].value);
  };

  const currentThemeLabel = themesList.find((t) => t.value === currentTheme)?.label || "";

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col items-end gap-2" id="theme-switcher-wrapper">
      <button
        onClick={handleCycleTheme}
        id="theme-switcher-btn"
        className="flex items-center gap-2 p-3 rounded-full shadow-lg backdrop-blur-md bg-white/10 text-white border border-white/20 hover:bg-white/25 active:scale-95 transition-all duration-300 group cursor-pointer"
        title="Cycle Themes"
      >
        <Palette className="w-5 h-5 animate-spin-slow group-hover:rotate-45 transition-transform duration-300" />
        <span className="text-xs font-medium font-sans max-w-0 pr-0 group-hover:max-w-xs group-hover:pr-2 overflow-hidden transition-all duration-500 whitespace-nowrap">
          {currentThemeLabel}
        </span>
      </button>
    </div>
  );
}
