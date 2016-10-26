const _ = require('lodash/core');
const { connect } = require('react-redux');
const { ActionTypes } = require('redux-undo');

const LeafletMap = require('shared/components/LeafletMap');
const Results = require('shared/components/Results');
const Settings = require('shared/components/Settings');

const CameraTypes = require('shared/components/CameraTypes');
const { SELECT_CAMERA_TYPE, REMOVE_CAMERA } = require('shared/actions');

if (typeof window !== "undefined") {
  require('../style.scss');
}

const keyboard = {
  BACKSPACE: 8,
  Z: 90,
  Y: 89
};

class ImportExport extends React.Component {
  render () {
    return <div>
      <label className='btn btn--purple'><i className='fa fa-import'/> Import<input type='file' onChange={ this.props.onImport } /></label>&nbsp;
      <a className='btn btn--purple' download='data.json' href={ this.getExportData() }>
        <i className='fa fa-export'/>  Export
      </a>
    </div>;
  }

  handleImportData (ev) {
    var file = ev.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = (ev) => {
      this.setState(this.loadState(ev.target.result));
    };
  }

  getExportData () {
    var data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state));
    return data;
  }
}

class _App extends React.Component {

  componentDidMount () {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown (ev) {
    if (ev.which == keyboard.BACKSPACE && this.props.selectedCameraId) {
      this.props.onRemoveCamera(this.props.selectedCameraId);
    }

    if (ev.which == keyboard.Z && (ev.metaKey || ev.ctrlKey)) {
      if (ev.shiftKey) {
        this.props.onRedo();
      } else {
        this.props.onUndo();
      }
    }

    // 0 to 9
    if (ev.which > 48 && ev.which < 58) {
      this.props.onSelectCameraByNumber(ev.which - 49);
    }
  }

  render() {
    const { settings } = this.props;
    return <div className='panel-container'>
      <div className='panel tools-panel'>
        <h1>
          <span className="fa-stack" style={{ fontSize: '1.25rem' }}>
            <i className="fa fa-map fa-stack-2x"></i>
            <i style={{ color: 'black' }} className="fa fa-camera fa-stack-1x fa-inverse"></i>
          </span>&nbsp;MapSnap
        </h1>
        <div className='panel-section'>
          <h2><i className='fa fa-fw fa-camera-retro' /> Camera templates</h2>
          <CameraTypes />
        </div>

        <div className='panel-section'>
          <h2><i className='fa fa-fw fa-file' /> Import/Export</h2>
          <ImportExport onImport={ this.handleImportData }/>
        </div>

        <div className='panel-section'>
          <h2><i className='fa fa-fw fa-gear' /> Settings</h2>
          <Settings />
        </div>
      </div>
      <div className='panel map-panel'>
        <LeafletMap
          ref='map'
          mapboxLogin={ settings.mapboxLogin }
          mapboxMapId={ settings.mapboxMapId }
          mapboxAccessToken={ settings.mapboxAccessToken } />
      </div>
      <div className='panel result-panel'>
        <Results
          mapboxLogin={ settings.mapboxLogin }
          mapboxMapId={ settings.mapboxMapId }
          mapboxAccessToken={ settings.mapboxAccessToken } />
      </div>
    </div>;
  }
}

const mapStateToProps = function (state) {
  state = state.present;
  return {
    selectedCameraId: state.selectedCameraId,
    settings: state.settings,
    cameraTypes: state.cameraTypes,
    cameras: state.cameras
  };
};

const mapDispatchToProps = function (dispatch, ownProps) {
  return {
    onRemoveCamera (cameraId) {
      dispatch({ type: REMOVE_CAMERA, camera: _.find(this.cameras, x => x.id == cameraId) });
    },

    onUndo () {
      dispatch({ type: ActionTypes.UNDO });
    },

    onRedo () {
      dispatch({ type: ActionTypes.REDO });
    },

    onSelectCameraByNumber (i) {
      const state = this;
      const cameraType = state.cameraTypes[i];
      if (cameraType) {
        dispatch({ type: SELECT_CAMERA_TYPE, cameraType });
      }
    }
  };
};

const App = connect(mapStateToProps, mapDispatchToProps)(_App);

module.exports = App;