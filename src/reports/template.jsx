import React, { useState, useEffect } from 'react'
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CFormInput,
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CCol,
  CRow,
} from '@coreui/react'
import { CPagination, CPaginationItem } from '@coreui/react'

import './ResizableTable.css'
import NorthIcon from '@mui/icons-material/North'
import SouthIcon from '@mui/icons-material/South'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'
import { formatDateToDDMMMYYYY } from '../utilities/formats'
import { dba, baseURL, fetchJson } from '../utilities/api'

const columns = [
  { key: 'vchno', label: 'Vch. No.', width: '5%', bold: false, align: 'center' },
  { key: 'vchdate', label: 'Date', width: '5%', bold: false, align: 'center' },
  { key: 'name', label: 'Particulars', width: '50%', bold: false, align: 'left' },
  { key: 'grandtotal', label: 'Amount', width: '10%', bold: false, align: 'right' },
  { key: 'ispostedtally', label: 'Status', width: '10%', bold: false, align: 'center' },
]

const ExpandedDetail = ({ item }) => {
  const [invEnt, setInvEnt] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const invEntData = await fetchJson(`${baseURL}salesvoucher?db=${dba}&vchno=${item.vchno}`)
        const invEnt = invEntData?.data ?? []
        setInvEnt(invEnt)
        console.log(invEnt)
      } catch (err) {
        console.error('Error loading detail:', err)
        setError('Failed to load data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <CTableRow className="bg-light">
        <CTableDataCell colSpan={columns.length + 1} className="text-center py-4">
          <div className="spinner-border text-primary" role="status" />
        </CTableDataCell>
      </CTableRow>
    )
  }

  if (error) {
    return (
      <CTableRow className="bg-light">
        <CTableDataCell colSpan={columns.length + 1}>
          <div className="alert alert-danger my-2 mb-0" role="alert">
            {error}
          </div>
        </CTableDataCell>
      </CTableRow>
    )
  }

  return (
    <>
      {invEnt.map((ie) => (
        <CTableRow key={ie.id} className="bg-light text-muted text-nowrap">
          {columns.map((col) => (
            <CTableDataCell
              key={`expanded-${ie.id}-${col.key}`}
              style={{
                fontWeight: 'normal',
                textAlign: col.align,
                width: col.width,
              }}
            >
              {col.key === 'name' ? (
                <div className="d-flex flex-wrap gap-2">
                  <span style={{ background: '#eef', padding: '2px 6px', borderRadius: '4px' }}>
                    {ie.itemname}
                  </span>
                  <span style={{ background: '#efe', padding: '2px 6px', borderRadius: '4px' }}>
                    {ie.qty} {ie.uom}
                  </span>
                </div>
              ) : col.key === 'grandtotal' ? (
                <div style={{ background: '#fee', padding: '2px 6px', borderRadius: '4px' }}>
                  {ie.amount}
                </div>
              ) : (
                ''
              )}
            </CTableDataCell>
          ))}
          <CTableDataCell /> {/* Placeholder for Action column */}
        </CTableRow>
      ))}
    </>
  )
}

