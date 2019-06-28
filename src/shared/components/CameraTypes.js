import _ from 'lodash/core';
import React from 'react';
import CameraTypeSelector from 'shared/components/CameraTypeSelector';
import { connect } from 'react-redux';
import { SELECT_CAMERA_TYPE, ADD_CAMERA_TYPE } from 'shared/actions';
import { CameraType } from 'shared/models';

class _CameraTypes extends React.Component  {
  constructor () {
    super();
    this.handleCreateCameraType = this.handleCreateCameraType.bind(this);
  }

  handleCreateCameraType () {
    var widthInMillimeters = parseInt(window.prompt('Width in millimeters ?'), 10);
    if (!widthInMillimeters) { return; }
    var heightInMillimeters = parseInt(window.prompt('Height in millimeters ?'), 10);
    if (!heightInMillimeters) { return; }
    var defaultZoom = parseInt(window.prompt('Default zoom ?'), 10);
    if (!defaultZoom) { return; }

    this.props.onAdd({
      widthInMillimeters, 
      heightInMillimeters,
      defaultZoom
    });
  }

  render () {
    var camTypes = _.sortBy(this.props.cameraTypes, function (ct) {
      return [ct.widthInMillimeters, ct.heightInMillimeters, ct.defaultZoom];
    });
    return <div>
      { _.map(camTypes, (cameraType, i) =>
        <CameraTypeSelector
          key={ i }
          cameraType={ cameraType }
          selected={ cameraType == this.props.selectedCameraType } />) }
          <div className='section__actions'>
            <button className='btn--green' onClick={ this.handleCreateCameraType }>
              <i className='fa fa-plus'/> new
            </button>&nbsp;
          </div>
    </div>;
  }
}

const mapStateToProps = function (state) {
  state = state.present;
  return {
    cameraTypes: state.cameraTypes,
    selectedCameraType: state.selectedCameraType
  };
};

const mapDispatchToProps = function (dispatch) {
  return {
    onAdd: function (options) {
      const cameraType = new CameraType(options);
      dispatch({ type: ADD_CAMERA_TYPE, cameraType });
      dispatch({ type: SELECT_CAMERA_TYPE, cameraType });
    }
  };
};


const CameraTypes = connect(
  mapStateToProps,
  mapDispatchToProps
)(_CameraTypes);

export default CameraTypes;
