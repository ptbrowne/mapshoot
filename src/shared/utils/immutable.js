const findIndex = require('lodash/findIndex');

const removeAtIndex = function (arr, i)  {
  if (i < 0) {
    return arr;
  }
  return arr.slice(0, i).concat(arr.slice(i + 1));
};

const replaceAtIndex = function (arr, i, updated) {
  return arr.slice(0, i).concat([updated]).concat(arr.slice(i + 1));
};

const findAndUpdate = function (arr, finder, updater) {
  const i = findIndex(arr, finder);
  if (i > -1) {
    const updated = updater(arr[i]);
    if (updated == arr[i]) {
      throw new Error('Find and update must replace the object');
    }
    return replaceAtIndex(arr, i, updated);
  } else {
    throw new Error('Could not find');
    return arr;
  }
};

module.exports = {
  removeAtIndex,
  replaceAtIndex,
  findAndUpdate
};