import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: { activeOrders: 0, suppliers: 0, inTransit: 0, monthlySpend: '₹0' },
  listings: [],
  orders: [],
};

const buyerSlice = createSlice({
  name: 'buyer',
  initialState,
  reducers: {}
});

export default buyerSlice.reducer;
