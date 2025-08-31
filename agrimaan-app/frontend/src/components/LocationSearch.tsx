import React from "react";
import { api } from "../lib/api";

type Suggestion = {
  id: number | string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type?: string;
  countryCode?: string | null;
};

type Props = {
  value: string;
  onChange: (v: string) => void;
  onPick: (s: Suggestion) => void; // called when user selects a suggestion
  placeholder?: string;
};

export default function LocationSearch({ value, onChange, onPick, placeholder }: Props) {
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [active, setActive] = React.useState<number>(-1);
  const boxRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const debounceRef = React.useRef<number | undefined>(undefined);

  // Close on outside click
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Debounced fetch
  React.useEffect(() => {
    if (!value?.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await api<Suggestion[]>(`/api/geo/suggest?query=${encodeURIComponent(value)}`);
        setSuggestions(res);
        setOpen(true);
      } catch (e) {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [value]);

  function selectIndex(i: number) {
    const s = suggestions[i];
    if (!s) return;
    onPick(s);
    setOpen(false);
    // Move cursor to end
    requestAnimationFrame(() => inputRef.current?.setSelectionRange(value.length, value.length));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((p) => Math.min(p + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((p) => Math.max(p - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0) selectIndex(active);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={boxRef}>
      <input
        ref={inputRef}
        type="text"
        className="border rounded px-2 py-1 w-72"
        placeholder={placeholder || "Search a location"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => (suggestions.length ? setOpen(true) : null)}
        onKeyDown={onKeyDown}
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && (
        <div className="absolute z-20 mt-1 w-[24rem] max-h-72 overflow-auto rounded border bg-white shadow-lg text-sm">
          {loading && <div className="px-3 py-2 text-gray-500">Searching…</div>}
          {!loading && suggestions.length === 0 && (
            <div className="px-3 py-2 text-gray-500">No matches</div>
          )}
          {!loading &&
            suggestions.map((s, i) => (
              <button
                key={s.id}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                  i === active ? "bg-gray-100" : ""
                }`}
                onMouseEnter={() => setActive(i)}
                onClick={() => selectIndex(i)}
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-gray-500">{s.displayName}</div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
