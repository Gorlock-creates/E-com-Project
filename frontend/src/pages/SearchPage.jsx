
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import axios from "axios";
import { Row, Col } from "react-bootstrap";
import Product from "../components/Product";

function SearchPage() {
  const [searchParams] = useSearchParams();

  const keyword = searchParams.get("keyword") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get(
          `/api/products?keyword=${encodeURIComponent(keyword)}`
        );

        setProducts(data);
      } catch (err) {
        setError("Unable to load search results.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword]);

  if (loading) return <h3>Loading products...</h3>;

  if (error) return <h3>{error}</h3>;

  return (
    <div>
      <h2 className="mb-4">
        Search Results: {keyword}
      </h2>

      {products.length === 0 ? (
        <h4>No artworks found!</h4>
      ) : (
        <Row>
          {products.map((product) => (
            <Col
              key={product._id}
              sm={12}
              md={6}
              lg={4}
              xl={3}
            >
              <Product product={product} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default SearchPage;
