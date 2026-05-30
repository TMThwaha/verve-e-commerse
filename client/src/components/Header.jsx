import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, User, Menu, X, Search, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, isAuthenticated, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="bg-white border-b border-secondary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-600">Verve</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            </div>
          </form>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-secondary-600 hover:text-secondary-900 font-medium">
              Products
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/wishlist" className="text-secondary-600 hover:text-secondary-900">
                  <Heart className="w-6 h-6" />
                </Link>
                <Link to="/cart" className="relative text-secondary-600 hover:text-secondary-900">
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900">
                    <User className="w-6 h-6" />
                    <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-secondary-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link to="/profile" className="block px-4 py-2 text-secondary-700 hover:bg-secondary-50">
                        Profile
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-secondary-700 hover:bg-secondary-50">
                        Orders
                      </Link>
                      <Link to="/addresses" className="block px-4 py-2 text-secondary-700 hover:bg-secondary-50">
                        Addresses
                      </Link>
                      <hr className="my-2 border-secondary-200" />
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-secondary-600 hover:text-secondary-900 font-medium">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              </div>
            </form>
            
            <nav className="flex flex-col gap-4">
              <Link to="/products" className="text-secondary-600 hover:text-secondary-900 font-medium" onClick={() => setIsMenuOpen(false)}>
                Products
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/cart" className="text-secondary-600 hover:text-secondary-900 font-medium flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                    <ShoppingCart className="w-5 h-5" />
                    Cart ({cartCount})
                  </Link>
                  <Link to="/wishlist" className="text-secondary-600 hover:text-secondary-900 font-medium flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                    <Heart className="w-5 h-5" />
                    Wishlist
                  </Link>
                  <Link to="/profile" className="text-secondary-600 hover:text-secondary-900 font-medium" onClick={() => setIsMenuOpen(false)}>
                    Profile
                  </Link>
                  <Link to="/orders" className="text-secondary-600 hover:text-secondary-900 font-medium" onClick={() => setIsMenuOpen(false)}>
                    Orders
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="text-red-600 hover:text-red-700 font-medium text-left flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" className="btn btn-secondary" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/signup" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
