import { useEffect, useState } from 'react'
import { MapPin, Plus, Edit2, Trash2, Loader2 } from 'lucide-react'
import { PageLoader } from '../components/Loading'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Addresses() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '', number: '', pincode: '', locality: '',
    address: '', city: '', state: '', addressType: 'HOME'
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses')
      setAddresses(response.data.addresses)
    } catch (error) {
      console.error('Error fetching addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', number: '', pincode: '', locality: '', address: '', city: '', state: '', addressType: 'HOME' })
    setShowForm(false)
    setEditingId(null)
  }

  const handleEdit = (addr) => {
    setFormData({
      name: addr.name,
      number: addr.number,
      pincode: addr.pincode,
      locality: addr.locality,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      addressType: addr.addressType || 'HOME'
    })
    setEditingId(addr._id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      if (editingId) {
        const response = await api.put(`/users/addresses/${editingId}`, formData)
        setAddresses(response.data.addresses)
        toast.success('Address updated')
      } else {
        const response = await api.post('/users/addresses', formData)
        setAddresses(response.data.addresses)
        toast.success('Address added')
      }
      resetForm()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    
    try {
      const response = await api.delete(`/users/addresses/${addressId}`)
      setAddresses(response.data.addresses)
      toast.success('Address deleted')
    } catch (error) {
      toast.error('Failed to delete address')
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">My Addresses</h1>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              <Plus className="w-5 h-5" />
              Add Address
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Full Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Phone Number</label>
                  <input type="tel" required value={formData.number} onChange={(e) => setFormData({...formData, number: e.target.value})} className="input" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Address</label>
                <textarea required rows={2} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="input" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Locality</label>
                  <input type="text" required value={formData.locality} onChange={(e) => setFormData({...formData, locality: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Pincode</label>
                  <input type="text" required value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">City</label>
                  <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">State</label>
                  <input type="text" required value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="input" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Address Type</label>
                <div className="flex gap-4">
                  {['HOME', 'WORK', 'OTHER'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="addressType"
                        checked={formData.addressType === type}
                        onChange={() => setFormData({...formData, addressType: type})}
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {editingId ? 'Update Address' : 'Save Address'}
                </button>
                <button type="button" onClick={resetForm} className="btn btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        {addresses.length === 0 && !showForm ? (
          <div className="card p-8 text-center">
            <MapPin className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="font-semibold text-secondary-900 mb-2">No addresses saved</h3>
            <p className="text-secondary-500 mb-4">Add an address to make checkout faster</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              <Plus className="w-5 h-5" /> Add Address
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr._id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-secondary-900">{addr.name}</span>
                      <span className="badge badge-primary text-xs">{addr.addressType}</span>
                    </div>
                    <p className="text-secondary-600 text-sm">
                      {addr.address}, {addr.locality}<br />
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    {addr.number && <p className="text-secondary-500 text-sm mt-1">Phone: {addr.number}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(addr)} className="btn btn-ghost p-2">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(addr._id)} className="btn btn-ghost p-2 text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
