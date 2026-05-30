import { useLocation, Link, Navigate } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'

export default function OrderConfirm() {
  const location = useLocation()
  const order = location.state?.order

  if (!order) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="card p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-secondary-600 mb-6">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          <div className="bg-secondary-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-secondary-700 mb-2">
              <Package className="w-5 h-5" />
              <span className="font-semibold">Order #{order.orderId}</span>
            </div>
            <p className="text-secondary-500 text-sm">
              We&apos;ll send you a confirmation email with order details
            </p>
          </div>

          <div className="border-t border-secondary-200 pt-6 mb-6">
            <h2 className="font-semibold text-secondary-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-600">Total Amount</span>
                <span className="font-semibold">₹{order.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Payment Method</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Payment Status</span>
                <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Items</span>
                <span>{order.products?.length} item(s)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/orders/${order._id}`} className="btn btn-primary">
              View Order Details
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/products" className="btn btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
