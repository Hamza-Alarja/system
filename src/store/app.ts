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
  name: string;
  showroomId: string;
    showroomName?: string;

  salary: number;
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'salary' | 'sales' | 'custody' | 'expense' | 'deduction';
  amount: number;
  description?: string;
  employeeId?: string;
  showroomId?: string;
  createdBy: string;
  createdAt: string;
}

interface AppState {
  showrooms: Showroom[];
  employees: Employee[];
  transactions: Transaction[];
  isLoading: boolean;
  selectedShowroom: Showroom | null;
  selectedEmployee: Employee | null;

  setShowrooms: (showrooms: Showroom[]) => void;
  addShowroom: (showroom: Omit<Showroom, 'id' | 'createdAt'> & Partial<Showroom>) => void;
  setEmployees: (employees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  setLoading: (loading: boolean) => void;
  setSelectedShowroom: (showroom: Showroom | null) => void;
  setSelectedEmployee: (employee: Employee | null) => void;
}

export const useAppStore = create<AppState>()((set) => ({
    employees: [],
  showrooms: [],
  transactions: [],
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
 
  isLoading: false,
  selectedShowroom: null,
  selectedEmployee: null,

  setShowrooms: (showrooms) => set({ showrooms }),

  addShowroom: (showroom) =>
    set((state) => {
      const finalManagers =
        Array.isArray(showroom.managers) && showroom.managers.length > 0
          ? showroom.managers
          : [];

      return {
        showrooms: [
          ...state.showrooms,
          {
            ...showroom,
            id: showroom.id || Date.now().toString(),
            managers: finalManagers,
            employeeCount: showroom.employeeCount || 0,
            createdAt: showroom.createdAt || new Date().toISOString(),
          },
        ],
      };
    }),

  setEmployees: (employees) => set({ employees }),
  addEmployee: (employee) => set((state) => ({
    employees: [...state.employees, employee]
  })),

  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) => set((state) => ({
    transactions: [...state.transactions, transaction]
  })),

  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedShowroom: (selectedShowroom) => set({ selectedShowroom }),
  setSelectedEmployee: (selectedEmployee) => set({ selectedEmployee }),
}));
