import React, { useState } from 'react';
import { ProjectContractsList } from './ProjectContractsList';
import { ProjectContractModal } from './ProjectContractModal';
import { ProjectContractViewModal } from './ProjectContractViewModal';
import { ProjectContract } from '../types/projectContract';

type ViewMode = 'list' | 'add' | 'edit' | 'view';

export const ProjectContractsManagement: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedContract, setSelectedContract] = useState<ProjectContract | null>(null);

    const handleViewContract = (contract: ProjectContract) => {
        setSelectedContract(contract);
        setViewMode('view');
    };

    const handleEditContract = (contract: ProjectContract) => {
        setSelectedContract(contract);
        setViewMode('edit');
    };

    const handleAddContract = () => {
        setSelectedContract(null);
        setViewMode('add');
    };

    const handleCloseModal = () => {
        setSelectedContract(null);
        setViewMode('list');
    };

    const handleContractSaved = (contract: ProjectContract) => {
        setSelectedContract(null);
        setViewMode('list');
    };

    return (
        <>
            <ProjectContractsList
                onViewContract={handleViewContract}
                onEditContract={handleEditContract}
                onAddContract={handleAddContract}
            />

            {/* Add/Edit Modal */}
            {(viewMode === 'add' || viewMode === 'edit') && (
                <ProjectContractModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    onSave={handleContractSaved}
                    contract={selectedContract || undefined}
                    mode={viewMode}
                />
            )}

            {/* View Modal */}
            {viewMode === 'view' && selectedContract && (
                <ProjectContractViewModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    onEdit={handleEditContract}
                    contractId={selectedContract._id}
                />
            )}
        </>
    );
};
