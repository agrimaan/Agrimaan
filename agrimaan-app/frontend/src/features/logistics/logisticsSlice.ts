import { createSlice } from '@reduxjs/toolkit';

export type Shipment = {
  id: string;
  pickup: string;
  drop: string;
  cargo: string;
  distance: string;
  status: string;
};

export type Job = {
  title: string;
  price: string;
  pickup: string;
  delivery: string;
  weight: string;
  distance: string;
};

export type LogisticsState = {
  stats: { active: number; completed: number; earnings: string; rating: number };
  shipments: Shipment[];
  jobs: Job[];
};

const initialState: LogisticsState = {
  stats: { active: 8, completed: 124, earnings: '₹32,450', rating: 4.8 },
  shipments: [
    { id: '#SH-2024-089', pickup: 'Karnal, Haryana', drop: 'Delhi NCR', cargo: 'Wheat (30 quintals)', distance: '130 km', status: 'In Transit' },
    { id: '#SH-2024-088', pickup: 'Amritsar, Punjab', drop: 'Chandigarh', cargo: 'Rice (20 quintals)', distance: '235 km', status: 'Scheduled' },
    { id: '#SH-2024-087', pickup: 'Agra, UP', drop: 'Delhi NCR', cargo: 'Potatoes (50 quintals)', distance: '180 km', status: 'Pickup Ready' },
    { id: '#SH-2024-086', pickup: 'Meerut, UP', drop: 'Delhi NCR', cargo: 'Vegetables (Mixed)', distance: '70 km', status: 'Delivered' },
  ],
  jobs: [
    { title: 'Rice Transport', price: '₹8,500', pickup: 'Sonipat, Haryana', delivery: 'Ghaziabad, UP', weight: '18t', distance: '115 km' },
    { title: 'Vegetable Run', price: '₹6,200', pickup: 'Meerut, UP', delivery: 'Noida, UP', weight: '8t', distance: '70 km' },
  ],
};

const logisticsSlice = createSlice({
  name: 'logistics',
  initialState,
  reducers: {}
});

export default logisticsSlice.reducer;
