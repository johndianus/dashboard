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

import './Style.css'
import NorthIcon from '@mui/icons-material/North'
import SouthIcon from '@mui/icons-material/South'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'
import { dba, baseURL, fetchJson } from '../../utilities/api'

const columns = [
  { key: 'id', label: 'Id', width: '5%', bold: false, align: 'center' },
  { key: 'name', label: 'Particulars', width: '70%', bold: false, align: 'left' },
  { key: 'balance', label: 'Balance', width: '10%', bold: false, align: 'right' },
]

// your imports remain the same

const Users = () => {
  const today = new Date()
  const formatDate = (date) => date.toISOString().split('T')[0]

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  const [data, setData] = useState([])
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
        const salesData = await fetchJson(`${baseURL}users?db=${dba}`)
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
  }, [])

  const filteredData = [...data]
    .filter((item) => {
      const matchesText = Object.values(item).some((val) =>
        String(val).toLowerCase().includes(filter.toLowerCase()),
      )
      return matchesText
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

  return (
    <CCard className="shadow-sm rounded-4">
      <CCardHeader className="bg-light fw-semibold text-primary fs-5">
        List of Customers
      </CCardHeader>
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
                          {col.key === 'balance'
                            ? item[col.key] === 0
                              ? ''
                              : item[col.key] + ' ' + item['drcr']
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
                  </React.Fragment>
                ))}
              </CTableBody>
            </CTable>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4">
              <div className="text-muted mb-2 mb-md-0">
                Showing {(currentPage - 1) * itemsPerPage + 1}–
                {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
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

export default Users
