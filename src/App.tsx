import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/auth/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { ContractorForm } from './components/ContractorForm';
import { ClientForm } from './components/ClientForm';
import { ContractorsManagement } from './components/ContractorsManagement';
import { ClientsManagement } from './components/ClientsManagement';
import { SuppliersManagement } from './components/SuppliersManagement';
import { ProjectForm } from './components/ProjectForm';
import { ProjectsManagement } from './components/ProjectsManagement';
import { ProjectContractForm } from './components/ProjectContractForm';
import { ProjectContractsManagement } from './components/ProjectContractsManagement';
import { PaymentSelection } from './components/PaymentSelection';
import { Reports } from './components/Reports';
import { PaymentForm } from './components/PaymentForm';
import { MaterialPaymentForm } from './components/MaterialPaymentForm';
import { ProjectPaymentForm } from './components/ProjectPaymentForm';
import { ProjectPaymentSummary } from './components/ProjectPaymentSummary';
import { AdminReceiptPage } from './components/AdminReceiptPage';
import { StatementGenerator } from './components/statements/StatementGenerator';
import { ProjectContractPayments } from './components/ProjectContractPayments';
import { AddUser } from './components/users/AddUser';
import { UsersList } from './components/users/UsersList';
import EmployeesManagement from './components/employees/EmployeesManagement';
import EmployeeForm from './components/employees/EmployeeForm';
import EmployeeView from './components/employees/EmployeeView';
import ExpensesManagement from './components/expenses/ExpensesManagement';
import ExpenseForm from './components/expenses/ExpenseForm';
import { NotFound } from './components/NotFound';
import { ProfileSettings } from './components/settings/ProfileSettings';

// ─── Client Portal Pages ─────────────────────────────────────────────────────
import { ClientDashboard } from './features/client/pages/ClientDashboard';
import { ClientProjectPage } from './features/client/pages/ClientProjectPage';
import { ClientPaymentsPage } from './features/client/pages/ClientPaymentsPage';

// ─── Contractor Portal Pages ──────────────────────────────────────────────────
import { ContractorDashboard } from './features/contractor/pages/ContractorDashboard';
import { ContractorContractsPage } from './features/contractor/pages/ContractorContractsPage';
import { ContractorPaymentsPage } from './features/contractor/pages/ContractorPaymentsPage';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* ─── Admin Routes ───────────────────────────────────────────────── */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['Admin', 'Accountant']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="contractors/add" element={<ContractorForm />} />
            <Route path="contractors" element={<ContractorsManagement />} />
            <Route path="clients/add" element={<ClientForm />} />
            <Route path="clients" element={<ClientsManagement />} />
            <Route path="suppliers" element={<SuppliersManagement />} />
            <Route path="projects/add" element={<ProjectForm />} />
            <Route path="projects" element={<ProjectsManagement />} />
            <Route path="project-contracts/add" element={<ProjectContractForm />} />
            <Route path="project-contracts" element={<ProjectContractsManagement />} />
            <Route path="payments/add" element={<PaymentSelection />} />
            <Route path="payments/contractor" element={<PaymentForm />} />
            <Route path="payments/all-contractor" element={<ProjectContractPayments />} />
            <Route path="payments/material" element={<MaterialPaymentForm />} />
            <Route path="payments/project" element={<ProjectPaymentForm />} />
            <Route path="payments" element={<ProjectPaymentSummary />} />
            <Route path="receipt/:id" element={<AdminReceiptPage />} />
            <Route path="statements" element={<StatementGenerator />} />
            <Route path="users" element={<UsersList />} />
            <Route path="users/add" element={<AddUser />} />
            <Route path="employees" element={<EmployeesManagement />} />
            <Route path="employees/add" element={<EmployeeForm />} />
            <Route path="employees/edit/:id" element={<EmployeeForm />} />
            <Route path="employees/view/:id" element={<EmployeeView />} />
            <Route path="expenses" element={<ExpensesManagement />} />
            <Route path="expenses/add" element={<ExpenseForm />} />
            <Route path="expenses/edit/:id" element={<ExpenseForm />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>

          {/* ─── Client Portal ──────────────────────────────────────────────── */}
          <Route path="/client" element={
            <ProtectedRoute allowedRoles={['Client']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="project" element={<ClientProjectPage />} />
            <Route path="payments" element={<ClientPaymentsPage />} />
            <Route path="settings" element={<ProfileSettings />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* ─── Contractor Portal ──────────────────────────────────────────── */}
          <Route path="/contractor" element={
            <ProtectedRoute allowedRoles={['Contractor']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<ContractorDashboard />} />
            <Route path="contracts" element={<ContractorContractsPage />} />
            <Route path="payments" element={<ContractorPaymentsPage />} />
            <Route path="settings" element={<ProfileSettings />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Redirect root — ProtectedRoute redirects to role-specific portal */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;