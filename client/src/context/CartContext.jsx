import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    } else {
      setCart({ items: [], total: 0 })
    }
  }, [isAuthenticated])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await api.get('/cart')
      setCart(response.data.cart)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    const response = await api.post('/cart/add', { productId, quantity })
    setCart(response.data.cart)
    return response.data
  }

  const updateQuantity = async (productId, quantity) => {
    const response = await api.put(`/cart/update/${productId}`, { quantity })
    setCart(response.data.cart)
    return response.data
  }

  const removeFromCart = async (productId) => {
    const response = await api.delete(`/cart/remove/${productId}`)
    setCart(response.data.cart)
    return response.data
  }

  const clearCart = async () => {
    await api.delete('/cart/clear')
    setCart({ items: [], total: 0 })
  }

  const getCartCount = useCallback(() => {
    return cart.items?.length || 0
  }, [cart.items])

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
    cartCount: getCartCount()
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
