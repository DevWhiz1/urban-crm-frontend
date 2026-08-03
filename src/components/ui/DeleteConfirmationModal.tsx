import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmDeactivate?: () => Promise<void>;
    onConfirmDelete: () => Promise<void>;
    itemName: string;
    itemType?: string; // e.g. "User", "Client", "Contractor"
    isInactive: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirmDeactivate,
    onConfirmDelete,
    itemName,
    itemType = 'User',
    isInactive
}) => {
    // 0: none, 1: deactivate confirm 1, 2: deactivate confirm 2, 3: permanent delete confirm 1, 4: permanent delete confirm 2
    const [deletePhase, setDeletePhase] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setDeletePhase(isInactive ? 3 : 1);
        } else {
            setDeletePhase(0);
        }
    }, [isOpen, isInactive]);

    if (!isOpen || deletePhase === 0) return null;

    const handleConfirm = async () => {
        try {
            setIsProcessing(true);
            if (deletePhase === 4) {
                await onConfirmDelete();
                onClose();
            } else if (deletePhase === 2 && onConfirmDeactivate) {
                await onConfirmDeactivate();
                onClose();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden border border-gray-200 shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${deletePhase === 1 || deletePhase === 3 ? 'bg-orange-100' : 'bg-red-100'}`}>
                                <AlertTriangle className={`w-6 h-6 ${deletePhase === 1 || deletePhase === 3 ? 'text-orange-600' : 'text-red-600'}`} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {deletePhase === 1 ? `Deactivate ${itemType}?` : 
                                     deletePhase === 2 ? 'Are you absolutely sure?' :
                                     deletePhase === 3 ? `Permanently Delete ${itemType}?` :
                                     'WARNING: Permanent Action'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {deletePhase === 1 ? `Are you sure you want to deactivate ${itemName}? They will no longer be able to access the system.` : 
                                     deletePhase === 2 ? `This action will mark ${itemName} as Inactive.` :
                                     deletePhase === 3 ? `Are you sure you want to PERMANENTLY delete ${itemName} from the database?` :
                                     `This action CANNOT BE UNDONE. ${itemName} will be completely wiped from the system.`}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                                Cancel
                            </Button>
                            {deletePhase === 1 || deletePhase === 3 ? (
                                <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => setDeletePhase(deletePhase + 1)}>
                                    Yes, proceed
                                </Button>
                            ) : (
                                <Button className="bg-red-600 hover:bg-red-700 text-white" loading={isProcessing} onClick={handleConfirm}>
                                    {deletePhase === 4 ? 'Yes, Delete Permanently' : 'Yes, Deactivate'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
