import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Package, MapPin, CreditCard, Truck, X } from 'lucide-react'
import { PageLoader } from '../components/Loading'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`)
        setOrder(response.data.order)
      } catch (error) {
        console.error('Error fetching order:', error)
        toast.error('Order not found')
        navigate('/orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId, navigate])

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    
    setCancelling(true)
    try {
      const response = await api.put(`/orders/${orderId}/cancel`)
      setOrder(response.data.order)
      toast.success('Order cancelled successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Delivered': return 'badge-success'
      case 'Order Shipped': return 'badge-primary'
      case 'Order Confirmed': return 'badge-primary'
      case 'canceled': return 'badge-danger'
      default: return 'badge-warning'
    }
  }

  if (loading) return <PageLoader />
  if (!order) return null

  const imageUrl = (img) => img 
    ? `${import.meta.env.VITE_API_URL || ''}/uploads/${img}`
    : '/placeholder.png'

  const canCancel = ['Pending', 'Order Confirmed'].includes(order.status)

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Orders
        </button>

        {/* Order Header */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-6 h-6 text-primary-600" />
                <h1 className="text-xl font-bold text-secondary-900">Order #{order.orderId}</h1>
                <span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span>
              </div>
              <p className="text-secondary-500">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
            
            {canCancel && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="btn btn-danger"
              >
                <X className="w-4 h-4" />
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Delivery Address */}
          <div className="card p-6">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary-600" />
              Delivery Address
            </h2>
            <div className="text-secondary-700">
              <p className="font-medium">{order.address?.name}</p>
              <p className="text-sm mt-1">
                {order.address?.address}, {order.address?.locality}<br />
                {order.address?.city}, {order.address?.state} - {order.address?.pincode}
              </p>
              {order.address?.phoneNumber && (
                <p className="text-sm mt-2">Phone: {order.address.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="card p-6">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary-600" />
              Payment Information
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-600">Payment Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Payment Status</span>
                <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Total Amount</span>
                <span className="font-bold text-lg">₹{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Date */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-primary-600" />
            <div>
              <span className="text-secondary-600">Expected Delivery: </span>
              <span className="font-medium">
                {new Date(order.deliveryDate).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Order Items ({order.products.length})</h2>
          <div className="divide-y divide-secondary-200">
            {order.products.map((item) => (
              <div key={item._id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex gap-4">
                  <Link
                    to={`/products/${item.product?._id}`}
                    className="w-20 h-20 bg-secondary-100 rounded-lg overflow-hidden flex-shrink-0"
                  >
                    <img
                      src={imageUrl(item.product?.images?.[0])}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/placeholder.png' }}
                    />
                  </Link>
                  <div className="flex-1">
                    <Link
                      to={`/products/${item.product?._id}`}
                      className="font-medium text-secondary-900 hover:text-primary-600"
                    >
                      {item.product?.name}
                    </Link>
                    <div className="text-sm text-secondary-500 mt-1">
                      Qty: {item.quantity} x ₹{item.price?.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`badge ${getStatusColor(item.status)}`}>{item.status}</span>
                      <span className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
