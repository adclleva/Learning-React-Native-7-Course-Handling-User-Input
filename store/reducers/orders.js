import { ADD_ORDER } from "../actions/orders";
import Order from "../../models/order";

const initialState = {
  orders: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_ORDER:
      // we'll be using the date as the psuedo dummy unique id, we'll be using the server to create new ones
      const newOrder = new Order(
        new Date().toString(),
        action.orderData.items,
        action.orderData.amount,
        new Date()
      );

      return {
        ...state,
        // we use concat since it won't touch the old array and will return the new one
        orders: state.orders.concat(newOrder),
      };
  }

  return state;
};
