import React from 'react'

import App from "./components/App";
import store from "./store";
import { Provider } from "react-redux";

class AppWithStore extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}

export default AppWithStore;
