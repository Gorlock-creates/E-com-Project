
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  ListGroup,
  Row,
  Col,
  Image,
  Card,
  Button,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import axios from "axios";

import Loader from "../components/Loader";
import Message from "../components/Message";

function OrderDetailPage() {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // Fetch order details
  useEffect(() => {
    const fetchOrderById = async () => {
      try {
        setIsLoading(true);
        setError("");

        const { data } = await axios.get(`/api/orders/${id}`);
        setOrder(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Unable to load order details."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderById();
  }, [id]);

  // Format currency
  const formatPrice = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString("en-NP", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Start eSewa payment
  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      setError("");

      const { data: paymentDetails } = await axios.get(
        `/api/orders/${order._id}/getpaymentdetails`
      );

      const form = document.createElement("form");
      form.action =
        "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
      form.method = "POST";

      Object.entries(paymentDetails).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not start eSewa payment. Please try again."
      );
      setPaymentLoading(false);
    }
  };

  // Mark order as delivered (admin only)
  const handleOrderDelivery = async () => {
    try {
      await axios.put(`/api/orders/${order._id}/deliver`);

      setOrder((previousOrder) => ({
        ...previousOrder,
        isDelivered: true,
        deliveredAt: new Date().toISOString(),
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Could not update delivery status."
      );
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error && !order) {
    return (
      <>
        <Message variant="danger">{error}</Message>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </>
    );
  }

  if (!order) {
    return <Message variant="danger">Order not found.</Message>;
  }

  const isAdmin = Boolean(userInfo?.isAdmin);
  const isEsewa = order.paymentMethod?.toLowerCase() === "esewa";

  return (
    <div className="container py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Order Details</h2>
          <p className="text-muted mb-0">
            Order ID: {order._id}
          </p>
        </Col>
        <Col xs="auto">
          <Button
            variant="outline-secondary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Col>
      </Row>

      {error && <Message variant="danger">{error}</Message>}

      <Row className="g-4">
        {/* Order information */}
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Customer & Shipping Information</h5>
            </Card.Header>

            <ListGroup variant="flush">
              <ListGroup.Item>
                <p>
                  <strong>Name: </strong>
                  {order.user?.fullname || "Customer"}
                </p>

                <p>
                  <strong>Email: </strong>
                  {order.user?.email ? (
                    <a href={`mailto:${order.user.email}`}>
                      {order.user.email}
                    </a>
                  ) : (
                    "Not available"
                  )}
                </p>

                <p className="mb-0">
                  <strong>Address: </strong>
                  {[
                    order.shippingAddress?.address,
                    order.shippingAddress?.city,
                    order.shippingAddress?.postalCode,
                    order.shippingAddress?.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "No address provided"}
                </p>
              </ListGroup.Item>

              <ListGroup.Item>
                <strong>Delivery Status: </strong>

                {order.isDelivered ? (
                  <Message variant="success">
                    Delivered on{" "}
                    {new Date(order.deliveredAt).toLocaleString()}
                  </Message>
                ) : (
                  <Message variant="danger">
                    Not delivered yet
                  </Message>
                )}

                {isAdmin && !order.isDelivered && (
                  <Button
                    variant="success"
                    className="mt-2"
                    onClick={handleOrderDelivery}
                  >
                    Mark as Delivered
                  </Button>
                )}
              </ListGroup.Item>

              <ListGroup.Item>
                <strong>Payment Method: </strong>
                {isEsewa ? "eSewa" : "Cash on Delivery"}

                <div className="mt-2">
                  <strong>Payment Status: </strong>

                  {order.isPaid ? (
                    <Message variant="success">
                      Paid
                      {order.paidAt &&
                        ` on ${new Date(order.paidAt).toLocaleString()}`}
                    </Message>
                  ) : (
                    <Message variant="danger">
                      Payment pending
                    </Message>
                  )}
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card>

          {/* Items in order */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Order Items</h5>
            </Card.Header>

            <ListGroup variant="flush">
              {order.orderItems?.length > 0 ? (
                order.orderItems.map((item, index) => (
                  <ListGroup.Item key={item._id || item.product || index}>
                    <Row className="align-items-center g-3">
                      <Col xs={3} sm={2}>
                        <Image
                          src={item.image}
                          alt={item.name}
                          fluid
                          rounded
                          style={{
                            width: "100%",
                            maxHeight: "100px",
                            objectFit: "contain",
                          }}
                        />
                      </Col>

                      <Col>
                        {item.product ? (
                          <Link to={`/products/${item.product}`}>
                            {item.name}
                          </Link>
                        ) : (
                          <span>{item.name}</span>
                        )}
                      </Col>

                      <Col xs={12} sm={4} className="text-sm-end">
                        {formatPrice(item.price)} × {item.qty}
                        <br />
                        <strong>
                          {formatPrice(
                            Number(item.price) * Number(item.qty)
                          )}
                        </strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>
                  No items found for this order.
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>

        {/* Order summary */}
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>

            <ListGroup variant="flush">
              <ListGroup.Item>
                <Row>
                  <Col>Subtotal</Col>
                  <Col className="text-end">
                    {formatPrice(order.itemPrice)}
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col>Shipping</Col>
                  <Col className="text-end">
                    {formatPrice(order.shippingPrice)}
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col>Tax</Col>
                  <Col className="text-end">
                    {formatPrice(order.taxPrice)}
                  </Col>
                </Row>

                <hr />

                <Row>
                  <Col>
                    <strong>Total</strong>
                  </Col>
                  <Col className="text-end">
                    <strong>{formatPrice(order.totalPrice)}</strong>
                  </Col>
                </Row>
              </ListGroup.Item>

              {isEsewa && !order.isPaid && !isAdmin && (
                <ListGroup.Item>
                  <Button
                    variant="success"
                    className="w-100"
                    onClick={handlePayment}
                    disabled={paymentLoading}
                  >
                    {paymentLoading
                      ? "Redirecting to eSewa..."
                      : "Pay with eSewa"}
                  </Button>

                  <small className="text-muted d-block mt-2">
                    You will be redirected to eSewa to complete payment.
                  </small>
                </ListGroup.Item>
              )}

              {isEsewa && order.isPaid && (
                <ListGroup.Item>
                  <Message variant="success">
                    Payment completed successfully.
                  </Message>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default OrderDetailPage;