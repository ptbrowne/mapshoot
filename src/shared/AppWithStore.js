const App = require('shared/components/App');
const store = require('shared/store');
const { Provider } = require('react-redux');

class AppWithStore extends React.Component {
  render () {
    return <Provider store={ store }>
      <App />
    </Provider>;
  }
};

export default AppWithStore;
