import React from "react"
import { connect } from "react-redux"

import { UPDATE_SETTINGS } from "../actions"

import utils from "./utils"

class _Settings extends React.Component {
  constructor(props) {
    super(props)
    const { mapboxStyleURL, mapboxAccessToken } = this.props.settings
    this.state = { mapboxStyleURL, mapboxAccessToken }
  }

  handleUpdateSettings(settingName, ev) {
    this.props.onUpdateSettings({
      mapboxStyleURL: this.state.mapboxStyleURL,
      mapboxAccessToken: this.state.mapboxAccessToken
    })
  }

  handleChangeSetting(settingName, ev) {
    this.setState({
      [settingName]: ev.target.value
    })
  }

  render() {
    const initialSettings = this.props.settings
    const { mapboxStyleURL, mapboxAccessToken } = this.state

    const {
      mapboxStyleURL: mapboxStyleURLSetting,
      mapboxAccessToken: mapboxAccessTokenSetting
    } = this.props.settings
    const shouldSave =
      mapboxStyleURL !== mapboxStyleURLSetting ||
      mapboxAccessToken !== mapboxAccessTokenSetting
    const { mapboxLogin, mapboxStyleId } = utils.parseStyleURL(mapboxStyleURL)

    return (
      <div>
        <h3>mapbox</h3>
        style url{" "}
        <input
          onChange={this.handleChangeSetting.bind(this, "mapboxStyleURL")}
          value={mapboxStyleURL}
        />
        <br />
        access token{" "}
        <input
          onChange={this.handleChangeSetting.bind(this, "mapboxAccessToken")}
          value={mapboxAccessToken}
        />
        <br />
        <a
          target="_blank"
          href={
            !mapboxLogin
              ? "https://studio.mapbox.com/styles/"
              : `https://studio.mapbox.com/styles/${mapboxLogin}/${mapboxStyleId}/edit/#10.81/49.4738/2.8827`
          }
        >
          Open Mapbox Studio
        </a>
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
    )
  }
}

const mapStateToProps = function(state) {
  state = state.present
  return {
    settings: state.settings
  }
}

const mapDispatchToProps = function(dispatch) {
  return {
    onUpdateSettings: function(update) {
      dispatch({ type: UPDATE_SETTINGS, update })
    }
  }
}

const Settings = connect(mapStateToProps, mapDispatchToProps)(_Settings)

export default Settings
