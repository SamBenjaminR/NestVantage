
import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Phone,
  Eye,
  Copy,
  X,
  Plus,
} from 'lucide-react'
import {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
} from '../services/leadService'

const emptyForm = {
  leadCode: '',
  buyerName: '',
  phone: '',
  source: 'Website',
  projectName: 'Project 1',
  bhkType: '2 BHK',
  budget: '',
}

function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedLead, setSelectedLead] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')
  const [editingLead, setEditingLead] = useState(null)
  const [editFormData, setEditFormData] = useState(emptyForm)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')


  async function fetchLeads() {
  try {
    setLoading(true)
    setError('')

    const data = await getAllLeads()

    const formattedLeads = data.map((lead) => ({
      databaseId: lead.id,
      id: lead.leadCode,
      name: lead.buyerName,
      phone: lead.phone || '',
      source: lead.source || '',
      project: lead.projectName || '',
      configuration: lead.bhkType || '',
      budget: lead.budget || '',
      status: lead.status || 'New Lead',
    }))

    setLeads(formattedLeads)
  } catch (err) {
    console.error('Failed to fetch leads:', err)
    setError('Unable to load leads. Please check the backend connection.')
  } finally {
    setLoading(false)
  }
}

  async function handleViewLead(databaseId) {
  try {
    setDetailsLoading(true)
    setDetailsError('')
    setSelectedLead(null)

    const data = await getLeadById(databaseId)

    setSelectedLead(data)
  } catch (err) {
    console.error('Failed to fetch lead details:', err)
    setDetailsError('Unable to load lead details. Please try again.')
  } finally {
    setDetailsLoading(false)
  }
}

function handleEditLead(lead) {
  setEditingLead({
    ...lead,
    databaseId: lead.id,
  })

  setEditFormData({
    leadCode: lead.leadCode || '',
    buyerName: lead.buyerName || '',
    phone: lead.phone || '',
    source: lead.source || 'Website',
    projectName: lead.projectName || 'Project1',
    bhkType: lead.bhkType || '2 BHK',
    budget: lead.budget || '',
  })

  setSelectedLead(null)
}

