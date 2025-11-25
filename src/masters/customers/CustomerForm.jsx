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
import SearchableSelect from '../../components/SearchableSelect'
import { baseURL, fetchJson } from '../../utilities/api'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { restructureOrganizations } from '../../utilities/formats'
import { getSessionValue } from '../../utilities/session'

const CustomerForm = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    organization_id: '',
    job_title: '',
    phone: '',
    email: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [companyName, setCompanyName] = useState('')
  const [loggedUser, setLoggedUser] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState()
  const customerid = searchParams.get('customerid')
  const [organizationOptions, setOrganizationOptions] = useState([])

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const storedCompanyName = await getSessionValue('crm:database')
        const storedUserId = await getSessionValue('crm:userid')
        setLoggedUser(storedUserId)
        setCompanyName(storedCompanyName)
      } catch (err) {
        console.error('Error loading company name:', err)
      }
    }
    fetchCompany()
  }, [])

  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (!companyName || !loggedUser) return
      setIsLoading(true)
      try {
        const organizationData = await fetchJson(
          `${baseURL}masters?db=${companyName}&object=organizations&user=${loggedUser}`,
        )
        setOrganizationOptions(restructureOrganizations(organizationData.data))
      } catch (err) {
        console.error('Error fetching organization data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrganizationData()
  }, [companyName, loggedUser])

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!companyName || !loggedUser) return
      if (!customerid) return
      setIsLoading(true)
      try {
        const customerData = await fetchJson(
          `${baseURL}contacts?db=${companyName}&id=${customerid}&user=${loggedUser}`,
        )
        setFormData(customerData.data[0])
      } catch (err) {
        console.error('Error fetching customer data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomerData()
  }, [companyName, customerid, loggedUser])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.first_name.trim()) newErrors.first_name = true
    if (!formData.last_name.trim()) newErrors.last_name = true
    if (!formData.organization_id) newErrors.organization_id = true
    if (!formData.job_title.trim()) newErrors.job_title = true
    if (!formData.phone.trim()) newErrors.phone = true
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = true

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
    delete payload.organization_name
    console.log('✅ Payload for API:', payload)

    try {
      // Check if updating or creating
      const customerid = searchParams.get('customerid')
      const action = customerid ? 'update' : 'create'

      const response = await fetchJson(
        `${baseURL}master?db=${companyname}&object=contacts&action=${action}&user=1`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      console.log(`✅ ${action.toUpperCase()} Response:`, response)

      // ✅ Navigate back, replacing history so user can't go "back" to form
      navigate('/masters/customers', { replace: true })
    } catch (error) {
      console.error('❌ Error posting to API:', error)
      setSaveError('Failed to save customer. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const organizationOptionsy = [
    {
      value: 1,
      label: 'JK Traders Ltd',
    },
    {
      value: 31,
      label: 'LMN Systems',
    },
  ]

  const organizationOptionsx = [
    { value: 1, label: 'JAR Softwares' },
    { value: 21, label: 'XJAR Softwares' },
  ]

  console.log('formData', organizationOptions)
  return (
    <CCard>
      <CCardHeader>{customerid ? 'Edit Client' : 'Create Client'}</CCardHeader>
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
                <CFormLabel>First Name</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className={errors.first_name ? 'is-invalid' : ''}
                />
              </div>

              <div className="mb-3">
                <CFormLabel>Last Name</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className={errors.last_name ? 'is-invalid' : ''}
                />
              </div>

              <div className="mb-3">
                <CFormLabel>Organization</CFormLabel>
                <SearchableSelect
                  options={organizationOptions}
                  value={String(formData.organization_id || '')} // ensure it’s a string
                  onChange={(val) => setFormData({ ...formData, organization_id: val })}
                  placeholder="Search Organization"
                  style={{
                    border: errors.organization_id ? '1px solid red' : '1px solid #dee2e6',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div className="mb-3">
                <CFormLabel>Job Title</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  className={errors.job_title ? 'is-invalid' : ''}
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
                <CFormLabel>Email</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? 'is-invalid' : ''}
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

export default CustomerForm
