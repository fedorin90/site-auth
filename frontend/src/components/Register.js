import { useState, useEffect } from 'react'
import { FaCheck, FaTimes } from 'react-icons/fa'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { Container, Button, Form, Row, Col, InputGroup } from 'react-bootstrap'
import axios from 'axios'
import { toast } from 'react-toastify'

const validatePassword = (password) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
}

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) // Вернет true, если email корректный
}

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const validation = validatePassword(password)
  const isEmailValid = validateEmail(email)
  const navigate = useNavigate()

  const isValid = Object.values(validation).every(Boolean) && isEmailValid

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:5050/register', {
        email,
        password,
        name,
      })
      toast.info(response.data.message)
      navigate('/login')
    } catch (err) {
      toast.error(err.response.data.error)
    }
  }
  return (
    <Container className="mt-5">
      <Row>
        <Col></Col>
        <Col xs={4}>
          <h1>Register</h1>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    borderColor: email
                      ? isEmailValid
                        ? 'green'
                        : 'red'
                      : '#ccc',
                    outline: 'none',
                    flex: 1,
                  }}
                />
              </div>
              {email && (
                <Form.Text style={{ color: isEmailValid ? 'green' : 'red' }}>
                  {isEmailValid ? (
                    <>
                      <FaCheck /> Valid email
                    </>
                  ) : (
                    <>
                      <FaTimes /> Invalid email format (example@example.com)
                    </>
                  )}
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    borderColor: password
                      ? isValid
                        ? 'green' // Если пароль валиден, зелёный
                        : 'red' // Если не валиден, красный
                      : '#ccc', // Если пустое, стандартный серый
                    outline: 'none',
                  }}
                />
                <InputGroup.Text
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: 'pointer' }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
              </InputGroup>
              {password && (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ color: validation.length ? 'green' : 'red' }}>
                    {validation.length ? <FaCheck /> : <FaTimes />} At least 8
                    characters
                  </li>
                  <li style={{ color: validation.uppercase ? 'green' : 'red' }}>
                    {validation.uppercase ? <FaCheck /> : <FaTimes />} One
                    uppercase letter
                  </li>
                  <li style={{ color: validation.lowercase ? 'green' : 'red' }}>
                    {validation.lowercase ? <FaCheck /> : <FaTimes />} One
                    lowercase letter
                  </li>
                  <li style={{ color: validation.digit ? 'green' : 'red' }}>
                    {validation.digit ? <FaCheck /> : <FaTimes />} One digit
                  </li>
                  <li
                    style={{ color: validation.specialChar ? 'green' : 'red' }}
                  >
                    {validation.specialChar ? <FaCheck /> : <FaTimes />} One
                    special character
                  </li>
                </ul>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicCheckbox">
              <Form.Check
                type="checkbox"
                label={
                  <>
                    I accept the{' '}
                    <a
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms and Conditions
                    </a>
                    .
                  </>
                }
                required
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              disabled={!isValid}
              style={{ background: isValid || 'gray' }}
            >
              Create account
            </Button>
          </Form>
        </Col>
        <Col></Col>
      </Row>
    </Container>
  )
}

export default Register
