import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/Loading'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setTokensFromCallback } = useAuth()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')
    const error = searchParams.get('error')

    if (error) {
      navigate('/login?error=' + error)
      return
    }

    if (accessToken && refreshToken) {
      setTokensFromCallback(accessToken, refreshToken)
      navigate('/')
    } else {
      navigate('/login')
    }
  }, [searchParams, setTokensFromCallback, navigate])

  return <PageLoader />
}
