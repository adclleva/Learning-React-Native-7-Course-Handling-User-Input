import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Card = (props) => {
  return (
    <View
      style={{
        // this gives us the ability to merge any styles that we created with the default styles
        ...styles.card,
        ...props.style,
      }}
    >
      {props.children}
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  card: {
    // shadow is for IOS
    shadowColor: "#000",
    shadowOpacity: 0.26,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    // elevation is for android
    elevation: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
});
