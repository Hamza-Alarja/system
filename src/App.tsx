import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/layout";
import { LoginPage } from "./pages/auth/login";
import { DashboardPage } from "./pages/dashboard";
import { ShowroomsListPage } from "./pages/showrooms/showrooms-list";
import { AddShowroomPage } from "./pages/showrooms/add-showroom";
import { EmployeesListPage } from "./pages/employees/employees-list";
import { AddEmployeePage } from "./pages/employees/add-employee";
import { TransactionsPage } from "./pages/transactions/transactions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/showrooms" element={<ShowroomsListPage />} />
            <Route path="/showrooms/new" element={<AddShowroomPage />} />
            <Route path="/employees" element={<EmployeesListPage />} />
            <Route path="/employees/new" element={<AddEmployeePage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/" element={<LoginPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
