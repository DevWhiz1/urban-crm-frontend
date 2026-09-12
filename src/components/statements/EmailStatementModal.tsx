import React, { useState } from 'react';
import { X, Send, Mail } from 'lucide-react';

interface EmailStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, subject: string, message: string, recipientName: string) => Promise<void>;
  defaultEmail?: string;
  defaultSubject?: string;
  recipientName?: string;
}

export default function EmailStatementModal({
  isOpen,
  onClose,
  onSubmit,
  defaultEmail = '',
  defaultSubject = 'Statement of Account - Urban Design & Construction',
  recipientName = 'Valued Client'
}: EmailStatementModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!defaultEmail) {
      setError('No recipient email found for this user.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit(defaultEmail, defaultSubject, '', recipientName);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#926F34]/10 rounded-lg">
              <Mail className="w-5 h-5 text-[#926F34]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Confirm Email</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}

          <div className="text-center space-y-2">
            <p className="text-gray-600">You are about to send this document to:</p>
            <p className="text-lg font-bold text-gray-900 bg-gray-50 py-2 rounded-lg border border-gray-100">
              {defaultEmail || 'No email available'}
            </p>
            {recipientName !== 'Valued Client' && (
              <p className="text-sm text-gray-600">Recipient Name: {recipientName}</p>
            )}
            <p className="text-sm text-gray-500 pt-2">The PDF will be automatically attached.</p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !defaultEmail}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white bg-[#926F34] hover:bg-[#7a5c2b] disabled:opacity-70 disabled:hover:bg-[#926F34] rounded-lg font-medium transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Confirm Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
