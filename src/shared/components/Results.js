const React = require('react');
const _ = require('lodash/core');

const { connect } = require('react-redux');
const { ActionTypes } = require('redux-undo');

const { CameraType } = require('shared/models');
const { 
  CLEAR_CAMERAS, SELECT_CAMERA, UPDATE_CAMERA,
  ADD_CAMERA_TYPE, REMOVE_CAMERA, SET_MAP_ZOOM
} = require('shared/actions');

class _Results extends React.Component {
  constructor () {
    super();
    this.handleClickZoom = this.handleClickZoom.bind(this);
  }

  handleClickZoom () {
    const { selectedCamera } = this.props;
    this.props.onChangeZoom(selectedCamera.zoom);
  }

  render () {
    const { cameras, selectedCamera } = this.props;
    const {
        onClearCameras, onSelectCamera,
        onRemoveCamera, onCreateCameraTypeFromCamera,
        onViewZoom, onSetZoom } = this.props;
    const { mapboxMapId, mapboxAccessToken, mapboxLogin } = this.props;
    return <div>
      { cameras.length ? <div className='panel-section'>
        <h2><i className='fa fa-picture-o'/> Snapshots</h2>
        { _.map(cameras, camera => {
          return <img
            key={ camera.id }
            className='results__camera'
            onClick={ onSelectCamera.bind(null, camera) }
            src={ camera.getRenderString(mapboxLogin, mapboxMapId, mapboxAccessToken) } />;
        })}
        <div className='section__actions'>
          <button className='btn--red' onClick={ onClearCameras }>
            <i className='fa fa-times'/> Remove all
          </button>
        </div> 
      </div> : null }
      { selectedCamera ? <div className='panel-section'>
        <h2><i className='fa fa-camera'/> Current camera</h2>
        <img className='results__selected-camera' src={ selectedCamera.getRenderString(mapboxLogin, mapboxMapId, mapboxAccessToken) } /><br/>
        <p>
          <span onClick={ this.handleClickZoom }>zoom: { selectedCamera.zoom }</span><br/>
          widthInMillimeters: { selectedCamera.widthInMillimeters }<br/>
          heightInMillimeters: { selectedCamera.heightInMillimeters }
        </p>
        <div className='section__actions'>
          <button className='btn btn--red' onClick={ onRemoveCamera.bind(null, selectedCamera) } >
            <i className='fa fa-times'/> Remove
          </button>&nbsp;
          <button onClick={ onCreateCameraTypeFromCamera.bind(null, selectedCamera) }
              className='btn btn--green'>
            <i className='fa fa-camera-retro'/> Create camera type
          </button>&nbsp;
          <button onClick={ onViewZoom.bind(null, selectedCamera) }
              className='btn btn--purple'>
            <i className='fa fa-icon-zoom-in'/> View zoom
          </button>&nbsp;
          <button onClick={ () => onSetZoom(selectedCamera, this.props.mapZoom) }
              className='btn btn--purple'>
            <i className='fa fa-icon-zoom'/> Set Zoom
          </button>&nbsp;
          <button onClick={ () => onSelectCamera(null) }
              className='btn btn--purple'>
            Deselect camera
          </button>
        </div>
      </div> : null }
      <div className='panel-section'>
        { this.props.mapZoom }
      </div>
    </div>;
  }
}

const mapStateToProps = function (state) {
  state = state.present;

  const cameras = state.cameras;
  const selectedCamera = _.find(cameras, x => x.id == state.selectedCameraId);
  return {
    cameras: state.cameras,
    selectedCamera: selectedCamera,
    mapZoom: state.map.zoom
  };
};

const mapDispatchToProps = function (dispatch) {
  return {
    onClearCameras: function () {
      dispatch({ type: CLEAR_CAMERAS });
    },

    onUndo: function () {
      dispatch({ type: ActionTypes.UNDO });
    },

    onSelectCamera: function (camera) {
      dispatch({ type: SELECT_CAMERA, camera });
    },

    onRemoveCamera: function (camera) {
      dispatch({ type: REMOVE_CAMERA, camera });
    },

    onViewZoom: function (camera) {
      // TODO : why + 1
      dispatch({ type: SET_MAP_ZOOM, zoom: camera.zoom + 1 });
    },

    onSetZoom: function (camera, zoom) {
      const update = {
        zoom: zoom - 1
      };
      dispatch({ type: UPDATE_CAMERA, camera, update });
    },

    onCreateCameraTypeFromCamera: function (camera) {
      const cameraType = new CameraType({
        widthInMillimeters: camera.widthInMillimeters,
        heightInMillimeters: camera.heightInMillimeters,
        defaultZoom: camera.zoom
      });
      dispatch({ type: ADD_CAMERA_TYPE, cameraType });
    }
  };
};

const Results = connect(mapStateToProps, mapDispatchToProps)(_Results);

module.exports = Results;