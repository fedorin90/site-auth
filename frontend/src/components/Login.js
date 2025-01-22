import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Button, Form, Row, Col } from 'react-bootstrap'
import axios from 'axios'

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:5050/login', {
        email,
        password,
      })
      alert(response.data.message)
      const { access_token } = response.data
      localStorage.setItem('access_token', access_token)
      setUser()
      navigate('/')
    } catch (err) {
      alert(err.response.data.error || 'Something went wrong')
    }
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
              <Form.Text className="text-muted">
                We'll never share your email with anyone else.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Login
            </Button>
          </Form>
        </Col>
        <Col></Col>
      </Row>
    </Container>
  )
}

export default Login
