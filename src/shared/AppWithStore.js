import App from 'shared/components/App';
import store from 'shared/store';
import { Provider } from 'react-redux';

class AppWithStore extends React.Component {
  render () {
    return <Provider store={ store }>
      <App />
    </Provider>;
  }
}

export default AppWithStore;
