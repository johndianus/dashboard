import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheck } from '@coreui/icons'
import { baseURL, fetchJson } from '../../utilities/api'
import { getItemStorage } from '../../utilities/localstorage'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getSessionValue } from '../../utilities/session'

const ServiceForm = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [companyname, setCompanyName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState()
  const serviceid = searchParams.get('serviceid')

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
    const fetchServiceData = async () => {
      if (!companyname) return // wait until companyname is ready
      if (!serviceid) return
      setIsLoading(true)
      try {
        const serviceData = await fetchJson(
          `${baseURL}masters?db=${companyname}&object=service_types&id=${serviceid}&user=1`,
        )
        setFormData(serviceData.data[0])
      } catch (err) {
        console.error('Error fetching service data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchServiceData()
  }, [companyname, searchParams])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = true
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)

    if (!validateForm()) {
      setSaving(false)
      return
    }

    const payload = { ...formData, db: companyname, user: 1 }
    console.log('✅ Payload for API:', payload)

    try {
      // Check if updating or creating
      const serviceid = searchParams.get('serviceid')
      const action = serviceid ? 'update' : 'create'

      const response = await fetchJson(
        `${baseURL}master?db=${companyname}&object=service_types&action=${action}&user=1`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      console.log(`✅ ${action.toUpperCase()} Response:`, response)

      // ✅ Navigate back, replacing history so user can't go "back" to form
      navigate('/masters/services', { replace: true })
    } catch (error) {
      console.error('❌ Error posting to API:', error)
      setSaveError('Failed to save service. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  console.log('formData', formData)
  return (
    <CCard>
      <CCardHeader>{serviceid ? 'Edit Service' : 'Create Service'}</CCardHeader>
      <CCardBody>
        <CForm
          onSubmit={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSave(e)
            }
          }}
        >
          {isLoading && (
            <div className="text-center py-4 text-primary">
              <div className="spinner-border text-primary" role="status" />
              <div className="mt-2">Loading data...</div>
            </div>
          )}

          {!isLoading && (
            <>
              <div className="mb-3">
                <CFormLabel>Name</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? 'is-invalid' : ''}
                />
              </div>

              <div className="mb-3">
                <CFormLabel>Description</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={errors.description ? 'is-invalid' : ''}
                />
              </div>

              <CRow className="mt-4 align-items-center">
                <CCol className="text-center">
                  {saveError && <div className="text-danger fw-semibold mb-2">{saveError}</div>}
                </CCol>
                <CCol className="d-flex justify-content-end">
                  <CButton
                    color="dark"
                    type="submit"
                    onClick={handleSave}
                    size="sm"
                    disabled={saving}
                  >
                    <CIcon icon={cilCheck} className="me-1" />
                    {saving ? 'Saving...' : 'Save'}
                  </CButton>
                </CCol>
              </CRow>
            </>
          )}
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default ServiceForm
