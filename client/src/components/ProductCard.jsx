import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const imageUrl = product.images?.[0] 
    ? `${import.meta.env.VITE_API_URL || ''}/uploads/${product.images[0]}`
    : '/placeholder.png'

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return
    }

    try {
      await addToCart(product._id)
      toast.success('Added to cart')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart')
    }
  }

  const handleAddToWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist')
      return
    }

    try {
      await api.post('/wishlist/add', { productId: product._id })
      toast.success('Added to wishlist')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to wishlist')
    }
  }

  return (
    <Link
      to={`/products/${product._id}`}
      className="group card overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square bg-secondary-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = '/placeholder.png'
          }}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleAddToWishlist}
            className="p-2 bg-white rounded-full shadow hover:bg-secondary-50"
          >
            <Heart className="w-5 h-5 text-secondary-600" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="text-xs text-secondary-500 mb-1">
          {product.category?.name || 'Uncategorized'}
        </div>
        <h3 className="font-semibold text-secondary-900 mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-secondary-500 line-clamp-2 mb-3">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-secondary-900">
            ₹{product.price?.toLocaleString()}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn btn-primary py-2 px-3 text-sm disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}
