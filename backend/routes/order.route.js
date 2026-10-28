
import express from "express";

import {
  addOrder,
  deliverOrder,
  getEsewaPaymentDetails,
  confirmEsewaPayment,
  getMyOrders,
  getOrderById,
  getOrders,
  payOrder,
} from "../controller/order.controller.js";

import { checkAuth, checkAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", checkAuth, checkAdmin, getOrders);

router.post("/", checkAuth, addOrder);

router.get("/mine", checkAuth, getMyOrders);

// E-Sewa redirects to this route after payment.
// Keep it before the /:id route.
router.get("/confirmpayment", confirmEsewaPayment);

router.get("/:id/getpaymentdetails", getEsewaPaymentDetails);

router.get("/:id", checkAuth, getOrderById);

router.put("/:id/pay", checkAuth, checkAdmin, payOrder);

router.put("/:id/deliver", checkAuth, checkAdmin, deliverOrder);

export default router;