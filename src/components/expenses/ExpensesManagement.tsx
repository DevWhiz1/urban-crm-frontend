import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Tags, Search, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExpensesList from './ExpensesList';
import ExpenseCategoryModal from './ExpenseCategoryModal';
import ExpenseViewModal from './ExpenseViewModal';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';
import { expenseApi } from '../../services/expenseApi';
import { fetchAllProjects } from '../../services/projectApi';
import { employeeApi } from '../../services/employeeApi';
import { Expense, ExpenseCategory } from '../../types/expense';
import { Button } from '../ui/Button';

const PAGE_SIZE_OPTIONS = [10, 15, 50, 100] as const;

const ExpensesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [projects, setProjects] = useState<{ _id: string; title?: string; name?: string }[]>([]);
  const [employees, setEmployees] = useState<{ _id: string; fullName: string }[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState<number>(10);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [expenseTypeFilter, setExpenseTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchCategories = async () => {
    try {
      const catData = await expenseApi.getCategories();
      setCategories(catData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [projData, empData] = await Promise.all([
        fetchAllProjects(),
        employeeApi.getEmployees({ limit: 'all' }),
      ]);
      setProjects(projData);
      setEmployees(empData);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const showProjectFilter = expenseTypeFilter === 'All' || expenseTypeFilter === 'Project';
  const showEmployeeFilter = expenseTypeFilter === 'All' || expenseTypeFilter === 'Employee';

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);

      const includeProject =
        (expenseTypeFilter === 'All' || expenseTypeFilter === 'Project') &&
        projectFilter !== 'All';
      const includeEmployee =
        (expenseTypeFilter === 'All' || expenseTypeFilter === 'Employee') &&
        employeeFilter !== 'All';

      const data = await expenseApi.getExpenses({
        page,
        limit,
        search: search || undefined,
        expenseType: expenseTypeFilter !== 'All' ? expenseTypeFilter : undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        project: includeProject ? projectFilter : undefined,
        employee: includeEmployee ? employeeFilter : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      if (data.pagination) {
        setExpenses(data.data);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalItems(data.pagination.total ?? 0);
        if (page > (data.pagination.totalPages || 1)) {
          setPage(data.pagination.totalPages || 1);
        }
      } else {
        setExpenses(Array.isArray(data) ? data : []);
        setTotalPages(1);
        setTotalItems(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    search,
    expenseTypeFilter,
    categoryFilter,
    projectFilter,
    employeeFilter,
    dateFrom,
    dateTo,
  ]);

  const handleExpenseTypeChange = (value: string) => {
    setExpenseTypeFilter(value);
    setPage(1);

    // Reset association filters that no longer apply
    if (value === 'Company') {
      setProjectFilter('All');
      setEmployeeFilter('All');
    } else if (value === 'Project') {
      setEmployeeFilter('All');
    } else if (value === 'Employee') {
      setProjectFilter('All');
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const hasActiveFilters =
    expenseTypeFilter !== 'All' ||
    categoryFilter !== 'All' ||
    (showProjectFilter && projectFilter !== 'All') ||
    (showEmployeeFilter && employeeFilter !== 'All') ||
    dateFrom !== '' ||
    dateTo !== '' ||
    searchInput.trim() !== '';

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setExpenseTypeFilter('All');
    setCategoryFilter('All');
    setProjectFilter('All');
    setEmployeeFilter('All');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

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

  const filterSelectClass =
    'min-w-0 flex-1 basis-[140px] max-w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

  const rangeStart = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = totalItems === 0 ? 0 : Math.min(page * limit, totalItems);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track company, project, and employee expenses.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
          >
            <Tags className="w-5 h-5 mr-2 shrink-0" />
            Categories
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2 shrink-0" />
            Add Expense
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-3 border-b border-gray-100 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendor or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={expenseTypeFilter}
              onChange={(e) => handleExpenseTypeChange(e.target.value)}
              className={filterSelectClass}
              aria-label="Expense type"
              title="Expense type"
            >
              <option value="All">All types</option>
              <option value="Company">Company</option>
              <option value="Project">Project</option>
              <option value="Employee">Employee</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className={filterSelectClass}
              aria-label="Category"
              title="Category"
            >
              <option value="All">All categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {showProjectFilter && (
              <select
                value={projectFilter}
                onChange={(e) => {
                  setProjectFilter(e.target.value);
                  setPage(1);
                }}
                className={filterSelectClass}
                aria-label="Project"
                title="Project"
              >
                <option value="All">All projects</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title || p.name || 'Unnamed project'}
                  </option>
                ))}
              </select>
            )}

            {showEmployeeFilter && (
              <select
                value={employeeFilter}
                onChange={(e) => {
                  setEmployeeFilter(e.target.value);
                  setPage(1);
                }}
                className={filterSelectClass}
                aria-label="Employee"
                title="Employee"
              >
                <option value="All">All employees</option>
                {employees.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.fullName}
                  </option>
                ))}
              </select>
            )}

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className={filterSelectClass}
              aria-label="From date"
              title="From date"
            />

            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className={filterSelectClass}
              aria-label="To date"
              title="To date"
              min={dateFrom || undefined}
            />

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                title="Clear filters"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
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

            <div className="p-4 border-t border-gray-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm">
              <div className="text-gray-600 space-y-1">
                <p>
                  Showing {rangeStart}–{rangeEnd} of {totalItems} expenses
                </p>
                <p>
                  Page {page} of {totalPages}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <label className="flex items-center gap-2 text-gray-600">
                  <span className="whitespace-nowrap">Rows per page</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(1)}
                    aria-label="First page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(totalPages)}
                    aria-label="Last page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
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
        itemName={expenseToDelete ? expenseToDelete.vendor || 'Expense' : 'Expense'}
        itemType="Expense"
        isInactive={expenseToDelete?.isActive === false}
      />
    </div>
  );
};

export default ExpensesManagement;
