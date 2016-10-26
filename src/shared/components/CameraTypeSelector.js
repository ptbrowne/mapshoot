const _ = require('lodash');
const React = require('react');
const { connect } = require('react-redux');
const { SELECT_CAMERA_TYPE, REMOVE_CAMERA_TYPE } = require('shared/actions'); 
const defaultStyle = {
  marginRight: '0.25rem',
  marginBottom: '0.25rem',
  padding: '0.25rem',
};

class _CameraTypeSelector extends React.Component {
  render () {
    const { cameraType } = this.props;
    const { widthInMillimeters, heightInMillimeters, defaultZoom } = cameraType;
    const className = 'camera-type ' + (this.props.selected ? 'camera-type__selected' : '');
    return <div className={ className } onClick={ this.props.onSelect.bind(null, cameraType) }
      style={ _.extend({
        width: widthInMillimeters,
        height: heightInMillimeters
      }, defaultStyle) }>
      <div className='camera-type__content'>
        {widthInMillimeters}x{heightInMillimeters} z{defaultZoom}
      </div>
      <i
        onClick={ this.props.onRemove.bind(null, cameraType) }
        className='fa fa-remove camera-type__remove' />
    </div>;
  }
}

const mapDispatchToProps = function (dispatch) {
  return {
    onSelect: function (cameraType, ev) {
      if (ev.defaultPrevented) { return; }
      dispatch({ type: SELECT_CAMERA_TYPE, cameraType });
    },

    onRemove: function (cameraType, ev) {
      dispatch({ type: REMOVE_CAMERA_TYPE, cameraType });
      dispatch({ type: SELECT_CAMERA_TYPE, cameraType: null });
      ev.stopPropagation();
      ev.preventDefault();
    }
  };
};

const mapStateToProps = function (state, ownProps) {
  state = state.present;
  return {
    selected: ownProps.cameraType == state.selectedCameraType
  };
};

const CameraTypeSelector = connect(
  mapStateToProps,
  mapDispatchToProps
)(_CameraTypeSelector);

module.exports = CameraTypeSelector;