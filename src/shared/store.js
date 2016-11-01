const _ = require('lodash/core');
const { combineReducers, createStore, applyMiddleware } = require('redux');
const hydrateState = require('shared/utils/hydrateState');
const {
  ADD_CAMERA,
  REMOVE_CAMERA,
  SELECT_CAMERA,
  UPDATE_CAMERA,
  ADD_CAMERA_TYPE,
  REMOVE_CAMERA_TYPE,
  SELECT_CAMERA_TYPE,
  CLEAR_CAMERA_TYPES,
  CLEAR_CAMERAS,
  UPDATE_SETTINGS,
  REPLACE_STATE,
  SET_MAP_ZOOM,
  SET_MAP_VIEW
} = require('shared/actions');

const reduxUndo = require('redux-undo');
const includeAction = reduxUndo.includeAction;
const undoable = reduxUndo.default;

const { removeAtIndex, findAndUpdate } = require('shared/utils/immutable');

const listReducer = function ({ add, remove, reset, item }) {
  return function (state, action) {
    switch(action.type) {
    case add:
      return [
        ...state,
        action[item]
      ];
    case remove:
      const i = state.indexOf(action[item]);
      return removeAtIndex(state, i);
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
      mapboxAccessToken: 'pk.eyJ1IjoicHRicm93bmUiLCJhIjoiUFNqTUZhUSJ9.2STzGXRBFhzxCQG3ZdseMA',
      mapboxMapId: 'streets-v9'
    }
  };
  const store = localStorage.getItem(LS_KEY);
  if (!store) {
    return init;
  } else {
    try {
      var state = JSON.parse(store).present;
      if (!state) { return init; }
      state = _.assignIn(init, state);
      hydrateState(state);
      return state;
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
  case UPDATE_CAMERA:
    const { camera, update } = action;
    const finder = (x) => x.id == camera.id;
    const updater = function (camera) {
      return camera.imUpdate(update);
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

const COMPIEGNE_LAT_LNG = [49.41794, 2.82606];
const initialMapState = { zoom: 18, center: COMPIEGNE_LAT_LNG };
const map = function (state = initialStore.map || initialMapState, action) {
  switch (action.type) {
  case SET_MAP_ZOOM:
    return Object.assign({}, state, { zoom: action.zoom });
  case SET_MAP_VIEW:
    const update = {};
    if (action.zoom) { update.zoom = action.zoom; }
    if (action.center) { update.center = action.center; }
    return Object.assign({}, state, update);
  }
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

const combinedReducers = combineReducers({
  cameras,
  cameraTypes,
  map,
  selectedCameraId,
  selectedCameraType,
  settings
});

const replaceStateReducer = function (state, action) {
  if (action.type == REPLACE_STATE) {
    return action.state;
  }
  return state;
};

const reducer = composeReducers(replaceStateReducer, combinedReducers);

const undoableReducer = undoable(
  reducer, {
    filter: includeAction([
      ADD_CAMERA_TYPE,
      REMOVE_CAMERA_TYPE,
      ADD_CAMERA,
      REMOVE_CAMERA,
      CLEAR_CAMERAS,
      CLEAR_CAMERA_TYPES,
      UPDATE_CAMERA,
      REPLACE_STATE
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