
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Types
interface Alert {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timeout?: number;
}

interface AlertState {
  alerts: Alert[];
}

// Initial state
const initialState: AlertState = {
  alerts: []
};

// Slice
const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setAlert: {
      reducer: (state, action: PayloadAction<Alert>) => {
        state.alerts.push(action.payload);
      },
      prepare: ({ message, type, timeout = 5000 }: Omit<Alert, 'id'>) => {
        return {
          payload: {
            id: uuidv4(),
            message,
            type,
            timeout
          }
        };
      }
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    }
  }
});

export const { setAlert, removeAlert } = alertSlice.actions;

export default alertSlice.reducer;