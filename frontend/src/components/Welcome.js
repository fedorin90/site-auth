import React, { Container } from 'react-bootstrap'

const jumbotronStyle = {
  padding: '2rem 1rem',
  marginBottom: '2rem',
  backgroundColor: '#e9ecef',
  borderRadius: '.3rem',
}

const Welcome = ({ user }) => {
  return (
    <Container style={jumbotronStyle} className="mt-3">
      <h1>Welcome</h1>
      {user.email ? (
        <p>If you see this information you are already authorized.</p>
      ) : (
        <p>To view content please login</p>
      )}
    </Container>
  )
}

export default Welcome
