import React, { useState, useEffect } from 'react'
import { CRow, CCol, CBadge } from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import { cilStar, cibAddthis, cilNoteAdd, cilSpeech, cilTrash } from '@coreui/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getSessionValue } from '../../utilities/session'
import { baseURL, fetchJson } from '../../utilities/api'
import { formatDateDDMMYYYYHHMM } from '../../utilities/formats'
import { getAuditDetails } from '../../utilities/auditDetails'
import './Style.css' // We'll add some minimal CSS

const OpportunityView = () => {
  const [searchParams] = useSearchParams()
  const opportunityId = searchParams.get('opportunity_id')

  const [companyname, setCompanyName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [auditData, setAuditData] = useState([])

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const storedCompanyname = await getSessionValue('crm:database')
        setCompanyName(storedCompanyname)
      } catch (err) {
        console.error('Error loading company name:', err)
      }
    }
    fetchCompany()
  }, [])

  useEffect(() => {
    if (!companyname || !opportunityId) return

    const loadOpportunity = async () => {
      setIsLoading(true)
      try {
        const res = await fetchJson(
          `${baseURL}auditlogs?db=${companyname}&entity_type=opportunities&entity_id=${opportunityId}`,
        )
        setAuditData(res.data)
      } catch (error) {
        console.error('Error loading opportunity:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOpportunity()
  }, [companyname, opportunityId])
  return (
    <div className="history-container">
      {auditData?.map((step, index) => (
        <div key={index} className="history-step">
          <div className="step-box">
            <div className="step-icon">
              <CIcon
                icon={
                  step.action_type == 'CREATE'
                    ? cibAddthis
                    : step.action_type == 'CLOSED'
                      ? cilTrash
                      : step.action_type == 'VIEW'
                        ? cilStar
                        : cilSpeech
                }
                size="xl"
              />
            </div>

            <div className="step-content">
              <div className="step-title">{step.action_type}</div>
              {step.created_at && (
                <div className="step-date">
                  By: {step.username} {formatDateDDMMYYYYHHMM(step.created_at)}
                </div>
              )}
              <div className="step-description">
                {step.action_type === 'UPDATE' ? getAuditDetails(step.old_data, step.new_data) : ''}
              </div>
            </div>
          </div>

          {index < auditData.length - 1 && (
            <div className="step-connector">
              <div className="line"></div>

              {/* Clean SVG Arrow */}
              <svg className="arrow" width="24" height="24" viewBox="0 0 24 24">
                <path
                  d="M12 0 L12 18 M6 12 L12 18 L18 12"
                  stroke="#999"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default OpportunityView
