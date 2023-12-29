import React from "react"
import { connect } from "react-redux"

import { REPLACE_STATE } from "../actions"
import hydrateState from "../utils/hydrateState"
import keyboard from "../utils/keyboard"

class _ImportExport extends React.Component {
  render() {
    return (
      <div>
        <label className="btn btn--purple" ref="label">
          <i className="fa fa-import" />
          Load
          <input type="file" onChange={this.handleImportData.bind(this)} />
        </label>
        &nbsp;
        <a
          ref="link"
          className="btn btn--purple"
          download="data.json"
          href={this.getExportData()}
        >
          <i className="fa fa-export" /> Save
        </a>
      </div>
    )
  }

  componentDidMount() {
    this.handleKeyDown = this.handleKeyDown.bind(this)
    document.addEventListener("keydown", this.handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown)
  }

  handleKeyDown(ev) {
    if (ev.which == keyboard.S && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.export()
    }

    if (ev.which == keyboard.O && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.openImportDialog()
    }
  }

  export(ev) {
    var evt = document.createEvent("MouseEvents")
    evt.initEvent("click", true, false)
    this.refs.link.dispatchEvent(evt)
  }

  openImportDialog() {
    var evt = document.createEvent("MouseEvents")
    evt.initEvent("click", true, false)
    this.refs.label.dispatchEvent(evt)
  }

  handleImportData(ev) {
    var file = ev.target.files[0]
    var reader = new FileReader()
    reader.readAsText(file, "UTF-8")
    reader.onload = ev => {
      this.props.onImport(JSON.parse(ev.target.result))
    }
  }

  getExportData() {
    var data =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(this.props.state))
    return data
  }
}

const mapStateToProps = function(state) {
  return {
    state: state.present
  }
}

const mapDispatchToProps = function(dispatch) {
  return {
    onImport: function(data) {
      hydrateState(data)
      dispatch({
        type: REPLACE_STATE,
        state: data
      })
    }
  }
}

const ImportExport = connect(mapStateToProps, mapDispatchToProps)(_ImportExport)

export default ImportExport
