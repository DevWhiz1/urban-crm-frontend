import React, { useState } from 'react';
import { X, PlusCircle, Banknote } from 'lucide-react';
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
}

export const PriceAdditionModal: React.FC<PriceAdditionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  entityName
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
        message: 'Price addition added successfully!'
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
        message: err.message || 'Failed to submit price addition'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <PlusCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              {entityName && <p className="text-xs text-emerald-100">{entityName}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {notification.show && (
          <div className="p-4">
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(prev => ({ ...prev, show: false }))}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Addition Amount (PKR) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Banknote className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors(prev => ({ ...prev, amount: undefined }));
                }}
                placeholder="e.g. 50000"
                className="pl-10"
                error={errors.amount}
              />
            </div>
            {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
              <p className="mt-1 text-xs text-emerald-600 font-medium">
                {formatPKRCurrency(amount)}
              </p>
            )}
          </div>

          {/* Reason Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason / Scope Description <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (errors.reason) setErrors(prev => ({ ...prev, reason: undefined }));
                }}
                placeholder="Explain why this price addition was made (e.g. Client requested extra floor tiles, scope expansion)"
                rows={3}
                error={errors.reason}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? 'Adding...' : 'Add Addition'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
