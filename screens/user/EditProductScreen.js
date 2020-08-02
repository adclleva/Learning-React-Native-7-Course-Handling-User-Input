import React, { useEffect, useCallback, useReducer } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";

import { HeaderButtons, Item } from "react-navigation-header-buttons";
import HeaderButton from "../../components/UI/HeaderButton";
import { useSelector, useDispatch } from "react-redux";
import * as productActions from "../../store/actions/product";
import Input from "../../components/UI/Input";

/**
 * We create this outside the component to avoid recreation to improve performance
 * this reducer is not related to redux, but is a another way to handle complex state logic
 */

const FORM_INPUT_UPDATE = "UPDATE";

const formReducer = (state, action) => {
  // the state comes from the useReducer
  if (action.type === FORM_INPUT_UPDATE) {
    const updatedValues = {
      ...state.inputValues, // this copies the inputValues
      [action.input]: action.value, // we dynamically get the key/value of the input and update the value
    };

    const updatedValidities = {
      ...state.inputValidities,
      [action.input]: action.isValid, // this updates the validity of the input key
    };

    // we'll be checking out
    let updatedFormIsValid = true;

    /**
     * this will check for every key within the updatedValidities
     * to update the formIsValid
     */

    for (const key in updatedValidities) {
      if (!updatedValidities[key]) {
        updatedFormIsValid = updatedFormIsValid && updatedValidities[key]; // if one key/value is false, then it will stay false
      }
    }

    return {
      ...state,
      inputValues: updatedValues,
      inputValidities: updatedValidities,
      formIsValid: updatedFormIsValid,
    };
  }

  return state;
};

const EditProductScreen = (props) => {
  // this could be null if the user is just creating with no params passed down
  const productId = props.navigation.getParam("productId");

  // this determines if we are creating or
  const editedProduct = useSelector((state) =>
    state.products.userProducts.find((product) => product.id === productId)
  );

  const dispatch = useDispatch();

  /**
   * this useReducer hook takes in a function and an initial state
   * it gets the state snapshot and also the dispatch method
   * we destructure the state that we can use within the component and the
   * dispatchFormState dispatcher
   */
  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      // these will be the input identifiers
      title: editedProduct ? editedProduct.title : "",
      imageUrl: editedProduct ? editedProduct.imageUrl : "",
      description: editedProduct ? editedProduct.description : "",
      price: "",
    },
    inputValidities: {
      title: editedProduct ? true : false,
      imageUrl: editedProduct ? true : false,
      description: editedProduct ? true : false,
      price: editedProduct ? true : false,
    },
    formIsValid: editedProduct ? true : false,
  });

  /**
   * we use this useEffect and useCallback pattern to pass the submitHandler
   * to our params, the useCallback makes sure the function isn't recreated
   * so it wont be entering an infinite loop
   * We check validity when submitting but not for every input itself, it will be within the component
   */
  const submitHandler = useCallback(() => {
    // if the title is not valid, we stop continuing the function execution
    if (!formState.formIsValid) {
      Alert.alert("Wrong input!", "Please check the errors in the form.", [
        { text: "Okay" },
      ]);
      return;
    }
    // this will check if we are editing or creating by checking editedProduct is not undefined
    if (editedProduct) {
      dispatch(
        productActions.updateProduct(
          productId,
          // these have been refactored to use the formState from the reducer
          formState.inputValues.title,
          formState.inputValues.description,
          formState.inputValues.imageUrl
        )
      );
    } else {
      // this case, we are creating
      dispatch(
        productActions.createProduct(
          formState.inputValues.title,
          formState.inputValues.description,
          formState.inputValues.imageUrl,
          +formState.inputValues.price // this is the shorthand way of converting a string to a number
        )
      );
    }

    props.navigation.goBack();
    /**
     * we need to make sure to add the dependencies because the useCallback function
     * won't be recreated when the user enters in the data or when any of these changes
     */
  }, [dispatch, productId, formState]);

  /**
   * this will render a function after every render cycle
   * with the dependency of submitHandler, since it doesn't change,
   * it only executes once
   */
  useEffect(() => {
    props.navigation.setParams({ submit: submitHandler }); // now submit is a parameter that can be retrieved within the header
  }, [submitHandler]);

  /**
   * this will handle the text input changing and will use the useCallback to avoid rec-creating the function
   * because we get all the values from arguments
   */

  const inputChangeHandler = useCallback(
    (inputIdentifier, inputValue, inputValidity) => {
      /**
       * we are forwarding the input information that we are getting from the component
       * we dispatch this reducer to handle our complex local state
       */

      dispatchFormState({
        type: FORM_INPUT_UPDATE,
        value: inputValue,
        isValid: inputValidity,
        input: inputIdentifier,
      });
    },
    [dispatchFormState]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <ScrollView>
        <View style={styles.form}>
          <Input
            /**
             * we refactored the onInputChange prop because it will re-create a
             * function binding on ever render cycle
             * thus we need to have an id passed down instead
             * because the useCallback is not having an effect
             * to avoid an infinite rendering cycle whenever we use an anonymous
             * function or binding
             */
            id="title"
            label="Title"
            errorText="Please enter a valid title!"
            keyboardType="default"
            autoCapitalize="sentences"
            autoCorrect
            returnKeyType="next"
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.title : ""}
            initiallyValid={!!editedProduct}
            required
          />
          <Input
            id="imageUrl"
            label="Image Url"
            errorText="Please enter a valid image url!"
            keyboardType="default"
            returnKeyType="next"
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.imageUrl : ""}
            initiallyValid={!!editedProduct} // this casts it as a boolean value
            required
          />
          {editedProduct ? null : (
            <Input
              id="price"
              label="Price"
              errorText="Please enter a valid price!"
              keyboardType="decimal-pad"
              returnKeyType="next"
              onInputChange={inputChangeHandler}
              required
              min={0.1}
            />
          )}
          <Input
            id="description"
            label="Description"
            errorText="Please enter a valid description!"
            keyboardType="default"
            autoCapitalize="sentences"
            autoCorrect
            multiline
            numberOfLines={3}
            returnKeyType="next"
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.description : ""}
            initiallyValid={!!editedProduct}
            required
            minLength={5}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
});
