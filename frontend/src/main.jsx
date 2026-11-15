import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router";

import { Provider } from "react-redux";
import store from "./store.js";

import App from "./App.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";

import ShippingPage from "./pages/ShippingPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import PlaceOrderPage from "./pages/PlaceOrderPage.jsx";
import OrderDetailPage from "./pages/OrderDetailPage.jsx";
import AdminProductPage from "./pages/AdminProductPage.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={App}>
          <Route index Component={HomePage} />

          <Route path="products/:id" Component={ProductDetailPage} />
          <Route path="search" Component={SearchPage} />
          <Route path="login" Component={LoginPage} />
          <Route path="cart" Component={CartPage} />

          {/* Logged-in user routes */}
          <Route element={<PrivateRoute />}>
            <Route path="shipping" Component={ShippingPage} />
            <Route path="payment" Component={PaymentPage} />
            <Route path="placeorder" Component={PlaceOrderPage} />
            <Route path="order/:id" Component={OrderDetailPage} />

            {/* Admin-only routes */}
            <Route element={<AdminRoute />}>
              <Route
                path="admin/products"
                Component={AdminProductPage}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </Provider>
);
