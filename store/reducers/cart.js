import { ADD_TO_CART, REMOVE_FROM_CART } from "../actions/cart";
import { ADD_ORDER } from "../actions/orders";
import CartItem from "../../models/cart-item";
import { DELETE_PRODUCT } from "../actions/product";

const initialState = {
  items: {},
  // the items will be an object where the keys are  the productId's and the values are the CartItem class
  totalAmount: 0,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      const addedProduct = action.product; // this is coming from the action creators
      const productPrice = addedProduct.price;
      const productTitle = addedProduct.title;

      let updatedOrNewCartItem;

      if (state.items[addedProduct.id]) {
        // we'll be using the id of the product to be our keys
        // already have the item in the cart
        updatedOrNewCartItem = new CartItem(
          state.items[addedProduct.id].quantity + 1,
          productPrice,
          productTitle,
          state.items[addedProduct.id].sum + productPrice
        );
      } else {
        updatedOrNewCartItem = new CartItem(
          1,
          productPrice,
          productTitle,
          productPrice
        );
      }
      return {
        ...state,
        items: {
          ...state.items,
          [addedProduct.id]: updatedOrNewCartItem,
        },
        totalAmount: state.totalAmount + productPrice,
      };
    case REMOVE_FROM_CART:
      const selectCartItem = state.items[action.productId]; // to get the current cart item
      const currentQuantity = selectCartItem.quantity; // we need the quantity to check whether to reduce or remove a cart item
      let updatedCartItems;
      // we need to reduce by one
      if (currentQuantity > 1) {
        const updatedCartItem = new CartItem(
          selectCartItem.quantity - 1,
          selectCartItem.productPrice,
          selectCartItem.productTitle,
          selectCartItem.sum - selectCartItem.productPrice
        );

        updatedCartItems = {
          ...state.items,
          [action.productId]: updatedCartItem,
        };
        // otherwise take out the whole product
      } else {
        updatedCartItems = { ...state.items }; // this will clone the state items
        delete updatedCartItems[action.productId]; // this will delete a property of our items object
      }

      return {
        ...state,
        items: updatedCartItems,
        totalAmount: state.totalAmount - selectCartItem.productPrice,
      };

    /* when the ADD_ORDER action is dispatched, the state within the cart 
         clears and goes back to its initial state  */
    case ADD_ORDER:
      return initialState;
    case DELETE_PRODUCT:
      if (!state.items[action.productId]) {
        // this checks if the product is within the cart
        return state;
      }

      const updatedItems = { ...state.items };
      const itemTotal = state.items[action.productId].sum; // gets the sum of the same numbered products combined or cart item
      delete updatedItems[action.productId];

      return {
        ...state,
        items: updatedItems,
        totalAmount: state.totalAmount - itemTotal,
      };
    default:
      return state;
  }

  return state;
};
