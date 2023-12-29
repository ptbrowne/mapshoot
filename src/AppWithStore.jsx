import React from "react"
import { Provider } from "react-redux"

import App from "./components/App"
import store from "./store"

class AppWithStore extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    )
  }
}

export default AppWithStore
