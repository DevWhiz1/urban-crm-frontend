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
import { ProjectContractPayments } from './components/ProjectContractPayments';
import { AddUser } from './components/users/AddUser';
import { UsersList } from './components/users/UsersList';
import EmployeesManagement from './components/employees/EmployeesManagement';
import EmployeeForm from './components/employees/EmployeeForm';
import EmployeeView from './components/employees/EmployeeView';
import ExpensesManagement from './components/expenses/ExpensesManagement';
import ExpenseForm from './components/expenses/ExpenseForm';
import { NotFound } from './components/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="contractors/add" element={<ContractorForm />} />
            <Route path="contractors" element={<ContractorsManagement />} />
            <Route path="clients/add" element={<ClientForm />} />
            <Route path="clients" element={<ClientsManagement />} />
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
            <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-gray-600 mt-2">Application settings will be implemented here.</p></div>} />
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;