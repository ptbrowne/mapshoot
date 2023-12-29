import React from 'react'

import _ from "lodash/core";
import { connect } from "react-redux";
import { ActionTypes } from "redux-undo";

import { SELECT_CAMERA_TYPE, REMOVE_CAMERA } from "../actions";
import keyboard from "../utils/keyboard";

const Key = function(props) {
  return <span className="key">{props.children}</span>;
};

const RECTANGLE_TOOL_SELECTOR = ".leaflet-draw-draw-rectangle";
const EDIT_TOOL_SELECTOR = ".leaflet-draw-edit-edit";
const DRAW_ACTION_SELECTOR = ".leaflet-draw-actions a";

const qs = document.querySelector.bind(document);
const qsa = document.querySelectorAll.bind(document);

class _KeyboardShortcuts extends React.Component {
  render() {
    return (
      <div className="panel-section">
        <h2>
          <i className="fa fa-fw fa-keyboard-o" /> Shortcuts
        </h2>
        <Key>1</Key>-<Key>9</Key> Select camera template
        <br />
        <Key>R</Key> Draw camera (<b>R</b>ectangle)
        <br />
        <Key>Ctrl</Key>
        <Key>Z</Key> Undo
        <br />
        <Key>Ctrl</Key>
        <Key>⇧</Key>
        <Key>Z</Key> Redo
        <br />
        <h3>While selecting camera</h3>
        <Key>E</Key> <b>E</b>dit camera
        <br />
        <Key>⌫</Key> Remove camera
        <h3>While editing camera</h3>
        <Key>Enter</Key> Save changes
        <br />
        <Key>Esc</Key> Cancel changes
        <br />
      </div>
    );
  }

  componentDidMount() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown(ev) {
    if (ev.which == keyboard.BACKSPACE) {
      ev.preventDefault()
      this.props.onRemoveCameraSelectedCamera();
    }

    if (ev.which == keyboard.Z && (ev.metaKey || ev.ctrlKey)) {
      if (ev.shiftKey) {
        this.props.onRedo();
      } else {
        this.props.onUndo();
      }
    }

    if (ev.which == keyboard.R) {
      this.props.onDrawCamera();
    }

    if (ev.which == keyboard.E) {
      this.props.onResizeCamera();
    }

    if (ev.which == keyboard.ENTER) {
      this.props.onSaveResizedCamera();
    }

    if (ev.which == keyboard.ESCAPE) {
      this.props.onCancelResizedCamera();
    }

    // 0 to 9
    if (ev.which > 48 && ev.which < 58) {
      this.props.onSelectCameraByNumber(ev.which - 49);
    }
  }
}

const mapStateToProps = state => ({
  selectedCameraId: state.present.selectedCameraId,
  cameraTypes: state.present.cameraTypes,
  cameras: state.present.cameras
});

const mapDispatchToProps = dispatch => ({
  onRemoveCameraSelectedCamera() {
    if (this.selectedCameraId) {
      dispatch({
        type: REMOVE_CAMERA,
        camera: _.find(this.cameras, x => x.id == this.selectedCameraId)
      });
    }
  },

  onSaveResizedCamera() {
    const saveBtn = qs(DRAW_ACTION_SELECTOR);
    saveBtn.dispatchEvent(new Event("click"));
  },

  onCancelResizedCamera() {
    const cancelBtn = qsa(DRAW_ACTION_SELECTOR)[1];
    cancelBtn.dispatchEvent(new Event("click"));
  },

  onDrawCamera() {
    const rectTool = qs(RECTANGLE_TOOL_SELECTOR);
    rectTool.dispatchEvent(new Event("click"));
  },

  onResizeCamera() {
    const editTool = qs(EDIT_TOOL_SELECTOR);
    editTool.dispatchEvent(new Event("click"));
  },

  onUndo() {
    dispatch({ type: ActionTypes.UNDO });
  },

  onRedo() {
    dispatch({ type: ActionTypes.REDO });
  },

  onSelectCameraByNumber(i) {
    const cameraType = this.cameraTypes[i];
    if (cameraType) {
      dispatch({ type: SELECT_CAMERA_TYPE, cameraType });
    }
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(_KeyboardShortcuts);
