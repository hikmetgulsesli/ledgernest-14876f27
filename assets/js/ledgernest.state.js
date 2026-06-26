/* LedgerNest state manager */
window.LedgerState = (function () {
  'use strict';

  var DEFAULT_SEED = {
    clients: [
      {
        id: 'c1',
        name: 'Acme Design',
        company: 'Acme Design Studio',
        email: 'billing@acme.example',
        address: '123 Business Rd, Suite 100',
        city: 'Metropolis',
        zip: '10001',
        status: 'active',
        balance: 2450,
        createdAt: '2026-01-15T10:00:00Z'
      },
      {
        id: 'c2',
        name: 'Beta Corp',
        company: 'Beta Corp',
        email: 'ap@beta.example',
        address: '456 Commerce St',
        city: 'Gotham',
        zip: '10002',
        status: 'on-hold',
        balance: 1200,
        createdAt: '2026-02-10T10:00:00Z'
      },
      {
        id: 'c3',
        name: 'Gamma Freelance',
        company: '',
        email: 'hello@gamma.example',
        address: '789 Market Ave',
        city: 'Star City',
        zip: '10003',
        status: 'inactive',
        balance: 0,
        createdAt: '2026-03-05T10:00:00Z'
      }
    ],
    expenses: [
      {
        id: 'e1',
        description: 'Office software subscription',
        amount: 49.99,
        date: '2026-03-01',
        category: 'software'
      }
    ],
    activityEvents: [
      {
        id: 'a1',
        type: 'created',
        message: 'Client Acme Design created',
        timestamp: '2026-01-15T10:00:00Z'
      },
      {
        id: 'a2',
        type: 'updated',
        message: 'Client Beta Corp status set to On Hold',
        timestamp: '2026-02-12T10:00:00Z'
      },
      {
        id: 'a3',
        type: 'expense',
        message: "Expense 'Office software subscription' added",
        timestamp: '2026-03-01T10:00:00Z'
      }
    ],
    preferences: {
      defaultView: 'list',
      notifications: true,
      density: 'comfortable'
    },
    savedFilters: [
      {
        id: 'f1',
        label: 'Active only',
        criteria: { status: 'active' }
      },
      {
        id: 'f2',
        label: 'Has balance',
        criteria: { minBalance: 1 }
      }
    ]
  };

  var state = null;
  var listeners = [];

  function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function newId(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  function init(seedData) {
    var seed = seedData || DEFAULT_SEED;
    var stored = window.LedgerStorage.load();
    var data;
    var storageStatus;
    var lastError = null;

    if (stored.ok) {
      data = deepCopy(stored.data);
      storageStatus = 'loaded';
    } else if (stored.empty) {
      data = deepCopy(seed);
      storageStatus = 'seeded';
    } else {
      data = deepCopy(seed);
      storageStatus = 'recovered_from_corruption';
      lastError = { type: 'storage', message: stored.message };
    }

    data.clients = data.clients || [];
    data.expenses = data.expenses || [];
    data.activityEvents = data.activityEvents || [];
    data.preferences = data.preferences || deepCopy(DEFAULT_SEED.preferences);
    data.savedFilters = data.savedFilters || [];

    state = {
      clients: data.clients,
      expenses: data.expenses,
      activityEvents: data.activityEvents,
      preferences: data.preferences,
      savedFilters: data.savedFilters,
      ui: {
        activeSurface: 'SURF_CLIENT_OPERATIONS',
        previousSurface: null,
        selectedClientId: null,
        searchQuery: '',
        statusFilter: 'all',
        activePanel: 'clients',
        editingClient: null,
        notificationsOpen: false,
        helpOpen: false,
        expenseModalOpen: false,
        lastError: lastError,
        storageStatus: storageStatus,
        validationErrors: {}
      }
    };

    if (storageStatus !== 'loaded') {
      persist();
    }
    notify();
  }

  function subscribe(fn) {
    listeners.push(fn);
    return function unsubscribe() {
      listeners = listeners.filter(function (l) { return l !== fn; });
    };
  }

  function notify() {
    listeners.forEach(function (fn) { fn(getSnapshot()); });
  }

  function persist() {
    var payload = {
      clients: state.clients,
      expenses: state.expenses,
      activityEvents: state.activityEvents,
      preferences: state.preferences,
      savedFilters: state.savedFilters
    };
    var result = window.LedgerStorage.save(payload);
    state.ui.storageStatus = result.ok ? 'saved' : 'save_failed';
    if (!result.ok) {
      state.ui.lastError = { type: 'storage', message: result.message };
    }
    return result;
  }

  function getSnapshot() {
    return {
      clients: state.clients,
      expenses: state.expenses,
      activityEvents: state.activityEvents,
      preferences: state.preferences,
      savedFilters: state.savedFilters,
      ui: state.ui
    };
  }

  function getState() {
    return getSnapshot();
  }

  function filteredClients() {
    var q = (state.ui.searchQuery || '').toLowerCase();
    return state.clients.filter(function (c) {
      var matchesQuery = !q ||
        c.name.toLowerCase().indexOf(q) !== -1 ||
        c.company.toLowerCase().indexOf(q) !== -1 ||
        c.email.toLowerCase().indexOf(q) !== -1 ||
        c.city.toLowerCase().indexOf(q) !== -1;
      var matchesStatus = state.ui.statusFilter === 'all' || c.status === state.ui.statusFilter;
      return matchesQuery && matchesStatus;
    });
  }

  function selectedClient() {
    if (!state.ui.selectedClientId) return null;
    return state.clients.find(function (c) { return c.id === state.ui.selectedClientId; }) || null;
  }

  function counts() {
    return {
      clients: state.clients.length,
      active: state.clients.filter(function (c) { return c.status === 'active'; }).length,
      onHold: state.clients.filter(function (c) { return c.status === 'on-hold'; }).length,
      inactive: state.clients.filter(function (c) { return c.status === 'inactive'; }).length,
      expenses: state.expenses.length,
      totalBalance: state.clients.reduce(function (sum, c) { return sum + (Number(c.balance) || 0); }, 0)
    };
  }

  function metrics() {
    var c = counts();
    return {
      totalClients: c.clients,
      activeClients: c.active,
      totalBalance: c.totalBalance,
      totalExpenses: state.expenses.reduce(function (sum, e) { return sum + (Number(e.amount) || 0); }, 0),
      recentEvents: state.activityEvents.slice().sort(function (a, b) {
        return new Date(b.timestamp) - new Date(a.timestamp);
      }).slice(0, 5)
    };
  }

  function logActivity(type, message) {
    state.activityEvents.unshift({
      id: newId('a'),
      type: type,
      message: message,
      timestamp: new Date().toISOString()
    });
    state.activityEvents = state.activityEvents.slice(0, 100);
  }

  function navigate(surface) {
    state.ui.previousSurface = state.ui.activeSurface;
    state.ui.activeSurface = surface;
    state.ui.editingClient = null;
    state.ui.validationErrors = {};
    if (surface !== 'SURF_SETTINGS_AND_PREFERENCES') {
      state.ui.notificationsOpen = false;
      state.ui.helpOpen = false;
    }
    notify();
  }

  function setUi(patch) {
    Object.keys(patch).forEach(function (key) {
      state.ui[key] = patch[key];
    });
    notify();
  }

  function setSearchQuery(q) {
    state.ui.searchQuery = q;
    notify();
  }

  function setStatusFilter(filter) {
    state.ui.statusFilter = filter;
    notify();
  }

  function selectClient(id) {
    state.ui.selectedClientId = id || null;
    notify();
  }

  function openEditor(clientId) {
    if (clientId) {
      var client = state.clients.find(function (c) { return c.id === clientId; }) || null;
      state.ui.editingClient = client ? deepCopy(client) : null;
    } else {
      state.ui.editingClient = {
        id: null,
        name: '',
        company: '',
        email: '',
        address: '',
        city: '',
        zip: '',
        status: 'active',
        balance: 0,
        createdAt: new Date().toISOString()
      };
    }
    state.ui.validationErrors = {};
    navigate('SURF_CLIENT_EDITOR');
  }

  function closeEditor() {
    state.ui.editingClient = null;
    state.ui.validationErrors = {};
    navigate('SURF_CLIENT_OPERATIONS');
  }

  function validateClient(client) {
    var errors = {};
    if (!client.name || !client.name.trim()) {
      errors.name = 'Client name is required.';
    }
    if (!client.email || !client.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
      errors.email = 'Enter a valid email address.';
    }
    return errors;
  }

  function saveClient(fields) {
    var client = state.ui.editingClient;
    if (!client) return { ok: false, errors: { form: 'No client is being edited.' } };

    var updated = Object.assign({}, client, fields);
    var errors = validateClient(updated);
    if (Object.keys(errors).length > 0) {
      state.ui.validationErrors = errors;
      state.ui.editingClient = updated;
      notify();
      return { ok: false, errors: errors };
    }

    if (client.id) {
      var idx = state.clients.findIndex(function (c) { return c.id === client.id; });
      if (idx === -1) return { ok: false, errors: { form: 'Client not found.' } };
      state.clients[idx] = updated;
      logActivity('updated', 'Client ' + updated.name + ' updated');
    } else {
      updated.id = newId('c');
      updated.createdAt = new Date().toISOString();
      state.clients.push(updated);
      logActivity('created', 'Client ' + updated.name + ' created');
    }

    state.ui.selectedClientId = updated.id;
    state.ui.editingClient = null;
    state.ui.validationErrors = {};
    persist();
    navigate('SURF_CLIENT_OPERATIONS');
    return { ok: true, client: updated };
  }

  function deleteClient(id) {
    var idx = state.clients.findIndex(function (c) { return c.id === id; });
    if (idx === -1) return { ok: false };
    var name = state.clients[idx].name;
    state.clients.splice(idx, 1);
    if (state.ui.selectedClientId === id) {
      state.ui.selectedClientId = null;
    }
    logActivity('deleted', 'Client ' + name + ' deleted');
    persist();
    notify();
    return { ok: true };
  }

  function addExpense(fields) {
    var amount = Number(fields.amount);
    if (!fields.description || !fields.description.trim() || isNaN(amount) || amount <= 0) {
      return { ok: false, errors: { description: !fields.description ? 'Description is required.' : undefined, amount: isNaN(amount) || amount <= 0 ? 'Enter a positive amount.' : undefined } };
    }
    var expense = {
      id: newId('e'),
      description: fields.description.trim(),
      amount: amount,
      date: fields.date || new Date().toISOString().slice(0, 10),
      category: fields.category || 'general'
    };
    state.expenses.push(expense);
    logActivity('expense', "Expense '" + expense.description + "' added");
    persist();
    notify();
    return { ok: true, expense: expense };
  }

  function savePreferences(prefs) {
    state.preferences = Object.assign({}, state.preferences, prefs);
    logActivity('preferences', 'Preferences updated');
    persist();
    notify();
    return { ok: true };
  }

  function addSavedFilter(label, criteria) {
    if (!label || !label.trim()) return { ok: false, errors: { label: 'Filter label is required.' } };
    state.savedFilters.push({ id: newId('f'), label: label.trim(), criteria: criteria || {} });
    persist();
    notify();
    return { ok: true };
  }

  function removeSavedFilter(id) {
    state.savedFilters = state.savedFilters.filter(function (f) { return f.id !== id; });
    persist();
    notify();
    return { ok: true };
  }

  function applySavedFilter(id) {
    var filter = state.savedFilters.find(function (f) { return f.id === id; });
    if (!filter) return { ok: false };
    if (filter.criteria.status) {
      state.ui.statusFilter = filter.criteria.status;
    } else {
      state.ui.statusFilter = 'all';
    }
    notify();
    return { ok: true };
  }

  function resetAll() {
    var cleared = window.LedgerStorage.clear();
    if (!cleared.ok) {
      state.ui.lastError = { type: 'storage', message: cleared.message };
      notify();
      return { ok: false };
    }
    state.clients = deepCopy(DEFAULT_SEED.clients);
    state.expenses = deepCopy(DEFAULT_SEED.expenses);
    state.activityEvents = deepCopy(DEFAULT_SEED.activityEvents);
    state.preferences = deepCopy(DEFAULT_SEED.preferences);
    state.savedFilters = deepCopy(DEFAULT_SEED.savedFilters);
    state.ui.activeSurface = 'SURF_CLIENT_OPERATIONS';
    state.ui.selectedClientId = null;
    state.ui.searchQuery = '';
    state.ui.statusFilter = 'all';
    state.ui.activePanel = 'clients';
    state.ui.editingClient = null;
    state.ui.lastError = null;
    state.ui.storageStatus = 'reset';
    persist();
    notify();
    return { ok: true };
  }

  function retryLoad() {
    var stored = window.LedgerStorage.load();
    if (stored.ok) {
      state.clients = stored.data.clients || [];
      state.expenses = stored.data.expenses || [];
      state.activityEvents = stored.data.activityEvents || [];
      state.preferences = stored.data.preferences || deepCopy(DEFAULT_SEED.preferences);
      state.savedFilters = stored.data.savedFilters || [];
      state.ui.lastError = null;
      state.ui.storageStatus = 'loaded';
      persist();
      notify();
      return { ok: true };
    }
    state.ui.lastError = { type: 'storage', message: stored.message || 'Retry failed' };
    notify();
    return { ok: false };
  }

  return {
    init: init,
    subscribe: subscribe,
    getState: getState,
    filteredClients: filteredClients,
    selectedClient: selectedClient,
    counts: counts,
    metrics: metrics,
    navigate: navigate,
    setUi: setUi,
    setSearchQuery: setSearchQuery,
    setStatusFilter: setStatusFilter,
    selectClient: selectClient,
    openEditor: openEditor,
    closeEditor: closeEditor,
    saveClient: saveClient,
    deleteClient: deleteClient,
    addExpense: addExpense,
    savePreferences: savePreferences,
    addSavedFilter: addSavedFilter,
    removeSavedFilter: removeSavedFilter,
    applySavedFilter: applySavedFilter,
    resetAll: resetAll,
    retryLoad: retryLoad
  };
})();
