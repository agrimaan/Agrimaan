import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Snackbar } from '@mui/material';
import { removeAlert } from '../../features/alert/alertSlice';
import { RootState } from '../../store';

const AlertDisplay: React.FC = () => {
  const dispatch = useDispatch();
  const alerts = useSelector((state: RootState) => state.alert.alerts);

  useEffect(() => {
    // Set up timers to remove alerts after their timeout
    alerts.forEach(alert => {
      if (alert.timeout) {
        const timer = setTimeout(() => {
          dispatch(removeAlert(alert.id));
        }, alert.timeout);

        return () => clearTimeout(timer);
      }
    });
  }, [alerts, dispatch]);

  return (
    <>
      {alerts.map((alert, index) => (
        <Snackbar
          key={alert.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          style={{ top: `${(index * 70) + 10}px` }}
        >
          <Alert
            onClose={() => dispatch(removeAlert(alert.id))}
            severity={alert.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default AlertDisplay;