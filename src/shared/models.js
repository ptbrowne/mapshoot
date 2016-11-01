const MILLIMETER_PER_INCH = 25.4;

const PROJECTION = L.CRS.EPSG3395;


const getStaticMapURL = function (lng, lat, width, height, zoom, mapboxLogin, mapboxMapId, mapboxAccessToken) {
  width = Math.round(width);
  height = Math.round(height);
  return `https://api.mapbox.com/styles/v1/${mapboxLogin}/${mapboxMapId}/static/${lat},${lng},${zoom},0.00,0.00/${width}x${height}@2x?access_token=${mapboxAccessToken}`;
};

const defaultPPI = 300;

class CameraType {
  constructor (options) {
    this.widthInMillimeters = options.widthInMillimeters;
    this.heightInMillimeters = options.heightInMillimeters;
    this.ppi = options.ppi || defaultPPI;
    this.defaultZoom = options.defaultZoom;
  }
}

class Camera {
  constructor (options) {
    this.widthInMillimeters = options.widthInMillimeters;
    this.heightInMillimeters = options.heightInMillimeters;
    this.ppi = options.ppi || defaultPPI;
    this.zoom = options.zoom;
    this.latlng = options.latlng;

    this.id = options.id ? Camera.registerId(options.id) : Camera.makeId();

    if (!options.polygon) {
      this.updatePolygon();
    } else {
      this.polygon = options.polygon;
    }
  }

  copy () {
    return new Camera({
      widthInMillimeters: this.widthInMillimeters,
      heightInMillimeters: this.heightInMillimeters,
      ppi: this.ppi,
      id: this.id,
      latlng: this.latlng,
      polygon: this.polygon,
      zoom: this.zoom
    });
  }

  imUpdate (update) {
    const newCam = Object.assign(this.copy(), update);
    if (!update.polygon) {
      newCam.updatePolygon();
    }
    return newCam;
  }

  updatePolygon () {
    this.polygon = this.getPolygon();
  }

  getPolygon () {
    // pixel per millimeters 
    const ppmm = this.ppi / MILLIMETER_PER_INCH;
    const widthPx = this.widthInMillimeters * ppmm;
    const heightPx = this.heightInMillimeters * ppmm;

    const latlng = L.latLng(this.latlng);
    const centerPx = PROJECTION.latLngToPoint(latlng, this.zoom);

    const xMin = centerPx.x - widthPx/2;
    const xMax = xMin + widthPx;

    const yMin = centerPx.y - heightPx/2;
    const yMax = yMin + heightPx;

    const poly = Camera.makeRectangle([
      PROJECTION.pointToLatLng(L.point([xMin, yMin]), this.zoom),
      PROJECTION.pointToLatLng(L.point([xMax, yMin]), this.zoom),
      PROJECTION.pointToLatLng(L.point([xMax, yMax]), this.zoom),
      PROJECTION.pointToLatLng(L.point([xMin, yMax]), this.zoom)
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

  getRenderString (mapboxLogin, mapboxMapId, mapboxAccessToken) {
    const [ latitude, longitude ] = this.getCenter();
    const [ widthPx, heightPx ] = this.getPixelDimensions();
    return getStaticMapURL(latitude, longitude, widthPx, heightPx, this.zoom, mapboxLogin, mapboxMapId, mapboxAccessToken);
  }


  updateFromPolygon (polygon) {
    this.polygon = polygon;
    const latlng = polygon.getBounds().getCenter();
    this.latlng = [latlng.lat, latlng.lng];
  }

  toJSON () {
    return {
      id: this.id,
      widthInMillimeters: this.widthInMillimeters,
      heightInMillimeters: this.heightInMillimeters,
      ppi: this.ppi,
      zoom: this.zoom,
      latlng: this.latlng,
      polygon: this.polygon._latlngs[0].map(l => [l.lat, l.lng])
    };
  }
}

Camera.previousId = -1;
Camera.makeId = () => {
  Camera.previousId = Camera.previousId + 1;
  return 'camera' + Camera.previousId;
};

Camera.getOptionsFromLayer = function (layer, zoom, ppi) {
  ppi = ppi || defaultPPI;
  const bounds = L.latLngBounds(layer._latlngs);
  const nw = bounds.getNorthWest();
  const se = bounds.getSouthEast();
  const nwPixel = PROJECTION.latLngToPoint(nw, zoom);
  const sePixel = PROJECTION.latLngToPoint(se, zoom);
  const xMin = nwPixel.x;
  const yMin = nwPixel.y;
  const xMax = sePixel.x;
  const yMax = sePixel.y;
  const widthPx = xMax - xMin;
  const heightPx = yMax - yMin;

  const ppmm = ppi / MILLIMETER_PER_INCH;
  const widthInMillimeters = Math.round(widthPx / ppmm);
  const heightInMillimeters = Math.round(heightPx / ppmm);
  const center = bounds.getCenter();

  return {
    widthInMillimeters: widthInMillimeters,
    heightInMillimeters: heightInMillimeters,
    latlng: [center.lat, center.lng],
    polygon: layer,
    zoom: zoom,
    ppi: ppi
  };
};

Camera.registerId = function (id) {
  Camera.previousId = parseInt(id.replace(/^camera/, ''), 10);
  return id;
};

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
      id: j.id,
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