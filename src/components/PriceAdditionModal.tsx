import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Banknote, Edit } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Notification } from './ui/Notification';
import { formatPKRCurrency } from '../utils/paymentValidation';

interface PriceAdditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, reason: string) => Promise<void>;
  title: string;
  entityName?: string;
  editData?: { _id: string; amount: number; reason: string } | null;
}

export const PriceAdditionModal: React.FC<PriceAdditionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  entityName,
  editData
}) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; reason?: string }>({});
  const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });

  const isEditMode = !!editData;

  useEffect(() => {
    if (isOpen && editData) {
      setAmount(editData.amount.toString());
      setReason(editData.reason);
      setErrors({});
      setNotification({ show: false, type: 'success', message: '' });
    } else if (isOpen && !editData) {
      setAmount('');
      setReason('');
      setErrors({});
      setNotification({ show: false, type: 'success', message: '' });
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: { amount?: string; reason?: string } = {};
    const parsedAmount = parseFloat(amount);
    if (!amount.trim()) {
      errs.amount = 'Amount is required';
    } else if (isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = 'Please enter a valid amount greater than 0';
    }

    if (!reason.trim()) {
      errs.reason = 'Reason for addition is required (e.g., extra material, scope change)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await onSubmit(parseFloat(amount), reason.trim());
      setNotification({
        show: true,
        type: 'success',
        message: isEditMode ? 'Price addition updated successfully!' : 'Price addition added successfully!'
      });
      setTimeout(() => {
        setAmount('');
        setReason('');
        setErrors({});
        onClose();
      }, 800);
    } catch (err: any) {
      setNotification({
        show: true,
        type: 'error',
        message: err.message || (isEditMode ? 'Failed to update price addition' : 'Failed to submit price addition')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isEditMode ? 'bg-amber-50' : 'bg-indigo-50'
              }`}
            >
              {isEditMode ? (
                <Edit className="w-5 h-5 text-amber-600" />
              ) : (
                <PlusCircle className="w-5 h-5 text-indigo-600" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {isEditMode ? 'Edit Price Addition' : 'Add Price Addition'}
              </h3>
              {entityName && (
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[220px]">{entityName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {notification.show && (
          <div className="px-6 pt-4">
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(prev => ({ ...prev, show: false }))}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Amount (PKR) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-sm font-medium text-gray-400">Rs.</span>
              </div>
              <Input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors(prev => ({ ...prev, amount: undefined }));
                }}
                placeholder="e.g. 50,000"
                className="pl-10"
                error={errors.amount}
              />
            </div>
            {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
              <div className="mt-2 flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
                <span className="text-xs font-semibold text-emerald-700">
                  {formatPKRCurrency(amount)}
                </span>
              </div>
            )}
          </div>

          {/* Reason Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Reason / Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errors.reason) setErrors(prev => ({ ...prev, reason: undefined }));
              }}
              placeholder="e.g. Client requested extra floor tiles, scope expansion..."
              rows={3}
              error={errors.reason}
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`text-white ${
                isEditMode
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading
                ? (isEditMode ? 'Updating...' : 'Adding...')
                : (isEditMode ? 'Update Addition' : 'Add Addition')
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
