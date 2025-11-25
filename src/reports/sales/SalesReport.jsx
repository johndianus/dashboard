import React, { useState, useEffect, useMemo } from 'react'
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
  CFormSelect,
} from '@coreui/react'
import { CPagination, CPaginationItem } from '@coreui/react'

import './style.css'
import NorthIcon from '@mui/icons-material/North'
import SouthIcon from '@mui/icons-material/South'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'
import { formatDateToDDMMMYYYY } from '../../utilities/formats'
import { dba, baseURL, fetchJson } from '../../utilities/api'

import SalesReportExpand from './SalesReportExpand'
import SalesReportModal from './SalesReportModal'

const columns = [
  { key: 'vchno', label: 'Vch. No.', width: '10%', bold: false, align: 'center' },
  { key: 'vchdate', label: 'Date', width: '10%', bold: false, align: 'center' },
  { key: 'name', label: 'Particulars', width: '60%', bold: false, align: 'left' },
  { key: 'grandtotal', label: 'Amount', width: '10%', bold: false, align: 'right' },
]

const SalesReport = () => {
  const today = new Date()
  const formatDate = (date) => date.toISOString().split('T')[0]

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [filterFromDate, setFilterFromDate] = useState(formatDate(today))
  const [filterToDate, setFilterToDate] = useState(formatDate(today))
  const [lastUsedDates, setLastUsedDates] = useState({ from: '', to: '' })
  const [selectedUser, setSelectedUser] = useState(null)
  const [shouldFetch, setShouldFetch] = useState(false)
  const [activeFilter, setActiveFilter] = useState('')
  const [activeSelectedUser, setActiveSelectedUser] = useState('')

  const [sortKey, setSortKey] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  const [data, setData] = useState('')
  const [expandedRow, setExpandedRow] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalItem, setModalItem] = useState(null)

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
    setShouldFetch(true)
  }, [])

  useEffect(() => {
    if (!shouldFetch) return

    if (filterFromDate === lastUsedDates.from && filterToDate === lastUsedDates.to) {
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const salesData = await fetchJson(
          `${baseURL}sales?db=${dba}&fromdate=${filterFromDate}&todate=${filterToDate}`,
        )
        const sales = salesData?.data ?? []
        setData(sales)
        setLastUsedDates({ from: filterFromDate, to: filterToDate }) // update last used dates here
      } catch (err) {
        console.error('Error loading dashboard data:', err)
        setError('Failed to load data. Please try again later.')
      } finally {
        setIsLoading(false)
        setShouldFetch(false)
      }
    }

    fetchData()
  }, [shouldFetch])

  const filteredData = useMemo(() => {
    return [...data]
      .filter((item) => {
        const matchesText = Object.values(item).some((val) =>
          String(val).toLowerCase().includes(activeFilter.toLowerCase()),
        )
        const matchesUser = !activeSelectedUser || item.vanid.toString() === activeSelectedUser
        return matchesText && matchesUser
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
  }, [data, activeFilter, activeSelectedUser, sortKey, sortAsc])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handleToggleExpand = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id))
  }

  return (
    <>
      <CCard className="shadow-sm rounded-4">
        <CCardHeader className="bg-light fw-semibold text-primary fs-5">Sales Register</CCardHeader>
        <CCardBody>
          <CForm className="mb-4">
            <CRow className="align-items-center mb-3">
              <CCol md={4}>
                <CFormInput
                  type="text"
                  placeholder="Search records..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="shadow-sm"
                />
              </CCol>

              <CCol md="auto" className="d-flex align-items-center gap-2">
                <label htmlFor="fromDate" className="mb-0 fw-semibold text-nowrap">
                  From
                </label>
                <CFormInput
                  id="fromDate"
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  className="shadow-sm"
                  style={{ width: '140px' }}
                />
              </CCol>

              <CCol md="auto" className="d-flex align-items-center gap-2">
                <label htmlFor="toDate" className="mb-0 fw-semibold text-nowrap">
                  To
                </label>
                <CFormInput
                  id="toDate"
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  className="shadow-sm"
                  style={{ width: '140px' }}
                />
              </CCol>

              <CCol md={3} className="d-flex align-items-center gap-2">
                <CFormSelect
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="shadow-sm"
                >
                  <option value="">All Users</option>
                  <option value="179">Van 1</option>
                  <option value="170">Van 2</option>
                  <option value="169">Van 3</option>
                  <option value="2704">Van 4</option>
                  <option value="180">Van 5</option>
                  <option value="171">Van 6</option>
                  <option value="172">Van 7</option>
                </CFormSelect>

                <CButton
                  color="primary"
                  className="shadow-sm text-white"
                  onClick={() => {
                    setShouldFetch(true)
                    setActiveFilter(filter)
                    setActiveSelectedUser(selectedUser)
                  }}
                >
                  Submit
                </CButton>
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
                            onClick={() => {
                              setModalItem(item)
                              setShowModal(true)
                            }}
                          >
                            <VisibilityIcon />
                          </CButton>
                          <CButton color="secondary" size="sm" variant="ghost" title="Edit">
                            <EditIcon />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>

                      {expandedRow === item.id && (
                        <SalesReportExpand item={item} columns={columns} />
                      )}
                    </React.Fragment>
                  ))}
                </CTableBody>
              </CTable>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4">
                <div className="text-muted mb-2 mb-md-0">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–
                  {Math.min(currentPage * itemsPerPage, filteredData.length)} of{' '}
                  {filteredData.length}
                </div>

                <div className="overflow-auto">
                  <CPagination align="end" className="mb-0">
                    <CPaginationItem
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      style={{ cursor: 'pointer' }}
                    >
                      Previous
                    </CPaginationItem>

                    {[...Array(totalPages)].map((_, index) => (
                      <CPaginationItem
                        key={index}
                        active={currentPage === index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        style={{ cursor: 'pointer' }}
                      >
                        {index + 1}
                      </CPaginationItem>
                    ))}

                    <CPaginationItem
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      style={{ cursor: 'pointer' }}
                    >
                      Next
                    </CPaginationItem>
                  </CPagination>
                </div>
              </div>
            </div>
          )}
        </CCardBody>
      </CCard>
      <SalesReportModal visible={showModal} onClose={() => setShowModal(false)} item={modalItem} />
    </>
  )
}

export default SalesReport
