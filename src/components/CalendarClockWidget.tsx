import { useState, useEffect } from "react";
import { Clock, Calendar as CalendarIcon, ToggleLeft, ToggleRight } from "lucide-react";

export function CalendarClockWidget() {
  const [time, setTime] = useState(new Date());
  const [use24Hour, setUse24Hour] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatClock = () => {
    let hours = time.getHours();
    const minutes = String(time.getMinutes()).padStart(2, "0");
    const seconds = String(time.getSeconds()).padStart(2, "0");
    
    if (use24Hour) {
      return `${String(hours).padStart(2, "0")}:${minutes}:${seconds}`;
    } else {
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // first hour is 0, format to 12
      return `${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
    }
  };

  const formatDate = () => {
    // Standard locales formatting: e.g., Wednesday, 23 May, 2026
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return time.toLocaleDateString("en-US", options);
  };

  return (
    <div
      id="calendar-clock-widget"
      className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full text-white relative overflow-hidden"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-600/20 text-red-500">
          <CalendarIcon className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-stone-400 font-mono tracking-wider font-semibold">CAMPUS DATE</span>
          <span className="text-sm font-sans font-medium">{formatDate()}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-stone-400 font-mono tracking-wider font-semibold">CCE REAL-TIME</span>
            <span className="text-base font-mono font-medium tracking-tight text-white glow-text">
              {formatClock()}
            </span>
          </div>
        </div>

        <button
          onClick={() => setUse24Hour(!use24Hour)}
          id="toggle-time-format-btn"
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-stone-300 text-[11px] transition duration-200 cursor-pointer"
        >
          {use24Hour ? (
            <>
              <span>24H</span>
              <ToggleRight className="w-4 h-4 text-red-500" />
            </>
          ) : (
            <>
              <span>12H</span>
              <ToggleLeft className="w-4 h-4 text-stone-500" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
