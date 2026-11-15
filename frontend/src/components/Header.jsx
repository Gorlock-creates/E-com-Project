
import {
  Navbar,
  Nav,
  Container,
  NavDropdown,
  Badge,
} from "react-bootstrap";

import { FaShoppingCart, FaUser, FaUserShield } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router";

import "./header.css";
import logo from "../assets/react.svg";
import { removeCredentials } from "../slices/authSlice";
import axios from "axios";
import SearchBox from "./SearchBox";

function Header() {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      const resp = await axios.post("/api/auth/logout");
      dispatch(removeCredentials());
      navigate("/login");
      console.log(resp.data);
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <header>
      <Navbar
        collapseOnSelect
        expand="lg"
        className="cream-navbar"
      >
        <Container fluid="lg">
          <Navbar.Brand
            as={NavLink}
            to="/"
            className="brand-name"
          >
            <img
              src={logo}
              alt="Kala Kriti logo"
              className="brand-logo"
            />
            <strong>Kala Kriti</strong>
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="navbar"
            className="custom-toggler"
          />

          <Navbar.Collapse id="navbar">
            <div className="search-wrapper">
              <SearchBox />
            </div>

            <Nav className="ms-auto align-items-lg-center nav-links">

              {/* Admin Dashboard */}
              {userInfo?.isAdmin && (
                <Nav.Link
                  as={NavLink}
                  to="/admin/products"
                >
                  <FaUserShield className="me-1" />
                  Admin Dashboard
                </Nav.Link>
              )}

              {/* Cart */}
              <Nav.Link as={NavLink} to="/cart">
                <FaShoppingCart className="me-1" />
                Cart{" "}

                {cartItems.length > 0 && (
                  <Badge bg="success" pill>
                    {cartItems.reduce(
                      (acc, item) => acc + Number(item.qty),
                      0
                    )}
                  </Badge>
                )}
              </Nav.Link>

              {/* User Menu */}
              {userInfo ? (
                <NavDropdown title={userInfo.fullname}>
                  <NavDropdown.Item>
                    Profile
                  </NavDropdown.Item>

                  <NavDropdown.Item onClick={logoutHandler}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Nav.Link as={NavLink} to="/login">
                  <FaUser className="me-1" />
                  Login
                </Nav.Link>
              )}

            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

export default Header;
