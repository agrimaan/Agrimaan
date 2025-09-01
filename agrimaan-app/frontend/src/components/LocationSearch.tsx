import React from "react";
import { api } from "../lib/api";
import {
  Autocomplete,
  TextField,
  CircularProgress,
} from "@mui/material";

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
  onPick: (s: Suggestion) => void;
  placeholder?: string;
};

export default function LocationSearch({
  value,
  onChange,
  onPick,
  placeholder,
}: Props) {
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [loading, setLoading] = React.useState(false);

  const debounceRef = React.useRef<number>();

  React.useEffect(() => {
    if (!value?.trim()) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api<Suggestion[]>(
          `/api/geo/suggest?query=${encodeURIComponent(value)}`
        );
        setSuggestions(res);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  return (
    <Autocomplete
      freeSolo
      fullWidth
      options={suggestions}
      getOptionLabel={(s) => (typeof s === "string" ? s : s.displayName)}
      loading={loading}
      inputValue={value}
      onInputChange={(_, newVal) => onChange(newVal)}
      onChange={(_, newVal) => {
        if (newVal && typeof newVal !== "string") {
          onPick(newVal);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Location"
          placeholder={placeholder}
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
