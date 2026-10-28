import { createSlice } from "@reduxjs/toolkit";

const initialState = localStorage.getItem("cart")
  ? JSON.parse(localStorage.getItem("cart"))
  : {
      cartItems: [],
      itemPrice: 0,
      shippingCharge: 0,
      taxPrice: 0,
      totalPrice: 0,
      shippingAddress: {},
      paymentMethod: "cod",
    };

// Recalculate all prices whenever the cart changes
const updateCart = (state) => {
  state.itemPrice = Number(
    state.cartItems
      .reduce((acc, item) => {
        return acc + Number(item.qty || 0) * Number(item.price || 0);
      }, 0)
      .toFixed(2)
  );

  state.shippingCharge =
    state.itemPrice === 0 || state.itemPrice >= 100 ? 0 : 10;

  state.taxPrice = Number((0.1 * state.itemPrice).toFixed(2));

  state.totalPrice = Number(
    (state.itemPrice + state.shippingCharge + state.taxPrice).toFixed(2)
  );

  // Save the updated cart
  localStorage.setItem("cart", JSON.stringify(state));
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const itemFound = state.cartItems.find(
        (i) => i._id === item._id
      );

      if (itemFound) {
        itemFound.qty = Number(item.qty);
      } else {
        state.cartItems.push({
          ...item,
          qty: Number(item.qty || 1),
        });
      }

      updateCart(state);
    },

    clearCart: (state) => {
      state.cartItems = [];
      updateCart(state);
    },

    removeFromCart: (state, action) => {
      const id = action.payload;

      state.cartItems = state.cartItems.filter(
        (item) => item._id !== id
      );

      updateCart(state);
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem("cart", JSON.stringify(state));
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem("cart", JSON.stringify(state));
    },
  },
});

export const {
  addToCart,
  clearCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
} = cartSlice.actions;

export default cartSlice.reducer;

