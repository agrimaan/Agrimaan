// This is a simplified version of the store for the Agronomist dashboard
// In a real application, this would be imported from the main store

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'farmer' | 'buyer' | 'admin' | 'logistics' | 'agronomist' | 'investor';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
}

// This is a mock of the Redux store state
const mockUser: User = {
  _id: 'a1',
  name: 'Dr. Agronomist Kumar',
  email: 'agronomist.kumar@agrimaan.com',
  role: 'agronomist'
};

export const mockAuthState: AuthState = {
  user: mockUser,
  isAuthenticated: true,
  loading: false,
  error: null
};

export const mockRootState: RootState = {
  auth: mockAuthState
};