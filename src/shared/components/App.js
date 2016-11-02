const _ = require('lodash/core');
const { connect } = require('react-redux');
const { ActionTypes } = require('redux-undo');
const { introJs } = require('intro.js');

const LeafletMap = require('shared/components/LeafletMap');
const Results = require('shared/components/Results');
const Settings = require('shared/components/Settings');
const ImportExport = require('shared/components/ImportExport');

const CameraTypes = require('shared/components/CameraTypes');
const { SELECT_CAMERA_TYPE, REMOVE_CAMERA } = require('shared/actions');
const keyboard = require('shared/utils/keyboard');

if (typeof window !== "undefined") {
  require('../style.scss');
}

const Key = function (props) {
  return <span className='key'>{ props.children }</span>;
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
    return <div className='panel-container'>
      <div className='panel tools-panel'>
        <h1>
          <span className="fa-stack" style={{ fontSize: '1.25rem' }}>
            <i className="fa fa-map fa-stack-2x"></i>
            <i style={{ color: 'black' }} className="fa fa-camera fa-stack-1x fa-inverse"></i>
          </span>&nbsp;MapShoot
        </h1>
        <div className='panel-section' data-position='right' data-intro='Create a camera template if you want to reuse the same format for many shots.'>
          <h2><i className='fa fa-fw fa-camera-retro' /> Camera templates</h2>
          <CameraTypes />
        </div>

        <div className='panel-section' data-position='right' data-intro='Save your cameras and load them later on another computer. On your computer, your cameras are auto-saved'>
          <h2><i className='fa fa-fw fa-file' /> Save/Load</h2>
          <ImportExport onImport={ this.handleImportData }/>
        </div>

        <div className='panel-section' data-position='right' data-intro='
        To add features, you need to create a <a href="http://mapbox.com">Mapbox</a> account and <a href="https://www.mapbox.com/help/getting-started-mapbox-studio-2/">create a style</a>.'>
          <h2><i className='fa fa-fw fa-gear' /> Settings</h2>
          <Settings />
        </div>
        <div className='panel-section'>
          <h2>Keyboard shorcuts</h2>
          <Key>1</Key>-<Key>9</Key> Select camera template<br/>
          <Key>Ctrl</Key><Key>Z</Key> Undo<br/>
          <Key>Ctrl</Key><Key>⇧</Key><Key>Z</Key> Redo<br/>
          <Key>⌫</Key> Remove selected camera
        </div>
        <div className='panel-section' style={{ background: 'transparent' }}>
          <button className='btn btn--purple' onClick={ this.props.onClickHelp }>
             Help <i className='fa fa-question-circle' />
          </button>
        </div>
      </div>
      <div className='panel map-panel'>
        <LeafletMap ref='map' />
      </div>
      <div className='panel result-panel'>
        <Results />
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
    },

    onClickHelp () {
      const drawRectangle = document.querySelector('.leaflet-draw-draw-rectangle');
      const drawEdit = document.querySelector('.leaflet-draw-edit-edit');
      drawRectangle.dataset['intro'] = 'Draw a camera freely with the rectangle tool';
      drawEdit.dataset['intro'] = 'Select a camera then resize it with the resize tool';

      introJs().start();
    }
  };
};

const App = connect(mapStateToProps, mapDispatchToProps)(_App);

module.exports = App;