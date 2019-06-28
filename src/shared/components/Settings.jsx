import { connect } from "react-redux";
import { UPDATE_SETTINGS } from "shared/actions";

class _Settings extends React.Component {
  constructor(props) {
    super(props);
    const { mapboxLogin, mapboxMapId, mapboxAccessToken } = this.props.settings;
    this.state = { mapboxLogin, mapboxMapId, mapboxAccessToken };
  }

  handleUpdateSettings(settingName, ev) {
    this.props.onUpdateSettings({
      mapboxLogin: this.state.mapboxLogin,
      mapboxMapId: this.state.mapboxMapId,
      mapboxAccessToken: this.state.mapboxAccessToken
    });
  }

  handleChangeSetting(settingName, ev) {
    this.setState({
      [settingName]: ev.target.value
    });
  }

  render() {
    const initialSettings = this.props.settings;
    const { mapboxLogin, mapboxMapId, mapboxAccessToken } = this.state;
    const shouldSave =
      mapboxLogin !== initialSettings.mapboxLogin ||
      mapboxMapId !== initialSettings.mapboxMapId ||
      mapboxAccessToken !== initialSettings.mapboxAccessToken;

    return (
      <div>
        <h3>mapbox</h3>
        login{" "}
        <input
          onChange={this.handleChangeSetting.bind(this, "mapboxLogin")}
          value={mapboxLogin}
        />
        <br />
        map id{" "}
        <input
          onChange={this.handleChangeSetting.bind(this, "mapboxMapId")}
          value={mapboxMapId}
        />
        <br />
        access token{" "}
        <input
          onChange={this.handleChangeSetting.bind(this, "mapboxAccessToken")}
          value={mapboxAccessToken}
        />
        <br />
        {shouldSave ? (
          <button
            onClick={this.handleUpdateSettings.bind(this)}
            className="btn--green"
          >
            Save
          </button>
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = function(state) {
  state = state.present;
  return {
    settings: state.settings
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    onUpdateSettings: function(update) {
      dispatch({ type: UPDATE_SETTINGS, update });
    }
  };
};

const Settings = connect(
  mapStateToProps,
  mapDispatchToProps
)(_Settings);

export default Settings;
