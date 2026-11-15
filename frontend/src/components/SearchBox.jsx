
import { useState } from "react";
import { useNavigate } from "react-router";
import { Form, Button } from "react-bootstrap";

function SearchBox() {
  const [keyword, setKeyword] = useState("");

  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();

    if (keyword.trim()) {
      navigate(
        `/search?keyword=${encodeURIComponent(keyword.trim())}`
      );
    } else {
      navigate("/");
    }
  };

  return (
    <Form onSubmit={submitHandler} className="d-flex">
      <Form.Control
        type="search"
        placeholder="Search artworks..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      <Button type="submit" variant="dark" className="ms-2">
        Search
      </Button>
    </Form>
  );
}

export default SearchBox;
