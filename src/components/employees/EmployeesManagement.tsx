import React, { useState, useEffect } from 'react';
import { Plus, Search, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmployeesList from './EmployeesList';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';
import { employeeApi } from '../../services/employeeApi';
import { Employee } from '../../types/employee';
import { Button } from '../ui/Button';

const EmployeesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const limit = 10;

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeApi.getEmployees({
        page,
        limit,
        search,
        status: statusFilter
      });
      if (data.pagination) {
        setEmployees(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, search, statusFilter]);

  const handleAdd = () => {
    navigate('/dashboard/employees/add');
  };

  const handleEdit = (employee: Employee) => {
    navigate(`/dashboard/employees/edit/${employee._id}`);
  };

  const handleView = (employee: Employee) => {
    navigate(`/dashboard/employees/view/${employee._id}`);
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteModalOpen(true);
  };

  const confirmDeactivate = async () => {
    if (employeeToDelete) {
      try {
        await employeeApi.updateEmployee(employeeToDelete._id, { 
          isActive: false, 
          status: 'Inactive' 
        });
        fetchEmployees();
      } catch (error) {
        console.error('Error deactivating employee:', error);
      } finally {
        setDeleteModalOpen(false);
        setEmployeeToDelete(null);
      }
    }
  };

  const confirmDelete = async () => {
    if (employeeToDelete) {
      try {
        await employeeApi.deleteEmployee(employeeToDelete._id);
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
      } finally {
        setDeleteModalOpen(false);
        setEmployeeToDelete(null);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all company employees, roles, and details.</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or designation..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-48 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading employees...</div>
        ) : (
          <>
            <EmployeesList
              employees={employees}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDeleteClick}
            />
            
            {/* Pagination Controls */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-600">Page {page} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirmDeactivate={confirmDeactivate}
        onConfirmDelete={confirmDelete}
        itemName={employeeToDelete?.fullName || 'Employee'}
        itemType="Employee"
        isInactive={employeeToDelete?.isActive === false || employeeToDelete?.status === 'Inactive'}
      />
    </div>
  );
};

export default EmployeesManagement;
