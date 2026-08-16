import React, { useState } from 'react';
import { ContractorsList } from './ContractorsList';
import { useNavigate } from 'react-router-dom';
import { ContractorModal } from './ContractorModal';
import { Contractor } from '../../types/contractor';

type ViewMode = 'list' | 'add' | 'edit' | 'view';

export const ContractorsManagement: React.FC = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleViewContractor = (contractor: Contractor) => {
        setSelectedContractor(contractor);
        setViewMode('view');
    };

    const handleEditContractor = (contractor: Contractor) => {
        setSelectedContractor(contractor);
        setViewMode('edit');
    };

    const handleAddContractor = () => {
        navigate('/dashboard/users/add');
    };

    const handleCloseModal = () => {
        setSelectedContractor(null);
        setViewMode('list');
    };

    const handleContractorSaved = (contractor: Contractor) => {
        setSelectedContractor(null);
        setViewMode('list');
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <>
            <ContractorsList
                onViewContractor={handleViewContractor}
                onEditContractor={handleEditContractor}
                onAddContractor={handleAddContractor}
                refreshTrigger={refreshTrigger}
            />

            {/* Add/Edit/View Modal */}
            {(viewMode === 'add' || viewMode === 'edit' || viewMode === 'view') && (
                <ContractorModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    onSave={handleContractorSaved}
                    contractor={selectedContractor || undefined}
                    mode={viewMode}
                />
            )}
        </>
    );
};
