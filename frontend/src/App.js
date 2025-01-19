import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Welcome from './components/Welcome'
import Login from './components/Login'
import Register from './components/Register'
import VerifyEmail from './components/VerifyEmail'

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify/:userId" element={<VerifyEmail />} />
      </Routes>
    </Router>
  )
}

export default App
