import React, { useState } from 'react';
import { SuppliersList } from './SuppliersList';
import { useNavigate } from 'react-router-dom';
import { SupplierModal } from './SupplierModal';
import { Supplier } from '../../types/supplier';

type ViewMode = 'list' | 'add' | 'edit' | 'view';

export const SuppliersManagement: React.FC = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleViewSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setViewMode('view');
    };

    const handleEditSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setViewMode('edit');
    };

    const handleAddSupplier = () => {
        navigate('/dashboard/users/add');
    };

    const handleCloseModal = () => {
        setSelectedSupplier(null);
        setViewMode('list');
    };

    const handleSupplierSaved = (supplier: Supplier) => {
        setSelectedSupplier(null);
        setViewMode('list');
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <>
            <SuppliersList
                onViewSupplier={handleViewSupplier}
                onEditSupplier={handleEditSupplier}
                onAddSupplier={handleAddSupplier}
                refreshTrigger={refreshTrigger}
            />

            {/* Add/Edit/View Modal */}
            {(viewMode === 'add' || viewMode === 'edit' || viewMode === 'view') && (
                <SupplierModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    onSave={handleSupplierSaved}
                    supplier={selectedSupplier || undefined}
                    mode={viewMode}
                />
            )}
        </>
    );
};
