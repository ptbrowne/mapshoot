import _ from "lodash/core";
import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { Camera } from "../models";

import {
  UPDATE_CAMERA,
  SELECT_CAMERA,
  ADD_CAMERA,
  SELECT_CAMERA_TYPE,
  SET_MAP_ZOOM,
  SET_MAP_VIEW
} from "../actions";


import "../../client/vendor/leaflet-mapbox-gl"
import "../../client/vendor/L.Path.Transform"
import "../../client/vendor/L.Path.Drag"


const layerFromCamera = function(camera, options) {
  if (camera._layer && _.isEqual(camera._layerOptions, options)) {
    return camera._layer;
  }

  const layer = L.rectangle(
    camera.polygon._latlngs,
    _.assignIn(
      {
        draggable: true,
        color: "black",
        opacity: 0.1,
        transform: true,
        weight: 1,
        camera
      },
      options
    )
  );

  camera._layer = layer;
  camera._layerOptions = options;
  return layer;
};

const difference = function(a, b) {
  const res = [];
  if (!a) {
    return [];
  }
  if (!b) {
    return a;
  }
  const la = a.length;
  const lb = b.length;
  for (let i = 0; i < la; i++) {
    var toAdd = true;
    for (let j = 0; j < lb; j++) {
      if (a[i] === b[j]) {
        toAdd = false;
        break;
      }
    }
    if (toAdd) {
      res.push(a[i]);
    }
  }
  return res;
};

class _LeafletMap extends React.Component {
  componentDidMount() {
    // Create a map in the div #map
    var mapContainer = ReactDOM.findDOMNode(this.refs.map);

    const editableGroup = (this.editableGroup = L.featureGroup([]));
    const map = (this.map = L.map(mapContainer, {
      fadeAnimation: false,
      minZoom: 0,
      maxZoom: 22
    }));

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

    map.on("draw:created", event => {
      const layer = event.layer;
      this.props.onCreateCameraFromLayer(layer, map.getZoom());
    });

    map.on("draw:edited", event => {
      const layers = event.layers;
      layers.eachLayer(layer => {
        this.props.onResizeCamera(layer.options.camera, layer);
      });
    });

    this.updateGLMap();

    map.setView(this.props.center, this.props.zoom);

    map.on("click", ev => {
      if (!ev.originalEvent.defaultPrevented) {
        this.props.onClickMap(ev.latlng);
      }
    });

    map.on("zoomend", ev => {
      this.props.onChangeZoom(this.map.getZoom());
    });

    map.on("moveend", ev => {
      this.props.onChangeCenter(this.map.getCenter());
    });

    window.map = this.map;
    //this.loadGpx();
    this.update();
  }

  loadGpx() {
    var gpx = "/e.gpx";
    new L.GPX(gpx, { async: true })
      .on("loaded", function(e) {})
      .addTo(this.map);
  }

  componentDidUpdate(prevProps) {
    this.update();

    if (
      prevProps.mapboxStyleURL !== this.props.mapboxStyleURL ||
      prevProps.mapboxAccessToken !== this.props.mapboxAccessToken
    ) {
      this.updateGLMap();
    }

    const changedCenter = !_.isEqual(prevProps.center, this.props.center);
    const changedZoom = prevProps.zoom !== this.props.zoom;

    if (changedCenter && changedZoom) {
      this.map.setView(this.props.center, this.props.zoom);
    } else if (changedCenter) {
      this.map.setView(this.props.center);
    } else if (changedZoom) {
      this.map.setZoom(this.props.zoom);
    }
  }

  updateGLMap() {
    const { mapboxStyleURL, mapboxAccessToken } = this.props;

    if (this.gl) {
      this.map.removeLayer(this.gl);
    }

    this.gl = L.mapboxGL({
      style: mapboxStyleURL,
      accessToken: mapboxAccessToken
    }).addTo(this.map);
  }

  handleClickLayer(camera, ev) {
    ev.originalEvent.preventDefault();
    ev.originalEvent.stopPropagation();
    this.props.onSelectCamera(camera);
  }

  handleDragLayer(camera, ev) {
    const newLocation = ev.target;
    this.props.onMoveCamera(camera, newLocation);
    this.props.onSelectCamera(camera);
  }

  update() {
    const oldLayers = this.layers;

    // update
    this.layers = _.map(this.props.cameras, camera => {
      const isSelected = camera.id == this.props.selectedCameraId;
      var layer = layerFromCamera(camera, {
        isSelected: isSelected,
        opacity: isSelected ? "0.5" : "0.1",
        weight: isSelected ? 1 : 1,
        color: camera.zoom == this.props.zoom - 1 ? "green" : "red",
        className: "camera-path" + (isSelected ? " camera-path__selected" : "")
      });

      layer.on("add", () => {
        layer.on("remove", function() {
          layer.transform.disable();
        });

        layer.on("click", this.handleClickLayer.bind(this, camera));
        layer.on("dragend", this.handleDragLayer.bind(this, camera));
      });

      return layer;
    });

    const toRemove = difference(oldLayers, this.layers);
    const toAdd = difference(this.layers, oldLayers);

    // remove
    _.each(toRemove, layer => {
      this.map.removeLayer(layer);
      this.editableGroup.removeLayer(layer);
    });

    // add
    _.each(toAdd, layer => {
      const isSelected = layer.options.isSelected;
      if (isSelected) {
        this.editableGroup.addLayer(layer);
      } else {
        this.map.addLayer(layer);
      }
    });
  }

  render() {
    return (
      <div
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        ref="map"
      ></div>
    );
  }
}

const mapStateToProps = function(state) {
  state = state.present;
  return {
    cameras: state.cameras,
    selectedCameraId: state.selectedCameraId,
    selectedCameraType: state.selectedCameraType,
    zoom: state.map.zoom,
    center: state.map.center,
    mapboxStyleURL: state.settings.mapboxStyleURL,
    mapboxAccessToken: state.settings.mapboxAccessToken
  };
};

const mapDispatchToProps = function(dispatch, ownProps) {
  return {
    onMoveCamera: function(camera, newLocation) {
      const center = newLocation.getBounds().getCenter();
      const update = {
        polygon: newLocation,
        latlng: [center.lat, center.lng]
      };
      dispatch({ type: UPDATE_CAMERA, camera, update });
    },

    onSelectCamera: function(camera) {
      dispatch({ type: SELECT_CAMERA, camera });
    },

    onChangeZoom: function(zoom) {
      dispatch({ type: SET_MAP_ZOOM, zoom });
    },

    onChangeCenter: function(center) {
      dispatch({ type: SET_MAP_VIEW, center: [center.lat, center.lng] });
    },

    onResizeCamera: function(camera, layer) {
      const update = Camera.getOptionsFromLayer(layer, camera.zoom, camera.ppi);
      dispatch({ type: UPDATE_CAMERA, camera, update });
    },

    onCreateCameraFromLayer: function(layer, zoom) {
      // TODO why -1 ?
      const cameraOptions = Camera.getOptionsFromLayer(layer, zoom - 1);
      const camera = new Camera(cameraOptions);
      dispatch({ type: ADD_CAMERA, camera });
    },

    onClickMap: function(latlng) {
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

const LeafletMap = connect(
  mapStateToProps,
  mapDispatchToProps
)(_LeafletMap);

export default LeafletMap;
