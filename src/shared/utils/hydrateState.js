const _ = require('lodash/core');
const { CameraType, Camera } = require('shared/models');

module.exports = function (state) {
  state.cameraTypes = _.map(state.cameraTypes, (ct) => new CameraType(ct));
  state.cameras = _.map(state.cameras, (jsonCamera) => Camera.fromJSON(jsonCamera));
};