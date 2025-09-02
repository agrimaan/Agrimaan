import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import fieldReducer from './features/fields/fieldSlice';
import cropReducer from './features/crops/cropSlice';
import sensorReducer from './features/sensors/sensorSlice';
import analyticsReducer from './features/analytics/analyticsSlice';
import weatherReducer from './features/weather/weatherSlice';
import alertReducer from './features/alert/alertSlice';
import buyerReducer from './features/buyer/buyerSlice';
import logisticsReducer from './features/logistics/logisticsSlice';   // NEW
import adminReducer from './features/admin/adminSlice';               // NEW

export const store = configureStore({
  reducer: {
    auth: authReducer,
    field: fieldReducer,
    crop: cropReducer,
    sensor: sensorReducer,
    analytics: analyticsReducer,
    weather: weatherReducer,
    alert: alertReducer,
    buyer: buyerReducer, // ⬅️ add this
    logistics: logisticsReducer,// add
    admin: adminReducer,        // add
  },
}
);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;




