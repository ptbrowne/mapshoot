const Map = require('./Map');
const React = require('react');
const _ = require('lodash');


if (typeof window !== "undefined") {
  require('../style.scss');
  require('../../client/vendor/gpx');
  require('../../client/vendor/L.Path.Drag');
}

var COMPIEGNE_LATLNG = [49.41794, 2.82606];


const { Camera, CameraType } = require('../Camera');

class CameraTypeRenderer extends React.Component {
  render () {
    var { widthInMillimeters, heightInMillimeters, defaultZoom } = this.props.cameraType;
    return <div className={'camera-type ' + (this.props.selectde ? 'camera-type__selected' : '') }style={{
      width: widthInMillimeters,
      height: heightInMillimeters,
      marginRight: '0.25rem',
      marginBottom: '0.25rem',
      padding: '0.25rem',

    }}>
      {widthInMillimeters}x{heightInMillimeters} z{defaultZoom}
    </div>;
  }
}

class CameraTypes extends React.Component  {
  constructor () {
    super();
    this.handleCreateCameraType = this.handleCreateCameraType.bind(this);
  }

  handleCreateCameraType () {
    var widthInMillimeters = parseInt(window.prompt('Width in millimeters ?'), 10);
    if (!widthInMillimeters) { return; }
    var heightInMillimeters = parseInt(window.prompt('Height in millimeters ?'), 10);
    if (!heightInMillimeters) { return; }
    var defaultZoom = parseInt(window.prompt('Default zoom ?'), 10);
    if (!defaultZoom) { return; }

    this.props.onCreateCameraType({
      widthInMillimeters, 
      heightInMillimeters,
      defaultZoom
    });
  }

  render () {
    var camTypes = _.sortBy(this.props.cameraTypes, function (ct) {
      return [ct.widthInMillimeters, ct.heightInMillimeters, ct.defaultZoom];
    });
    return <div>
      { _.map(camTypes, (cameraType, i) =>
        <div key={ i } style={{ display: 'inline-block' }}
          onDoubleClick={ this.props.onDoubleClickCameraType.bind(null, cameraType) }
          onClick={ this.props.onClick.bind(null, cameraType) } > 
          <CameraTypeRenderer cameraType={ cameraType } selected={ cameraType == this.props.selectedCameraType } />
        </div>) }
      <div>
        <button onClick={ this.handleCreateCameraType }>add camera</button>&nbsp;
        <button onClick={ this.props.onClickClearCameras }>clear cameras</button>
      </div>
    </div>;
  }
}

class ImportExport extends React.Component {
  render () {
    return <div>
      <label className='btn'>Import<input type='file' onChange={ this.props.onImport } /></label>&nbsp;
      <a className='btn' download='data.json' href={ this.getExportData() }>Export</a>
    </div>;
  }

  getExportData () {
    var data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state));
    return data;
  }
}

class Results extends React.Component {
  render () {
    return <div>
      { _.map(this.props.cameras, camera => {
        return <img
          className='results__camera'
          onClick={ this.props.handleSelectCamera.bind(null, camera) }
          src={ camera.getRenderString() } />;
      })}
      
      { this.props.selectedCamera ? <img className='results__selected-camera' src={ this.props.selectedCamera.getRenderString() } /> : null }
    </div>;
  }
}

class App extends React.Component {

  constructor () {
    super();
    this.state = this.loadStateLS();
    this.handleCreateCameraType = this.handleCreateCameraType.bind(this);
    this.handleClickMap = this.handleClickMap.bind(this);
    this.handleDoubleClickCamera = this.handleDoubleClickCamera.bind(this);
    this.handleClickCameraType = this.handleClickCameraType.bind(this);
    this.handleClickClearCameras = this.handleClickClearCameras.bind(this);
    this.handleDoubleClickCameraType = this.handleDoubleClickCameraType.bind(this);
    this.handleMoveCamera = this.handleMoveCamera.bind(this);
    this.handleImportData = this.handleImportData.bind(this);
    this.handleClickCamera = this.handleClickCamera.bind(this);
    this.handleSelectCamera = this.handleSelectCamera.bind(this);
    this.handleClickClearCameras = this.handleClickClearCameras.bind(this);
  }


  handleImportData (ev) {
    var file = ev.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = (ev) => {
      this.setState(this.loadState(ev.target.result));
    };
  }

  handleMoveCamera (camera) {
    this.saveStateLS();
  }

