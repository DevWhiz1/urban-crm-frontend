import React, { useState } from 'react';
import { ClientsList } from './ClientsList';
import { useNavigate } from 'react-router-dom';
import { ClientModal } from './ClientModal';
import { Client } from '../types/client';

type ViewMode = 'list' | 'add' | 'edit' | 'view';

export const ClientsManagement: React.FC = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const handleViewClient = (client: Client) => {
        setSelectedClient(client);
        setViewMode('view');
    };

    const handleEditClient = (client: Client) => {
        setSelectedClient(client);
        setViewMode('edit');
    };

    const handleAddClient = () => {
        navigate('/dashboard/users/add');
    };

    const handleCloseModal = () => {
        setSelectedClient(null);
        setViewMode('list');
    };

    const handleClientSaved = (client: Client) => {
        setSelectedClient(null);
        setViewMode('list');
    };

    return (
        <>
            <ClientsList
                onViewClient={handleViewClient}
                onEditClient={handleEditClient}
                onAddClient={handleAddClient}
            />

            {/* Add/Edit/View Modal */}
            {(viewMode === 'add' || viewMode === 'edit' || viewMode === 'view') && (
                <ClientModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    onSave={handleClientSaved}
                    client={selectedClient || undefined}
                    mode={viewMode}
                />
            )}
        </>
    );
};
