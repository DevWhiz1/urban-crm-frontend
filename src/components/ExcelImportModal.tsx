import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  UploadCloud,
  X,
  CheckCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  Calendar,
  Loader2
} from 'lucide-react';
import { Button } from './ui/Button';
import { bulkImportPayments, BulkImportPaymentItem } from '../services/paymentApi';
import { formatPKRCurrency } from '../utils/paymentValidation';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: { id: string; name: string };
  contractor: { id: string; name: string };
  contract?: { id: string; type: string } | null;
  onSuccess: (count: number) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  project,
  contractor,
  contract,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedPayments, setParsedPayments] = useState<BulkImportPaymentItem[]>([]);
  const [invalidRowsCount, setInvalidRowsCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Flexible column header detector
  const findValueByPossibleKeys = (row: any, possibleKeys: string[]): any => {
    const keys = Object.keys(row);
    for (const key of keys) {
      const normalizedKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const pk of possibleKeys) {
        if (normalizedKey === pk.toLowerCase().replace(/[^a-z0-9]/g, '')) {
          return row[key];
        }
      }
    }
    return undefined;
  };

  const parseFile = (fileToParse: File) => {
    setError(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          setError('The uploaded Excel/CSV file contains no rows.');
          setParsedPayments([]);
          setLoading(false);
          return;
        }

        const validPayments: BulkImportPaymentItem[] = [];
        let invalidCount = 0;

        rawJson.forEach((row) => {
          const rawAmount = findValueByPossibleKeys(row, [
            'amount', 'paid amount', 'paid', 'debit', 'cost', 'price', 'total', 'amt'
          ]);

          const rawDate = findValueByPossibleKeys(row, [
            'date', 'payment date', 'txn date', 'transaction date', 'time', 'day'
          ]);

          const rawDesc = findValueByPossibleKeys(row, [
            'description', 'work description', 'workdescription', 'notes', 'particulars', 'detail', 'details', 'item'
          ]);

          const rawType = findValueByPossibleKeys(row, [
            'type', 'payment type', 'credit/debit'
          ]);

          const rawMethod = findValueByPossibleKeys(row, [
            'method', 'payment method', 'mode', 'payment mode'
          ]);

          // Parse amount
          let parsedAmount = 0;
          if (typeof rawAmount === 'number') {
            parsedAmount = rawAmount;
          } else if (typeof rawAmount === 'string') {
            const cleanStr = rawAmount.replace(/[^0-9.-]/g, '');
            parsedAmount = parseFloat(cleanStr);
          }

          // Parse date
          let parsedDateStr = '';
          if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
            parsedDateStr = rawDate.toISOString().split('T')[0];
          } else if (typeof rawDate === 'string' && rawDate.trim() !== '') {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
              parsedDateStr = d.toISOString().split('T')[0];
            }
          } else if (typeof rawDate === 'number') {
            // Excel serial date number handle
            const excelDate = new Date((rawDate - (25567 + 2)) * 86400 * 1000);
            if (!isNaN(excelDate.getTime())) {
              parsedDateStr = excelDate.toISOString().split('T')[0];
            }
          }

          if (!parsedDateStr) {
            parsedDateStr = new Date().toISOString().split('T')[0];
          }

          const descText = rawDesc ? String(rawDesc).trim() : '';

          if (!isNaN(parsedAmount) && parsedAmount > 0) {
            validPayments.push({
              amount: parsedAmount,
              date: parsedDateStr,
              workDescription: descText !== '' ? descText : 'None',
              type: rawType && String(rawType).toLowerCase().includes('credit') ? 'credit' : 'debit',
              paymentMethod: rawMethod ? String(rawMethod).toLowerCase().replace(/[^a-z_]/g, '') : 'cash',
              notes: descText !== '' ? descText : ''
            });
          } else {
            invalidCount++;
          }
        });

        if (validPayments.length === 0) {
          setError('Could not find valid payment rows with positive amounts in the sheet. Please ensure columns have "Date" and "Amount" headers.');
        }

        setParsedPayments(validPayments);
        setInvalidRowsCount(invalidCount);
      } catch (err: any) {
        console.error('Excel parse error:', err);
        setError(`Failed to read file: ${err.message || 'Invalid format'}`);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file.');
      setLoading(false);
    };

    reader.readAsArrayBuffer(fileToParse);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const totalAmountSum = parsedPayments.reduce((sum, p) => sum + p.amount, 0);

  const handleImport = async () => {
    if (parsedPayments.length === 0) return;

    try {
      setLoading(true);
      setError(null);
      
      const res = await bulkImportPayments({
        project: project.id,
        contractor: contractor.id,
        contract: contract?.id || undefined,
        payments: parsedPayments
      });

      onSuccess(res.count);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Import failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Import Payments from Excel / CSV</h2>
              <p className="text-xs text-gray-500">Bulk create payment logs for selected contractor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Context Summary */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-gray-500 font-medium">Project:</span>{' '}
            <span className="font-semibold text-gray-800">{project.name}</span>
          </div>
          <div>
            <span className="text-gray-500 font-medium">Contractor:</span>{' '}
            <span className="font-semibold text-gray-800">{contractor.name}</span>
          </div>
          <div>
            <span className="text-gray-500 font-medium">Contract:</span>{' '}
            <span className="font-semibold text-gray-800">{contract?.type || 'General / Unspecified'}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Upload Area */}
          {!file && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
            >
              <UploadCloud className="w-12 h-12 text-blue-500 animate-bounce" />
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Click to upload or drag & drop Excel / CSV file
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports .xlsx, .xls, .csv (Requires <span className="font-medium text-blue-600">Date</span> and <span className="font-medium text-blue-600">Amount</span> columns)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Error Parsing File</p>
                <p className="text-xs mt-0.5 text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* File Selected & Preview */}
          {file && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-xl">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{file.name}</p>
                    <p className="text-[11px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setParsedPayments([]);
                    setError(null);
                  }}
                >
                  Change File
                </Button>
              </div>

              {/* Stats Bar */}
              {parsedPayments.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                    <p className="text-[11px] text-emerald-600 font-semibold uppercase">Payments Found</p>
                    <p className="text-xl font-bold text-emerald-800">{parsedPayments.length}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                    <p className="text-[11px] text-blue-600 font-semibold uppercase">Total Amount Sum</p>
                    <p className="text-xl font-bold text-blue-800">{formatPKRCurrency(totalAmountSum)}</p>
                  </div>
                  {invalidRowsCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl col-span-2 sm:col-span-1">
                      <p className="text-[11px] text-amber-600 font-semibold uppercase">Skipped Rows</p>
                      <p className="text-xl font-bold text-amber-800">{invalidRowsCount}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Preview Table */}
              {parsedPayments.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 uppercase flex justify-between items-center">
                    <span>Parsed Payments Preview (First 50 shown)</span>
                    <span className="text-gray-500 font-normal">{parsedPayments.length} records ready</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-500 font-semibold">#</th>
                          <th className="px-4 py-2 text-left text-gray-500 font-semibold">Date</th>
                          <th className="px-4 py-2 text-right text-gray-500 font-semibold">Amount (PKR)</th>
                          <th className="px-4 py-2 text-left text-gray-500 font-semibold">Description</th>
                          <th className="px-4 py-2 text-left text-gray-500 font-semibold">Type / Mode</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {parsedPayments.slice(0, 50).map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-400">{idx + 1}</td>
                            <td className="px-4 py-2 font-medium text-gray-800">{item.date}</td>
                            <td className="px-4 py-2 text-right font-bold text-emerald-600">
                              {formatPKRCurrency(item.amount)}
                            </td>
                            <td className="px-4 py-2 text-gray-600 truncate max-w-xs">{item.workDescription}</td>
                            <td className="px-4 py-2 text-gray-500 capitalize">{item.type} ({item.paymentMethod})</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={parsedPayments.length === 0 || loading}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importing Payments...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Import {parsedPayments.length} Payments</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
