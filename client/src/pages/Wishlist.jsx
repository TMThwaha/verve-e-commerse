import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingCart } from 'lucide-react'
import { PageLoader, EmptyState } from '../components/Loading'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Wishlist() {
  const [wishlist, setWishlist] = useState({ products: [] })
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await api.get('/wishlist')
        setWishlist(response.data.wishlist)
      } catch (error) {
        console.error('Error fetching wishlist:', error)
      } finally {
        setLoading(false)
      }
    }
    if (isAuthenticated) fetchWishlist()
  }, [isAuthenticated])

  const handleRemove = async (productId) => {
    try {
      const response = await api.delete(`/wishlist/remove/${productId}`)
      setWishlist(response.data.wishlist)
      toast.success('Removed from wishlist')
    } catch (error) {
      toast.error('Failed to remove item')
    }
  }

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId)
      await handleRemove(productId)
      toast.success('Added to cart')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart')
    }
  }

  if (loading) return <PageLoader />

  if (!wishlist.products || wishlist.products.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save items you love to your wishlist"
            action={
              <Link to="/products" className="btn btn-primary">
                Explore Products
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
          My Wishlist ({wishlist.products.length} items)
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {wishlist.products.map((product) => (
            <div key={product._id} className="card overflow-hidden">
              <Link
                to={`/products/${product._id}`}
                className="block aspect-square bg-secondary-100"
              >
                <img
                  src={imageUrl(product.images?.[0])}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.src = '/placeholder.png' }}
                />
              </Link>

              <div className="p-4">
                <Link
                  to={`/products/${product._id}`}
                  className="font-semibold text-secondary-900 hover:text-primary-600 line-clamp-1"
                >
                  {product.name}
                </Link>
                <p className="text-sm text-secondary-500 mb-2">{product.category?.name}</p>
                <p className="font-bold text-lg text-secondary-900 mb-3">
                  ₹{product.price?.toLocaleString()}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    disabled={product.stock === 0}
                    className="btn btn-primary flex-1 py-2 text-sm disabled:opacity-50"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="btn btn-outline p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
