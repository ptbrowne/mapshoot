const _ = require('lodash/core');
const { connect } = require('react-redux');
const { ActionCreators } = require('redux-undo');

class _ActionHistory extends React.Component {
  render () {
    const { actions } = this.props;
    return actions.length === 0 ? null : <div className='panel-section'>
      <h2><i className='fa fa-calendar'/> History</h2>{
        _.map(actions, (action, i) =>
          <div key={ i }>{ action.type } <button onClick={ this.props.revertTo.bind(null, i) }>Go back</button></div>)
      }
    </div>;
  }
}

const ActionHistory = connect(state => ({
  actions: state.present.actions
}), dispatch => ({
  revertTo: function (index) {
    for (var i = 0; i < index; i++) {
      dispatch(ActionCreators.undo());
    }
  }
}))(_ActionHistory);

module.exports = ActionHistory;