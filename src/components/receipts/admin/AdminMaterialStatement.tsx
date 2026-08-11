/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { MapPin, Phone, Mail, MousePointer2, Download, ArrowLeft } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const Logo = ({ isWatermark = false }: { isWatermark?: boolean }) => {
  return (
    <div className={`flex flex-col items-center select-none ${isWatermark ? 'opacity-15 w-[350px] grayscale pointer-events-none' : 'w-48'}`}>
      <img src="/logo.png" alt="Urban Design & Construction" className="w-full h-auto object-contain" />
    </div>
  );
};

const PAGE_1_ROWS = 8;
const PAGE_N_ROWS = 15;

interface AdminMaterialStatementProps {
  onBack?: () => void;
  data: any;
  dateRange?: { startDate: string; endDate: string };
}

export default function AdminMaterialStatement({ onBack, data, dateRange }: AdminMaterialStatementProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const pages: any[] = [];
  const materials = [...(data?.payments || [])];

  if (materials.length > PAGE_1_ROWS) {
    pages.push(materials.splice(0, PAGE_1_ROWS));
    while (materials.length > 0) {
      pages.push(materials.splice(0, PAGE_N_ROWS));
    }
  } else {
    pages.push(materials);
  }

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    
    // Temporarily remove visual gap for perfect A4 continuous rendering in html2pdf
    printRef.current.classList.remove('gap-8');

    const opt = {
      margin:       0,
      filename:     'admin-statement.pdf',
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    const expectedPages = pages.length;
    await html2pdf().set(opt).from(printRef.current).toPdf().get('pdf').then((pdf: any) => {
      const totalPages = pdf.internal.getNumberOfPages();
      if (totalPages > expectedPages) {
        for (let i = totalPages; i > expectedPages; i--) {
          pdf.deletePage(i);
        }
      }
    }).save();

    // Restore visual gap for screen
    printRef.current.classList.add('gap-8');
  };

  const PageTemplate = ({ children, showSummary = false, pageIndex, totalPages }: any) => (
    <div className="w-[210mm] h-[297mm] shrink-0 bg-[#ffffff] relative flex flex-col mx-auto overflow-hidden border border-[#0000001a] print:border-none shadow-2xl print:shadow-none">
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
      <main className="flex-grow relative flex flex-col px-12 py-8 overflow-hidden z-10">
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
          <Logo isWatermark={true} />
        </div>
        
        <div className="relative z-10 w-full flex flex-col gap-8">
          {showSummary && (
            <>
              <div className="w-full flex justify-end mt-[-35px] text-[14px] font-normal text-black">
                <div className="flex flex-col text-left">
                  <p><span className="font-bold">Date:</span> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).replace(',', '')}</p>
                </div>
              </div>

              <div className="w-full text-center mb-2">
                <h1 className="text-[17px] font-bold uppercase underline underline-offset-4">Admin Material Statement</h1>
              </div>

              <div className="flex flex-col gap-3 font-sans text-black">
                <div className="text-[15px] font-bold underline underline-offset-2">a) {dateRange?.startDate || dateRange?.endDate ? (
                    <div className="flex gap-4">
                      <span className="font-bold underline underline-offset-4">Statement Date Range:</span>
                      <span className="font-medium">
                        {dateRange.startDate ? new Date(dateRange.startDate).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Beginning'} - 
                        {dateRange.endDate ? new Date(dateRange.endDate).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Present'}
                      </span>
                    </div>
                  ) : 'Project Summary:'}
                </div>
                
                <div className="flex flex-col gap-2 mt-4 text-[13px]">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-bold mr-2">Project:</span>
                      <span>{data?.summary?.project || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-bold mr-2">Client details:</span>
                      <span>{data?.summary?.client || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <span className="font-bold mr-2">PROJECT COST:</span>
                      <br/><span>{data?.summary?.projectCost != null ? `PKR ${data.summary.projectCost.toLocaleString()}` : '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold mr-2">TOTAL RECEIVED:</span>
                      <br/><span>{data?.summary?.totalReceived != null ? `PKR ${data.summary.totalReceived.toLocaleString()}` : '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold mr-2">Purchase Cost:</span>
                      <br/><span>{data?.summary?.purchaseCost != null ? `PKR ${data.summary.purchaseCost.toLocaleString()}` : '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold mr-2">Return Amount:</span>
                      <br/><span>{data?.summary?.returnAmount != null ? `PKR ${data.summary.returnAmount.toLocaleString()}` : '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold mr-2">Net MATERIAL COST:</span>
                      <br/><span className="font-bold">{data?.summary?.netMaterialCost != null ? `PKR ${data.summary.netMaterialCost.toLocaleString()}` : '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold mr-2">Net PROJECT AMOUNT:</span>
                      <br/><span className="font-bold">{data?.summary?.netProjectAmount != null ? `PKR ${data.summary.netProjectAmount.toLocaleString()}` : '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Children (Table chunk) */}
          <div className="w-full font-sans flex flex-col">
            {children}
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
  );

  return (
    <div className="min-h-screen bg-[#f3f4f680] flex items-center justify-center py-8 font-sans print:p-0 print:bg-transparent overflow-auto">
      
      {/* Floating Back Action */}
      {onBack && (
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

      {/* Floating Print Action */}
      <div className="fixed bottom-8 right-8 z-50 print:hidden">
        <button 
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 bg-[#926F34] hover:bg-[#7a5c2b] text-white px-6 py-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 font-medium"
        >
          <Download size={20} />
          <span>Save as PDF</span>
        </button>
      </div>

      {/* Pages Container */}
      <div ref={printRef} className="flex flex-col gap-8 print:gap-0">
        {pages.map((pageMaterials, pageIndex) => (
          <PageTemplate key={pageIndex} showSummary={pageIndex === 0} pageIndex={pageIndex} totalPages={pages.length}>
            <div className="flex flex-col gap-3 font-sans text-black">
              <h2 className="text-[15px] font-bold underline underline-offset-2">
                {pageIndex === 0 ? "b) Material Details:" : "Material Details (Continued):"}
              </h2>
            </div>
            <div className="w-full mt-2">
              <table className="w-full text-left text-[12px] border-collapse font-sans text-black">
                <thead>
                  <tr className="border-t-2 border-b-2 border-black">
                    <th className="py-2 px-1 font-bold">ID</th>
                    <th className="py-2 px-1 font-bold">Date</th>
                    <th className="py-2 px-1 font-bold">Type</th>
                    <th className="py-2 px-1 font-bold">Material Detail</th>
                    <th className="py-2 px-1 font-bold">Provider</th>
                    <th className="py-2 px-1 font-bold">Qty & Rate</th>
                    <th className="py-2 px-1 font-bold">Status</th>
                    <th className="py-2 px-1 font-bold text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {pageMaterials.map((p: any, i: number) => (
                    <tr key={i} className="border-b border-[#e5e7eb]">
                      <td className="py-2.5 px-2">{p.paymentId || '—'}</td>
                      <td className="py-2.5 px-2 whitespace-nowrap">{p.date ? new Date(p.date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td className="py-2.5 px-2 capitalize">{p.transactionType || '—'}</td>
                      <td className="py-2.5 px-2 text-left">{p.materialDetail || '—'}</td>
                      <td className="py-2.5 px-2 text-left">{p.materialProvider || '—'}</td>
                      <td className="py-2.5 px-2">{p.MaterialQuantity || '0'} @ {p.MaterialRate != null ? `PKR ${p.MaterialRate.toLocaleString()}` : '0'}</td>
                      <td className="py-2.5 px-2 capitalize">{p.status || '—'}</td>
                      <td className="py-2.5 px-2 text-right">{p.amount != null ? (p.transactionType === 'return' ? `-PKR ${p.amount.toLocaleString()}` : `PKR ${p.amount.toLocaleString()}`) : '—'}</td>
                    </tr>
                  ))}
                  {pageMaterials.length === 0 && (
                    <tr className="text-center">
                      <td colSpan={8} className="px-2 py-4 border-b border-[#e5e7eb] italic text-gray-500">No material records found.</td>
                    </tr>
                  )}
                  {pageIndex === pages.length - 1 && (
                    <tr className="border-b-2 border-black font-bold">
                      <td colSpan={7} className="py-3 px-2 text-right pr-12">Net Material Cost:</td>
                      <td className="py-3 px-2 text-right">{data?.summary?.netMaterialCost != null ? `PKR ${data.summary.netMaterialCost.toLocaleString()}` : '—'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </PageTemplate>
        ))}
      </div>
    </div>
  );
}
