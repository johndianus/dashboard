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

const OrganizationForm = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [companyname, setCompanyName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState()
  const organizationid = searchParams.get('organizationid')

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
    const fetchOrganizationData = async () => {
      if (!companyname) return // wait until companyname is ready
      if (!organizationid) return
      setIsLoading(true)
      try {
        const organizationData = await fetchJson(
          `${baseURL}masters?db=${companyname}&object=organizations&id=${organizationid}&user=1`,
        )
        setFormData(organizationData.data[0])
      } catch (err) {
        console.error('Error fetching organization data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrganizationData()
  }, [companyname, searchParams])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = true
    if (!formData.industry.trim()) newErrors.industry = true
    if (!formData.website) newErrors.website = true
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = true
    if (!formData.phone.trim()) newErrors.phone = true
    if (!formData.address.trim()) newErrors.address = true
    if (!formData.city.trim()) newErrors.city = true
    if (!formData.state.trim()) newErrors.state = true
    if (!formData.country.trim()) newErrors.country = true
    if (!formData.postal_code.trim()) newErrors.postal_code = true
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
      const organizationid = searchParams.get('organizationid')
      const action = organizationid ? 'update' : 'create'

      const response = await fetchJson(
        `${baseURL}master?db=${companyname}&object=organizations&action=${action}&user=1`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      console.log(`✅ ${action.toUpperCase()} Response:`, response)

      // ✅ Navigate back, replacing history so user can't go "back" to form
      navigate('/masters/organizations', { replace: true })
    } catch (error) {
      console.error('❌ Error posting to API:', error)
      setSaveError('Failed to save organization. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  console.log('formData', formData)
  return (
    <CCard>
      <CCardHeader>{organizationid ? 'Edit Organization' : 'Create Organization'}</CCardHeader>
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
                <CFormLabel>Industry</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className={errors.industry ? 'is-invalid' : ''}
                />
              </div>

              <div className="mb-3">
                <CFormLabel>Website</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className={errors.website ? 'is-invalid' : ''}
                />
              </div>

              <div className="mb-3">
                <CFormLabel>Email</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? 'is-invalid' : ''}
                />
              </div>

              <div className="mb-3">
                <CFormLabel>Phone</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={errors.phone ? 'is-invalid' : ''}
                />
              </div>

              <div className="mb-3">
                <CFormLabel>Address</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={errors.address ? 'is-invalid' : ''}
                />
              </div>

              <div className="mb-3">
                <CFormLabel>City</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={errors.city ? 'is-invalid' : ''}
                />
              </div>

              <div className="mb-3">
                <CFormLabel>State</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className={errors.state ? 'is-invalid' : ''}
                />
              </div>

              <div className="mb-3">
                <CFormLabel>Country</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className={errors.country ? 'is-invalid' : ''}
                />
              </div>

              <div className="mb-3">
                <CFormLabel>Post Code</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className={errors.postal_code ? 'is-invalid' : ''}
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

export default OrganizationForm
