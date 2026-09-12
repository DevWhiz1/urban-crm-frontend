/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { MapPin, Phone, Mail, MousePointer2, Download, ArrowLeft, Share2 } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { ClientPaymentDTO } from '../../../features/client/api/clientPortalApi';
import EmailStatementModal from '../../statements/EmailStatementModal';
import apiClient from '../../../services/apiClient';

const Logo = ({ isWatermark = false }: { isWatermark?: boolean }) => {
  return (
    <div className={`flex flex-col items-center select-none ${isWatermark ? 'opacity-15 w-[350px] grayscale pointer-events-none' : 'w-48'}`}>
      <img src="/logo.png" alt="Urban Design & Construction" className="w-full h-auto object-contain" />
    </div>
  );
};

// Basic number to words converter for PKR
function numberToWords(num: number): string {
  const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];

  if ((num = num || 0) === 0) return 'Zero';
  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != '00') ? (a[Number(n[1])] || b[n[1][0] as any] + ' ' + a[n[1][1] as any]) + 'Crore ' : '';
  str += (n[2] != '00') ? (a[Number(n[2])] || b[n[2][0] as any] + ' ' + a[n[2][1] as any]) + 'Lakh ' : '';
  str += (n[3] != '00') ? (a[Number(n[3])] || b[n[3][0] as any] + ' ' + a[n[3][1] as any]) + 'Thousand ' : '';
  str += (n[4] != '0') ? (a[Number(n[4])] || b[n[4][0] as any] + ' ' + a[n[4][1] as any]) + 'Hundred ' : '';
  str += (n[5] != '00') ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0] as any] + ' ' + a[n[5][1] as any]) : '';
  return str.trim();
}

interface ClientReceiptProps {
  payment: ClientPaymentDTO;
  project: { name: string; projectCode: string };
  clientName: string;
  onBack: () => void;
  hideBackButton?: boolean;
}

