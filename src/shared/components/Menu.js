var React = require('react');
var { Link } = require('react-router');

module.exports = React.createClass({
  render: function () {
    return <div>
      <Link to='episodes'>episodes</Link>
    </div>;
  }
});
