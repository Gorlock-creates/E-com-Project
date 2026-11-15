
import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Card,
  Alert,
  Spinner,
} from "react-bootstrap";
import axios from "axios";

const initialForm = {
  name: "",
  description: "",
  price: "",
  brand: "",
  category: "",
  image: "",
  countInStock: "",
};

function AdminProductPage() {
  const [formData, setFormData] = useState(initialForm);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get("/api/products");
      setProducts(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err.response?.data?.error || "Failed to fetch products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Add or update artwork
  const submitHandler = async (e) => {
    console.log("SUBMIT HANDLER IS RUNNING");

    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const productData = {
        ...formData,
        price: Number(formData.price),
        countInStock: Number(formData.countInStock),
      };

      console.log("Editing ID:", editingId);
      console.log("Stock value:", productData.countInStock);

      if (editingId) {
        console.log("Sending PUT request...");

        const response = await axios.put(
          `/api/products/${editingId}`,
          productData
        );

        console.log("Update response:", response.data);

        setMessage("Artwork updated successfully!");
      } else {
        console.log("Sending POST request...");

        await axios.post("/api/products", productData);

        setMessage("Artwork added successfully!");
      }

      setFormData(initialForm);
      setEditingId(null);

      await fetchProducts();
    } catch (err) {
      console.error("Save error:", err);

      setError(
        err.response?.data?.error || "Operation failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // Load artwork into form for editing
  const editHandler = (product) => {
    setEditingId(product._id);

    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      brand: product.brand || "",
      category: product.category || "",
      image: product.image || "",
      countInStock: product.countInStock ?? 0,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
    setError("");
    setMessage("");
  };

  // Delete artwork
  const deleteHandler = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this artwork?"
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      await axios.delete(`/api/products/${id}`);

      if (editingId === id) {
        cancelEdit();
      }

      setMessage("Artwork deleted successfully!");

      await fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);

      setError(
        err.response?.data?.error || "Failed to delete artwork."
      );
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Kala Kriti Admin Dashboard</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      {/* Artwork Form */}
      <Card className="shadow-sm mb-5">
        <Card.Header>
          <h4 className="mb-0">
            {editingId ? "Edit Artwork" : "Add New Artwork"}
          </h4>
        </Card.Header>

        <Card.Body>
          <Form onSubmit={submitHandler}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Artwork Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter artwork name"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (Rs.)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Enter price"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Artist / Brand</Form.Label>
                  <Form.Control
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Enter artist name"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Enter category"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Available Stock</Form.Label>
                  <Form.Control
                    type="number"
                    name="countInStock"
                    value={formData.countInStock}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter stock quantity"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your artwork"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button
              type="submit"
              variant="dark"
              disabled={saving}
            >
              {saving
                ? "Please wait..."
                : editingId
                ? "Save Changes"
                : "Add Artwork"}
            </Button>

            {editingId && (
              <Button
                variant="secondary"
                className="ms-2"
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel
              </Button>
            )}
          </Form>
        </Card.Body>
      </Card>

      {/* Artwork Table */}
      <h4 className="mb-3">Manage Artworks</h4>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" />
        </div>
      ) : products.length === 0 ? (
        <Alert variant="info">
          No artworks found.
        </Alert>
      ) : (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  <img
                    src={product.image}
                    alt={product.name}
                    width="60"
                    height="60"
                    style={{ objectFit: "cover" }}
                  />
                </td>

                <td>{product.name}</td>
                <td>Rs. {product.price}</td>
                <td>{product.category}</td>
                <td>{product.countInStock}</td>

                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => editHandler(product)}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteHandler(product._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default AdminProductPage;
