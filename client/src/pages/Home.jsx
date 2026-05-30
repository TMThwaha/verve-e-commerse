import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RefreshCcw, Headphones } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { PageLoader } from '../components/Loading'
import api from '../services/api'

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products/featured/latest'),
          api.get('/products/meta/categories')
        ])
        setProducts(productsRes.data.products)
        setCategories(categoriesRes.data.categories)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <PageLoader />

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Discover Premium Products at Great Prices
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8">
              Shop the latest trends with free shipping on orders over ₹999. Quality guaranteed.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn bg-white text-primary-700 hover:bg-primary-50 px-6 py-3">
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/products" className="btn border-2 border-white text-white hover:bg-white/10 px-6 py-3">
                View Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹999' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
              { icon: RefreshCcw, title: 'Easy Returns', desc: '7-day return policy' },
              { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support' }
            ].map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center p-4">
                <feature.icon className="w-10 h-10 text-primary-600 mb-3" />
                <h3 className="font-semibold text-secondary-900">{feature.title}</h3>
                <p className="text-sm text-secondary-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-secondary-900">
                Shop by Category
              </h2>
              <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category.name}`}
                  className="group relative overflow-hidden rounded-xl bg-secondary-100 aspect-square"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-semibold text-white">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900">
              Latest Products
            </h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-secondary-300 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers and discover amazing products at unbeatable prices.
          </p>
          <Link to="/signup" className="btn bg-primary-600 hover:bg-primary-700 text-white px-8 py-3">
            Create Account
          </Link>
        </div>
      </section>
    </div>
  )
}
