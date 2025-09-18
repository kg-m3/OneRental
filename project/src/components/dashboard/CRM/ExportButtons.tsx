import { jsPDF } from 'jspdf';

export default function ExportButtons({ onExportCsv, filename }: { onExportCsv: () => void; filename: string }) {
  const exportPdf = () => {
    const doc = new jsPDF();
    doc.text('OneRental Stats Summary', 10, 10);
    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="flex gap-2">
      <button onClick={onExportCsv} className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">Export CSV</button>
      <button onClick={exportPdf} className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">Export PDF</button>
    </div>
  );
}
