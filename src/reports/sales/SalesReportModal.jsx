import React, { useEffect, useState, useRef } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { cilPrint, cilSave, cilXCircle } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { formatDateToDDMMMYYYY } from '../../utilities/formats'
import { fetchJson, baseURL, dba } from '../../utilities/api'
import { handlePrint, handleExportPDF } from '../../utilities/printexport'
import './style.css'

const SalesReportModal = ({ visible, onClose, item }) => {
  const [details, setDetails] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const printRef = useRef()

  useEffect(() => {
    const fetchDetails = async () => {
      if (item) {
        setLoading(true)
        setError(null)
        try {
          const res = await fetchJson(`${baseURL}salesvoucher?db=${dba}&vchno=${item.vchno}`)
          setDetails(res?.data ?? [])
        } catch (err) {
          console.error('Failed to fetch invoice details', err)
          setError('Failed to fetch invoice details. Please try again.')
        } finally {
          setLoading(false)
        }
      }
    }

    fetchDetails()
  }, [item])

  if (!item) return null

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader closeButton>
        <CModalTitle>Invoice Details</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div id="printable-area" ref={printRef}>
          {/* Invoice Summary Table */}
          <CTable bordered className="mb-3 text-nowrap">
            <CTableHead className="table-light">
              <CTableRow>
                <CTableHeaderCell colSpan="4" style={{ textAlign: 'center' }}>
                  Tax Invoice
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              <CTableRow>
                <CTableDataCell>
                  <strong>Customer:</strong>
                </CTableDataCell>
                <CTableDataCell>{item.name}</CTableDataCell>
                <CTableDataCell>
                  <strong>Invoice No:</strong>
                </CTableDataCell>
                <CTableDataCell>{item.vchno}</CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableDataCell>
                  <strong>Date:</strong>
                </CTableDataCell>
                <CTableDataCell>{formatDateToDDMMMYYYY(item.vchdate)}</CTableDataCell>
                <CTableDataCell>
                  <strong>Status:</strong>
                </CTableDataCell>
                <CTableDataCell>
                  {item.ispostedtally === 1 ? 'Posted' : 'Pending' || ''}
                </CTableDataCell>
              </CTableRow>
              <CTableRow>
                <CTableDataCell>
                  <strong>Van:</strong>
                </CTableDataCell>
                <CTableDataCell>{item.vanid || '—'}</CTableDataCell>
                <CTableDataCell>
                  <strong></strong>
                </CTableDataCell>
                <CTableDataCell></CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>

          {/* Loader or Error */}
          {loading ? (
            <div className="text-center my-4">
              <CSpinner color="primary" />
            </div>
          ) : error ? (
            <CAlert color="danger" className="my-3">
              {error}
            </CAlert>
          ) : (
            <CTable bordered responsive>
              <CTableHead className="table-light">
                <CTableRow>
                  <CTableHeaderCell>Item</CTableHeaderCell>
                  <CTableHeaderCell>Qty</CTableHeaderCell>
                  <CTableHeaderCell>UOM</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Amount</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {details.map((entry) => (
                  <CTableRow key={entry.id}>
                    <CTableDataCell>{entry.itemname}</CTableDataCell>
                    <CTableDataCell>{entry.qty}</CTableDataCell>
                    <CTableDataCell>{entry.uom}</CTableDataCell>
                    <CTableDataCell className="text-end">{entry.amount}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </div>
      </CModalBody>
      <CModalFooter className="justify-content-between">
        <div>
          <CButton
            color="info"
            variant="outline"
            className="me-2 shadow-sm"
            onClick={() => handlePrint(printRef.current, `Invoice_${item.vchno}`)}
          >
            <CIcon icon={cilPrint} className="me-2" />
            Print
          </CButton>
          <CButton
            color="success"
            variant="outline"
            className="me-2 shadow-sm"
            onClick={() => handleExportPDF(printRef.current, `Invoice_${item.vchno}.pdf`)}
          >
            <CIcon icon={cilSave} className="me-2" />
            Export PDF
          </CButton>
        </div>
        <CButton color="secondary" className="shadow-sm" onClick={onClose}>
          <CIcon icon={cilXCircle} className="me-2" />
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default SalesReportModal
