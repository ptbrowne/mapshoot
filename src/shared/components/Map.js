const React = require('react');
const ReactDOM = require('react-dom');
const _ = require('lodash');

if (typeof window != 'undefined') {
  require('../leaflet-mapbox-gl');
}

var COMPIEGNE_LATLNG = [49.41794, 2.82606];
const { ACCESS_TOKEN, MAPBOX_LOGIN, MAPBOX_MAP_ID } = require('../settings');

var layerFromCamera = function (camera, options) {
  var latlngs = camera.polygon._latlngs;
  return L.rectangle(latlngs, _.merge({
    draggable: true,
    color: 'black',
    opacity: 0.1,
    weight: 1
  }, options));
};


class Map extends React.Component {
  componentDidMount () {
    // Create a map in the div #map
    var mapContainer = ReactDOM.findDOMNode(this.refs.map);
    this.map = L.map(mapContainer, {
      fadeAnimation: false
    });
  // create the tile layer with correct attribution
  var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
  var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});
  this.map.addLayer(osm);
    var gl = L.mapboxGL({
        style: `mapbox://styles/${ MAPBOX_LOGIN }/${ MAPBOX_MAP_ID }`,
        accessToken: ACCESS_TOKEN
    }).addTo(this.map);
    //osm.addTo(this.map);

    this.map.setView(COMPIEGNE_LATLNG, 17);
    this.map.on('click', (ev) => {
      this.props.onClick(ev.latlng);
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
    console.log('upadtelayers!');
    _.each(this.layers, (layer) => {
      this.map.removeLayer(layer);
    });
    this.layers = _.map(this.props.cameras, camera => {
      const isSelected =  camera == this.props.selectedCamera;
      var layer = layerFromCamera(camera, {
        opacity: isSelected ? '0.5' : '0.1',
        weight: isSelected ? '3px' : '1px',
        className: 'camera-path' + (isSelected ? ' camera-path__selected': '')
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
    return <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}} ref='map'></div>;
  }
}

module.exports = Map;