import React, { useState, useEffect } from 'react';
import { Plus, Tags, Search, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExpensesList from './ExpensesList';
import ExpenseCategoryModal from './ExpenseCategoryModal';
import ExpenseViewModal from './ExpenseViewModal';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';
import { expenseApi } from '../../services/expenseApi';
import { Expense, ExpenseCategory } from '../../types/expense';
import { Button } from '../ui/Button';

const ExpensesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [expenseTypeFilter, setExpenseTypeFilter] = useState('All');
  const limit = 10;

  const fetchCategories = async () => {
    try {
      const catData = await expenseApi.getCategories();
      setCategories(catData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseApi.getExpenses({
        page,
        limit,
        search,
        expenseType: expenseTypeFilter
      });
      if (data.pagination) {
        setExpenses(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        setExpenses(data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [page, search, expenseTypeFilter]);

  const handleAdd = () => {
    navigate('/dashboard/expenses/add');
  };

  const handleEdit = (expense: Expense) => {
    navigate(`/dashboard/expenses/edit/${expense._id}`);
  };

  const handleView = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsViewOpen(true);
  };

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (expenseToDelete) {
      try {
        await expenseApi.deleteExpense(expenseToDelete._id);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      } finally {
        setDeleteModalOpen(false);
        setExpenseToDelete(null);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track company, project, and employee expenses.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Tags className="w-5 h-5 mr-2" />
            Categories
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vendor or description..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={expenseTypeFilter}
            onChange={(e) => { setExpenseTypeFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-48 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="All">All Types</option>
            <option value="General">General</option>
            <option value="Project">Project</option>
            <option value="Employee">Employee</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading expenses...</div>
        ) : (
          <>
            <ExpensesList
              expenses={expenses}
              categories={categories}
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

      {isViewOpen && selectedExpense && (
        <ExpenseViewModal
          expense={selectedExpense}
          categories={categories}
          onClose={() => setIsViewOpen(false)}
        />
      )}

      {isCategoryModalOpen && (
        <ExpenseCategoryModal
          categories={categories}
          onClose={() => setIsCategoryModalOpen(false)}
          onRefresh={fetchCategories}
        />
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirmDeactivate={confirmDelete}
        onConfirmDelete={confirmDelete}
        itemName={expenseToDelete ? (expenseToDelete.vendor || 'Expense') : 'Expense'}
        itemType="Expense"
        isInactive={expenseToDelete?.isActive === false}
      />
    </div>
  );
};

export default ExpensesManagement;
