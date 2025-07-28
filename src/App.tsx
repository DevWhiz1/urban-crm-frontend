import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { ContractorForm } from './components/ContractorForm';
import { ClientForm } from './components/ClientForm';
import { ProjectForm } from './components/ProjectForm';
import { ProjectContractForm } from './components/ProjectContractForm';
import { PaymentSelection } from './components/PaymentSelection';
import { PaymentForm } from './components/PaymentForm';
import { MaterialPaymentForm } from './components/MaterialPaymentForm';
import { ProjectPaymentForm } from './components/ProjectPaymentForm';
import { ProjectPaymentSummary } from './components/ProjectPaymentSummary';
import { ProjectContractPayments } from './components/ProjectContractPayments';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="contractors/add" element={<ContractorForm />} />
            <Route path="contractors" element={<div className="p-6"><h1 className="text-2xl font-bold">All Contractors</h1><p className="text-gray-600 mt-2">Contractors list will be implemented here.</p></div>} />
            <Route path="clients/add" element={<ClientForm />} />
            <Route path="clients" element={<div className="p-6"><h1 className="text-2xl font-bold">All Clients</h1><p className="text-gray-600 mt-2">Clients list will be implemented here.</p></div>} />
            <Route path="projects/add" element={<ProjectForm />} />
            <Route path="projects" element={<div className="p-6"><h1 className="text-2xl font-bold">Projects</h1><p className="text-gray-600 mt-2">Projects management will be implemented here.</p></div>} />
            <Route path="project-contracts/add" element={<ProjectContractForm />} />
            <Route path="project-contracts" element={<ProjectContractPayments />} />
            <Route path="payments/add" element={<PaymentSelection />} />
            <Route path="payments/contractor" element={<PaymentForm />} />
            <Route path="payments/material" element={<MaterialPaymentForm />} />
            <Route path="payments/project" element={<ProjectPaymentForm />} />
            <Route path="payments" element={<ProjectPaymentSummary />} />
            <Route path="users" element={<div className="p-6"><h1 className="text-2xl font-bold">All Users</h1><p className="text-gray-600 mt-2">Users list will be implemented here.</p></div>} />
            <Route path="users/add" element={<div className="p-6"><h1 className="text-2xl font-bold">Add User</h1><p className="text-gray-600 mt-2">Add user form will be implemented here.</p></div>} />
            <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p className="text-gray-600 mt-2">Reports and analytics will be implemented here.</p></div>} />
            <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-gray-600 mt-2">Application settings will be implemented here.</p></div>} />
          </Route>
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;