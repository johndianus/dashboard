import React, { useState, useEffect } from 'react'
import { CTableDataCell, CTableRow } from '@coreui/react'
import { dba, baseURL, fetchJson } from '../../utilities/api'

const SalesReportExpand = ({ item, columns }) => {
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
export default SalesReportExpand
