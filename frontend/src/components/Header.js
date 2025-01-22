import { Container, Navbar } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import { ReactComponent as Logo } from '../images/logo.svg'
import 'bootstrap/dist/css/bootstrap.min.css'

const Header = ({ user, logout }) => {
  return (
    <Navbar className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/">
          <Logo />
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end me-2">
          {user ? (
            <Navbar.Text>
              Signed in as: <a href="#profile">{user}</a>
            </Navbar.Text>
          ) : (
            <Navbar.Text>Not signed in</Navbar.Text>
          )}
        </Navbar.Collapse>
        <ButtonGroup aria-label="auth func">
          {!user && (
            <>
              <Button href="/login" variant="secondary">
                Log in
              </Button>
              <Button href="/register" variant="secondary">
                Create account
              </Button>
            </>
          )}
          {user && (
            <Button onClick={logout} variant="secondary">
              Log out
            </Button>
          )}
        </ButtonGroup>
      </Container>
    </Navbar>
  )
}

export default Header
