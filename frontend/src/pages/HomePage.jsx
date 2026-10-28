import { useState, useEffect } from "react";
import Product from "../components/Product";
import { Row, Col, Container } from "react-bootstrap";

function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const resp = await fetch("/api/products");
        const data = await resp.json();
        setProducts(data);
      } catch (err) {
        console.log(err.message);
      }
    };

    loadProducts();
  }, []);

  return (
    <>
      <Container className="art-section my-5">
        <div className="section-heading">
          <div>
            <h2>Latest Artworks</h2>
            <p>Explore the newest creations from our artists.</p>
          </div>

          <div className="heading-line"></div>
        </div>

        <Row className="g-4">
          {products.map((product) => (
            <Col
              key={product._id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              className="artwork-col"
            >
              <Product product={product} />
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}

export default HomePage;
