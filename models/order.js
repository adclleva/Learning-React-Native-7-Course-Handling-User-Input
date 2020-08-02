import moment from "moment"; // a library that can make date/time easier to implement for IOS and Android
class Order {
  constructor(id, items, totalAmount, date) {
    this.id = id;
    this.items = items;
    this.totalAmount = totalAmount;
    this.date = date;
  }

  // we use this getter to get the date to be valid text for the component to render
  get readableDate() {
    // return this.date.toLocaleDateString("en-EN", {
    //   year: "numeric",
    //   month: "long",
    //   day: "numeric",
    //   hour: "2-digit",
    //   minute: "2-digit",
    // });

    return moment(this.date).format("MMMM Do YYYY, hh:mm");
  }
}

export default Order;
