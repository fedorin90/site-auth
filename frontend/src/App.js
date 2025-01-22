import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Header from './components/Header'
import Welcome from './components/Welcome'
import Login from './components/Login'
import Register from './components/Register'
import VerifyEmail from './components/VerifyEmail'
import TermsAndConditions from './components/TermsAndConditions'

const getAuthorizedUser = () => {
  const token = localStorage.getItem('access_token')
  if (token) {
    try {
      const user = jwtDecode(token) // Декодируем токен
      return user.sub.email
    } catch (error) {
      console.error('Error decoding token:', error.message)
    }
  }
  return null // Возвращаем null, если токен отсутствует или некорректен
}

function App() {
  const [user, setUser] = useState(null)

  const setAuthorizedUser = () => {
    const currentUser = getAuthorizedUser()
    setUser(currentUser)
  }

  useEffect(() => {
    const currentUser = getAuthorizedUser()
    setUser(currentUser)
  }, []) // Только при первом рендере

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
  }

  return (
    <Router>
      <Header user={user} logout={handleLogout} />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setUser={setAuthorizedUser} />} />
        <Route path="/verify/:userId" element={<VerifyEmail />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      </Routes>
    </Router>
  )
}

export default App
