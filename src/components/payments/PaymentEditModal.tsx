import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Receipt, Upload, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '../../constants/payment';
import { updatePayment } from '../../services/paymentApi';
import { uploadApi } from '../../services/uploadApi';
import { formatCurrencyToWords } from '../../utils/currencyFormatter';

interface Payment {
    _id: string;
    paymentId?: string;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
    workDescription?: string;
    status: string;
    receiptPhoto?: string;
    notes?: string;
    date: string;
}

interface PaymentEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: Payment | null;
    onSuccess: (updatedPayment: Payment) => void;
}

export const PaymentEditModal: React.FC<PaymentEditModalProps> = ({
    isOpen,
    onClose,
    payment,
    onSuccess
}) => {
    const [formData, setFormData] = useState({
        amount: '',
        date: '',
        paymentMethod: '',
        transactionId: '',
        workDescription: '',
        status: '',
        receiptPhoto: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploadingReceipt, setUploadingReceipt] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingReceipt(true);
            const data = await uploadApi.uploadFile(file);
            setFormData(prev => ({ ...prev, receiptPhoto: data.url }));
        } catch (error) {
            setError('Failed to upload receipt.');
        } finally {
            setUploadingReceipt(false);
        }
    };

    useEffect(() => {
        if (payment && isOpen) {
            setFormData({
                amount: payment.amount.toString(),
                date: new Date(payment.date).toISOString().split('T')[0],
                paymentMethod: payment.paymentMethod || 'online',
                transactionId: payment.transactionId || '',
                workDescription: payment.workDescription || '',
                status: payment.status || 'paid',
                receiptPhoto: payment.receiptPhoto || '',
                notes: payment.notes || ''
            });
            setError(null);
        }
    }, [payment, isOpen]);

    if (!isOpen || !payment) return null;

    const handleInputChange = (field: string) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.amount || isNaN(parseFloat(formData.amount))) {
            setError('Please enter a valid amount');
            return;
        }
        if (!formData.date) {
            setError('Please select a payment date');
            return;
        }

        try {
            setLoading(true);
            const updated = await updatePayment(payment._id, {
                ...formData,
                amount: parseFloat(formData.amount)
            });
            onSuccess(updated as unknown as Payment);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to update payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Edit Payment</h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Payment Amount"
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={handleInputChange('amount')}
                                helperText={formatCurrencyToWords(formData.amount)}
                                required
                            />
                            <Input
                                label="Payment Date"
                                type="date"
                                value={formData.date}
                                onChange={handleInputChange('date')}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select
                                label="Payment Method"
                                options={PAYMENT_METHODS}
                                value={formData.paymentMethod}
                                onChange={handleInputChange('paymentMethod')}
                            />
                            <Select
                                label="Payment Status"
                                options={PAYMENT_STATUSES}
                                value={formData.status}
                                onChange={handleInputChange('status')}
                            />
                        </div>

                        <Input
                            label="Transaction ID (Optional)"
                            value={formData.transactionId}
                            onChange={handleInputChange('transactionId')}
                            placeholder="Enter transaction reference"
                        />

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-slate-500" />
                                <label className="text-sm font-medium text-slate-700">Work Description</label>
                            </div>
                            <Textarea
                                value={formData.workDescription}
                                onChange={handleInputChange('workDescription')}
                                rows={2}
                                placeholder="Describe the work..."
                            />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Receipt className="w-4 h-4 text-slate-500" />
                                <label className="text-sm font-medium text-slate-700">Notes & Receipt URL</label>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                        <div className="px-4 py-2 border border-slate-300 rounded-md flex items-center space-x-2 hover:bg-slate-50 transition-colors">
                                            <Upload className="w-4 h-4" />
                                            <span className="text-sm">{uploadingReceipt ? 'Uploading...' : 'Upload Receipt Photo'}</span>
                                        </div>
                                        <input
                                            type="file"
                                            className="sr-only"
                                            accept="image/*,.pdf"
                                            onChange={handleFileUpload}
                                            disabled={uploadingReceipt}
                                        />
                                    </label>
                                    {formData.receiptPhoto && (
                                        <div className="text-sm text-emerald-600 flex items-center font-medium">
                                            <CheckCircle className="w-4 h-4 mr-1.5" />
                                            Uploaded
                                        </div>
                                    )}
                                </div>
                                <Textarea
                                    value={formData.notes}
                                    onChange={handleInputChange('notes')}
                                    rows={2}
                                    placeholder="Additional notes..."
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={loading} className="bg-blue-600 hover:bg-blue-700">
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
