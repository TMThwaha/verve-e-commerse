import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, Minus, Plus, ArrowLeft, Check } from 'lucide-react'
import { PageLoader } from '../components/Loading'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [inWishlist, setInWishlist] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`)
        setProduct(response.data.product)
        
        if (isAuthenticated) {
          const wishlistRes = await api.get(`/wishlist/check/${id}`)
          setInWishlist(wishlistRes.data.inWishlist)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        toast.error('Product not found')
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id, isAuthenticated, navigate])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      navigate('/login')
      return
    }

    try {
      await addToCart(product._id, quantity)
      toast.success('Added to cart')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart')
    }
  }

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist')
      navigate('/login')
      return
    }

    try {
      if (inWishlist) {
        await api.delete(`/wishlist/remove/${product._id}`)
        setInWishlist(false)
        toast.success('Removed from wishlist')
      } else {
        await api.post('/wishlist/add', { productId: product._id })
        setInWishlist(true)
        toast.success('Added to wishlist')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist')
    }
  }

  if (loading) return <PageLoader />
  if (!product) return null

  const imageUrl = (img) => img 
    ? `${import.meta.env.VITE_API_URL || ''}/uploads/${img}`
    : '/placeholder.png'

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-secondary-100 rounded-xl overflow-hidden mb-4">
              <img
                src={imageUrl(product.images?.[selectedImage])}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/placeholder.png' }}
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary-600' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={imageUrl(img)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/placeholder.png' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="mb-4">
              <span className="badge badge-primary">{product.category?.name}</span>
              {product.brand?.name && (
                <span className="text-secondary-500 text-sm ml-2">by {product.brand.name}</span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-secondary-900 mb-4">{product.name}</h1>
            
            <p className="text-secondary-600 mb-6">{product.description}</p>

            <div className="text-3xl font-bold text-secondary-900 mb-6">
              ₹{product.price?.toLocaleString()}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span>In Stock ({product.stock} available)</span>
                </div>
              ) : (
                <div className="text-red-600 font-medium">Out of Stock</div>
              )}
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="btn btn-outline p-2"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="btn btn-outline p-2"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn btn-primary flex-1 py-3"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`btn p-3 ${inWishlist ? 'bg-red-50 text-red-600 border-red-200' : 'btn-outline'}`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
