import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { PageLoader, EmptyState } from '../components/Loading'
import toast from 'react-hot-toast'

export default function Cart() {
  const { cart, loading, updateQuantity, removeFromCart } = useCart()

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      await updateQuantity(productId, newQuantity)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update quantity')
    }
  }

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId)
      toast.success('Item removed from cart')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove item')
    }
  }

  if (loading) return <PageLoader />

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Looks like you haven't added any items yet"
            action={
              <Link to="/products" className="btn btn-primary">
                Continue Shopping
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  const imageUrl = (img) => img 
    ? `${import.meta.env.VITE_API_URL || ''}/uploads/${img}`
    : '/placeholder.png'

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-8">
          Shopping Cart ({cart.items.length} items)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.product._id} className="card p-4 md:p-6">
                <div className="flex gap-4">
                  <Link 
                    to={`/products/${item.product._id}`}
                    className="w-24 h-24 md:w-32 md:h-32 bg-secondary-100 rounded-lg overflow-hidden flex-shrink-0"
                  >
                    <img
                      src={imageUrl(item.product.images?.[0])}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/placeholder.png' }}
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4">
                      <div>
                        <Link 
                          to={`/products/${item.product._id}`}
                          className="font-semibold text-secondary-900 hover:text-primary-600"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-secondary-500">
                          {item.product.category?.name}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.product._id)}
                        className="text-secondary-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="btn btn-outline p-1.5 disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="btn btn-outline p-1.5 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-lg font-bold text-secondary-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-secondary-600">
                  <span>Subtotal</span>
                  <span>₹{cart.total?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-secondary-600">
                  <span>Shipping</span>
                  <span>{cart.total >= 999 ? 'Free' : '₹99'}</span>
                </div>
                <hr className="border-secondary-200" />
                <div className="flex justify-between text-lg font-bold text-secondary-900">
                  <span>Total</span>
                  <span>₹{(cart.total + (cart.total >= 999 ? 0 : 99)).toLocaleString()}</span>
                </div>
              </div>

              <Link to="/checkout" className="btn btn-primary w-full py-3">
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link to="/products" className="btn btn-ghost w-full mt-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
