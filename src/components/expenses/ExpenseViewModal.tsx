import React from 'react';
import { X, Receipt, Paperclip, Building2, User, CreditCard } from 'lucide-react';
import { Expense } from '../../types/expense';

interface Props {
  expense: Expense;
  categories: ExpenseCategory[];
  onClose: () => void;
}

const ExpenseViewModal: React.FC<Props> = ({ expense, categories, onClose }) => {
  const getCategoryName = (category: any) => {
    if (typeof category === 'object' && category?.name) return category.name;
    const found = categories.find((c) => c._id === category || c._id === category?._id);
    return found ? found.name : (category?.name || 'Unknown');
  };

  const getAssociatedName = (expense: Expense) => {
    if (expense.expenseType === 'Project' && expense.project) {
        return expense.project.title || expense.project.name || 'Unknown';
    }
    if (expense.expenseType === 'Employee' && expense.employee) {
        return expense.employee.fullName || 'Unknown';
    }
    return 'Company / General';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden border border-gray-200 shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-blue-600" />
              Expense Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Primary Info */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Overview</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="text-2xl font-bold text-gray-900">Rs {expense.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex mt-1 px-2.5 py-1 text-sm font-semibold rounded-full ${
                        expense.approvalStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                        expense.approvalStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                        expense.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {expense.approvalStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Association</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start">
                      <div className="mt-1 mr-3 text-indigo-500">
                        {expense.expenseType === 'Project' ? <Building2 className="w-5 h-5" /> : 
                         expense.expenseType === 'Employee' ? <User className="w-5 h-5" /> : 
                         <Building2 className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Type: {expense.expenseType}</p>
                        <p className="font-medium text-gray-900">{getAssociatedName(expense)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium text-gray-900">{getCategoryName(expense.category)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Info */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Payment Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="flex items-start">
                      <CreditCard className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Vendor / Receiver</p>
                        <p className="font-medium text-gray-900">{expense.vendor || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium text-gray-900">{expense.paymentMethod || 'Online'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Description</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{expense.description || 'No description provided.'}</p>
                  </div>
                </div>

                {expense.attachReceipt && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Receipt</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <a 
                        href={expense.attachReceipt} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Paperclip className="w-5 h-5 mr-2" />
                        <span className="font-medium underline">View Attached Receipt</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseViewModal;
