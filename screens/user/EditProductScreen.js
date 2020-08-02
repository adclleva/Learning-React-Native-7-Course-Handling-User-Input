import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";

import { HeaderButtons, Item } from "react-navigation-header-buttons";
import HeaderButton from "../../components/UI/HeaderButton";
import { useSelector, useDispatch } from "react-redux";
import * as productActions from "../../store/actions/product";

const EditProductScreen = (props) => {
  // this could be null if the user is just creating with no params passed down
  const productId = props.navigation.getParam("productId");

  // this determines if we are creating or
  const editedProduct = useSelector((state) =>
    state.products.userProducts.find((product) => product.id === productId)
  );

  const dispatch = useDispatch();

  const [title, setTitle] = useState(editedProduct ? editedProduct.title : "");
  const [imageUrl, setImageUrl] = useState(
    editedProduct ? editedProduct.imageUrl : ""
  );
  const [price, setPrice] = useState(""); // we don't edit the price but to create it
  const [description, setDescription] = useState(
    editedProduct ? editedProduct.description : ""
  );

  /**
   * we use this useEffect and useCallback pattern to pass the submitHandler
   * to our params, the useCallback makes sure the function isn't recreated
   * so it wont be entering an infinite loop
   */
  const submitHandler = useCallback(() => {
    // this will check if we are editing or creating by checking editedProduct is not undefined
    if (editedProduct) {
      dispatch(
        productActions.updateProduct(productId, title, description, imageUrl)
      );
    } else {
      // this case, we are creating
      dispatch(
        productActions.createProduct(
          title,
          description,
          imageUrl,
          +price // this is the shorthand way of converting a string to a number
        )
      );
    }

    props.navigation.goBack();
    /**
     * we need to make sure to add the dependencies because the useCallback function
     * won't be recreated when the user enters in the data
     */
  }, [dispatch, productId, title, description, imageUrl, price]);

  /**
   * this will render a function after every render cycle
   * with the dependency of submitHandler, since it doesn't change,
   * it only executes once
   */
  useEffect(() => {
    props.navigation.setParams({ submit: submitHandler }); // now submit is a parameter that can be retrieved within the header
  }, [submitHandler]);

  return (
    <ScrollView>
      <View style={styles.form}>
        <View style={styles.formControl}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={(text) => setTitle(text)}
            // onChangeText is simple prop, that gives whatever is the value of the input field on every change.
          />
        </View>
        <View style={styles.formControl}>
          <Text style={styles.label}>Image URL</Text>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={(text) => setImageUrl(text)}
          />
        </View>
        {editedProduct ? null : (
          <View style={styles.formControl}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={(text) => setPrice(text)}
            />
          </View>
        )}
        <View style={styles.formControl}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={(text) => setDescription(text)}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default EditProductScreen;

EditProductScreen.navigationOptions = (navData) => {
  const submitFunction = navData.navigation.getParam("submit");
  return {
    // this will determine if we are creating or editing depending if a parameter was passed or not
    headerTitle: navData.navigation.getParam("productId")
      ? "Edit Product"
      : "Create Product",
    headerRight: () => (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Save"
          // this will render a specific icon depending on the platform
          // we can go here to check out the icons https://icons.expo.fyi/
          iconName={
            Platform.OS === "android" ? "md-checkmark" : "ios-checkmark"
          }
          onPress={() => submitFunction()}
        />
      </HeaderButtons>
    ),
  };
};

const styles = StyleSheet.create({
  form: {
    margin: 20,
  },
  formControl: {
    width: "100%",
  },
  label: {
    fontFamily: "open-sans-bold",
    marginVertical: 8,
  },
  input: {
    paddingHorizontal: 2,
    paddingVertical: 5,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
});
