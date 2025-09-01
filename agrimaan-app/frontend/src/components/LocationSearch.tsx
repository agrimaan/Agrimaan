import * as React from "react";
import { Autocomplete, TextField, CircularProgress, Box, Typography } from "@mui/material";
import { Suggestion } from "../features/weather/weatherSlice";
import { api } from "../lib/api";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onPick: (s: Suggestion) => void;
  placeholder?: string;
};

export default function LocationSearch({ value, onChange, onPick, placeholder }: Props) {
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const debounceRef = React.useRef<number | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    if (!value?.trim() || value.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      try {
        const res = await api<any>(
          `/api/geo/suggest?query=${encodeURIComponent(value)}`,
          { signal: abortRef.current.signal as any }
        );

        const arr: unknown = res && Array.isArray(res?.data) ? res.data : res;
        const safe: Suggestion[] = Array.isArray(arr) ? arr : [];

        setSuggestions(safe);
        setOpen(safe.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [value]);

  return (
    <Autocomplete
      fullWidth
      freeSolo
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={suggestions}
      filterOptions={(x) => x}
      inputValue={value}
      onInputChange={(_, newVal) => {
        onChange(newVal);
        if (!newVal) {
          setSuggestions([]);
          setOpen(false);
        }
      }}
      getOptionLabel={(opt) =>
        typeof opt === "string" ? opt : opt?.displayName || opt?.name || ""
      }
      isOptionEqualToValue={(opt, val) =>
        typeof val === "string" ? opt.displayName === val || opt.name === val : opt.id === val.id
      }
      loading={loading}
      noOptionsText={value.trim().length < 2 ? "Type at least 2 characters" : "No matches"}
      loadingText="Searching…"
      onChange={(_, picked) => {
        if (picked && typeof picked !== "string") {
          onPick(picked as Suggestion);
          onChange((picked as Suggestion).displayName ?? (picked as Suggestion).name);
          setOpen(false);
        }
      }}
      renderOption={(props, option) => (
        <li {...props} key={String(option.id)}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {option.name || option.displayName}
            </Typography>
            {option.displayName && option.displayName !== option.name && (
              <Typography variant="caption" color="text.secondary">
                {option.displayName}
              </Typography>
            )}
          </Box>
        </li>
      )}
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
      ListboxProps={{ style: { maxHeight: 320, overflow: "auto" } }}
    />
  );
}
