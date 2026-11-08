
import { createContext, useContext, useState } from 'react'
import api from '../api/axiosConfig'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('nestvantage_user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const login = async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    })

    const userData = response.data

    localStorage.setItem('nestvantage_token', userData.token)

    const loggedInUser = {
      userId: userData.userId,
      email: userData.email,
      role: userData.role,
      name: userData.name,
    }

    localStorage.setItem(
      'nestvantage_user',
      JSON.stringify(loggedInUser)
    )

    setUser(loggedInUser)

    return loggedInUser
  }

  const logout = () => {
    localStorage.removeItem('nestvantage_token')
    localStorage.removeItem('nestvantage_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
