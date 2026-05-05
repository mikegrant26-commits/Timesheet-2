import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TimesheetData, Totals } from '../types';

export const generatePdf = (data: TimesheetData, totals: Totals) => {
    const doc = new jsPDF();

    // Ensure numeric fields are safe for all inputs
    const safeToFixed = (val: any) => {
        const num = parseFloat(String(val));
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    // Setup basic styles
    const primaryColor = [30, 58, 138]; // blue-900

    // Header Rectangle
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 35, 'F');
    
    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('RTD MECHANICAL LTD', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Weekly Timesheet Report', 105, 30, { align: 'center' });

    // Info Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOYEE NAME:', 15, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(data.employeeName || 'Not Specified', 55, 50);

    doc.setFont('helvetica', 'bold');
    doc.text('WEEK ENDING:', 15, 58);
    doc.setFont('helvetica', 'normal');
    doc.text(data.weekEndingDate, 50, 58);

    // Table Data Mapping
    const tableData = data.times.map(row => {
        let leaveLabel = '-';
        if (row.leaveType === 'al8') leaveLabel = 'Annual Leave (8h)';
        else if (row.leaveType === 'al4') leaveLabel = 'Annual Leave (4h)';
        else if (row.leaveType === 'bh8') leaveLabel = 'Bank Holiday (8h)';
        else if (row.leaveType === 'sl') leaveLabel = 'Sick Leave (8h)';

        const regVal = parseFloat(String(row.reg)) || 0;
        const ot15Val = parseFloat(String(row.ot15)) || 0;
        const ot2Val = parseFloat(String(row.ot2)) || 0;

        return [
            row.day,
            row.site || '-',
            regVal > 0 ? safeToFixed(regVal) : '-',
            ot15Val > 0 ? safeToFixed(ot15Val) : '-',
            ot2Val > 0 ? safeToFixed(ot2Val) : '-',
            row.leaveType !== 'none' ? leaveLabel : 'Work'
        ];
    });

    // Draw Table
    autoTable(doc, {
        startY: 65,
        head: [['Day', 'Work Site / Description', 'Regular', 'OT 1.5x', 'OT 2.0x', 'Type']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor as any, textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, halign: 'left' },
        columnStyles: {
            2: { halign: 'center' },
            3: { halign: 'center' },
            4: { halign: 'center' },
            5: { halign: 'center' },
        }
    });

    // Get Y position after the table using previousAutoTable.finalY
    const finalY = ((doc as any).lastAutoTable?.finalY || 150) + 15;

    // Totals Section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTALS', 15, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Regular:`, 15, finalY + 8);
    doc.text(safeToFixed(totals.totalReg), 55, finalY + 8);
    
    doc.text(`Total OT 1.5x:`, 15, finalY + 15);
    doc.text(safeToFixed(totals.totalOT15), 55, finalY + 15);
    
    doc.text(`Total OT 2.0x:`, 15, finalY + 22);
    doc.text(safeToFixed(totals.totalOT2), 55, finalY + 22);

    // Highlight Box for Effective Hours
    doc.setFillColor(240, 249, 255);
    doc.rect(130, finalY - 5, 65, 30, 'F');
    doc.setDrawColor(30, 58, 138);
    doc.rect(130, finalY - 5, 65, 30, 'S');

    doc.setTextColor(30, 58, 138);
    doc.setFontSize(10);
    doc.text('EFFECTIVE TOTAL', 162.5, finalY + 5, { align: 'center' });
    doc.setFontSize(18);
    doc.text(safeToFixed(totals.totalEffective), 162.5, finalY + 18, { align: 'center' });

    // Save PDF
    const fileName = `Timesheet_${(data.employeeName || 'Timesheet').replace(/\s+/g, '_')}_${data.weekEndingDate}.pdf`;
    doc.save(fileName);
};
