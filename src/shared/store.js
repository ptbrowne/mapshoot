const { combineReducers, createStore, applyMiddleware } = require('redux');
const {
  ADD_CAMERA,
  REMOVE_CAMERA,
  SELECT_CAMERA,
  UPDATE_CAMERA_LOCATION,
  ADD_CAMERA_TYPE,
  REMOVE_CAMERA_TYPE,
  SELECT_CAMERA_TYPE,
  CLEAR_CAMERA_TYPES,
  CLEAR_CAMERAS,
  UPDATE_SETTINGS
} = require('shared/actions');
const _ = require('lodash');

const reduxUndo = require('redux-undo');
const includeAction = reduxUndo.includeAction;
const undoable = reduxUndo.default;

const { Camera, CameraType } = require('shared/Camera');


const immutableRemoveAtIndex = function (arr, i)  {
  if (i < 0) {
    return arr;
  }
  return arr.slice(0, i).concat(arr.slice(i + 1));
};

const replaceAtIndex = function (arr, i, updated) {
  return arr.slice(0, i).concat([updated]).concat(arr.slice(i + 1));
};

const findAndUpdate = function (arr, finder, updater) {
  const i = _.findIndex(arr, finder);
  if (i > -1) {
    const updated = updater(arr[i]);
    return replaceAtIndex(arr, i, updated);
  } else {
    return arr;
  }
};

const listReducer = function ({ add, remove, reset, item, initialState }) {
  return function (state, action) {
    switch(action.type) {
    case add:
      return [
        ...state,
        action[item]
      ];
    case remove:
      const i = state.indexOf(action[item]);
      return immutableRemoveAtIndex(state, i);
    case reset:
      return [];
    }

    return state;
  };
};

const LS_KEY = 'state';

const getInitialStore = function () {
  const init = {
    cameraTypes: [],
    cameras: [],
    center: [49.4179497, 2.8263171],
    selectedCamera: null,
    selectedCameraType: null,
    settings: {
      mapboxLogin: 'mapbox',
      mapboxAccessToken: '',
      mapboxMapId: 'streets-v9'
    }
  };
  const store = localStorage.getItem(LS_KEY);
  if (!store) {
    return init;
  } else {
    try {
      var s = JSON.parse(store).present;
      if (!s) { return init; }
      s = _.extend(init, s);
      s.cameraTypes = _.map(s.cameraTypes, (ct) => new CameraType(ct));
      s.cameras = _.map(s.cameras, (jsonCamera) => Camera.fromJSON(jsonCamera));
      if (s.selectedCamera) {
        s.selectedCamera = Camera.fromJSON(s.selectedCamera);
      }
      return s;
    } catch (e) {
      localStorage.removeItem(LS_KEY);
      console.warn('Error while loading previous state', e);
      return init;
    }
  }
};

const initialStore = getInitialStore();

const composeReducers = function (/* reducers */) {
  const reducers = _.slice(arguments);
  return function (state, action) {
    _.each(reducers, function (r) {
      state = r(state, action);
    });
    return state;
  };
};

const cameras = composeReducers(listReducer({
  add: ADD_CAMERA,
  remove: REMOVE_CAMERA,
  reset: CLEAR_CAMERAS,
  item: 'camera'
}), function (state = initialStore.cameras, action) {
  switch (action.type) {
  case UPDATE_CAMERA_LOCATION:
    const { camera, newLocation } = action;
    const finder = (x) => x.id == camera.id;
    const updater = function (camera) {
      const center = newLocation.getBounds().getCenter();
      return camera.imUpdate({
        polygon: newLocation,
        latlng: [center.lat, center.lng]
      });
    };
    return findAndUpdate(state, finder, updater);
  }

  return state;
});

const cameraTypes = composeReducers(listReducer({
  add: ADD_CAMERA_TYPE,
  remove: REMOVE_CAMERA_TYPE,
  reset: CLEAR_CAMERA_TYPES,
  item: 'cameraType'
}), function (state = initialStore.cameraTypes, action) {
  return state;
});

const map = function (state = {}, action) {
  return state;
};

const selectedCameraId = function (
    state = initialStore.selectedCamera ? initialStore.selectedCamera.id : null,
    action) {
  switch (action.type) {
  case SELECT_CAMERA:
    return action.camera ? action.camera.id : null;
  case REMOVE_CAMERA:
    return null;
  }
  return state;
};

const selectedCameraType = function (state = initialStore.selectedCameraType, action) {
  switch (action.type) {
  case SELECT_CAMERA_TYPE:
    return action.cameraType;
  case REMOVE_CAMERA_TYPE:
    return null;
  }
  return state;
};

const settings = function (state = initialStore.settings, action) {
  switch (action.type) {
  case UPDATE_SETTINGS:
    return Object.assign({}, state, action.update);
  }
  return state;
};

const reducer = combineReducers({
  cameras,
  cameraTypes,
  map,
  selectedCameraId,
  selectedCameraType,
  settings
});

const undoableReducer = undoable(reducer, {
  filter: includeAction([
    ADD_CAMERA_TYPE,
    REMOVE_CAMERA_TYPE,
    ADD_CAMERA,
    REMOVE_CAMERA,
    CLEAR_CAMERAS,
    CLEAR_CAMERA_TYPES,
    UPDATE_CAMERA_LOCATION
  ])
});

const save = _store => next => action => {
  let result = next(action);
  localStorage.setItem(LS_KEY, JSON.stringify(store.getState()));
  return result;
};

const logger = store => next => action => {
  console.group(action.type);
  console.log('Dispatching', action);
  console.log('  Previous state', store.getState().present);
  let result = next(action);
  console.log('  Next state', store.getState().present);
  console.groupEnd(action.type);
  return result;
};

const store = createStore(undoableReducer, applyMiddleware(logger, save));


module.exports = store;