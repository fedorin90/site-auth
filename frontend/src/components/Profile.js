import axios from 'axios'
import { toast } from 'react-toastify'
import { useState } from 'react'
import {
  Col,
  Row,
  Image,
  Form,
  InputGroup,
  Button,
  Container,
} from 'react-bootstrap'
import defaultAvatar from '../images/default_avatar.png'

const Profile = ({ user, fetchUser }) => {
  const [name, setName] = useState(user.name || '')

  const [selectedFile, setSelectedFile] = useState(null)

  const handleNameChange = (e) => setName(e.target.value)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file) // Сохраняем файл
    }
  }

  const handleSave = async () => {
    try {
      const formData = new FormData()
      formData.append('name', name)
      if (selectedFile) {
        formData.append('photo', selectedFile)
      }

      await axios.put('http://localhost:5050/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      })
      fetchUser()
      toast.success('Profile updated!')
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col></Col>
        <Col xs={4}>
          <h1>Profile</h1>
          <Image
            src={
              user.google_user
                ? user.photo || defaultAvatar
                : user.photo
                ? `http://localhost:5050${user.photo}` // Для локальных фото
                : defaultAvatar // Если фото нет, показываем дефолтное
            }
            rounded
            width={128}
            height={128}
          />
          <p />
          <Form.Label>Choose avatar</Form.Label>
          <InputGroup className="mb-3">
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </InputGroup>
          <p />
          <Form.Label>Name: {user.name || 'No name'}</Form.Label>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Your new username"
              value={name}
              onChange={handleNameChange}
            />
          </InputGroup>
          <Button variant="outline-secondary" onClick={handleSave}>
            Save Changes
          </Button>
          <p />
          Email: {user.email}
        </Col>
        <Col></Col>
      </Row>
    </Container>
  )
}

export default Profile
