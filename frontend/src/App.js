import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import axios from 'axios'
import Header from './components/Header'
import Welcome from './components/Welcome'
import Profile from './components/Profile'
import Login from './components/Login'
import Register from './components/Register'
import VerifyEmail from './components/VerifyEmail'
import TermsAndConditions from './components/TermsAndConditions'

function App() {
  const defaultUser = {
    name: '',
    email: '',
    photo: '',
    isDefault: true,
  }
  const [user, setUser] = useState(defaultUser)

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:5050/profile', {
        withCredentials: true, // Включаем отправку cookies
      })
      setUser({
        name: response.data.user.name,
        email: response.data.user.email,
        photo: response.data.user.photo,
        isDefault: false,
      }) // Устанавливаем пользователя
    } catch (err) {
      //TODO добавить обработчкик 401
      setUser(defaultUser) // Если нет сессии — user = defaultUser
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
    setUser(defaultUser)
    toast.info('Logged out')
  }

  return (
    <Router>
      <Header user={user} logout={handleLogout} />
      <Routes>
        <Route path="/" element={<Welcome user={user} />} />
        <Route path="/profile" element={<Profile user={user} />} />
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
