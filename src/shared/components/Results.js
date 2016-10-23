const React = require('react');
const _ = require('lodash');

class Results extends React.Component {
  render () {
    const { selectedCamera, cameras } = this.props;
    const { mapboxMapId, mapboxAccessToken, mapboxLogin } = this.props;
    return <div>
      { selectedCamera ? <div className='panel-section'>
        <h2>Current camera</h2>
        <img className='results__selected-camera' src={ selectedCamera.getRenderString(mapboxLogin, mapboxMapId, mapboxAccessToken) } /><br/>
        <div>
          zoom: { selectedCamera.zoom }<br/>
          widthInMillimeters: { selectedCamera.widthInMillimeters }<br/>
          heightInMillimeters: { selectedCamera.heightInMillimeters }
        </div>
      </div> : null }
      <div className='panel-section'>
        <h2>Snapshots</h2>
        { _.map(cameras, camera => {
          return <img
            key={ camera.id }
            className='results__camera'
            onClick={ this.props.onSelectCamera.bind(null, camera) }
            src={ camera.getRenderString(mapboxLogin, mapboxMapId, mapboxAccessToken) } />;
        })}
        <div className={{ textAlign: 'right' }}>
          <button style={{ background: 'crimson' }} onClick={ this.props.onClearCameras }>
            <i className='fa fa-times'/> Remove all
          </button>
        </div>
      </div>
    </div>;
  }
}

module.exports = Results;