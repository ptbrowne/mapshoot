const Map = require('./Map');
const React = require('react');
const _ = require('lodash');
const { Camera, CameraType } = require('../Camera');
const Results = require('./Results');

if (typeof window !== "undefined") {
  require('../style.scss');
  require('../../client/vendor/gpx');
}

const COMPIEGNE_LATLNG = [49.41794, 2.82606];

const { BACKSPACE } = {
  BACKSPACE: 8
};

class CameraTypeRenderer extends React.Component {
  render () {
    const { cameraType } = this.props;
    const { widthInMillimeters, heightInMillimeters, defaultZoom } = cameraType;
    return <div className={'camera-type ' + (this.props.selected ? 'camera-type__selected' : '') }
      style={{
        width: widthInMillimeters,
        height: heightInMillimeters,
        marginRight: '0.25rem',
        marginBottom: '0.25rem',
        padding: '0.25rem',

      }}>
      <div className='camera-type__content'>
        {widthInMillimeters}x{heightInMillimeters} z{defaultZoom}
      </div>
      <i
        onClick={ this.props.onRemove.bind(null, cameraType) }
        className='fa fa-remove camera-type__remove' />
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
          onClick={ this.props.onClick.bind(null, cameraType) } > 
          <CameraTypeRenderer
            onRemove={ this.props.onRemoveCameraType.bind(null, cameraType) }
            cameraType={ cameraType }
            selected={ cameraType == this.props.selectedCameraType } />
        </div>) }
      <div style={{ textAlign: 'right' }}>
        <button onClick={ this.handleCreateCameraType }>
          <i className='fa fa-plus'/> new
        </button>&nbsp;

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

class App extends React.Component {

  constructor () {
    super();

    if (typeof window !== 'undefined') {
      this.state = this.loadStateLS();
    } else {
      this.state = {};
    }

    if (!this.state.mapboxLogin) {
      this.state.mapboxLogin = 'mapbox';
      this.state.mapboxAccessToken = 'pk.eyJ1IjoicHRicm93bmUiLCJhIjoiUFNqTUZhUSJ9.2STzGXRBFhzxCQG3ZdseMA';
      this.state.mapboxMapId = 'streets-v9';
    }

    const methods = [
      'handleCreateCameraType',
      'handleClickMap',
      'handleDoubleClickCamera',
      'handleClickCameraType',
      'handleClickClearCameras',
      'removeCameraType',
      'handleMoveCamera',
      'handleImportData',
      'handleClickCamera',
      'handleSelectCamera',
      'handleClickClearCameras',
      'handleKeyDown',
      'handleChangeSetting'
    ];

    methods.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidUpdate () {
    this.saveStateLS();
  }

  componentDidMount () {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown (ev) {
    if (ev.which == BACKSPACE && this.state.selectedCamera) {
      this.removeCurrentCamera();
    }
  }

  removeCurrentCamera () {
    this.removeCamera(this.state.selectedCamera);
  }

  removeCamera (camera) {
    const { cameras } = this.state;
    const i = cameras.indexOf(camera);
    if (i > -1) {
      cameras.splice(i, 1);
    }
    this.setState({ cameras });
    if (this.state.selectedCamera == camera) {
      this.setState({ selectedCamera: null });
    }
  }

  clearCameras () {
    this.setState({ cameras: [], selectedCamera: null });
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

  removeCameraType (cameraType) {
    var indexCt = this.state.cameraTypes.indexOf(cameraType);
    this.state.cameraTypes.splice(indexCt, 1);
    this.setState({
      cameraTypes: this.state.cameraTypes
    });
  }

  selectCamera (camera) {
    this.setState({ selectedCamera: camera });
  }

  handleClickCamera (camera) {
    this.selectCamera(camera);
  }

  handleSelectCamera (camera) {
    this.selectCamera(camera);
  }

  handleChangeSetting (settingName, ev) {
    const upd = {};
    upd[settingName] = ev.currentTarget.value;
    this.setState(upd);
    this.saveStateLS();
  }

  render() {
    return <div className='panel-container'>
      <div className='panel tools-panel'>
        <h1>MapSnap</h1>
        <div className='panel-section'>
          <h2><i className='fa fa-fw fa-camera-retro' /> Camera templates</h2>
          <CameraTypes
            cameraTypes={ this.state.cameraTypes }
            selectedCameraType={ this.state.selectedCameraType }
            onCreateCameraType={ this.handleCreateCameraType }
            onRemoveCameraType={ this.removeCameraType }
            onClick={ this.handleClickCameraType } />
        </div>

        <div className='panel-section'>
          <h2><i className='fa fa-fw fa-file' /> Import/Export</h2>
          <ImportExport onImport={ this.handleImportData }/>
        </div>

        <div className='panel-section'>
          <h2><i className='fa fa-fw fa-gear' /> Settings</h2>
          <div>
            <h3>mapbox</h3>
            login <input
              onChange={ this.handleChangeSetting.bind(null, 'mapboxLogin') } value={ this.state.mapboxLogin }/><br/>
            map id <input
              onChange={ this.handleChangeSetting.bind(null, 'mapboxMapId') } value={ this.state.mapboxMapId }/><br/>
            access token <input
              onChange={ this.handleChangeSetting.bind(null, 'mapboxAccessToken') } value={ this.state.mapboxAccessToken }/><br/>
          </div>
        </div>
      </div>
      <div className='panel map-panel'>
        <Map
          mapboxLogin={ this.state.mapboxLogin }
          mapboxMapId={ this.state.mapboxMapId }
          mapboxAccessToken={ this.state.mapboxAccessToken }
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
        <Results
          mapboxLogin={ this.state.mapboxLogin }
          mapboxMapId={ this.state.mapboxMapId }
          mapboxAccessToken={ this.state.mapboxAccessToken }
          cameras={ this.state.cameras }
          selectedCamera={ this.state.selectedCamera }
          onClearCameras={ this.handleClickClearCameras }
          onSelectCamera={ this.handleSelectCamera } />
      </div>
    </div>;
  }
}

module.exports = App;