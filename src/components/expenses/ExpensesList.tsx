import React from 'react';
import { Edit2, Trash2, Paperclip, Eye } from 'lucide-react';
import { Expense, ExpenseCategory } from '../../types/expense';

interface Props {
  expenses: Expense[];
  categories: ExpenseCategory[];
  onEdit: (expense: Expense) => void;
  onView: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const ExpensesList: React.FC<Props> = ({ expenses, categories, onEdit, onView, onDelete }) => {
  if (expenses.length === 0) {
    return <div className="p-8 text-center text-gray-500">No expenses found.</div>;
  }

  const getCategoryName = (category: any) => {
    if (typeof category === 'object' && category?.name) return category.name;
    const found = categories.find((c) => c._id === category || c._id === category?._id);
    return found ? found.name : (category?.name || 'Unknown');
  };

  const getAssociatedName = (expense: Expense) => {
    if (expense.expenseType === 'Project' && expense.project) {
        return `Project: ${expense.project.title || expense.project.name || 'Unknown'}`;
    }
    if (expense.expenseType === 'Employee' && expense.employee) {
        return `Employee: ${expense.employee.fullName || 'Unknown'}`;
    }
    return expense.expenseType;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Category & Date</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Type & Association</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Vendor & Payment</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Amount</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Created By</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {expenses.map((expense) => (
            <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{getCategoryName(expense.category)}</div>
                <div className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-gray-900 font-medium">{expense.expenseType}</div>
                <div className="text-sm text-gray-500">{getAssociatedName(expense)}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-gray-900">{expense.vendor || 'N/A'}</div>
                <div className="text-sm text-gray-500">{expense.paymentMethod || 'Online'}</div>
              </td>
              <td className="px-6 py-4">
                <div className="font-bold text-gray-900">Rs {expense.amount.toLocaleString()}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{expense.createdBy?.userName || 'System / Admin'}</div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  expense.approvalStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                  expense.approvalStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                  expense.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {expense.approvalStatus}
                </span>
                {expense.attachReceipt && (
                  <a href={expense.attachReceipt} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex text-blue-600 hover:text-blue-800" title="View Receipt">
                    <Paperclip className="w-4 h-4" />
                  </a>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onView(expense)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(expense)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(expense)}
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

export default ExpensesList;
