import Container from 'react-bootstrap/Container'
import { Col, Row, Image, Form } from 'react-bootstrap'
import defaultAvatar from '../images/default_avatar.png'

const Profile = ({ user }) => {
  return (
    <Container className="mt-5">
      <Row>
        <Col></Col>
        <Col xs={4}>
          <h1>Profile</h1>
          <Image
            src={user.photo || defaultAvatar}
            rounded
            width={128}
            height={128}
          />
          <p />
          <Form.Group controlId="formFileSm" className="mb-3">
            <Form.Label>Change avatar</Form.Label>
            <Form.Control type="file" />
          </Form.Group>
          <p />
          Name: {user.name || 'No name'}
          <p />
          Email: {user.email}
        </Col>
        <Col></Col>
      </Row>
    </Container>
  )
}

export default Profile
