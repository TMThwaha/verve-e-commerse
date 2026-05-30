import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight, Calendar } from 'lucide-react'
import { PageLoader, EmptyState } from '../components/Loading'
import api from '../services/api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1 })

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get(`/orders?page=${pagination.page}`)
        setOrders(response.data.orders)
        setPagination(response.data.pagination)
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [pagination.page])

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

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="You haven't placed any orders yet"
            action={
              <Link to="/products" className="btn btn-primary">
                Start Shopping
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="card p-4 md:p-6 block hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-secondary-900">Order #{order.orderId}</span>
                    <span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-secondary-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span>{order.products.length} item(s)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4">
                  <span className="font-bold text-lg text-secondary-900">
                    ₹{order.totalAmount?.toLocaleString()}
                  </span>
                  <ChevronRight className="w-5 h-5 text-secondary-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPagination(prev => ({ ...prev, page: p }))}
                className={`w-10 h-10 rounded-lg font-medium ${
                  p === pagination.page
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-secondary-300 hover:bg-secondary-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
