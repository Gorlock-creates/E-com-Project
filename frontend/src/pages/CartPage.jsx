import React from "react";
import {
  Row,
  Col,
  ListGroup,
  Button,
  Form,
  Image,
  Card,
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { addToCart, removeFromCart } from "../slices/cartSlice";
import { Link } from "react-router";
import { FaTrash } from "react-icons/fa";

function CartPage() {
  const { cartItems, itemPrice, shippingCharge, taxPrice, totalPrice } =
    useSelector((state) => state.cart);

  const dispatch = useDispatch();

  const itemCount = cartItems.reduce(
    (acc, item) => acc + Number(item.qty || 0),
    0
  );

  const subtotal = cartItems.length === 0 ? 0 : Number(itemPrice || 0);
  const shipping = cartItems.length === 0 ? 0 : Number(shippingCharge || 0);
  const tax = cartItems.length === 0 ? 0 : Number(taxPrice || 0);
  const total = cartItems.length === 0 ? 0 : Number(totalPrice || 0);

  const handleQtyUpdate = (e, item) => {
    dispatch(
      addToCart({
        ...item,
        qty: Number(e.target.value),
      })
    );
  };

  return (
    <Row>
      <Col md={8}>
        {cartItems.length === 0 ? (
          <h3>
            Cart is empty. <Link to="/">Go Back</Link>
          </h3>
        ) : (
          <>
            <h2>Cart Items</h2>

            <ListGroup variant="flush">
              {cartItems.map((item) => (
                <ListGroup.Item key={item._id}>
                  <Row className="align-items-center">
                    <Col md={2}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fluid
                        rounded
                      />
                    </Col>

                    <Col md={4}>
                      <Link to={`/product/${item._id}`}>
                        {item.name}
                      </Link>
                    </Col>

                    <Col md={2}>
                      ${Number(item.price).toFixed(2)}
                    </Col>

                    <Col md={2}>
                      <Form.Select
                        value={item.qty}
                        onChange={(e) => handleQtyUpdate(e, item)}
                      >
                        {[...Array(Number(item.countInStock) || 0).keys()].map(
                          (x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          )
                        )}
                      </Form.Select>
                    </Col>

                    <Col md={2}>
                      <Button
                        variant="danger"
                        onClick={() => dispatch(removeFromCart(item._id))}
                      >
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}
      </Col>

      <Col md={4}>
        <Card>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h3>Subtotal ({itemCount}) Items</h3>
            </ListGroup.Item>

            <ListGroup.Item>
              <strong>${subtotal.toFixed(2)}</strong>
            </ListGroup.Item>

            {cartItems.length > 0 && (
              <>
                <ListGroup.Item>
                  Shipping: ${shipping.toFixed(2)}
                </ListGroup.Item>

                <ListGroup.Item>
                  Tax: ${tax.toFixed(2)}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Total: ${total.toFixed(2)}</strong>
                </ListGroup.Item>
              </>
            )}

            <ListGroup.Item>
              <Button
                as={Link}
                to="/login?redirect=/shipping"
                variant="dark"
                className="w-100"
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </Button>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
  );
}

export default CartPage;
