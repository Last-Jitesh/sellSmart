import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency, formatDate } from './formatters'

// formatCurrency ki jagah
const fmt = (amt) => `Rs. ${Math.round(amt || 0).toLocaleString('en-IN')}`

/**
 * Generate and download a PDF invoice for a sale
 * @param {Object} params
 * @param {Object} params.shopkeeper
 * @param {string} params.customerName
 * @param {Array}  params.items  — [{ name, qty, price }]
 * @param {string} params.date
 * @param {string} params.invoiceId
 */
export function generateInvoice({ shopkeeper = {}, customerName = '', items = [], date, invoiceId }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const sName    = shopkeeper.shopName || 'Retail Invoice'
  const sPhone   = shopkeeper.phone   ? `Ph: ${shopkeeper.phone}`   : ''
  const sAddress = shopkeeper.address || ''
  const sGst     = shopkeeper.gstNumber ? `GST: ${shopkeeper.gstNumber}` : ''

  // ── Header ────────────────────────────────────────────────────────
  doc.setFillColor(10, 10, 10)
  doc.rect(0, 0, 210, 50, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(sName, 14, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(170, 170, 170)
  if (sAddress) doc.text(sAddress, 14, 26)
  if (sPhone)   doc.text(sPhone,   14, 32)
  if (sGst)     doc.text(sGst,     14, 38)

  doc.text(`Invoice #${invoiceId || 'INV-001'}`, 150, 18)
  doc.text(`Date: ${formatDate(date || new Date())}`, 150, 24)

  // ── Customer info ─────────────────────────────────────────────────
  let startY = 58
  if (customerName) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.text(`Bill To:`, 14, 56)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20, 20, 20)
    doc.text(customerName, 35, 56)
    startY = 65
  }

  // ── Items table ───────────────────────────────────────────────────
  const tableRows = items.map((item, i) => [
    i + 1,
    item.name,
    item.qty,
    fmt(item.price),
    fmt(item.qty * item.price),
  ])

  const total = items.reduce((s, i) => s + i.qty * i.price, 0)

  autoTable(doc, {
    startY,
    head: [['#', 'Product', 'Qty', 'Unit Price', 'Total']],
    body: tableRows,
    styles: { font: 'helvetica', fontSize: 10, textColor: [40, 40, 40] },
    headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  })

  const finalY = doc.lastAutoTable.finalY + 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(10, 10, 10)
  doc.text(`Grand Total: ${fmt(total)}`, 14, finalY)

  // ── Footer ────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(150, 150, 150)
  doc.text('Thank you for your purchase! — Powered by SellSmart', 14, 280)

  doc.save(`invoice_${invoiceId || Date.now()}.pdf`)
}