async function handleUpdateLead(event) {
  event.preventDefault()


  try {
    setEditSaving(true)
    setEditError('')
  
    await updateLead(editingLead.databaseId, editFormData)

    await fetchLeads()

    const updatedLead = await getLeadById(editingLead.databaseId)
    setSelectedLead(updatedLead)
    setEditingLead(null)
  } catch (err) {
    console.error('Failed to update lead:', err)
    setEditError(
      err.response?.data?.error ||
      'Unable to update lead. Please try again.'
    )
  } finally {
    setEditSaving(false)
  }
}

  useEffect(() => {
    fetchLeads()
  }, [])

  const duplicateIds = useMemo(() => {
    const phoneCounts = {}

    leads.forEach((lead) => {
      if (!lead.phone) return
      const phone = lead.phone.replace(/\D/g, '').slice(-10)
      if (phone) phoneCounts[phone] = (phoneCounts[phone] || 0) + 1
    })

    return new Set(
      leads
        .filter((lead) => {
          if (!lead.phone) return false
          const phone = lead.phone.replace(/\D/g, '').slice(-10)
          return phoneCounts[phone] > 1
        })
        .map((lead) => lead.id)
    )
  }, [leads])

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const search = searchTerm.toLowerCase()

      const matchesSearch =
        lead.name.toLowerCase().includes(search) ||
        lead.id.toLowerCase().includes(search) ||
        lead.phone.includes(search)

      const matchesSource =
        sourceFilter === 'All' || lead.source === sourceFilter

      const matchesStatus =
        statusFilter === 'All' || lead.status === statusFilter

      return matchesSearch && matchesSource && matchesStatus
    })
  }, [leads, searchTerm, sourceFilter, statusFilter])

  const newLeads = leads.filter(
    (lead) => lead.status === 'New Lead'
  ).length

  const duplicateCount = duplicateIds.size

  function clearFilters() {
    setSearchTerm('')
    setSourceFilter('All')
    setStatusFilter('All')
  }

  function handleInputChange(event) {
    const { name, value } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleAddLead(event) {
    event.preventDefault()
    setFormError('')
    setSuccessMessage('')

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setFormError('Enter a valid 10-digit phone number.')
      return
    }

    try {
      setSaving(true)

      await createLead({
        ...formData,
        budget: formData.budget.trim() || null,
      })

      setFormData(emptyForm)
      setShowAddForm(false)
      setSuccessMessage('Lead added successfully.')

      await fetchLeads()
    } catch (err) {
    console.error('Failed to create lead:', err)

    if (err.response?.status === 409) {
      setFormError(
        err.response?.data?.error ||
        'This lead already exists.')

    } else if (err.response?.status === 400) {
      setFormError('Please check the information entered and try again.')
    } else {
      setFormError('Unable to add lead. Please check the backend connection.')
    }
  } finally {
      setSaving(false)
    }
  }

  return (
    
    <main className="min-w-0 flex-1 bg-slate-50 p-8">
      {/* Edit Lead Form */}
{editingLead && (
  <div className="mb-6 rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
    <div className="mb-5 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Edit Lead
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Update the buyer's information.
        </p>
      </div>

      <button
        onClick={() => {
          setEditingLead(null)
          setEditError('')
        }}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        aria-label="Close edit form"
      >
        <X size={20} />
      </button>
    </div>

    <form onSubmit={handleUpdateLead}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Lead Code
          </label>
          <input
            type="text"
            value={editFormData.leadCode}
            onChange={(e) => setEditFormData({
              ...editFormData,
              leadCode: e.target.value
            })}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Buyer Name
          </label>
          <input
            type="text"
            value={editFormData.buyerName}
            onChange={(e) => setEditFormData({
              ...editFormData,
              buyerName: e.target.value
            })}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Phone Number
          </label>
          <input
            type="text"
            value={editFormData.phone}
            onChange={(e) => setEditFormData({
              ...editFormData,
              phone: e.target.value
            })}
            pattern="[0-9]{10}"
            maxLength={10}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Lead Source
          </label>
          <select
            value={editFormData.source}
            onChange={(e) => setEditFormData({
              ...editFormData,
              source: e.target.value
            })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="Website">Website</option>
            <option value="Property Portal">Property Portal</option>
            <option value="Social Media">Social Media</option>
            <option value="Hoarding Call">Hoarding Call</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Project
          </label>
          <select
            value={editFormData.projectName}
            onChange={(e) => setEditFormData({
              ...editFormData,
              projectName: e.target.value
            })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="Project 1">Project 1</option>
            <option value="Project 2">Project 2</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Configuration
          </label>
          <select
            value={editFormData.bhkType}
            onChange={(e) => setEditFormData({
              ...editFormData,
              bhkType: e.target.value
            })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="2 BHK">2 BHK</option>
            <option value="3 BHK">3 BHK</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Budget
          </label>
          <input
            type="text"
            value={editFormData.budget}
            onChange={(e) => setEditFormData({
              ...editFormData,
              budget: e.target.value
            })}
            placeholder="e.g. 65L - 80L"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

      </div>

      {editError && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {editError}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setEditingLead(null)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={editSaving}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {editSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  </div>
)}
      
{/* Lead Details Panel */}
{(detailsLoading || detailsError || selectedLead) && (
  <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">

    {/* <div className="mb-5 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Lead Details
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Complete information retrieved from the database.
        </p>
      </div> */}
      <div className="mb-5 flex items-center justify-between">
  <div>
    <h2 className="text-lg font-semibold text-slate-900">Lead Details</h2>
    <p className="mt-1 text-sm text-slate-500">
      Complete information retrieved from the database.
    </p>
  </div>

  <div className="flex items-center gap-2">
    {selectedLead && (
      <button
        onClick={() => handleEditLead(selectedLead)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Edit Lead
      </button>
    )}
</div>

      <button
        onClick={() => {
          setSelectedLead(null)
          setDetailsError('')
        }}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        aria-label="Close lead details"
      >
        <X size={20} />
      </button>
    </div>

    {detailsLoading && (
      <p className="text-sm text-blue-600">
        Loading lead details...
      </p>
    )}

    {detailsError && (
      <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
        {detailsError}
      </p>
    )}

    {selectedLead && (
      <>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {selectedLead.buyerName}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {selectedLead.leadCode}
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
            {selectedLead.status}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Phone Number</p>
            <p className="mt-2 font-medium text-slate-900">
              {selectedLead.phone || 'Not provided'}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Lead Source</p>
            <p className="mt-2 font-medium text-slate-900">
              {selectedLead.source || 'Not provided'}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Project</p>
            <p className="mt-2 font-medium text-slate-900">
              {selectedLead.projectName || 'Not provided'}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Configuration</p>
            <p className="mt-2 font-medium text-slate-900">
              {selectedLead.bhkType || 'Not provided'}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Budget</p>
            <p className="mt-2 font-medium text-slate-900">
              {selectedLead.budget || 'Not provided'}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Created At</p>
            <p className="mt-2 font-medium text-slate-900">
              {selectedLead.createdAt
                ? new Date(selectedLead.createdAt).toLocaleString()
                : 'Not available'}
            </p>
          </div>

        </div>
      </>
    )}
  </div>
)}


      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lead Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and track all your property enquiries.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddForm(true)
            setFormError('')
            setSuccessMessage('')
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add New Lead
        </button>
      </div>

      {successMessage && (
        <div className="mb-5 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {showAddForm && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Add New Lead
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the buyer's enquiry details.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAddForm(false)
                setFormError('')
              }}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close form"
            >
              <X size={20} />
            </button>
          </div>

          {formError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleAddLead}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Lead Code *
                </label>
                <input
                  name="leadCode"
                  value={formData.leadCode}
                  onChange={handleInputChange}
                  placeholder="Example: LD-58225"
                  maxLength={50}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Buyer Name *
                </label>
                <input
                  name="buyerName"
                  value={formData.buyerName}
                  onChange={handleInputChange}
                  placeholder="Enter buyer name"
                  maxLength={100}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Phone Number *
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit phone number"
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Lead Source *
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                >
                  <option>Website</option>
                  <option>Property Portal</option>
                  <option>Social Media</option>
                  <option>Hoarding Call</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Project *
                </label>
                <select
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                >
                  <option>Project 1</option>
                  <option>Project 2</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Configuration *
                </label>
                <select
                  name="bhkType"
                  value={formData.bhkType}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                >
                  <option>2 BHK</option>
                  <option>3 BHK</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Budget (Optional)
                </label>
                <input
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="Example: 65L - 80L"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setFormError('')
                }}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Lead'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Leads</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">{leads.length}</h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">New Leads</p>
          <h2 className="mt-2 text-2xl font-bold text-blue-600">{newLeads}</h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Duplicate Records</p>
          <h2 className="mt-2 text-2xl font-bold text-orange-600">{duplicateCount}</h2>
        </div>
      </div>

      {loading && (
        <div className="mb-5 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          Loading leads from the database...
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
          <Search size={18} className="shrink-0 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search name or lead ID..."
            className="w-full text-sm outline-none"
          />
        </div>

        <select
          value={sourceFilter}
          onChange={(event) => setSourceFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none"
        >
          <option value="All">All Sources</option>
          <option value="Property Portal">Property Portal</option>
          <option value="Social Media">Social Media</option>
          <option value="Hoarding Call">Hoarding Call</option>
          <option value="Website">Website</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="New Lead">New Lead</option>
          <option value="Visit Booked">Visit Booked</option>
          <option value="Visited">Visited</option>
        </select>

        <button
          onClick={clearFilters}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
        >
          <X size={15} /> Clear
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {filteredLeads.length} of {leads.length} records
        </p>
        <p className="flex items-center gap-1 text-xs text-orange-600">
          <Copy size={13} /> {duplicateCount} records flagged as duplicates
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900">All Leads</h2>
          <p className="mt-1 text-xs text-slate-500">
            Records retrieved from the NestVantage database.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Lead Details</th>
                <th className="px-5 py-4">Source</th>
                <th className="px-5 py-4">Requirement</th>
                <th className="px-5 py-4">Budget</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Duplicate Check</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredLeads.map((lead) => {
                const isDuplicate = duplicateIds.has(lead.id)

                return (
                  <tr key={lead.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{lead.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{lead.id}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <Phone size={12} /> {lead.phone || 'Not provided'}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">{lead.source}</td>

                    <td className="px-5 py-4 text-slate-600">
                      {lead.configuration}
                      <p className="mt-1 text-xs text-slate-400">{lead.project}</p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">{lead.budget}</td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {lead.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {isDuplicate ? (
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                          Duplicate
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Not detected</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <button
                       title="View lead"
                       onClick={() => handleViewLead(lead.databaseId)}
                       className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })}

              {!loading && !error && filteredLeads.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-sm text-slate-500">
                    No leads found. Try changing your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export default Leads
