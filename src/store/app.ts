import { create } from 'zustand';

export interface Showroom {
  id: string;
  name: string;
  managers: string[];
  address: string;
  employeeCount: number;
  createdAt: string;
}

export interface Employee {
 id: string;
  user_id: string;
  name: string;
  salary: number;
  role: string;
  showroom_id?: string;
  showroomName?: string; 
  createdAt: string;
}

export interface Transaction {
  showroom_name: string;
  employee_name: string;
  id: string;
  type: 'salary' | 'sales' | 'custody' | 'expense' | 'deduction';
  amount: number;
  description?: string;
  employeeId?: string;
  employee_id?: string;
  showroomId?: string;
  showroom_id?: string;
  createdBy: string;
  
  createdAt: string;
  created_at?: Date;
}

interface AppState {
  showrooms: Showroom[];
  employees: Employee[];
  transactions: Transaction[];
  isLoading: boolean;
  selectedShowroom: Showroom | null;
  selectedEmployee: Employee | null;

  // Existing setters
  setShowrooms: (showrooms: Showroom[]) => void;
  addShowroom: (showroom: Omit<Showroom, 'id' | 'createdAt'> & Partial<Showroom>) => void;
  setEmployees: (employees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  setLoading: (loading: boolean) => void;
  setSelectedShowroom: (showroom: Showroom | null) => void;
  setSelectedEmployee: (employee: Employee | null) => void;

  // Fetch functions (for compatibility with your page)
  fetchEmployees: () => Promise<void>;
  fetchShowrooms: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
}

export const useAppStore = create<AppState>()((set) => ({
  employees: [],
  showrooms: [],
  transactions: [],
  isLoading: false,
  selectedShowroom: null,
  selectedEmployee: null,

  // Setters
  setShowrooms: (showrooms) => set({ showrooms }),
  addShowroom: (showroom) =>
    set((state) => ({
      showrooms: [
        ...state.showrooms,
        {
          ...showroom,
          id: showroom.id || Date.now().toString(),
          managers: showroom.managers || [],
          employeeCount: showroom.employeeCount || 0,
          createdAt: showroom.createdAt || new Date().toISOString(),
        },
      ],
    })),
  setEmployees: (employees) => set({ employees }),
  addEmployee: (employee) => set((state) => ({ employees: [...state.employees, employee] })),
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) => set((state) => ({ transactions: [...state.transactions, transaction] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedShowroom: (selectedShowroom) => set({ selectedShowroom }),
  setSelectedEmployee: (selectedEmployee) => set({ selectedEmployee }),

  // Fetch functions
  fetchEmployees: async () => {
    const res = await fetch("/api/employees");
    const data = await res.json();
    set({ employees: data.employees || [] });
  },
  fetchShowrooms: async () => {
    const res = await fetch("/api/showrooms");
    const data = await res.json();
    set({ showrooms: data.showrooms || [] });
  },
  fetchTransactions: async () => {
    const res = await fetch("/api/transactions");
    const data = await res.json();
    set({ transactions: data.transactions || [] });
  },
}));
