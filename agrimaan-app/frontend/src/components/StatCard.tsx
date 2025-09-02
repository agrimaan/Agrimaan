// components/StatCard.tsx
import { Card, CardContent, Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

type Props = {
  title: string;
  value: ReactNode;
  Icon: ReactNode;
};
export default function StatCard({ title, value, Icon }: Props) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
            <Typography variant="h4" component="div">{value}</Typography>
          </Box>
          {Icon}
        </Box>
      </CardContent>
    </Card>
  );
}
