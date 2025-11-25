import React, { useState } from 'react'
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

const InvoiceForm = () => {
  const [formData, setFormData] = useState({
    customer: '',
    ledger: '',
    remarks: '',
    items: [{ itemName: '', qty: 0, uom: '', rate: 0 }],
  })

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    setFormData({ ...formData, items: newItems })
  }

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemName: '', qty: 0, uom: '', rate: 0 }],
    })
  }

  const handleDeleteItem = (indexToDelete) => {
    const updatedItems = formData.items.filter((_, idx) => idx !== indexToDelete)
    setFormData({ ...formData, items: updatedItems })
  }

  const handleSave = () => {
    const payload = {
      customer: formData.customer,
      ledger: formData.ledger,
      remarks: formData.remarks,
      items: formData.items.map((item) => ({
        ...item,
        amount: item.qty * item.rate,
      })),
    }
    console.log('Payload for API:', payload)
    // TODO: Post to your API here
  }

  const customerOptions = [
    { value: 'cust1', label: 'Customer 1' },
    { value: 'cust2', label: 'Customer 2' },
    { value: 'cust3', label: 'Customer 3' },
  ]

  const salesLedgerOptions = [
    { value: '5645', label: 'Sales 1' },
    { value: '65545', label: 'Sales 2' },
    { value: '2343', label: 'Sales 3' },
  ]

  const itemOptions = [
    { value: '1212', label: 'Item 1' },
    { value: '1313', label: 'Item 2' },
    { value: '1531', label: 'Itemr 3' },
  ]

  const uomOptions = [
    { value: '1212', label: 'Pcs' },
    { value: '1313', label: 'Ltr' },
    { value: '1531', label: 'Kgs' },
  ]

  return (
    <CCard>
      <CCardHeader>Create Invoice</CCardHeader>
      <CCardBody>
        <CForm>
          <div className="mb-3">
            <CFormLabel htmlFor="customerSelect">Customer</CFormLabel>
            <SearchableSelect
              options={customerOptions}
              value={formData.customer}
              onChange={(val) => setFormData({ ...formData, customer: val })}
              placeholder="Search Customer"
            />
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="ledgerSelect">Sales Ledger</CFormLabel>
            <SearchableSelect
              options={salesLedgerOptions}
              value={formData.ledger}
              onChange={(val) => setFormData({ ...formData, ledger: val })}
              placeholder="Search Sales Ledger"
            />
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="remarksInput">Remarks</CFormLabel>
            <CFormInput
              type="text"
              id="remarksInput"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <CCard className="border p-2">
            {/* Header row */}
            <CRow className="fw-bold border-bottom m-0 p-1 align-items-center">
              <CCol md={3} className="border-end p-1">
                Item Name
              </CCol>
              <CCol md={2} className="border-end p-1">
                Qty
              </CCol>
              <CCol md={2} className="border-end p-1">
                UOM
              </CCol>
              <CCol md={2} className="border-end p-1">
                Rate
              </CCol>
              <CCol md={2} className="border-end p-1">
                Amount
              </CCol>
              <CCol md={1} className="p-1 text-center">
                Action
              </CCol>
            </CRow>

            {/* Item rows */}
            {formData.items.map((item, index) => (
              <CRow key={index} className="m-0 p-1 border-bottom align-items-center">
                <CCol md={3} className="border-end p-1">
                  <SearchableSelect
                    options={itemOptions}
                    value={item.itemName}
                    onChange={(val) => handleItemChange(index, 'itemName', val)}
                    placeholder="Select Item"
                  />
                </CCol>
                <CCol md={2} className="border-end p-1">
                  <CFormInput
                    type="number"
                    min={0}
                    size="sm"
                    value={item.qty === 0 ? '' : item.qty} // show empty when qty is 0
                    onChange={(e) => {
                      const val = e.target.value
                      handleItemChange(index, 'qty', val === '' ? '' : parseFloat(val))
                    }}
                  />
                </CCol>
                <CCol md={2} className="border-end p-1">
                  <SearchableSelect
                    options={uomOptions}
                    value={item.uom}
                    onChange={(val) => handleItemChange(index, 'uom', val)}
                    placeholder="Select UOM"
                  />
                </CCol>
                <CCol md={2} className="border-end p-1">
                  <CFormInput
                    type="number"
                    min={0}
                    size="sm"
                    value={item.rate}
                    onChange={(e) =>
                      handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)
                    }
                  />
                </CCol>
                <CCol md={2} className="border-end p-1">
                  <CFormInput
                    value={(item.qty * item.rate).toFixed(2)}
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
                    onClick={() => handleDeleteItem(index)}
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
              <CButton color="secondary" onClick={addItemRow} className="me-2" size="sm">
                <CIcon icon={cilPlus} className="me-1" />
                Add Item
              </CButton>

              <CButton color="dark" onClick={handleSave} size="sm">
                <CIcon icon={cilCheck} className="me-1" />
                Save
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default InvoiceForm
