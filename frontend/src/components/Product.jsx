
import { Card } from "react-bootstrap";
import Rating from "./Ratings";
import { Link } from "react-router";

function Product({ product }) {
  return (
    <Card className="my-3 p-3 rounded product-card">
      <div className="product-image-container">
        <Card.Img
          src={product.image}
          alt={product.name}
          className="product-image"
        />
      </div>

      <Card.Body className="product-card-body">
        <Card.Title className="product-title">
          <Link to={`/products/${product._id}`}>
            <strong>{product.name}</strong>
          </Link>
        </Card.Title>

        <Card.Text as="h4" className="product-price">
          ${product.price}
        </Card.Text>

        <Card.Text as="div" className="product-rating">
          <Rating
            value={product.rating}
            text={product.numReviews}
          />
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default Product;