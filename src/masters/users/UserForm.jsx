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
import SearchableSelect from '../../components/SearchableSelect'
import { restructureRoles } from '../../utilities/formats'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getSessionValue } from '../../utilities/session'
import md5 from 'md5'

const ServiceForm = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    username: '',
    displayname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role_id: '',
  })
  const [roleData, setRoleData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [companyname, setCompanyName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState()
  const userid = searchParams.get('userid')

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const storedCompanyname = await getSessionValue('crm:companyname')
        setCompanyName(storedCompanyname)
      } catch (err) {
        console.error('Error loading company name:', err)
      }
    }

    fetchCompany()
  }, [])

  useEffect(() => {
    if (!companyname) return

    const loadData = async () => {
      setIsLoading(true)

      try {
        // Fetch user only if userid exists
        if (userid) {
          const userRes = await fetchJson(`${baseURL}users?db=${companyname}&id=${userid}&user=1`)
          setFormData(userRes.data[0])
        }

        // Always fetch roles
        const roleRes = await fetchJson(`${baseURL}masters?object=roles&db=${companyname}&user=1`)
        const roles = restructureRoles(roleRes.data)
        setRoleData(roles)
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [companyname, searchParams])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) newErrors.username = true
    if (!formData.displayname.trim()) newErrors.displayname = true
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = true
    if (formData.password !== formData.confirmPassword) newErrors.password = true
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = true
    if (!userid && !formData.password) newErrors.password = true
    if (!userid && !formData.password) newErrors.confirmPassword = true
    if (!formData.role_id) newErrors.role_id = true
    setErrors(newErrors)
    console.log(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)

    if (!validateForm()) {
      setSaving(false)
      return
    }

    const payload = {
      ...formData,
      db: companyname,
      user: 1,
    }

    // Add hashed password only if a password was entered
    if (formData.password) {
      payload.password_hash = md5(formData.password)
    }

    // Remove raw password fields
    delete payload.password
    delete payload.confirmPassword
    console.log('✅ Payload for API:', payload)

    try {
      // Check if updating or creating
      const userid = searchParams.get('userid')
      const action = userid ? 'update' : 'create'

      const response = await fetchJson(
        `${baseURL}user?db=${companyname}&action=${action}&id=${userid}&user=1`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      console.log(`✅ ${action.toUpperCase()} Response:`, response)

      // ✅ Navigate back, replacing history so user can't go "back" to form
      navigate('/masters/users', { replace: true })
    } catch (error) {
      console.error('❌ Error posting to API:', error)
      setSaveError('Failed to save user. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  console.log('formData', formData)
  return (
    <CCard>
      <CCardHeader>{userid ? 'Edit User' : 'Create User'}</CCardHeader>
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
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={errors.username ? 'is-invalid' : ''}
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
                <CFormLabel>Display Name</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.displayname}
                  onChange={(e) => setFormData({ ...formData, displayname: e.target.value })}
                  className={errors.displayname ? 'is-invalid' : ''}
                />
              </div>

              <div className="mb-3">
                <CFormLabel>Role</CFormLabel>
                <SearchableSelect
                  options={roleData}
                  value={formData.role_id || ''} // ensure it’s a string
                  onChange={(val) => setFormData({ ...formData, role_id: val })}
                  placeholder="Search Role"
                  style={{
                    border: errors.role_id ? '1px solid red' : '1px solid #dee2e6',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div className="mb-3">
                <CFormLabel>Password</CFormLabel>
                <CFormInput
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={errors.password ? 'is-invalid' : ''}
                />
              </div>

              <div className="mb-3">
                <CFormLabel>Confirm Password</CFormLabel>
                <CFormInput
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={errors.confirmPassword ? 'is-invalid' : ''}
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