export default function ClientReceipt({ payment, project, clientName, onBack, hideBackButton }: ClientReceiptProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const formattedDate = new Date(payment.date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  const filename = `Receipt-${clientName.replace(/\s+/g, '-')}-${formattedDate}.pdf`;

  const getPdfOptions = () => ({
    margin:       0,
    filename:     filename,
    image:        { type: 'jpeg' as const, quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
  });

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    
    await html2pdf().set(getPdfOptions()).from(printRef.current).toPdf().get('pdf').then((pdf: any) => {
      const totalPages = pdf.internal.getNumberOfPages();
      if (totalPages > 1) {
        for (let i = totalPages; i > 1; i--) {
          pdf.deletePage(i);
        }
      }
    }).save();
  };

  const handleEmailSubmit = async (email: string, subject: string, message: string, recipientName: string) => {
    if (!printRef.current) return;

    const pdfBlob = await html2pdf().set(getPdfOptions()).from(printRef.current).output('blob');

    const formData = new FormData();
    formData.append('toEmail', email);
    formData.append('subject', subject);
    formData.append('message', message);
    formData.append('recipientName', recipientName);
    formData.append('pdfFile', pdfBlob, filename);

    await apiClient.post('/api/email/send-statement', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  };

  const handleShare = async () => {
    if (!printRef.current) return;

    try {
      // Generate PDF as blob for sharing
      const pdfBlob = await html2pdf().set(getPdfOptions()).from(printRef.current).output('blob');
      
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Payment Receipt - ${project.name}`,
          text: `Please find attached the payment receipt for ${project.name}.`,
          files: [file]
        });
      } else {
        alert("Sharing files is not supported on this device/browser. Please download it instead.");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f680] flex items-center justify-center py-8 font-sans print:p-0 print:bg-transparent overflow-auto">
      
      {/* Floating Back Action */}
      {!hideBackButton && (
        <div className="fixed top-8 left-8 z-50 print:hidden">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg shadow-md transition-all font-medium border border-gray-200"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Floating Actions */}
      <div className="fixed bottom-8 right-8 z-50 print:hidden flex flex-col gap-3">
        <button 
          onClick={() => setIsEmailModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 font-medium"
        >
          <Mail size={20} />
          <span className="hidden sm:inline">Email</span>
        </button>
        <button 
          onClick={handleShare}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 font-medium"
        >
          <Share2 size={20} />
          <span className="hidden sm:inline">Share</span>
        </button>
        <button 
          onClick={handleDownloadPdf}
          className="flex items-center justify-center gap-2 bg-[#926F34] hover:bg-[#7a5c2b] text-white px-6 py-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 font-medium"
        >
          <Download size={20} />
          <span>Save PDF</span>
        </button>
      </div>

      <EmailStatementModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={handleEmailSubmit}
        defaultEmail={(payment as any)?.project?.customer?.user?.email || (payment as any)?.clientEmail || ''}
        defaultSubject={`Payment Receipt - ${project.name}`}
        recipientName={clientName}
      />

      {/* A4 Paper Container */}
      <div ref={printRef} className="w-[210mm] h-[297mm] shrink-0 bg-[#ffffff] relative flex flex-col mx-auto overflow-hidden border border-[#0000001a] print:border-none shadow-2xl print:shadow-none">
        
        {/* --- HEADER --- */}
        <header className="relative w-full h-[280px] shrink-0">
          {/* SVG Background Curve */}
          <svg 
            viewBox="0 0 1000 280" 
            preserveAspectRatio="none" 
            className="absolute inset-0 w-full h-full object-cover object-top"
          >
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#926F34" />
                <stop offset="30%" stopColor="#DFB761" />
                <stop offset="50%" stopColor="#F9E596" />
                <stop offset="70%" stopColor="#DFB761" />
                <stop offset="100%" stopColor="#926F34" />
              </linearGradient>
            </defs>
            
            <path d="M 0 0 L 1000 0 L 1000 170 C 600 120 400 280 0 200 Z" fill="url(#goldGrad)" />
            <path d="M 0 0 L 1000 0 L 1000 162 C 600 112 400 272 0 192 Z" fill="#1e1e1e" />
          </svg>

          {/* Header Content */}
          <div className="relative z-10 pt-8 pl-12 flex justify-start">
            <Logo />
          </div>
        </header>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-grow relative flex flex-col px-12 py-12 overflow-hidden z-10 font-sans text-black">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
            <Logo isWatermark={true} />
          </div>
          
          <div className="relative z-10 w-full flex flex-col h-full">
            
            <div className="w-full flex justify-end mt-[-35px] text-[14px] font-normal text-black">
              <div className="flex flex-col text-left">
                {payment.receiptNo && (
                  <p><span className="font-bold">Receipt #:</span> {payment.receiptNo}</p>
                )}
                <p><span className="font-bold">Dated:</span> {formattedDate}</p>
              </div>
            </div>

            <div className="w-full text-center mb-8 mt-4">
              <h1 className="text-[17px] font-bold uppercase underline underline-offset-4">Receipt of Payment</h1>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-[15px] font-bold underline underline-offset-2">a) Payment Details:</h2>
              
              <p className="text-[15px] leading-relaxed">
                An amount of <strong>PKR {payment.amount.toLocaleString()}/-</strong> 
                (Rupees: {numberToWords(payment.amount)} Only) has been received with thanks from <strong>{clientName}</strong> for <strong>{project.name}</strong>.
              </p>
              
              <p className="text-[15px] mt-2 mb-2">
                Please find below summary of transaction(s) received:
              </p>
            </div>

            <div className="w-full mt-4">
              <table className="w-full text-left text-[14px] border-collapse" style={{ pageBreakInside: 'avoid' }}>
                <thead>
                  <tr className="border-t-2 border-b-2 border-black">
                    <th className="py-3 px-2 font-bold w-[30%]">Description</th>
                    <th className="py-3 px-2 font-bold w-[35%]">Transaction Details</th>
                    <th className="py-3 px-2 font-bold w-[18%]">Transaction<br/>Amount</th>
                    <th className="py-3 px-2 font-bold w-[17%]">Transaction<br/>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b-2 border-black" style={{ pageBreakInside: 'avoid' }}>
                    <td className="py-4 px-2 align-top pr-4">{payment.workDescription || payment.notes || 'Payment against project'}</td>
                    <td className="py-4 px-2 align-top pr-4">Received via {payment.paymentMethod} and recorded with Payment ID: {payment.paymentId}. {payment.transactionId ? `Txn ID: ${payment.transactionId}` : ''}</td>
                    <td className="py-4 px-2 align-top">PKR {payment.amount.toLocaleString()}/-</td>
                    <td className="py-4 px-2 align-top">{formattedDate}</td>
                  </tr>
                  <tr className="border-b-2 border-black font-bold">
                    <td colSpan={2} className="py-3 px-2 text-right pr-12">Total:</td>
                    <td colSpan={2} className="py-3 px-2">PKR {payment.amount.toLocaleString()}/-</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </main>

        {/* --- FOOTER --- */}
        <footer className="w-full mt-auto shrink-0 relative z-20">
          <div className="bg-[#1e1e1e] px-8 py-5 flex flex-row justify-between items-center gap-4 text-[#ffffff]">
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-[#ffffff]" strokeWidth={1.5} />
              <span className="text-xs font-serif tracking-wide text-[#e5e7eb]">
                Multi Gardens B-17, Islamabad
              </span>
            </div>
            <div className="block w-px h-10 bg-[#4b556380]"></div>
            <div className="flex flex-col gap-1.5 justify-center">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#ffffff]" strokeWidth={1.5} />
                <span className="text-[11px] tracking-wider text-[#e5e7eb] font-serif">+92 315-587 4112</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#ffffff]" strokeWidth={1.5} />
                <span className="text-[11px] tracking-wider text-[#e5e7eb] font-serif">+92 333-383 4040</span>
              </div>
            </div>
            <div className="block w-px h-10 bg-[#4b556380]"></div>
            <div className="flex flex-col gap-1.5 justify-center">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#ffffff]" strokeWidth={1.5} />
                <span className="text-[11px] tracking-wide text-[#e5e7eb] font-serif">urbandesconstb17@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MousePointer2 size={14} className="text-[#ffffff]" strokeWidth={1.5} />
                <span className="text-[11px] tracking-wide text-[#e5e7eb] font-serif">www.urbandesconst.com</span>
              </div>
            </div>
          </div>
          <div className="h-4 w-full" style={{ background: 'linear-gradient(to right, #926F34, #F9E596, #926F34)' }}></div>
        </footer>
      </div>
    </div>
  );
}
