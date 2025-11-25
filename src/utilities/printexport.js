import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export const handlePrint = (element, title = 'Invoice') => {
    if (!element) return
  
    const content = element.innerHTML
    const printWindow = window.open('', '', 'height=600,width=800')
  
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }
            .table-light {
              background-color: #f9f9f9;
            }
            .text-end {
              text-align: right;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `)
  
    printWindow.document.close()
    printWindow.focus()
  
    // Delay needed to ensure content is rendered
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }
  

export const handleExportPDF = async (element, fileName = 'document.pdf') => {
  if (!element) return

  const canvas = await html2canvas(element)
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const imgProps = pdf.getImageProperties(imgData)
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(fileName)
}
