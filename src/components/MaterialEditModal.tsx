import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Receipt, Package, Truck, LayoutList, Upload, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { updateMaterialPayment } from '../services/materialPaymentApi';
import { uploadApi } from '../services/uploadApi';
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '../constants/payment';

interface Material {
    _id: string;
    project: string;
    materialDetail: string;
    materialProvider: string;
    MaterialQuantity: number;
    MaterialRate: number;
    totalAmount: number;
    transactionType?: 'purchase' | 'return';
    date: string;
    receiptPhoto?: string;
    status?: string;
    paymentMethod?: string;
}

interface MaterialEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    material: Material | null;
    onSuccess: (updatedMaterial: Material) => void;
}

export const MaterialEditModal: React.FC<MaterialEditModalProps> = ({
    isOpen,
    onClose,
    material,
    onSuccess
}) => {
    const [formData, setFormData] = useState({
        materialDetail: '',
        materialProvider: '',
        MaterialQuantity: '',
        MaterialRate: '',
        transactionType: 'purchase',
        date: '',
        receiptPhoto: '',
        status: 'paid',
        paymentMethod: 'online'
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
        if (material && isOpen) {
            setFormData({
                materialDetail: material.materialDetail || '',
                materialProvider: material.materialProvider || '',
                MaterialQuantity: material.MaterialQuantity?.toString() || '1',
                MaterialRate: material.MaterialRate?.toString() || '0',
                transactionType: material.transactionType || 'purchase',
                date: material.date ? new Date(material.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                receiptPhoto: material.receiptPhoto || '',
                status: material.status || 'paid',
                paymentMethod: material.paymentMethod || 'online'
            });
            setError(null);
        }
    }, [material, isOpen]);

    if (!isOpen || !material) return null;

    const handleInputChange = (field: string) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const qty = parseFloat(formData.MaterialQuantity);
        const rate = parseFloat(formData.MaterialRate);

        if (isNaN(qty) || qty <= 0) {
            setError('Please enter a valid quantity');
            return;
        }
        if (isNaN(rate) || rate <= 0) {
            setError('Please enter a valid rate');
            return;
        }
        if (!formData.date) {
            setError('Please select a date');
            return;
        }

        const totalAmount = qty * rate;

        try {
            setLoading(true);
            const updated = await updateMaterialPayment(material._id, {
                ...formData,
                MaterialQuantity: qty,
                MaterialRate: rate,
                totalAmount
            });
            onSuccess(updated as Material);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to update material payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Edit Material Payment</h3>
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
                                label="Material Detail"
                                value={formData.materialDetail}
                                onChange={handleInputChange('materialDetail')}
                                required
                            />
                            <Input
                                label="Material Provider"
                                value={formData.materialProvider}
                                onChange={handleInputChange('materialProvider')}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Quantity"
                                type="number"
                                step="any"
                                value={formData.MaterialQuantity}
                                onChange={handleInputChange('MaterialQuantity')}
                                required
                            />
                            <Input
                                label="Rate"
                                type="number"
                                step="any"
                                value={formData.MaterialRate}
                                onChange={handleInputChange('MaterialRate')}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select
                                label="Transaction Type"
                                options={[
                                    { value: 'purchase', label: 'Purchase' },
                                    { value: 'return', label: 'Return (Refund)' }
                                ]}
                                value={formData.transactionType}
                                onChange={handleInputChange('transactionType')}
                                required
                            />
                            <Input
                                label="Date"
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

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Receipt className="w-4 h-4 text-slate-500" />
                                <label className="text-sm font-medium text-slate-700">Receipt Photo</label>
                            </div>
                            <div className="flex items-center space-x-4">
                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none">
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
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-600">Calculated Total</span>
                            <span className="text-lg font-bold text-teal-600">
                                {isNaN(parseFloat(formData.MaterialQuantity) * parseFloat(formData.MaterialRate)) 
                                    ? 'Rs 0.00' 
                                    : `Rs ${(parseFloat(formData.MaterialQuantity) * parseFloat(formData.MaterialRate)).toLocaleString()}`
                                }
                            </span>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={loading} className="bg-teal-600 hover:bg-teal-700">
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
