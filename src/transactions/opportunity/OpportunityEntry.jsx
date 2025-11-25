import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CButton,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilCheck, cilTrash } from '@coreui/icons'
import SearchableSelect from '../../components/SearchableSelect'
import {
  restructureContacts,
  restructureContactsWithOrganization,
  restructureStages,
  restructureServices,
  formatDateTimeLocal,
} from '../../utilities/formats'
import { baseURL, fetchJson } from '../../utilities/api'
import { getSessionValue } from '../../utilities/session'
import { useNavigate, useSearchParams } from 'react-router-dom'

const InvoiceForm = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const opportunityId = searchParams.get('opportunity_id')
  const [formData, setFormData] = useState({
    customer: '',
    stage: '',
    source: '',
    remarks: '',
    follow_date: '',
    services: [{ service_type_id: '', quantity: 0, uom: '', rate: 0 }],
  })
  const [companyname, setCompanyName] = useState('')
  const [loggedUser, setLoggedUser] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [contactData, setContactData] = useState([])
  const [contactList, setContactList] = useState([])
  const [stagesList, setStagesList] = useState([])
  const [servicesList, setServicesList] = useState([])
  const [saveError, setSaveError] = useState()
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const storedCompanyname = await getSessionValue('crm:database')
        const storedUserId = await getSessionValue('crm:userid')
        setCompanyName(storedCompanyname)
        setLoggedUser(storedUserId)
      } catch (err) {
        console.error('Error loading company name:', err)
      }
    }
    fetchCompany()
  }, [])

  useEffect(() => {
    if (!companyname || !opportunityId || !loggedUser) return

    const loadOpportunity = async () => {
      setIsLoading(true)
      try {
        const res = await fetchJson(
          `${baseURL}opportunities?db=${companyname}&id=${opportunityId}&user=${loggedUser}`,
        )
        console.log(res.data)
        const opp = res.data

        setFormData({
          customer: opp.contact_id || '',
          stage: opp.opportunities_stage_id || '',
          source: opp.source || '',
          remarks: opp.description || '',
          follow_date: formatDateTimeLocal(opp.follow_date) || '',
          services: opp.opportunities_details?.map((d) => ({
            opportunities_details_id: d.opportunities_details_id,
            service_type_id: d.service_type_id,
            quantity: d.quantity,
            uom: d.uom,
            rate: d.rate,
          })) || [
            { opportunities_details_id: null, service_type_id: '', quantity: 0, uom: '', rate: 0 },
          ],
        })
      } catch (error) {
        console.error('Error loading opportunity:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOpportunity()
  }, [companyname, opportunityId, loggedUser])

  useEffect(() => {
    if (!companyname) return

    const loadData = async () => {
      setIsLoading(true)

      try {
        // Fetch user only if userid exists
        //const userRes = await fetchJson(`${baseURL}contacts?db=${companyname}&id`)
        //setFormData(userRes.data[0])

        // Always fetch roles
        const contactRes = await fetchJson(
          `${baseURL}contacts?db=${companyname}&user=${loggedUser}`,
        )
        const contacts = restructureContactsWithOrganization(contactRes.data)
        setContactData(contactRes.data)
        setContactList(contacts)

        const stageRes = await fetchJson(
          `${baseURL}masters?object=opportunities_stages&db=${companyname}&user=${loggedUser}`,
        )
        setStagesList(restructureStages(stageRes.data))
        console.log(stageRes.data)
        console.log(restructureStages(stageRes.data))

        const serviceRes = await fetchJson(
          `${baseURL}masters?object=service_types&db=${companyname}&user=${loggedUser}`,
        )
        setServicesList(restructureServices(serviceRes.data))
        console.log(serviceRes.data)
        console.log(restructureServices(serviceRes.data))
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [companyname])

  const handleServiceChange = (index, field, value) => {
    const newServices = [...formData.services]
    newServices[index][field] = value
    setFormData({ ...formData, services: newServices, user: `${loggedUser}` })
  }

  const addServiceRow = () => {
    setFormData({
      ...formData,
      services: [
        ...formData.services,
        { opportunities_details_id: null, serviceName: '', quantity: 0, uom: '', rate: 0 },
      ],
    })
  }

  const handleDeleteService = (indexToDelete) => {
    const updatedServices = formData.services.filter((_, idx) => idx !== indexToDelete)
    setFormData({ ...formData, services: updatedServices })
  }

  const validateForm = () => {
    const newErrors = {}
    console.log(formData)
    if (!formData.customer) newErrors.customer = true

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    const payload = {
      contact_id: formData.customer,
      organization_id:
        contactData.find((c) => c.contact_id === formData.customer)?.organization_id || null,
      opportunities_stage_id: formData.stage,
      description: formData.remarks,
      source: formData.source,
      follow_date: formData.follow_date,
      user: `${loggedUser}`, //who created/updated
      user_id: `${loggedUser}`, //Who its assigned for
      amount: formData.services.reduce(
        (sum, s) => sum + Number(s.quantity || 0) * Number(s.rate || 0),
        0,
      ),
      details: formData.services.map((s) => ({
        ...s,
        amount: s.quantity * s.rate,
        description: '', // Optional: add description if needed
      })),
    }

    try {
      setIsSaving(true)

      const action = opportunityId ? 'update' : 'create'
      if (action === 'update') {
        payload.opportunities_id = opportunityId
      }
      payload.currency = 'AED'
      console.log('Saving payload:', payload)
      const response = await fetchJson(
        `${baseURL}opportunity?db=${companyname}&action=${action}&user=1`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      console.log('Saved:', response)
      navigate('/reports/opportunities', { replace: true })
      //alert(`Opportunity ${action}d successfully`)
    } catch (error) {
      console.error('Error saving:', error)
      setSaveError('Failed to save opportunity.')
    } finally {
      setIsSaving(false)
    }
  }

  const sourceList = [
    { value: 'Phone', label: 'Phone' },
    { value: 'Whatsapp', label: 'Whatsapp' },
    { value: 'Email', label: 'Email' },
    { value: 'Referal', label: 'Referal' },
    { value: 'Others', label: 'Others' },
  ]

  return (
    <CCard>
      <CCardHeader>New Opportunity</CCardHeader>
      <CCardBody>
        {isLoading && (
          <div className="text-center py-4 text-primary">
            <div className="spinner-border text-primary" role="status" />
            <div className="mt-2">Loading data...</div>
          </div>
        )}
        {!isLoading && (
          <CForm>
            <div className="mb-3">
              <CFormLabel>Customer</CFormLabel>
              <SearchableSelect
                options={contactList}
                value={formData.customer} // ensure it’s a string
                onChange={(val) => setFormData({ ...formData, customer: val })}
                placeholder="Search Contact"
                style={{
                  border: errors.customer ? '1px solid red' : '1px solid #dee2e6',
                  borderRadius: '4px',
                }}
              />
            </div>

            <div className="mb-3">
              <CFormLabel>Stage</CFormLabel>
              <SearchableSelect
                options={stagesList}
                value={formData.stage} // ensure it’s a string
                onChange={(val) => setFormData({ ...formData, stage: val })}
                placeholder="Search Stage"
                style={{
                  border: errors.stage ? '1px solid red' : '1px solid #dee2e6',
                  borderRadius: '4px',
                }}
              />
            </div>

            <div className="mb-3">
              <CFormLabel>Source</CFormLabel>
              <SearchableSelect
                options={sourceList}
                value={formData.source} // ensure it’s a string
                onChange={(val) => setFormData({ ...formData, source: val })}
                placeholder="Search Source"
                style={{
                  border: errors.source ? '1px solid red' : '1px solid #dee2e6',
                  borderRadius: '4px',
                }}
              />
            </div>

            <div className="mb-3">
              <CFormLabel htmlFor="remarksInput">Description</CFormLabel>
              <CFormInput
                type="text"
                id="remarksInput"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <CFormLabel htmlFor="remarksInput">Follow On</CFormLabel>
              <CFormInput
                type="datetime-local"
                id="followDateInput"
                value={formData.follow_date}
                onChange={(e) => setFormData({ ...formData, follow_date: e.target.value })}
                size="sm"
              />
            </div>

            <CCard className="border p-2">
              {/* Header row */}
              <CRow className="fw-bold border-bottom m-0 p-1 align-items-center">
                <CCol md={7} className="border-end p-1">
                  Service Name
                </CCol>
                <CCol md={1} className="border-end p-1">
                  Qty
                </CCol>
                <CCol md={1} className="border-end p-1">
                  UOM
                </CCol>
                <CCol md={1} className="border-end p-1">
                  Rate
                </CCol>
                <CCol md={1} className="border-end p-1">
                  Amount
                </CCol>
                <CCol md={1} className="p-1 text-center">
                  Action
                </CCol>
              </CRow>

              {/* Item rows */}
              {formData?.services?.map((service, index) => (
                <CRow key={index} className="m-0 p-1 border-bottom align-items-center">
                  <CCol md={7} className="border-end p-1">
                    <SearchableSelect
                      options={servicesList}
                      value={service.service_type_id}
                      onChange={(val) => handleServiceChange(index, 'service_type_id', val)}
                      placeholder="Select Item"
                    />
                  </CCol>
                  <CCol md={1} className="border-end p-1">
                    <CFormInput
                      type="number"
                      min={0}
                      size="sm"
                      value={service.quantity === 0 ? '' : service.quantity}
                      onChange={(e) => {
                        const val = e.target.value
                        handleServiceChange(index, 'quantity', val === '' ? '' : parseFloat(val))
                      }}
                    />
                  </CCol>
                  <CCol md={1} className="border-end p-1">
                    <CFormInput
                      type="string"
                      min={0}
                      size="sm"
                      value={service.uom}
                      onChange={(e) => handleServiceChange(index, 'uom', e.target.value)}
                    />
                  </CCol>
                  <CCol md={1} className="border-end p-1">
                    <CFormInput
                      type="number"
                      min={0}
                      size="sm"
                      value={service.rate}
                      onChange={(e) =>
                        handleServiceChange(index, 'rate', parseFloat(e.target.value) || 0)
                      }
                    />
                  </CCol>
                  <CCol md={1} className="border-end p-1">
                    <CFormInput
                      value={(service.quantity * service.rate).toFixed(2)}
                      readOnly
                      plaintext
                      size="sm"
                      aria-label="Amount"
                    />
                  </CCol>

                  {/* Delete button column */}
                  <CCol md="1" className="p-0 d-flex align-items-center justify-content-center">
                    <CButton
                      color="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteService(index)}
                      title="Delete Item"
                      aria-label="Delete Item"
                      className="p-1"
                      style={{ lineHeight: 1 }}
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </CCol>
                </CRow>
              ))}
            </CCard>

            <CRow className="mt-3">
              <CCol className="d-flex justify-content-end">
                <CButton color="secondary" onClick={addServiceRow} className="me-2" size="sm">
                  <CIcon icon={cilPlus} className="me-1" />
                  Add Item
                </CButton>

                <CButton color="dark" onClick={handleSave} size="sm" disabled={isSaving}>
                  <CIcon icon={cilCheck} className="me-1" />
                  {isSaving ? 'Saving' : 'Save'}
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        )}
      </CCardBody>
    </CCard>
  )
}

export default InvoiceForm