  handleClickCameraType (cameraType) {
    this.setState({
      selectedCameraType: cameraType
    });
  }

  handleClickMap (latlng) {
    var cameraType = this.state.selectedCameraType;
    if (!cameraType) {
      window.alert('select camera type first');
    }
    this.state.cameras.push(new Camera({
      widthInMillimeters: cameraType.widthInMillimeters,
      heightInMillimeters: cameraType.heightInMillimeters,
      latlng: [latlng.lat, latlng.lng],
      zoom: cameraType.defaultZoom,
      map: this.refs.map.map
    }));
    this.setState({ cameras: this.state.cameras });
    this.saveStateLS();
  }

  loadStateLS () {
    var localState = localStorage.getItem('state');
    return this.loadState(localState);
  }

  loadState (state) {
    var init = {
      cameraTypes: [],
      cameras: [],
      center: COMPIEGNE_LATLNG
    };
    if (!state) {
      return init;
    }
    try {
      var s = JSON.parse(state);
      if (!s) { return init; }
      s.cameraTypes = _.map(s.cameraTypes, (ct) => new CameraType(ct));
      s.cameras = _.map(s.cameras, (jsonCamera) => Camera.fromJSON(jsonCamera));
      if (s.selectedCamera) {
        s.selectedCamera = Camera.fromJSON(s.selectedCamera);
      }
      return s;
    } catch (e) {
      localStorage.removeItem('state');
      console.warn('Error while loading previous state', e);
      return init;
    }
  }

  saveStateLS () {
    var s = JSON.stringify(this.state);
    localStorage.setItem('state', s);
  }

  componentDidUpdate () {
    this.saveStateLS();
  }


  clearCameras () {
    this.setState({ cameras: []});
  }

  handleClickClearCameras () {
    if (window.confirm('Are you sure to clear the cameras ?')) {
      this.clearCameras();
    }
  }

  handleCreateCameraType (options) {
    var newCt = new CameraType(options);
    this.state.cameraTypes.push(newCt);
    this.setState({
      selectedCameraType: newCt,
      cameraTypes: this.state.cameraTypes
    });

  }

  handleDoubleClickCamera (camera) {
    var indexCam = this.state.cameras.indexOf(camera);
    if (indexCam > -1) {
      this.state.cameras.splice(indexCam, 1);
      this.setState({
        cameras: this.state.cameras
      });
    }
  }

  handleDoubleClickCameraType (cameraType) {
    var indexCt = this.state.cameraTypes.indexOf(cameraType);
    this.state.cameraTypes.splice(indexCt, 1);
    this.setState({
      cameraTypes: this.state.cameraTypes
    });
  }

  handleClickCamera (camera) {
    this.setState({ selectedCamera: camera });
  }

  handleSelectCamera (camera) {
    this.setState({ selectedCamera: camera });
  }

  render() {
    return <div className='panel-container'>
      <div className='panel tools-panel'>
        <h1>MapSnap</h1>
        <div className='panel-section'>
          <h2><i className='fa fa-fw fa-camera-retro' /> Cameras</h2>
          <CameraTypes
            cameraTypes={ this.state.cameraTypes }
            selectedCameraType={ this.state.selectedCameraType }
            onCreateCameraType={ this.handleCreateCameraType }
            onDoubleClickCameraType={ this.handleDoubleClickCameraType }
            onClickClearCameras={ this.handleClickClearCameras }
            onClick={ this.handleClickCameraType } />
        </div>

        <div className='panel-section'>
          <h2><i className='fa fa-fw fa-file' /> Import/Export</h2>
          <ImportExport onImport={ this.handleImportData }/>
        </div>
      </div>
      <div className='panel map-panel'>
        <Map
          ref='map'
          onClick={ this.handleClickMap }
          cameras={ this.state.cameras }
          selectedCamera={ this.state.selectedCamera }
          onMoveCamera={ this.handleMoveCamera }
          onClickCamera={ this.handleClickCamera }
          onDoubleClickCamera={ this.handleDoubleClickCamera }
          initialCenter={ this.center } />
      </div>
      <div className='panel result-panel'>
        <div className='panel-section'>
          <h2>Snapshots</h2>
          <Results
            cameras={ this.state.cameras }
            selectedCamera={ this.state.selectedCamera }
            handleSelectCamera={ this.handleSelectCamera }
          />
        </div>
      </div>
    </div>;
  }
}

module.exports = App;