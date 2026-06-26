/* LedgerNest persistence adapter */
window.LedgerStorage = (function () {
  'use strict';

  var STORAGE_KEY = 'ledgernest:v1';

  function isStorageAvailable() {
    try {
      var test = '__ledgernest_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  function load() {
    if (!isStorageAvailable()) {
      return { ok: false, empty: false, error: 'storage_unavailable', message: 'localStorage is not available' };
    }
    var raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null || raw === '') {
      return { ok: false, empty: true, error: 'empty', message: 'No saved data found' };
    }
    try {
      var data = JSON.parse(raw);
      return { ok: true, empty: false, data: data };
    } catch (err) {
      return { ok: false, empty: false, error: 'corrupted', message: err.message };
    }
  }

  function save(data) {
    if (!isStorageAvailable()) {
      return { ok: false, message: 'localStorage is not available' };
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }

  function clear() {
    if (!isStorageAvailable()) {
      return { ok: false, message: 'localStorage is not available' };
    }
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    isStorageAvailable: isStorageAvailable,
    load: load,
    save: save,
    clear: clear
  };
})();
