import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, CreditCard, Truck, Tag, Plus, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { PageLoader } from '../components/Loading'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Checkout() {
  const navigate = useNavigate()
  const { cart, refreshCart } = useCart()
  const [addresses, setAddresses] = useState([])
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    name: '', number: '', pincode: '', locality: '', 
    address: '', city: '', state: '', addressType: 'HOME'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [addressRes, couponRes] = await Promise.all([
          api.get('/users/addresses'),
          api.get('/orders/coupons').catch(() => ({ data: { coupons: [] } }))
        ])
        setAddresses(addressRes.data.addresses)
        setCoupons(couponRes.data.coupons || [])
        if (addressRes.data.addresses.length > 0) {
          setSelectedAddress(addressRes.data.addresses[0]._id)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const subtotal = cart.total || 0
  const shipping = subtotal >= 999 ? 0 : 99
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0
  const total = Math.max(0, subtotal + shipping - discount)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    
    try {
      const response = await api.post('/orders/apply-coupon', {
        couponCode: couponCode.trim(),
        totalAmount: subtotal
      })
      setAppliedCoupon(response.data.coupon)
      toast.success('Coupon applied successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon')
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/users/addresses', newAddress)
      setAddresses(response.data.addresses)
      setSelectedAddress(response.data.addresses[response.data.addresses.length - 1]._id)
      setShowAddAddress(false)
      setNewAddress({ name: '', number: '', pincode: '', locality: '', address: '', city: '', state: '', addressType: 'HOME' })
      toast.success('Address added')
    } catch (error) {
      toast.error('Failed to add address')
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address')
      return
    }

    setProcessing(true)
    try {
      const orderData = {
        addressId: selectedAddress,
        paymentMethod,
        couponCode: appliedCoupon?.code
      }

      if (paymentMethod === 'Razor Pay') {
        // Get Razorpay key and create order
        const keyRes = await api.get('/payment/razorpay-key')
        const orderRes = await api.post('/orders/place', orderData)
        const paymentOrderRes = await api.post('/payment/create-order', {
          amount: total,
          orderId: orderRes.data.order._id
        })

        const options = {
          key: keyRes.data.key,
          amount: paymentOrderRes.data.order.amount,
          currency: 'INR',
          name: 'Verve',
          description: 'Order Payment',
          order_id: paymentOrderRes.data.order.id,
          handler: async (response) => {
            try {
              await api.post('/payment/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderRes.data.order._id
              })
              await refreshCart()
              navigate('/order-confirm', { state: { order: orderRes.data.order } })
            } catch (error) {
              toast.error('Payment verification failed')
            }
          },
          prefill: {
            name: addresses.find(a => a._id === selectedAddress)?.name,
          },
          theme: { color: '#0ea5e9' }
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
      } else {
        const response = await api.post('/orders/place', orderData)
        await refreshCart()
        navigate('/order-confirm', { state: { order: response.data.order } })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  Delivery Address
                </h2>
                <button onClick={() => setShowAddAddress(true)} className="btn btn-ghost text-sm">
                  <Plus className="w-4 h-4" /> Add New
                </button>
              </div>

              {addresses.length === 0 ? (
                <p className="text-secondary-500">No addresses saved. Add one to continue.</p>
              ) : (
                <div className="grid gap-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddress === addr._id 
                          ? 'border-primary-600 bg-primary-50' 
                          : 'border-secondary-200 hover:border-secondary-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress === addr._id}
                          onChange={() => setSelectedAddress(addr._id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{addr.name}</span>
                            <span className="badge badge-primary text-xs">{addr.addressType}</span>
                          </div>
                          <p className="text-sm text-secondary-600">
                            {addr.address}, {addr.locality}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          {addr.number && <p className="text-sm text-secondary-500 mt-1">Phone: {addr.number}</p>}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Add Address Form */}
              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="mt-4 p-4 border border-secondary-200 rounded-lg">
                  <h3 className="font-medium mb-3">Add New Address</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Full Name" required value={newAddress.name} onChange={(e) => setNewAddress({...newAddress, name: e.target.value})} className="input" />
                    <input type="text" placeholder="Phone Number" required value={newAddress.number} onChange={(e) => setNewAddress({...newAddress, number: e.target.value})} className="input" />
                    <input type="text" placeholder="Pincode" required value={newAddress.pincode} onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})} className="input" />
                    <input type="text" placeholder="Locality" required value={newAddress.locality} onChange={(e) => setNewAddress({...newAddress, locality: e.target.value})} className="input" />
                    <input type="text" placeholder="Address" required value={newAddress.address} onChange={(e) => setNewAddress({...newAddress, address: e.target.value})} className="input col-span-2" />
                    <input type="text" placeholder="City" required value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="input" />
                    <input type="text" placeholder="State" required value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} className="input" />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button type="submit" className="btn btn-primary">Save Address</button>
                    <button type="button" onClick={() => setShowAddAddress(false)} className="btn btn-ghost">Cancel</button>
                  </div>
                </form>
              )}
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary-600" />
                Payment Method
              </h2>
              <div className="space-y-3">
                {['Cash on Delivery', 'Razor Pay'].map((method) => (
                  <label
                    key={method}
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${
                      paymentMethod === method ? 'border-primary-600 bg-primary-50' : 'border-secondary-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    <div className="flex items-center gap-2">
                      {method === 'Cash on Delivery' ? <Truck className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                      <span className="font-medium">{method}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {cart.items?.map((item) => (
                  <div key={item.product._id} className="flex justify-between text-sm">
                    <span className="text-secondary-600">{item.product.name} x {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="input text-sm"
                    disabled={!!appliedCoupon}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={!!appliedCoupon}
                    className="btn btn-outline text-sm"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
                    <Check className="w-4 h-4" />
                    Coupon applied: -{appliedCoupon.discountAmount}
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-6 border-t border-secondary-200 pt-4">
                <div className="flex justify-between text-secondary-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-secondary-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={processing || !selectedAddress}
                className="btn btn-primary w-full py-3 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
