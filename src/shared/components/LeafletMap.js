const _ = require('lodash/core');
const React = require('react');
const ReactDOM = require('react-dom');
const { Camera } = require('shared/models');
const { connect } = require('react-redux');

const {
  UPDATE_CAMERA,
  REMOVE_CAMERA,
  SELECT_CAMERA,
  ADD_CAMERA,
  SET_MAP_ZOOM,
  SELECT_CAMERA_TYPE
} = require('shared/actions');


if (typeof window != 'undefined') {
  require('client/vendor/leaflet-mapbox-gl');
  require('client/vendor/L.Path.Transform');
  require('client/vendor/L.Path.Drag'); // patched version
}

var COMPIEGNE_LATLNG = [49.41794, 2.82606];

var layerFromCamera = function (camera, options) {
  const layer = L.rectangle(camera.polygon._latlngs, _.assignIn({
    draggable: true,
    color: 'black',
    opacity: 0.1,
    transform: true,
    weight: 1,
    camera
  }, options));
  return layer;
};


class _LeafletMap extends React.Component {
  componentDidMount () {
    // Create a map in the div #map
    var mapContainer = ReactDOM.findDOMNode(this.refs.map);

    const editableGroup = this.editableGroup = L.featureGroup([]);
    const map = this.map = L.map(mapContainer, {
      fadeAnimation: false,
      minZoom: 0,
      maxZoom: 22
    });

    map.addLayer(editableGroup);

    const drawOptions = {
      draw: {
        circle: false,
        marker: false,
        polyline: false,
        polygon: false
      },
      edit: {
        featureGroup: editableGroup,
        remove: false
      }
    };

    const drawControl = new L.Control.Draw(drawOptions);
    map.addControl(drawControl);

    map.on('draw:created', event => {
      const layer = event.layer;
      this.props.onCreateCameraFromLayer(layer, map.getZoom());
    });

    map.on('draw:edited', event => {
      const layers = event.layers;
      layers.eachLayer(layer => {
        this.props.onResizeCamera(layer.options.camera, layer);
      });
    });

    this.updateGLMap();

    map.setView(COMPIEGNE_LATLNG, this.props.zoom);

    map.on('click', (ev) => {
      if (!ev.originalEvent.defaultPrevented) {
        this.props.onClickMap(ev.latlng);
      }
    });

    map.on('zoomend', (ev) => {
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

    if (prevProps.zoom !== this.props.zoom) {
      this.map.setZoom(this.props.zoom);
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

  handleClickLayer (camera, ev) {
    ev.originalEvent.preventDefault();
    ev.originalEvent.stopPropagation();
    this.props.onSelectCamera(camera);
  }

  handleDragLayer (camera, ev) {
    const newLocation = ev.target;
    this.props.onMoveCamera(camera, newLocation);
    this.props.onSelectCamera(camera);
  }

  handleDblClickCamera (camera, ev) {
    ev.originalEvent.stopPropagation();
    this.props.onDoubleClickCamera(camera);
  }

  update () {
    _.each(this.layers, (layer) => {
      this.map.removeLayer(layer);
      this.editableGroup.removeLayer(layer);
    });
    this.layers = _.map(this.props.cameras, camera => {
      const isSelected = camera.id == this.props.selectedCameraId;
      var layer = layerFromCamera(camera, {
        opacity: isSelected ? '0.5' : '0.1',
        weight: isSelected ? 1 : 1,
        color: (camera.zoom == this.props.zoom - 1) ? 'green' : 'red',
        className: 'camera-path' + (isSelected ? ' camera-path__selected': '')
      });

      layer.on('remove', function () {
        layer.transform.disable();
      });

      layer.on('click', this.handleClickLayer.bind(this, camera));
      layer.on('dragend', this.handleDragLayer.bind(this, camera));
      layer.on('dblclick', this.handleDblClickCamera.bind(this, camera));

      if (isSelected) {
        this.editableGroup.addLayer(layer);
      } else {
        this.map.addLayer(layer);
      }
      return layer;
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
    selectedCameraType: state.selectedCameraType,
    zoom: state.map.zoom
  };
};

const mapDispatchToProps = function (dispatch, ownProps) {
  return {
    onMoveCamera: function (camera, newLocation) {
      const center = newLocation.getBounds().getCenter();
      const update = {
        polygon: newLocation,
        latlng: [center.lat, center.lng]
      };
      dispatch({ type: UPDATE_CAMERA, camera, update });
    },

    onSelectCamera: function (camera) {
      dispatch({ type: SELECT_CAMERA, camera });
    },

    onDoubleClickCamera: function (camera) {
      dispatch({ type: REMOVE_CAMERA, camera });
    },

    onChangeZoom: function (zoom) {
      dispatch({ type: SET_MAP_ZOOM, zoom });
    },

    onResizeCamera: function (camera, layer) {
      const update = Camera.getOptionsFromLayer(layer, camera.zoom, camera.ppi);
      dispatch({ type: UPDATE_CAMERA, camera, update });
    },

    onCreateCameraFromLayer: function (layer, zoom) {
      const cameraOptions = Camera.getOptionsFromLayer(layer, zoom);
      const camera = new Camera(cameraOptions);
      dispatch({ type: ADD_CAMERA, camera });
    },

    onClickMap: function (latlng) {
      var { selectedCameraType } = this;
      if (!selectedCameraType) {
        // dispatch({ type: SELECT_CAMERA, camera: null });
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