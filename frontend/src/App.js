import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import axios from 'axios'
import Header from './components/Header'
import Welcome from './components/Welcome'
import Login from './components/Login'
import Register from './components/Register'
import VerifyEmail from './components/VerifyEmail'
import TermsAndConditions from './components/TermsAndConditions'

function App() {
  const [user, setUser] = useState(null)

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:5050/profile', {
        withCredentials: true, // Включаем отправку cookies
      })
      setUser(response.data.user.email) // Устанавливаем пользователя
    } catch (err) {
      //TODO добавить обработчкик 401
      setUser(null) // Если нет сессии — user = null
    }
  }

  useEffect(() => {
    fetchUser() // Загружаем пользователя при запуске приложения
  }, [])

  const handleLogout = async () => {
    await axios.post(
      'http://localhost:5050/logout',
      {},
      { withCredentials: true }
    )
    setUser(null)
    toast.info('Logged out')
  }

  return (
    <Router>
      <Header user={user} logout={handleLogout} />
      <Routes>
        <Route path="/" element={<Welcome user={user} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login fetchUser={fetchUser} />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      </Routes>
      <ToastContainer position="top-center" />
    </Router>
  )
}

export default App
