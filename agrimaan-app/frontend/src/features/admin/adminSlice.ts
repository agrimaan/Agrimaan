// src/features/admin/adminSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  type: string;      // e.g., "Listing", "Supplier"
  entity: string;    // e.g., "Rice (PB-1121)"
  owner: string;     // e.g., "Gurpreet Singh"
  submitted: string; // e.g., "2h ago"
  status: string;    // e.g., "Pending" | "Review" | "Approved" | "Rejected"
};

export type SystemHealthItem = {
  name: 'ACMS' | 'APAM' | 'ADSS' | 'ADSP' | string;
  status: 'Operational' | 'Degraded' | 'Down' | string;
};

export type AdminState = {
  kpis: Kpis;
  approvals: Approval[];
  systemHealth: SystemHealthItem[];
};

const initialState: AdminState = {
  kpis: {
    farmers: 512,
    buyers: 203,
    listings: 148,
    shipments: 76,
    pendingApprovals: 9,
    disputes: 2,
  },
  approvals: [
    {
      id: 'APP-1092',
      type: 'Listing',
      entity: 'Rice (PB-1121)',
      owner: 'Gurpreet Singh',
      submitted: '2h ago',
      status: 'Pending',
    },
    {
      id: 'APP-1091',
      type: 'Supplier',
      entity: 'Amit Logistics',
      owner: 'Amit Patel',
      submitted: '6h ago',
      status: 'Review',
    },
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
  reducers: {
    setKpis(state, action: PayloadAction<Partial<Kpis>>) {
      state.kpis = { ...state.kpis, ...action.payload };
    },
    addApproval(state, action: PayloadAction<Approval>) {
      state.approvals.unshift(action.payload);
    },
    updateApprovalStatus(state, action: PayloadAction<{ id: string; status: string }>) {
      const idx = state.approvals.findIndex(a => a.id === action.payload.id);
      if (idx !== -1) state.approvals[idx].status = action.payload.status;
    },
    setSystemHealth(state, action: PayloadAction<SystemHealthItem[]>) {
      state.systemHealth = action.payload;
    },
  },
});

export const { setKpis, addApproval, updateApprovalStatus, setSystemHealth } = adminSlice.actions;
export default adminSlice.reducer;
