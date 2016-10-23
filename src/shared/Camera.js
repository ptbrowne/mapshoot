const _ = require('lodash');
const MILLIMETER_PER_INCH = 25.4;

const { ACCESS_TOKEN, MAPBOX_MAP_ID, MAPBOX_LOGIN } = require('./settings');

const getStaticMapURL = function (lng, lat, width, height, zoom) {
  width = Math.round(width);
  height = Math.round(height);
  return `https://api.mapbox.com/styles/v1/${MAPBOX_LOGIN}/${MAPBOX_MAP_ID}/static/${lat},${lng},${zoom},0.00,0.00/${width}x${height}?access_token=${ACCESS_TOKEN}`;
};

class CameraType {
  constructor (options) {
    this.widthInMillimeters = options.widthInMillimeters;
    this.heightInMillimeters = options.heightInMillimeters;
    this.ppi = options.ppi || 300;
    this.defaultZoom = options.defaultZoom;
  }
}

class Camera {
  constructor (options) {
    this.widthInMillimeters = options.widthInMillimeters;
    this.heightInMillimeters = options.heightInMillimeters;
    this.ppi = options.ppi || 300;
    this.zoom = options.zoom;
    this.latlng = options.latlng;
    this.map = options.map;

    if (!options.polygon) {
      this.updatePolygon();
    } else {
      this.polygon = options.polygon;
    }
  }

  updatePolygon () {
    this.polygon = this.getPolygon();
  }

  getPolygon () {
    // pixel per millimeters 
    var ppmm = this.ppi / MILLIMETER_PER_INCH;
    var widthPx = this.widthInMillimeters * ppmm;
    var heightPx = this.heightInMillimeters * ppmm;

    var latlng = L.latLng(this.latlng);
    var centerPx = this.map.project(latlng, this.zoom);

    var xMin = centerPx.x - widthPx/2;
    var xMax = xMin + widthPx;

    var yMin = centerPx.y - heightPx/2;
    var yMax = yMin + heightPx;

    var poly = Camera.makeRectangle([
      this.map.unproject([xMin, yMin], this.zoom),
      this.map.unproject([xMax, yMin], this.zoom),
      this.map.unproject([xMax, yMax], this.zoom),
      this.map.unproject([xMin, yMax], this.zoom)
    ]);

    return poly;
  }

  getPixelDimensions () {
    var ppmm = this.ppi / MILLIMETER_PER_INCH * 2;
    var widthPx = this.widthInMillimeters * ppmm;
    var heightPx = this.heightInMillimeters * ppmm;
    return [widthPx, heightPx];
  }

  getCenter () {
    return this.latlng;
  }

  getRenderString () {
    const [ latitude, longitude ] = this.getCenter();
    const [ widthPx, heightPx ] = this.getPixelDimensions();
    return getStaticMapURL(latitude, longitude, widthPx, heightPx, this.zoom);
  }


  updateFromPolygon (polygon) {
    this.polygon = polygon;
    const latlng = polygon.getBounds().getCenter();
    this.latlng = [latlng.lat, latlng.lng];
  }

  toJSON () {
    return {
      widthInMillimeters: this.widthInMillimeters,
      heightInMillimeters: this.heightInMillimeters,
      ppi: this.ppi,
      zoom: this.zoom,
      latlng: this.latlng,
      polygon: this.polygon._latlngs[0].map(l => [l.lat, l.lng])
    };
  }
}

Camera.makeRectangle = function (latlngs) {
  return L.rectangle(latlngs, {
    draggable: true,
    color: 'black',
    opacity: 0.1,
    weight: 1
  });
};

Camera.fromJSON = function (j) {
  try {
    return new Camera({
      widthInMillimeters: j.widthInMillimeters,
      heightInMillimeters: j.heightInMillimeters,
      ppi: j.ppi,
      zoom: j.zoom,
      latlng: j.latlng,
      polygon: Camera.makeRectangle(j.polygon)
    });
  } catch (e) {
    throw new Error('Bad camera' + JSON.stringify(j, null, 2));
  }
};

module.exports = {
  Camera,
  CameraType
};