const _ = require('lodash/core');
const React = require('react');
const ReactDOM = require('react-dom');
const { Camera } = require('shared/Camera');
const { connect } = require('react-redux');

const {
  UPDATE_CAMERA_LOCATION,
  REMOVE_CAMERA,
  SELECT_CAMERA,
  ADD_CAMERA,
  CHANGE_MAP_ZOOM,
  SELECT_CAMERA_TYPE
} = require('shared/actions');


if (typeof window != 'undefined') {
  require('client/vendor/leaflet-mapbox-gl');
  require('client/vendor/L.Path.Transform');
  require('client/vendor/L.Path.Drag'); // patched version
}

var COMPIEGNE_LATLNG = [49.41794, 2.82606];

var layerFromCamera = function (camera, options) {
  const layer = L.polygon(camera.polygon._latlngs, _.merge({
    draggable: true,
    color: 'black',
    opacity: 0.1,
    transform: true,
    weight: 1
  }, options));
  return layer;
};


class _LeafletMap extends React.Component {
  componentDidMount () {
    // Create a map in the div #map
    var mapContainer = ReactDOM.findDOMNode(this.refs.map);
    this.map = L.map(mapContainer, {
      fadeAnimation: false
    });

    this.updateGLMap();

    this.map.setView(COMPIEGNE_LATLNG, 17);
    this.map.on('click', (ev) => {
      if (!ev.originalEvent.defaultPrevented) {
        this.props.onClickMap(ev.latlng);
      }
    });

    this.map.on('zoomend', (ev) => {
      this.props.onChangeZoom(this.map.getZoom());
    });

    window.map = this.map;
    //this.loadGpx();
    this.update();
  }

  loadGpx () {
    var gpx = '/e.gpx';
    new L.GPX(gpx, {async: true}).on('loaded', function(e) {
    }).addTo(this.map);
  }

  componentDidUpdate (prevProps) {
    this.update();

    if (
      prevProps.mapboxLogin !== this.props.mapboxLogin ||
      prevProps.mapboxMapId !== this.props.mapboxMapId ||
      prevProps.mapboxAccessToken !== this.props.mapboxAccessToken) {
      this.updateGLMap();
    }

    if (prevProps.initialCenter !== this.props.initialCenter) {
      this.map.setCenter(this.props.initialCenter);
    }

    if (prevProps.initialZoom !== this.props.initialZoom) {
      this.map.setZoom(this.props.initialZoom);
    }
  }

  updateGLMap () {
    const { mapboxLogin, mapboxMapId, mapboxAccessToken } = this.props;

    if (this.gl) {
      this.map.removeLayer(this.gl);
    }
    this.gl = L.mapboxGL({
      style: `mapbox://styles/${ mapboxLogin }/${ mapboxMapId }`,
      accessToken: mapboxAccessToken
    }).addTo(this.map);
  }

  update () {
    console.log('Update map layers');
    _.each(this.layers, (layer) => {
      this.map.removeLayer(layer);
    });
    this.layers = _.map(this.props.cameras, camera => {
      const isSelected = camera.id == this.props.selectedCameraId;
      var layer = layerFromCamera(camera, {
        opacity: isSelected ? '0.5' : '0.1',
        weight: isSelected ? 3 : 1,
        className: 'camera-path' + (isSelected ? ' camera-path__selected': '')
      });

      if (isSelected) {
        layer.on('add', function () {
          layer.transform.setOptions({
            scaling: true,
            rotation: true
          }).enable();
        });

        layer.on('scalend', function () {

        });
      }

      layer.on('remove', function () {
        layer.transform.disable();
      });

      layer.on('click', (ev) => {
        ev.originalEvent.preventDefault();
        ev.originalEvent.stopPropagation();
        this.props.onClickCamera(camera);
        window.layer = layer;
      });
      layer.on('dblclick', (ev) => {
        ev.originalEvent.stopPropagation();
        this.props.onDoubleClickCamera(camera);
      });
      layer.on('dragend', (ev) => {
        const newLocation = ev.target;
        this.props.onMoveCamera(camera, newLocation);
        this.props.onClickCamera(camera);
      });
      return layer;
    });
    _.each(this.layers, (layer) => {
      this.map.addLayer(layer);
    });
  }

  render () {
    return <div
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      ref='map'></div>;
  }
}

const mapStateToProps = function (state) {
  state = state.present;
  return {
    cameras: state.cameras,
    selectedCameraId: state.selectedCameraId,
    selectedCameraType: state.selectedCameraType
  };
};

const mapDispatchToProps = function (dispatch, ownProps) {
  return {
    onMoveCamera: function (camera, newLocation) {
      dispatch({ type: UPDATE_CAMERA_LOCATION, newLocation, camera });
    },

    onClickCamera: function (camera) {
      dispatch({ type: SELECT_CAMERA, camera });
    },

    onDoubleClickCamera: function (camera) {
      dispatch({ type: REMOVE_CAMERA, camera });
    },

    onChangeZoom: function (zoom) {
      dispatch({ type: CHANGE_MAP_ZOOM, zoom });
    },

    onClickMap: function (latlng) {
      var { selectedCameraType } = this;
      if (!selectedCameraType) {
        dispatch({ type: SELECT_CAMERA, camera: null });
      } else {
        const camera = new Camera({
          widthInMillimeters: selectedCameraType.widthInMillimeters,
          heightInMillimeters: selectedCameraType.heightInMillimeters,
          latlng: [latlng.lat, latlng.lng],
          zoom: selectedCameraType.defaultZoom
        });
        dispatch({ type: ADD_CAMERA, camera });
        dispatch({ type: SELECT_CAMERA, camera });
        dispatch({ type: SELECT_CAMERA_TYPE, cameraType: null });
      }
    }
  };
};

const LeafletMap = connect(mapStateToProps, mapDispatchToProps)(_LeafletMap);

module.exports = LeafletMap;