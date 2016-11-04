const { connect } = require('react-redux');
const { introJs } = require('intro.js');

const LeafletMap = require('shared/components/LeafletMap');
const Results = require('shared/components/Results');
const Settings = require('shared/components/Settings');
const ImportExport = require('shared/components/ImportExport');
const KeyboardShortcuts = require('shared/components/KeyboardShortcuts');
const ForkMeInGitHub = require('shared/components/ForkMeInGitHub');

const CameraTypes = require('shared/components/CameraTypes');

if (typeof window !== "undefined") {
  require('../style.scss');
}

class _App extends React.Component {
  render() {
    return <div>
      <div className='panel-container'>
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

          <KeyboardShortcuts />

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
      </div>
      <ForkMeInGitHub />
    </div>;
  }
}

const mapDispatchToProps = function (dispatch, ownProps) {
  return {
    onClickHelp () {
      const drawRectangle = document.querySelector('.leaflet-draw-draw-rectangle');
      const drawEdit = document.querySelector('.leaflet-draw-edit-edit');
      drawRectangle.dataset['intro'] = 'Draw a camera freely with the rectangle tool';
      drawEdit.dataset['intro'] = 'Select a camera then resize it with the resize tool';

      introJs().start();
    }
  };
};

const App = connect(null, mapDispatchToProps)(_App);

module.exports = App;