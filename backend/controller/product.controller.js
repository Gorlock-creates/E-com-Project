
import Product from "../model/Product.js";

// GET ALL PRODUCTS + SEARCH
const getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    const products = await Product.find({
      name: {
        $regex: keyword,
        $options: "i",
      },
    }).populate("user", "fullname email -_id");

    res.send(products);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// ADD PRODUCT (ADMIN ONLY)
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      brand,
      category,
      image,
      countInStock,
    } = req.body;

    if (
      !name ||
      price === undefined ||
      price === "" ||
      !brand ||
      !category
    ) {
      return res.status(400).send({
        error: "Please provide name, price, brand and category.",
      });
    }

    const stock = Number(countInStock ?? 0);
    const productPrice = Number(price);

    if (!Number.isFinite(stock) || stock < 0) {
      return res.status(400).send({
        error: "Stock must be a valid non-negative number.",
      });
    }

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      return res.status(400).send({
        error: "Price must be a valid non-negative number.",
      });
    }

    const product = await Product.create({
      name,
      description,
      price: productPrice,
      brand,
      category,
      image,
      countInStock: stock,
      user: req.user._id,
    });

    res.status(201).send({
      message: "Product added successfully!",
      product,
    });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

// GET SINGLE PRODUCT
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send({
        error: "Product not found!",
      });
    }

    res.send(product);
  } catch (err) {
    res.status(400).send({ error: "Invalid product ID" });
  }
};

// UPDATE PRODUCT (ADMIN ONLY)
const updateProduct = async (req, res) => {
  try {
    console.log("UPDATED PRODUCT CONTROLLER IS RUNNING");
    console.log("Received product ID:", req.params.id);
    console.log("Received stock:", req.body.countInStock);

    const { id } = req.params;

    const allowedFields = [
      "name",
      "price",
      "category",
      "brand",
      "image",
      "description",
      "countInStock",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Validate price
    if (updates.price !== undefined) {
      updates.price = Number(updates.price);

      if (!Number.isFinite(updates.price) || updates.price < 0) {
        return res.status(400).send({
          error: "Price must be a valid non-negative number.",
        });
      }
    }

    // Validate stock
    if (updates.countInStock !== undefined) {
      updates.countInStock = Number(updates.countInStock);

      if (
        !Number.isFinite(updates.countInStock) ||
        updates.countInStock < 0
      ) {
        return res.status(400).send({
          error: "Stock must be a valid non-negative number.",
        });
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).send({
        error: "No product details provided for update.",
      });
    }

    // Update product in MongoDB
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).send({
        error: "Product not found!",
      });
    }

    console.log("Updated stock in database:", product.countInStock);

    res.send({
      message: "Product updated successfully!",
      product,
    });
  } catch (err) {
    console.error("Product update error:", err.message);

    res.status(400).send({
      error: err.message,
    });
  }
};

// DELETE PRODUCT (ADMIN ONLY)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).send({
        error: "Product not found!",
      });
    }

    res.send({
      message: "Product deleted successfully!",
    });
  } catch (err) {
    res.status(400).send({ error: "Invalid product ID" });
  }
};

export {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
