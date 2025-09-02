import { createSlice } from '@reduxjs/toolkit';

export type Kpis = {
  farmers: number;
  buyers: number;
  listings: number;
  shipments: number;
  pendingApprovals: number;
  disputes: number;
};

export type Approval = {
  id: string;
  type: string;
  entity: string;
  owner: string;
  submitted: string;
  status: string;
};

export type SystemHealthItem = {
  name: string;
  status: 'Operational' | 'Degraded' | 'Down' | string;
};

export type AdminState = {
  kpis: Kpis;
  approvals: Approval[];
  systemHealth: SystemHealthItem[];
};

const initialState: AdminState = {
  kpis: { farmers: 512, buyers: 203, listings: 148, shipments: 76, pendingApprovals: 9, disputes: 2 },
  approvals: [
    { id: 'APP-1092', type: 'Listing', entity: 'Rice (PB-1121)', owner: 'Gurpreet Singh', submitted: '2h ago', status: 'Pending' },
    { id: 'APP-1091', type: 'Supplier', entity: 'Amit Logistics', owner: 'Amit Patel', submitted: '6h ago', status: 'Review' },
  ],
  systemHealth: [
    { name: 'ACMS', status: 'Operational' },
    { name: 'APAM', status: 'Operational' },
    { name: 'ADSS', status: 'Degraded' },
    { name: 'ADSP', status: 'Operational' },
  ],
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {}
});

export default adminSlice.reducer;