const Customers = () => {
  const today = new Date()
  const formatDate = (date) => date.toISOString().split('T')[0]

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [filterFromDate, setFilterFromDate] = useState(formatDate(today))
  const [filterToDate, setFilterToDate] = useState(formatDate(today))
  const [sortKey, setSortKey] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  const [data, setData] = useState('')
  const [expandedRow, setExpandedRow] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 100

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const salesData = await fetchJson(
          `${baseURL}sales?db=${dba}&fromdate=${filterFromDate}&todate=${filterToDate}`,
        )
        const sales = salesData?.data ?? []
        setData(sales)
      } catch (err) {
        console.error('Error loading dashboard data:', err)
        setError('Failed to load data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [filterFromDate, filterToDate])

  const filteredData = [...data]
    .filter((item) => {
      const matchesText = Object.values(item).some((val) =>
        String(val).toLowerCase().includes(filter.toLowerCase()),
      )

      //const itemDate = new Date(item.date)
      //const fromDate = filterFromDate ? new Date(filterFromDate) : null
      //const toDate = filterToDate ? new Date(filterToDate) : null
      //const matchesDate = (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate)

      return matchesText //&& matchesDate
    })
    .sort((a, b) => {
      if (!sortKey) return 0

      let valA = a[sortKey]
      let valB = b[sortKey]

      if (sortKey === 'date') {
        valA = new Date(valA)
        valB = new Date(valB)
      }

      if (valA < valB) return sortAsc ? -1 : 1
      if (valA > valB) return sortAsc ? 1 : -1
      return 0
    })

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handleToggleExpand = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id))
  }

  return (
    <CCard className="shadow-sm rounded-4">
      <CCardHeader className="bg-light fw-semibold text-primary fs-5">Sales Register</CCardHeader>
      <CCardBody>
        <CForm className="mb-4">
          <CRow className="align-items-center">
            <CCol md={4}>
              <CFormInput
                type="text"
                placeholder="Search records..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="shadow-sm"
              />
            </CCol>
            <CCol md={3} className="d-flex align-items-center gap-2">
              <label htmlFor="fromDate" className="mb-0 fw-semibold text-nowrap">
                From Date
              </label>
              <CFormInput
                id="fromDate"
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                className="shadow-sm"
              />
            </CCol>

            <CCol md={3} className="d-flex align-items-center gap-2">
              <label htmlFor="toDate" className="mb-0 fw-semibold text-nowrap">
                To Date
              </label>
              <CFormInput
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                className="shadow-sm"
              />
            </CCol>
          </CRow>
        </CForm>

        {isLoading && (
          <div className="text-center py-4 text-primary">
            <div className="spinner-border text-primary" role="status" />
            <div className="mt-2">Loading data...</div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger my-3" role="alert">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="resizable-table-wrapper">
            <CTable
              hover
              responsive
              bordered
              align="middle"
              className="mb-0 border shadow-sm resizable-table"
            >
              <CTableHead className="table-light text-nowrap">
                <CTableRow>
                  {columns.map((col) => (
                    <CTableHeaderCell
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      style={{
                        cursor: 'pointer',
                        fontWeight: col.bold ? 'bold' : 'normal',
                        width: col.width,
                        textAlign: col.align,
                      }}
                      className="resizable-header"
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent:
                            col.align === 'right'
                              ? 'flex-end'
                              : col.align === 'center'
                                ? 'center'
                                : 'flex-start',
                          alignItems: 'center',
                        }}
                      >
                        <span>{col.label}</span>
                        {sortKey === col.key && (
                          <span className="ms-2">
                            {sortAsc ? (
                              <NorthIcon fontSize="small" />
                            ) : (
                              <SouthIcon fontSize="small" />
                            )}
                          </span>
                        )}
                      </div>
                    </CTableHeaderCell>
                  ))}
                  <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {paginatedData.map((item) => (
                  <React.Fragment key={item.id}>
                    <CTableRow className="text-nowrap">
                      {columns.map((col) => (
                        <CTableDataCell
                          key={col.key}
                          style={{
                            fontWeight: col.bold ? 'bold' : 'normal',
                            textAlign: col.align,
                            width: col.width,
                          }}
                        >
                          {col.key === 'vchdate'
                            ? formatDateToDDMMMYYYY(item[col.key])
                            : item[col.key]}
                        </CTableDataCell>
                      ))}
                      <CTableDataCell className="text-center">
                        <CButton
                          color="secondary"
                          size="sm"
                          variant="ghost"
                          className="me-2"
                          title="Expand"
                          onClick={() => handleToggleExpand(item.id)}
                        >
                          <ExpandMoreIcon />
                        </CButton>
                        <CButton
                          color="secondary"
                          size="sm"
                          variant="ghost"
                          className="me-2"
                          title="View"
                        >
                          <VisibilityIcon />
                        </CButton>
                        <CButton color="secondary" size="sm" variant="ghost" title="Edit">
                          <EditIcon />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>

                    {expandedRow === item.id && <ExpandedDetail item={item} />}
                  </React.Fragment>
                ))}
              </CTableBody>
            </CTable>
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted">
                Showing {(currentPage - 1) * itemsPerPage + 1}–
                {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
              </div>
              <CPagination align="end">
                <CPaginationItem
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </CPaginationItem>

                {[...Array(totalPages)].map((_, index) => (
                  <CPaginationItem
                    key={index}
                    active={currentPage === index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </CPaginationItem>
                ))}

                <CPaginationItem
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </CPaginationItem>
              </CPagination>
            </div>
          </div>
        )}
      </CCardBody>
    </CCard>
  )
}

export default Customers
