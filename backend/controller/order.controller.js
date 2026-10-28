
import Order from "../model/Order.js";
import crypto from "crypto";

const ESEWA_PRODUCT_CODE = "EPAYTEST";
const ESEWA_SECRET_KEY = "8gBm/:&EnhH.1/q";
const FRONTEND_URL = "http://localhost:5173";
const BACKEND_URL = "http://localhost:4000";

// Generate an HMAC-SHA256 signature.
const generateSignature = (message) =>
  crypto
    .createHmac("sha256", ESEWA_SECRET_KEY)
    .update(message)
    .digest("base64");

// Verify a signature without ordinary string comparison.
const signaturesMatch = (expected, received) => {
  if (!expected || !received) return false;

  const a = Buffer.from(expected);
  const b = Buffer.from(received);

  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const addOrder = async (req, res) => {
  try {
    const {
      orderItems,
      itemPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      shippingAddress,
      paymentMethod,
    } = req.body;

    if (!orderItems?.length) {
      return res.status(400).send({ message: "Your cart is empty." });
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      itemPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      paymentMethod,
    });

    res.status(201).send({
      message: "Order created!",
      orderId: order._id,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).send({ message: "Could not create order." });
  }
};

const getOrders = async (req, res) => {
  const orders = await Order.find().populate("user", "fullname email");
  res.send(orders);
};

const getOrderById = async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id).populate(
    "user",
    "fullname email isAdmin"
  );

  if (!order) {
    return res.status(404).send({ error: "Order not found!" });
  }

  res.send(order);
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.send(orders);
};

const payOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).send({ message: "Order not found" });
  }

  // This is your existing admin/manual payment route.
  // Do not use it as E-Sewa payment verification.
  order.isPaid = true;
  order.paidAt = new Date();

  await order.save();

  res.send({ message: "Order paid successfully!" });
};

const deliverOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).send({ message: "Order not found" });
  }

  if (!order.isPaid) {
    return res.status(400).send({ error: "Order not paid!" });
  }

  order.isDelivered = true;
  order.deliveredAt = new Date();

  await order.save();

  res.send({ message: "Order delivered successfully" });
};

// Generate E-Sewa ePay V2 payment details.
const getEsewaPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    if (order.paymentMethod !== "esewa") {
      return res.status(400).send({
        message: "This order is not using E-Sewa.",
      });
    }

    if (order.isPaid) {
      return res.status(400).send({
        message: "This order is already paid.",
      });
    }

    // Reuse the same UUID for retries on this order.
    if (!order.esewaTransactionUuid) {
      order.esewaTransactionUuid = `${Date.now()}-${order._id}`;
      await order.save();
    }

    const transaction_uuid = order.esewaTransactionUuid;
    const total_amount = Number(order.totalPrice).toFixed(2);

    const message =
      `total_amount=${total_amount},` +
      `transaction_uuid=${transaction_uuid},` +
      `product_code=${ESEWA_PRODUCT_CODE}`;

    const signature = generateSignature(message);

    const paymentDetail = {
      amount: String(order.itemPrice),
      tax_amount: String(order.taxPrice),
      product_service_charge: "0",
      product_delivery_charge: String(order.shippingPrice),
      total_amount: total_amount,
      transaction_uuid,
      product_code: ESEWA_PRODUCT_CODE,
      signed_field_names:
        "total_amount,transaction_uuid,product_code",
      signature,
      success_url: `${BACKEND_URL}/api/orders/confirmpayment`,
      failure_url: `${FRONTEND_URL}/order/${order._id}?payment=failed`,
    };

    res.send(paymentDetail);
  } catch (error) {
    console.error("E-Sewa payment details error:", error);
    res.status(500).send({
      message: "Could not generate payment details.",
    });
  }
};

// E-Sewa redirects here with its Base64-encoded response in `data`.
const confirmEsewaPayment = async (req, res) => {
  try {
    const { data } = req.query;

    if (typeof data !== "string" || !data) {
      return res.redirect(
        `${FRONTEND_URL}/?payment=failed`
      );
    }

    let payment;

    try {
      const decoded = Buffer.from(data, "base64").toString("utf8");
      payment = JSON.parse(decoded);
    } catch {
      return res.redirect(
        `${FRONTEND_URL}/?payment=failed`
      );
    }

    const {
      status,
      signature,
      signed_field_names,
      transaction_uuid,
      product_code,
      total_amount,
    } = payment;

    if (
      !transaction_uuid ||
      product_code !== ESEWA_PRODUCT_CODE ||
      status !== "COMPLETE" ||
      !signature ||
      !signed_field_names
    ) {
      return res.redirect(
        `${FRONTEND_URL}/?payment=failed`
      );
    }

    // Verify the signature over the fields E-Sewa says it signed.
    const fields = signed_field_names.split(",");

    if (!fields.includes("transaction_uuid") ||
        !fields.includes("total_amount") ||
        !fields.includes("product_code") ||
        !fields.includes("status")) {
      return res.redirect(
        `${FRONTEND_URL}/?payment=failed`
      );
    }

    const signedMessage = fields
      .map((field) => {
        if (payment[field] === undefined) {
          throw new Error(`Missing signed field: ${field}`);
        }

        return `${field}=${payment[field]}`;
      })
      .join(",");

    const expectedSignature = generateSignature(signedMessage);

    if (!signaturesMatch(expectedSignature, signature)) {
      return res.redirect(
        `${FRONTEND_URL}/?payment=failed`
      );
    }

    const order = await Order.findOne({
      esewaTransactionUuid: transaction_uuid,
    });

    if (!order) {
      return res.redirect(
        `${FRONTEND_URL}/?payment=failed`
      );
    }

    if (order.isPaid) {
      return res.redirect(
        `${FRONTEND_URL}/order/${order._id}?payment=success`
      );
    }

    // Match the amount returned by E-Sewa to the saved order.
    if (
      Number(total_amount).toFixed(2) !==
      Number(order.totalPrice).toFixed(2)
    ) {
      return res.redirect(
        `${FRONTEND_URL}/order/${order._id}?payment=failed`
      );
    }

    // Verify the transaction status directly with E-Sewa as well.
    const verifyUrl = new URL(
      "https://uat.esewa.com.np/api/epay/transaction/status/"
    );

    verifyUrl.search = new URLSearchParams({
      product_code: ESEWA_PRODUCT_CODE,
      total_amount: Number(order.totalPrice).toFixed(2),
      transaction_uuid,
    }).toString();

    const verifyResponse = await fetch(verifyUrl);

    if (!verifyResponse.ok) {
      throw new Error("E-Sewa status verification failed.");
    }

    const verification = await verifyResponse.json();

    if (
      verification.status !== "COMPLETE" ||
      verification.product_code !== ESEWA_PRODUCT_CODE ||
      verification.transaction_uuid !== transaction_uuid ||
      Number(verification.total_amount).toFixed(2) !==
        Number(order.totalPrice).toFixed(2)
    ) {
      return res.redirect(
        `${FRONTEND_URL}/order/${order._id}?payment=failed`
      );
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.esewaTransactionCode =
      payment.transaction_code || verification.ref_id || null;

    await order.save();

    return res.redirect(
      `${FRONTEND_URL}/order/${order._id}?payment=success`
    );
  } catch (error) {
    console.error("E-Sewa confirmation error:", error);

    return res.redirect(
      `${FRONTEND_URL}/?payment=verification-error`
    );
  }
};

export {
  addOrder,
  getOrders,
  getOrderById,
  getMyOrders,
  payOrder,
  deliverOrder,
  getEsewaPaymentDetails,
  confirmEsewaPayment,
};