window.__SETFARM_TEST_BRIDGE__ = {
  stack: "static-html",
  ready: true
};

window.app = (function () {
  'use strict';

  function ensureState() {
    return window.LedgerState ? window.LedgerState.getState() : null;
  }

  return {
    getState: ensureState,
    getActiveScreen: function () {
      var state = ensureState();
      return state ? state.ui.activeSurface : null;
    },
    getSelectedRecord: function () {
      var state = ensureState();
      return state ? window.LedgerState.selectedClient() : null;
    },
    getCounts: function () {
      var state = ensureState();
      return state ? window.LedgerState.counts() : null;
    },
    getStorageStatus: function () {
      var state = ensureState();
      return state ? state.ui.storageStatus : null;
    },
    getLastError: function () {
      var state = ensureState();
      return state ? state.ui.lastError : null;
    },
    getActivePanel: function () {
      var state = ensureState();
      return state ? state.ui.activePanel : null;
    },
    navigate: function (surface) {
      if (window.LedgerState) window.LedgerState.navigate(surface);
    },
    saveClient: function (fields) {
      if (window.LedgerState) return window.LedgerState.saveClient(fields);
      return { ok: false };
    },
    deleteClient: function (id) {
      if (window.LedgerState) return window.LedgerState.deleteClient(id);
      return { ok: false };
    },
    addExpense: function (fields) {
      if (window.LedgerState) return window.LedgerState.addExpense(fields);
      return { ok: false };
    },
    resetAll: function () {
      if (window.LedgerState) return window.LedgerState.resetAll();
      return { ok: false };
    }
  };
})();
