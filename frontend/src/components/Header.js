import { Container, Navbar } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'

import { ReactComponent as Logo } from '../images/logo.svg'
import 'bootstrap/dist/css/bootstrap.min.css'

const Header = () => {
  return (
    <Navbar className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/">
          <Logo />
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end me-2">
          <Navbar.Text>
            Signed in as: <a href="#login">Mark Otto</a>
          </Navbar.Text>
        </Navbar.Collapse>
        <ButtonGroup aria-label="auth func">
          <Button variant="secondary">Log in</Button>
          <Button variant="secondary">Create account</Button>
          <Button variant="secondary">Log out</Button>
        </ButtonGroup>
      </Container>
    </Navbar>
  )
}

export default Header
