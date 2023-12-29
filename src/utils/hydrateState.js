import _ from "lodash/core"

import { CameraType, Camera } from "../models"

export default function(state) {
  state.cameraTypes = _.map(state.cameraTypes, ct => new CameraType(ct))
  state.cameras = _.map(state.cameras, jsonCamera =>
    Camera.fromJSON(jsonCamera)
  )
}
