const React = require('react');
const ReactDOM = require('react-dom');
const _ = require('lodash');

if (typeof window != 'undefined') {
  require('../leaflet-mapbox-gl');
  require('../../client/vendor/L.Path.Transform');
  require('../../client/vendor/L.Path.Drag');
}

var COMPIEGNE_LATLNG = [49.41794, 2.82606];

var layerFromCamera = function (camera, options) {
  const arr = camera.polygon._latlngs.map(l => l.map(x => [x.lat, x.lng]));
  return L.polygon(camera.polygon._latlngs, _.merge({
    draggable: true,
    color: 'black',
    opacity: 0.1,
    weight: 1
  }, options));
};


class LeafletMap extends React.Component {
  componentDidMount () {
    // Create a map in the div #map
    var mapContainer = ReactDOM.findDOMNode(this.refs.map);
    this.map = L.map(mapContainer, {
      fadeAnimation: false
    });

    const { mapboxLogin, mapboxMapId, mapboxAccessToken } = this.props;

    L.mapboxGL({
        style: `mapbox://styles/${ mapboxLogin }/${ mapboxMapId }`,
        accessToken: mapboxAccessToken
    }).addTo(this.map);

    this.map.setView(COMPIEGNE_LATLNG, 17);
    this.map.on('click', (ev) => {
      if (!ev.originalEvent.defaultPrevented) {
        this.props.onClick(ev.latlng);
      }
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

  componentDidUpdate () {
    this.update();
  }

  update () {
    _.each(this.layers, (layer) => {
      this.map.removeLayer(layer);
    });
    this.layers = _.map(this.props.cameras, camera => {
      const isSelected =  camera == this.props.selectedCamera;
      var layer = layerFromCamera(camera, {
        opacity: isSelected ? '0.5' : '0.1',
        weight: isSelected ? 3 : 1,
        className: 'camera-path' + (isSelected ? ' camera-path__selected': '')
      });
      layer.on('click', (ev) => {
        console.log(ev.originalEvent);
        ev.originalEvent.preventDefault();
        ev.originalEvent.stopPropagation();
        this.props.onClickCamera(camera);
      });
      layer.on('dblclick', (ev) => {
        ev.originalEvent.stopPropagation();
        this.props.onDoubleClickCamera(camera);
      });
      layer.on('dragend', (ev) => {
        camera.updateFromPolygon(ev.target);
        this.props.onMoveCamera(camera);
        this.props.onClickCamera(camera);
      });
      return layer;
    });
    _.each(this.layers, (layer) => {
      this.map.addLayer(layer);
    });
  }

  render () {
    return <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}ref='map'></div>;
  }
}

module.exports = LeafletMap;