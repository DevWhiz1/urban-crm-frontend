import React from 'react';
import { Edit2, Eye, Trash2 } from 'lucide-react';
import { Employee } from '../../types/employee';

interface Props {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onView: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

const EmployeesList: React.FC<Props> = ({ employees, onEdit, onView, onDelete }) => {
  if (employees.length === 0) {
    return <div className="p-8 text-center text-gray-500">No employees found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">ID / Name</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Role & Type</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contact</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {employees.map((employee) => (
            <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{employee.fullName}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-gray-900">{employee.role}</div>
                <div className="text-sm text-gray-500">{employee.employmentType}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-gray-900">{employee.phone}</div>
                <div className="text-sm text-gray-500">{employee.email || 'N/A'}</div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  employee.status === 'Active' ? 'bg-green-100 text-green-700' :
                  employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-700' :
                  employee.status === 'Resigned' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {employee.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onView(employee)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(employee)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(employee)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeesList;
