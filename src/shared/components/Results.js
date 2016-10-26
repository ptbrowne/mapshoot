const React = require('react');
const _ = require('lodash');

const { connect } = require('react-redux');
const { CLEAR_CAMERAS, SELECT_CAMERA, REMOVE_CAMERA } = require('shared/actions');
const { ActionTypes } = require('redux-undo');


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
    const { onClearCameras, onSelectCamera, onRemoveCamera } = this.props;
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
          </button>
        </div>
      </div> : null }
    </div>;
  }
}

const mapStateToProps = function (state) {
  state = state.present;

  const cameras = state.cameras;
  const selectedCamera = _.find(cameras, x => x.id == state.selectedCameraId);
  return {
    cameras: state.cameras,
    selectedCamera: selectedCamera
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
    }
  };
};

const Results = connect(mapStateToProps, mapDispatchToProps)(_Results);

module.exports = Results;