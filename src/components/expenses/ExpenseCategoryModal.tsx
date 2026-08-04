import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { ExpenseCategory } from '../../types/expense';
import { expenseApi } from '../../services/expenseApi';

interface Props {
  categories: ExpenseCategory[];
  onClose: () => void;
  onRefresh: () => void;
}

const ExpenseCategoryModal: React.FC<Props> = ({ categories, onClose, onRefresh }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setLoading(true);
    try {
      await expenseApi.createCategory(newCategoryName);
      setNewCategoryName('');
      onRefresh();
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await expenseApi.deleteCategory(id);
        onRefresh();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center relative">
          <h2 className="text-xl font-bold text-gray-800">Expense Categories</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleAddCategory} className="flex items-center space-x-3 mb-6">
            <input
              type="text"
              placeholder="New category name..."
              required
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-6 h-6" />
            </button>
          </form>

          <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
            {categories.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">No categories found. Add one above.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <li key={cat._id} className="flex justify-between items-center px-4 py-3 hover:bg-gray-50">
                    <span className="text-gray-700 font-medium">{cat.name}</span>
                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCategoryModal;
