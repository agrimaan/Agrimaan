// src/components/WeatherAdvicePanel.tsx
import React from "react";
import type { WeatherAdvice } from "../services/ai";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

type Props = {
  advice?: WeatherAdvice | null;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  FieldsName?: string;
};

export default function WeatherAdvicePanel({
  advice,
  loading,
  error,
  onRefresh,
  FieldsName,
}: Props) {
  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Typography variant="h6">
            AI Weather Advice {FieldsName ? `— ${FieldsName}` : ""}
          </Typography>
        }
        action={
          onRefresh && (
            <Button
              onClick={onRefresh}
              size="small"
              startIcon={<RefreshIcon />}
              disabled={loading}
            >
              Refresh
            </Button>
          )
        }
      />
      <CardContent>
        {loading && (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={20} />
            <Typography variant="body2">Analyzing latest forecast…</Typography>
          </Box>
        )}

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}

        {!loading && !error && advice && (
          <Box display="flex" flexDirection="column" gap={2}>
            {advice.summary && (
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {advice.summary}
              </Typography>
            )}

            {advice.risks?.length ? (
              <Box>
                <Typography variant="subtitle2">Risks</Typography>
                <ul style={{ marginLeft: "1.25rem" }}>
                  {advice.risks.map((r, i) => (
                    <li key={i}>
                      <Typography variant="body2">{r}</Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            ) : null}

            {advice.recommendations?.length ? (
              <Box>
                <Typography variant="subtitle2">Recommendations</Typography>
                <ul style={{ marginLeft: "1.25rem" }}>
                  {advice.recommendations.map((r, i) => (
                    <li key={i}>
                      <Typography variant="body2">{r}</Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            ) : null}

            {advice.warnings?.length ? (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "warning.main" }}
                >
                  Warnings
                </Typography>
                <ul style={{ marginLeft: "1.25rem" }}>
                  {advice.warnings.map((r, i) => (
                    <li key={i}>
                      <Typography variant="body2">{r}</Typography>
                    </li>
                  ))}
                </ul>
              </Box>
            ) : null}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
