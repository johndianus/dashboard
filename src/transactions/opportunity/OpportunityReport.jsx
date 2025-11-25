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
  CFormSelect,
} from '@coreui/react'
import { CPagination, CPaginationItem } from '@coreui/react'

import './Style.css'
import NorthIcon from '@mui/icons-material/North'
import SouthIcon from '@mui/icons-material/South'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import { dba, baseURL, fetchJson } from '../../utilities/api'
import { getItemStorage } from '../../utilities/localstorage'
import { useNavigate } from 'react-router-dom'
import { formatDateDDMMYYYYHHMM } from '../../utilities/formats'
import { getSessionValue } from '../../utilities/session'
import { restructureStages } from '../../utilities/formats'

const columns = [
  { key: 'opportunity_id', label: '#', width: '20px', bold: false, align: 'left' },
  { key: 'created_at', label: 'Entry Date', width: '90px', bold: false, align: 'left' },
  { key: 'contact_name', label: 'Contact', width: '120px', bold: false, align: 'left' },
  { key: 'description', label: 'Description', width: '150px', bold: false, align: 'left' },
  { key: 'stage_name', label: 'Status', width: '80px', bold: false, align: 'left' },
  { key: 'follow_date', label: 'Follow Date', width: '80px', bold: false, align: 'right' },
]

// your imports remain the same

const Opportunities = () => {
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('xxx') // empty = show all
  const [stagesList, setStagesList] = useState([])
  const [sortKey, setSortKey] = useState('follow_date')
  const [sortAsc, setSortAsc] = useState(true)
  const [data, setData] = useState([])
  const [expandedRow, setExpandedRow] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 100
  const [, setCompanyName] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true)
        setError('')

        // 1️⃣ Load company name first
        const storedCompanyname = await getSessionValue('crm:database')
        if (!storedCompanyname) {
          setError('Company name not found in storage.')
          setIsLoading(false)
          return
        }

        setCompanyName(storedCompanyname)

        // 2️⃣ Then fetch data once company name is ready
        const masterData = await fetchJson(
          `${baseURL}opportunities?db=${storedCompanyname}&user=1&page=${currentPage}&limit=${itemsPerPage}`,
        )
        const masters = masterData?.data ?? []
        setData(masters)
        setTotalPages(masterData?.totalPages || 1)

        const stageRes = await fetchJson(
          `${baseURL}masters?object=opportunities_stages&db=${storedCompanyname}&user=1`,
        )
        setStagesList(restructureStages(stageRes.data))
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAll()
  }, [currentPage])

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const filteredData = [...data]
    .filter((item) => {
      // Text search filter
      const matchesText = Object.values(item).some((val) =>
        String(val).toLowerCase().includes(filter.toLowerCase()),
      )

      // Status filter
      let matchesStatus = true
      if (statusFilter) {
        if (statusFilter === 'xxx') {
          // Exclude closed statuses
          matchesStatus = !['Closed', 'Closed Lost'].includes(item.stage_name)
        } else {
          matchesStatus = item.stage_name === statusFilter
        }
      }

      return matchesText && matchesStatus
    })
    .sort((a, b) => {
      if (!sortKey) return 0
      let valA = a[sortKey]
      let valB = b[sortKey]

      // Handle dates
      if (sortKey === 'follow_date' || sortKey === 'created_at') {
        valA = valA ? new Date(valA).getTime() : 0
        valB = valB ? new Date(valB).getTime() : 0
      } else {
        valA = valA ? String(valA).toLowerCase() : ''
        valB = valB ? String(valB).toLowerCase() : ''
      }

      if (valA < valB) return sortAsc ? -1 : 1
      if (valA > valB) return sortAsc ? 1 : -1
      return 0
    })

  const paginatedData = filteredData

  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  const paginationRange = () => {
    const totalNumbers = 5
    const totalBlocks = totalNumbers + 2

    if (totalPages <= totalBlocks) {
      return [...Array(totalPages)].map((_, i) => i + 1)
    }

    const startPage = Math.max(2, currentPage - 2)
    const endPage = Math.min(totalPages - 1, currentPage + 2)

    const pages = [1]
    if (startPage > 2) pages.push('...')
    for (let i = startPage; i <= endPage; i++) pages.push(i)
    if (endPage < totalPages - 1) pages.push('...')
    pages.push(totalPages)

    return pages
  }

  const handleToggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  const handleAddContact = () => {
    navigate('/transactions/opportunity')
  }

  const editCustomer = (item) => {
    navigate(`/transactions/opportunity?opportunity_id=${item.opportunity_id}`)
  }

  const viewCustomer = (item) => {
    navigate(`/transactions/opportunityview?opportunity_id=${item.opportunity_id}`)
  }

  console.log(paginatedData)
  return (
    <CCard className="shadow-sm rounded-4">
      <CCardHeader className="bg-light fw-semibold text-primary fs-5">
        List of Opportunities
      </CCardHeader>
      <CCardBody>
        <CForm className="mb-4">
          <CRow className="align-items-center">
            {/* Search Box */}
            <CCol md={4}>
              <CFormInput
                type="text"
                placeholder="Search records..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="shadow-sm"
              />
            </CCol>

            {/* Status Filter */}
            <CCol md={3}>
              <CFormSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="shadow-sm"
              >
                <option value="">🌟 All Status</option>
                <option value="xxx">📌 In Progress</option>
                {stagesList.map((opt) => (
                  <option key={opt.label} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
                {/* Or populate dynamically */}
              </CFormSelect>
            </CCol>

            {/* Add Button */}
            <CCol md={5} className="text-end">
              <CButton color="primary" className="shadow-sm" onClick={() => handleAddContact()}>
                + Add Opportunity
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
              className="mb-0 border shadow-sm resizable-table compact-table"
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
                  <React.Fragment key={item.opportunity_id}>
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
                          {col.key === 'created_at' || col.key === 'follow_date'
                            ? formatDateDDMMYYYYHHMM(item[col.key])
                            : col.key === 'contact_name'
                              ? `${item[col.key]} (${item['organization_name']})`
                              : item[col.key]}
                        </CTableDataCell>
                      ))}
                      <CTableDataCell
                        className="text-center"
                        style={{
                          width: '10%',
                        }}
                      >
                        <CButton
                          color="secondary"
                          size="sm"
                          variant="ghost"
                          className="me-2"
                          title="View"
                          onClick={() => viewCustomer(item)}
                        >
                          <VisibilityIcon />
                        </CButton>
                        <CButton
                          color="secondary"
                          size="sm"
                          variant="ghost"
                          title="Edit"
                          onClick={() => editCustomer(item)}
                        >
                          <EditIcon />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  </React.Fragment>
                ))}
              </CTableBody>
            </CTable>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4">
              <div className="text-muted mb-2 mb-md-0">
                Page {currentPage} of {totalPages}
              </div>

              <div className="d-flex justify-content-md-end w-100 overflow-auto">
                <CPagination className="mb-0">
                  <CPaginationItem
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    style={{ cursor: 'pointer' }}
                  >
                    Previous
                  </CPaginationItem>

                  {paginationRange().map((page, index) => (
                    <CPaginationItem
                      key={index}
                      active={page === currentPage}
                      onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      disabled={page === '...'}
                      style={{ cursor: page === '...' ? 'default' : 'pointer' }}
                    >
                      {page}
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
  )
}

export default Opportunities
