import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, X, ChevronDown } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { PageLoader, EmptyState } from '../components/Loading'
import api from '../services/api'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [showFilters, setShowFilters] = useState(false)

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const brand = searchParams.get('brand') || ''
  const sort = searchParams.get('sort') || '-createdAt'
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (category) params.set('category', category)
        if (brand) params.set('brand', brand)
        params.set('sort', sort)
        params.set('page', page.toString())

        const response = await api.get(`/products?${params.toString()}`)
        setProducts(response.data.products)
        setPagination(response.data.pagination)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [search, category, brand, sort, page])

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/products/meta/categories'),
          api.get('/products/meta/brands')
        ])
        setCategories(catRes.data.categories)
        setBrands(brandRes.data.brands)
      } catch (error) {
        console.error('Error fetching filters:', error)
      }
    }
    fetchFilters()
  }, [])

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const hasFilters = category || brand || search

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">
              {search ? `Search results for "${search}"` : 'All Products'}
            </h1>
            <p className="text-secondary-500 mt-1">
              {pagination.total} product{pagination.total !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline md:hidden"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="input pr-10 min-w-[180px]"
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={`
            fixed inset-0 z-50 bg-white md:relative md:inset-auto md:z-auto md:bg-transparent
            md:block md:w-64 md:flex-shrink-0
            ${showFilters ? 'block' : 'hidden'}
          `}>
            <div className="h-full overflow-y-auto p-6 md:p-0">
              <div className="flex items-center justify-between md:hidden mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4"
                >
                  Clear all filters
                </button>
              )}

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold text-secondary-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={category === cat.name}
                        onChange={() => updateFilter('category', category === cat.name ? '' : cat.name)}
                        className="text-primary-600"
                      />
                      <span className="text-secondary-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6">
                <h3 className="font-semibold text-secondary-900 mb-3">Brands</h3>
                <div className="space-y-2">
                  {brands.map((b) => (
                    <label key={b._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="brand"
                        checked={brand === b.name}
                        onChange={() => updateFilter('brand', brand === b.name ? '' : b.name)}
                        className="text-primary-600"
                      />
                      <span className="text-secondary-700">{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowFilters(false)}
                className="btn btn-primary w-full md:hidden"
              >
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <PageLoader />
            ) : products.length === 0 ? (
              <EmptyState
                title="No products found"
                description={hasFilters ? "Try adjusting your filters" : "Check back later for new products"}
                action={hasFilters && (
                  <button onClick={clearFilters} className="btn btn-primary">
                    Clear Filters
                  </button>
                )}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => updateFilter('page', p.toString())}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
