import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

export interface PDFInvoiceData {
  invoice: {
    id: string;
    invoiceNumber: string;
    createdAt: Date;
    dueDate: Date;
    status: string;
    amount: number;
    tax: number;
    total: number;
    description: string;
    items: Array<{
      description: string;
      quantity: number;
      rate: number;
      amount: number;
    }>;
    notes?: string;
    terms?: string;
  };
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  organization: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
  };
}

export interface PDFReportData {
  title: string;
  subtitle?: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  organization: {
    name: string;
    address?: string;
  };
  sections: Array<{
    title: string;
    data: any;
    type: 'table' | 'chart' | 'text' | 'list';
  }>;
}

class PDFGenerator {
  /**
   * Generate invoice PDF
   */
  async generateInvoice(data: PDFInvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Header
        this.addInvoiceHeader(doc, data);

        // Invoice details
        this.addInvoiceDetails(doc, data);

        // Customer and organization info
        this.addInvoiceParties(doc, data);

        // Items table
        this.addInvoiceItems(doc, data);

        // Totals
        this.addInvoiceTotals(doc, data);

        // Footer
        this.addInvoiceFooter(doc, data);

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate report PDF
   */
  async generateReport(data: PDFReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Header
        this.addReportHeader(doc, data);

        // Sections
        data.sections.forEach(section => {
          this.addReportSection(doc, section);
        });

        // Footer
        this.addReportFooter(doc, data);

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate customer data export PDF
   */
  async generateCustomerExport(customerData: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Title
        doc.fontSize(20).text('Customer Data Export', 50, 50);
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);
        doc.moveDown(2);

        // Customer Information
        doc.fontSize(16).text('Customer Information', 50, doc.y);
        doc.moveDown();

        const customer = customerData.customerData;
        doc.fontSize(12);
        doc.text(`Name: ${customer.name}`, 50, doc.y);
        if (customer.email) doc.text(`Email: ${customer.email}`, 50, doc.y);
        if (customer.phone) doc.text(`Phone: ${customer.phone}`, 50, doc.y);
        if (customer.address) doc.text(`Address: ${customer.address}`, 50, doc.y);
        doc.text(`Customer Since: ${new Date(customer.createdAt).toLocaleDateString()}`, 50, doc.y);
        doc.moveDown(2);

        // Appointments
        if (customer.appointments && customer.appointments.length > 0) {
          doc.fontSize(16).text('Appointment History', 50, doc.y);
          doc.moveDown();
          
          customer.appointments.forEach((apt: any) => {
            doc.fontSize(12);
            doc.text(`${new Date(apt.startTime).toLocaleDateString()} - ${apt.title}`, 50, doc.y);
            doc.text(`Status: ${apt.status}`, 70, doc.y);
            if (apt.notes) doc.text(`Notes: ${apt.notes}`, 70, doc.y);
            doc.moveDown();
          });
          doc.moveDown();
        }

        // Consent Records
        if (customerData.consents && customerData.consents.length > 0) {
          doc.fontSize(16).text('Consent History', 50, doc.y);
          doc.moveDown();
          
          customerData.consents.forEach((consent: any) => {
            doc.fontSize(12);
            doc.text(`${consent.consentType}: ${consent.granted ? 'Granted' : 'Revoked'}`, 50, doc.y);
            doc.text(`Date: ${new Date(consent.grantedAt).toLocaleDateString()}`, 70, doc.y);
            doc.moveDown();
          });
        }

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  // Private helper methods for invoice generation
  private addInvoiceHeader(doc: PDFKit.PDFDocument, data: PDFInvoiceData) {
    // Company logo placeholder
    doc.fontSize(24).text(data.organization.name, 50, 50);
    
    // Invoice title
    doc.fontSize(20).text('INVOICE', 400, 50);
    doc.fontSize(12).text(`#${data.invoice.invoiceNumber}`, 400, 80);
    
    doc.moveDown(3);
  }

  private addInvoiceDetails(doc: PDFKit.PDFDocument, data: PDFInvoiceData) {
    const startY = doc.y;
    
    doc.fontSize(12);
    doc.text('Invoice Date:', 50, startY);
    doc.text(data.invoice.createdAt.toLocaleDateString(), 150, startY);
    
    doc.text('Due Date:', 50, startY + 20);
    doc.text(data.invoice.dueDate.toLocaleDateString(), 150, startY + 20);
    
    doc.text('Status:', 50, startY + 40);
    doc.text(data.invoice.status, 150, startY + 40);
    
    doc.moveDown(4);
  }

  private addInvoiceParties(doc: PDFKit.PDFDocument, data: PDFInvoiceData) {
    const startY = doc.y;
    
    // Bill To
    doc.fontSize(14).text('Bill To:', 50, startY);
    doc.fontSize(12);
    doc.text(data.customer.name, 50, startY + 20);
    if (data.customer.email) doc.text(data.customer.email, 50, startY + 35);
    if (data.customer.phone) doc.text(data.customer.phone, 50, startY + 50);
    if (data.customer.address) doc.text(data.customer.address, 50, startY + 65);
    
    // From
    doc.fontSize(14).text('From:', 300, startY);
    doc.fontSize(12);
    doc.text(data.organization.name, 300, startY + 20);
    if (data.organization.address) doc.text(data.organization.address, 300, startY + 35);
    if (data.organization.phone) doc.text(data.organization.phone, 300, startY + 50);
    if (data.organization.email) doc.text(data.organization.email, 300, startY + 65);
    
    doc.moveDown(6);
  }

  private addInvoiceItems(doc: PDFKit.PDFDocument, data: PDFInvoiceData) {
    const tableTop = doc.y;
    const itemsPerPage = 10;
    
    // Table headers
    doc.fontSize(12).fillColor('black');
    doc.text('Description', 50, tableTop);
    doc.text('Qty', 300, tableTop);
    doc.text('Rate', 350, tableTop);
    doc.text('Amount', 450, tableTop);
    
    // Draw header line
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    
    let currentY = tableTop + 30;
    
    data.invoice.items.forEach((item, index) => {
      if (index > 0 && index % itemsPerPage === 0) {
        doc.addPage();
        currentY = 50;
      }
      
      doc.fontSize(10);
      doc.text(item.description, 50, currentY, { width: 240 });
      doc.text(item.quantity.toString(), 300, currentY);
      doc.text(`$${item.rate.toFixed(2)}`, 350, currentY);
      doc.text(`$${item.amount.toFixed(2)}`, 450, currentY);
      
      currentY += 20;
    });
    
    doc.y = currentY + 20;
  }

  private addInvoiceTotals(doc: PDFKit.PDFDocument, data: PDFInvoiceData) {
    const startY = doc.y;
    
    doc.fontSize(12);
    doc.text('Subtotal:', 400, startY);
    doc.text(`$${data.invoice.amount.toFixed(2)}`, 480, startY);
    
    doc.text('Tax:', 400, startY + 20);
    doc.text(`$${data.invoice.tax.toFixed(2)}`, 480, startY + 20);
    
    // Total line
    doc.moveTo(400, startY + 35).lineTo(550, startY + 35).stroke();
    
    doc.fontSize(14).fillColor('black');
    doc.text('Total:', 400, startY + 45);
    doc.text(`$${data.invoice.total.toFixed(2)}`, 480, startY + 45);
    
    doc.moveDown(4);
  }

  private addInvoiceFooter(doc: PDFKit.PDFDocument, data: PDFInvoiceData) {
    if (data.invoice.notes) {
      doc.fontSize(10).text('Notes:', 50, doc.y);
      doc.text(data.invoice.notes, 50, doc.y, { width: 500 });
      doc.moveDown();
    }
    
    if (data.invoice.terms) {
      doc.fontSize(10).text('Terms & Conditions:', 50, doc.y);
      doc.text(data.invoice.terms, 50, doc.y, { width: 500 });
    }
    
    // Footer
    const bottomY = doc.page.height - 50;
    doc.fontSize(8).fillColor('gray');
    doc.text('Thank you for your business!', 50, bottomY, { align: 'center', width: 500 });
  }

  // Private helper methods for report generation
  private addReportHeader(doc: PDFKit.PDFDocument, data: PDFReportData) {
    doc.fontSize(20).text(data.title, 50, 50);
    
    if (data.subtitle) {
      doc.fontSize(14).text(data.subtitle, 50, 80);
    }
    
    doc.fontSize(12);
    doc.text(`Period: ${data.dateRange.startDate.toLocaleDateString()} - ${data.dateRange.endDate.toLocaleDateString()}`, 50, 110);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 50, 130);
    doc.text(`Organization: ${data.organization.name}`, 50, 150);
    
    doc.moveDown(3);
  }

  private addReportSection(doc: PDFKit.PDFDocument, section: any) {
    doc.fontSize(16).text(section.title, 50, doc.y);
    doc.moveDown();
    
    switch (section.type) {
      case 'table':
        this.addTable(doc, section.data);
        break;
      case 'text':
        doc.fontSize(12).text(section.data, 50, doc.y, { width: 500 });
        break;
      case 'list':
        this.addList(doc, section.data);
        break;
      default:
        doc.fontSize(12).text(JSON.stringify(section.data, null, 2), 50, doc.y);
    }
    
    doc.moveDown(2);
  }

  private addTable(doc: PDFKit.PDFDocument, tableData: any) {
    if (!tableData.headers || !tableData.rows) return;
    
    const startY = doc.y;
    const colWidth = 100;
    
    // Headers
    doc.fontSize(10).fillColor('black');
    tableData.headers.forEach((header: string, index: number) => {
      doc.text(header, 50 + (index * colWidth), startY);
    });
    
    // Draw header line
    doc.moveTo(50, startY + 15).lineTo(50 + (tableData.headers.length * colWidth), startY + 15).stroke();
    
    let currentY = startY + 25;
    
    // Rows
    tableData.rows.forEach((row: any[]) => {
      row.forEach((cell, index) => {
        doc.text(String(cell), 50 + (index * colWidth), currentY);
      });
      currentY += 15;
    });
    
    doc.y = currentY + 10;
  }

  private addList(doc: PDFKit.PDFDocument, listData: string[]) {
    doc.fontSize(12);
    listData.forEach(item => {
      doc.text(`• ${item}`, 50, doc.y);
      doc.moveDown(0.5);
    });
  }

  private addReportFooter(doc: PDFKit.PDFDocument, data: PDFReportData) {
    const bottomY = doc.page.height - 50;
    doc.fontSize(8).fillColor('gray');
    doc.text(`Generated by VervidFlow on ${new Date().toLocaleDateString()}`, 50, bottomY, { 
      align: 'center', 
      width: 500 
    });
  }
}

// Export singleton instance
export const pdfGenerator = new PDFGenerator();
