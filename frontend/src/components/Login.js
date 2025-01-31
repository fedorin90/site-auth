import { useState } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Container, Button, Form, Row, Col, InputGroup } from 'react-bootstrap'
import axios from 'axios'

const style = {
  divider: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    color: '#666',
    fontWeight: 'bold',
    fontSize: '14px',
    margin: '20px 0',
  },
  line: {
    flex: 1,
    borderTop: '1px solid #ccc',
    margin: '0 10px',
  },
}

const Login = ({ fetchUser }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        'http://localhost:5050/login',
        {
          email,
          password,
        },
        { withCredentials: true }
      )

      fetchUser()
      toast.success(`Login successfull! Welcome, ${response.data.user.email}`)

      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong')
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5050/google-login'
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col></Col>
        <Col xs={4}>
          <h1>Login</h1>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <InputGroup.Text
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: 'pointer' }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>
            <p />
            <Button variant="primary" type="submit" style={{ width: '100%' }}>
              Login
            </Button>
            <p />
            <Form.Text>
              Don't have an account? <a href="/register">Sign up</a>
              <div style={style.divider}>
                <div style={style.line}></div>
                OR
                <div style={style.line}></div>
              </div>
            </Form.Text>
            <Button
              onClick={handleGoogleLogin}
              variant="outline-dark"
              style={{ width: '100%' }}
            >
              <FcGoogle className="mb-1" style={{ fontSize: '24px' }} />{' '}
              Continue with Google
            </Button>
          </Form>
        </Col>
        <Col></Col>
      </Row>
    </Container>
  )
}

export default Login
