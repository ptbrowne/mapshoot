import React from 'react';
import _ from 'lodash/core';
import { connect } from 'react-redux';
import { ActionTypes } from 'redux-undo';
import ActionHistory from 'shared/components/ActionHistory';
import { CameraType } from 'shared/models';

import {
  CLEAR_CAMERAS,
  SELECT_CAMERA,
  UPDATE_CAMERA,
  ADD_CAMERA_TYPE,
  REMOVE_CAMERA,
  SET_MAP_VIEW,
} from 'shared/actions';

class _Snapshots extends React.Component {
  render () {
    const { cameras, onClearCameras, onSelectCamera } = this.props;
    const { mapboxLogin, mapboxMapId, mapboxAccessToken } = this.props;
    return cameras.length ? <div className='panel-section'>
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
      </div> : null ;
  }
}

const Snapshots = connect(state => {
  state = state.present;
  const { settings, cameras } = state;
  return {
    cameras: cameras,
    mapboxLogin: settings.mapboxLogin,
    mapboxMapId: settings.mapboxMapId,
    mapboxAccessToken: settings.mapboxAccessToken
  };
}, dispatch => ({
  onClearCameras: function () {
    dispatch({ type: CLEAR_CAMERAS });
  },

  onSelectCamera: function (camera) {
    dispatch({ type: SELECT_CAMERA, camera });
  }
}))(_Snapshots);


class _SelectedCamera extends React.Component {
  constructor () {
    super();
    this.handleClickZoom = this.handleClickZoom.bind(this);
  }

  handleClickZoom () {
    const { selectedCamera } = this.props;
    this.props.onChangeZoom(selectedCamera.zoom);
  }

  render () {
    const { selectedCamera } = this.props;
    const { onSelectCamera,
        onRemoveCamera, onCreateCameraTypeFromCamera,
        onViewZoom, onSetZoom } = this.props;
    const { mapboxMapId, mapboxAccessToken, mapboxLogin } = this.props.settings;
    const url = selectedCamera ? selectedCamera.getRenderString(mapboxLogin, mapboxMapId, mapboxAccessToken) : null;
    const rightZoom = selectedCamera ? selectedCamera.zoom == this.props.mapZoom - 1 : false;
    return selectedCamera ? <div className='panel-section'>
        <h2><i className='fa fa-camera'/> Current camera</h2>
        <img className='results__selected-camera' src={ url } /><br/>
        <p>
          <span className={ rightZoom ? 'bg--green' : 'bg--red' }>
            { rightZoom ? 'Camera and map at same zoom level' : 'Camera and map at different zoom levels'}
          </span><br/>
          width: { selectedCamera.widthInMillimeters }mm<br/>
          height: { selectedCamera.heightInMillimeters }mm
        </p>
        <div className='section__actions'>
          <a href={ url } download className='btn btn--green'>
            <i className='fa fa-arrow-down' /> Download
          </a>
          <button className='btn btn--red' onClick={ onRemoveCamera.bind(null, selectedCamera) } >
            <i className='fa fa-times'/> Remove
          </button>
          <button onClick={ onCreateCameraTypeFromCamera.bind(null, selectedCamera) }
              className='btn btn--green'>
            <i className='fa fa-camera-retro'/> Create camera type
          </button>
          <button onClick={ onViewZoom.bind(null, selectedCamera) }
              className='btn btn--purple'>
            <i className='fa fa-search-plus'/> Center on camera
          </button>
          <button onClick={ () => onSetZoom(selectedCamera, this.props.mapZoom) }
              className='btn btn--purple'>
            <i className='fa fa-pencil'/> Set zoom to map zoom
          </button>
          <button onClick={ () => onSelectCamera(null) }
              className='btn btn--purple'>
            Deselect camera
          </button>
        </div>
      </div> : null;
  }
}

const mapStateToProps = function (state) {
  state = state.present;

  const cameras = state.cameras;
  const selectedCamera = _.find(cameras, x => x.id == state.selectedCameraId);
  return {
    cameras: state.cameras,
    selectedCamera: selectedCamera,
    mapZoom: state.map.zoom,
    settings: state.settings
  };
};

const mapDispatchToProps = function (dispatch) {
  return {
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
      dispatch({ type: SET_MAP_VIEW, center: camera.latlng, zoom: camera.zoom + 1 });
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

const SelectedCamera = connect(mapStateToProps, mapDispatchToProps)(_SelectedCamera);



class _Results extends React.Component {
  render () {
    return <div>
      <Snapshots />
      <SelectedCamera />
      { false ? <ActionHistory /> : null }
    </div>;
  }
}

const Results = connect(state => ({ mapZoom: state.present.map.zoom }), null)(_Results);

export default Results;