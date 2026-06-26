window.setfarmStaticReady = true;

(function () {
  'use strict';

  var headerEl = null;
  var mainEl = null;
  var toastEl = null;
  var currentState = null;

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatCurrency(n) {
    return '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('en-US');
    } catch (e) {
      return iso;
    }
  }

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('visible');
    setTimeout(function () {
      toastEl.classList.remove('visible');
    }, 2500);
  }

  function init() {
    headerEl = document.getElementById('app-header');
    mainEl = document.getElementById('app-main');
    toastEl = document.getElementById('app-toast');

    if (!headerEl || !mainEl) {
      console.error('LedgerNest: missing app containers');
      return;
    }

    loadSeedAndBoot();

    headerEl.addEventListener('click', handleActionClick);
    mainEl.addEventListener('click', handleActionClick);
    mainEl.addEventListener('input', handleInput);
    mainEl.addEventListener('submit', handleSubmit);
    mainEl.addEventListener('keydown', handleKeydown);
  }

  function loadSeedAndBoot() {
    fetch('assets/data/ledgernest.json')
      .then(function (res) { return res.json(); })
      .then(function (seed) {
        window.LedgerState.init(seed);
      })
      .catch(function () {
        window.LedgerState.init();
      });
    window.LedgerState.subscribe(function (state) {
      currentState = state;
      render();
    });
  }

  function handleActionClick(event) {
    var target = event.target;
    var actionEl = target.closest('[data-action-id]');
    if (!actionEl) return;

    var action = actionEl.getAttribute('data-action-id');
    var value = actionEl.getAttribute('data-value');
    var id = actionEl.getAttribute('data-id');

    if (actionEl.tagName === 'A' || actionEl.getAttribute('role') === 'link') {
      event.preventDefault();
    }

    switch (action) {
      case 'nav-dashboard':
        window.LedgerState.setUi({ activePanel: 'dashboard' });
        window.LedgerState.navigate('SURF_INSIGHTS');
        break;
      case 'nav-clients':
        window.LedgerState.setUi({ activePanel: 'clients' });
        window.LedgerState.navigate('SURF_CLIENT_OPERATIONS');
        break;
      case 'nav-invoices':
        window.LedgerState.setUi({ activePanel: 'invoices' });
        window.LedgerState.navigate('SURF_CLIENT_OPERATIONS');
        break;
      case 'nav-insights':
        window.LedgerState.navigate('SURF_INSIGHTS');
        break;
      case 'nav-settings':
        window.LedgerState.navigate('SURF_SETTINGS_AND_PREFERENCES');
        break;
      case 'ACT_CREATE_RECORD':
        window.LedgerState.openEditor(null);
        break;
      case 'ACT_NOTIFICATIONS':
        window.LedgerState.setUi({ notificationsOpen: !currentState.ui.notificationsOpen, helpOpen: false });
        break;
      case 'ACT_HELP':
        window.LedgerState.setUi({ helpOpen: !currentState.ui.helpOpen, notificationsOpen: false });
        break;
      case 'ACT_ADD_EXPENSE':
        window.LedgerState.setUi({ expenseModalOpen: true });
        break;
      case 'ACT_CLOSE_MODAL':
        window.LedgerState.setUi({ expenseModalOpen: false, helpOpen: false, notificationsOpen: false });
        break;
      case 'ACT_SELECT_RECORD':
        if (id) window.LedgerState.selectClient(id);
        break;
      case 'ACT_FILTER_STATUS':
        if (value) window.LedgerState.setStatusFilter(value);
        break;
      case 'ACT_EDIT_CLIENT':
        if (id) window.LedgerState.openEditor(id);
        break;
      case 'ACT_DELETE_CLIENT':
        if (id && window.confirm('Delete this client? This cannot be undone.')) {
          window.LedgerState.deleteClient(id);
          showToast('Client deleted');
        }
        break;
      case 'ACT_SAVE_RECORD':
        // Handled via form submit for accessibility; keep click from bubbling.
        break;
      case 'ACT_CANCEL_EDIT':
      case 'ACT_GO_BACK':
        window.LedgerState.closeEditor();
        break;
      case 'ACT_RETRY_LOAD':
        window.LedgerState.retryLoad();
        showToast('Data reloaded');
        break;
      case 'ACT_EXPORT_SUMMARY':
        exportSummary();
        break;
      case 'ACT_SAVE_PREFERENCES':
        // Handled via form submit.
        break;
      case 'ACT_CANCEL_PREFERENCES':
        window.LedgerState.navigate('SURF_CLIENT_OPERATIONS');
        break;
      case 'ACT_RESET_DATA':
        if (window.confirm('Reset all data to the default seed?')) {
          window.LedgerState.resetAll();
          showToast('Data reset to defaults');
        }
        break;
      case 'ACT_APPLY_FILTER':
        if (id) {
          window.LedgerState.applySavedFilter(id);
          window.LedgerState.navigate('SURF_CLIENT_OPERATIONS');
        }
        break;
      case 'ACT_REMOVE_FILTER':
        if (id) window.LedgerState.removeSavedFilter(id);
        break;
      case 'ACT_ADD_FILTER':
        addFilterFromForm(actionEl.closest('form'));
        break;
      case 'ACT_SAVE_EXPENSE':
        saveExpenseFromForm(actionEl.closest('form'));
        break;
      default:
        // No-op for unknown actions to keep controls deterministic.
        break;
    }
  }

  function handleInput(event) {
    var target = event.target;
    if (target.matches('[data-action-id="ACT_SEARCH_RECORDS"]')) {
      window.LedgerState.setSearchQuery(target.value);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    var form = event.target;
    var action = form.getAttribute('data-form-action');
    if (action === 'ACT_SAVE_RECORD') {
      saveClientFromForm(form);
    } else if (action === 'ACT_SAVE_PREFERENCES') {
      savePreferencesFromForm(form);
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      if (currentState && currentState.ui.expenseModalOpen) {
        window.LedgerState.setUi({ expenseModalOpen: false });
      }
    }
  }

  function fieldValue(form, name) {
    var el = form.elements[name];
    return el ? el.value : '';
  }

  function checkedValue(form, name) {
    var el = form.elements[name];
    return el ? el.checked : false;
  }

  function saveClientFromForm(form) {
    var fields = {
      name: fieldValue(form, 'name').trim(),
      company: fieldValue(form, 'company').trim(),
      email: fieldValue(form, 'email').trim(),
      address: fieldValue(form, 'address').trim(),
      city: fieldValue(form, 'city').trim(),
      zip: fieldValue(form, 'zip').trim(),
      status: fieldValue(form, 'status'),
      balance: Number(fieldValue(form, 'balance')) || 0
    };
    var result = window.LedgerState.saveClient(fields);
    if (result.ok) {
      showToast('Client saved');
    }
  }

  function savePreferencesFromForm(form) {
    var prefs = {
      defaultView: fieldValue(form, 'defaultView'),
      notifications: checkedValue(form, 'notifications'),
      density: fieldValue(form, 'density')
    };
    window.LedgerState.savePreferences(prefs);
    showToast('Preferences saved');
  }

  function addFilterFromForm(form) {
    if (!form) return;
    var label = fieldValue(form, 'filterLabel').trim();
    var status = fieldValue(form, 'filterStatus');
    var criteria = {};
    if (status && status !== 'all') criteria.status = status;
    var result = window.LedgerState.addSavedFilter(label, criteria);
    if (result.ok) {
      form.reset();
      showToast('Filter added');
    }
  }

  function saveExpenseFromForm(form) {
    if (!form) return;
    var result = window.LedgerState.addExpense({
      description: fieldValue(form, 'description').trim(),
      amount: fieldValue(form, 'amount'),
      date: fieldValue(form, 'date'),
      category: fieldValue(form, 'category')
    });
    if (result.ok) {
      window.LedgerState.setUi({ expenseModalOpen: false });
      showToast('Expense added');
    }
  }

  function exportSummary() {
    var metrics = window.LedgerState.metrics();
    var blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'ledgernest-summary.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Summary exported');
  }

  function render() {
    if (!currentState) return;
    headerEl.innerHTML = renderHeader(currentState);
    mainEl.innerHTML = renderMain(currentState);
  }

  function renderHeader(state) {
    var ui = state.ui;
    var navClass = function (surface, panel) {
      if (panel) {
        return ui.activePanel === panel && ui.activeSurface === surface ? 'active' : '';
      }
      return ui.activeSurface === surface ? 'active' : '';
    };

    var notificationsHtml = '';
    if (ui.notificationsOpen) {
      var items = state.activityEvents.slice(0, 6).map(function (evt) {
        return '<li class="notification-item">' +
          '<span class="notification-message">' + escapeHtml(evt.message) + '</span>' +
          '<span class="notification-time">' + escapeHtml(formatDate(evt.timestamp)) + '</span>' +
          '</li>';
      }).join('') || '<li class="notification-item">No recent notifications</li>';
      notificationsHtml = '<div class="dropdown notifications-dropdown">' +
        '<ul>' + items + '</ul>' +
        '</div>';
    }

    var helpHtml = '';
    if (ui.helpOpen) {
      helpHtml = '<div class="dropdown help-dropdown">' +
        '<p>Use the top navigation to move between Clients, Insights, and Settings. Create records, edit clients, and export summaries from the action bar.</p>' +
        '<button type="button" class="btn btn-secondary" data-action-id="ACT_CLOSE_MODAL">Close</button>' +
        '</div>';
    }

    return '<div class="header-brand">LedgerNest</div>' +
      '<nav class="app-nav" aria-label="Main navigation">' +
      '<a href="#" data-action-id="nav-dashboard" class="' + navClass('SURF_INSIGHTS', 'dashboard') + '">dashboard</a>' +
      '<a href="#" data-action-id="nav-clients" class="' + navClass('SURF_CLIENT_OPERATIONS', 'clients') + '">Clients</a>' +
      '<a href="#" data-action-id="nav-invoices" class="' + navClass('SURF_CLIENT_OPERATIONS', 'invoices') + '">Invoices</a>' +
      '<a href="#" data-action-id="nav-insights" class="' + navClass('SURF_INSIGHTS') + '">insights</a>' +
      '<a href="#" data-action-id="nav-settings" class="' + navClass('SURF_SETTINGS_AND_PREFERENCES') + '">settings</a>' +
      '</nav>' +
      '<div class="header-actions">' +
      '<button type="button" class="btn btn-primary" data-action-id="ACT_CREATE_RECORD">Create New</button>' +
      '<button type="button" class="btn btn-icon" data-action-id="ACT_NOTIFICATIONS" aria-label="Notifications">notifications</button>' +
      '<button type="button" class="btn btn-icon" data-action-id="ACT_HELP" aria-label="Help">help_outline</button>' +
      '<button type="button" class="btn btn-secondary" data-action-id="ACT_ADD_EXPENSE">Add Expense</button>' +
      notificationsHtml +
      helpHtml +
      '</div>';
  }

  function renderMain(state) {
    var ui = state.ui;
    if (ui.activeSurface === 'SURF_CLIENT_EDITOR') return renderClientEditor(state);
    if (ui.activeSurface === 'SURF_INSIGHTS') return renderInsights(state);
    if (ui.activeSurface === 'SURF_SETTINGS_AND_PREFERENCES') return renderSettings(state);
    return renderClientOperations(state);
  }

  function statusBadge(status) {
    return '<span class="badge badge-' + escapeHtml(status) + '">' + escapeHtml(status.replace('-', ' ')) + '</span>';
  }

  function renderClientOperations(state) {
    var ui = state.ui;
    var counts = window.LedgerState.counts();
    var clients = window.LedgerState.filteredClients();
    var selected = window.LedgerState.selectedClient();

    var panelContent = '';
    if (ui.activePanel === 'invoices') {
      panelContent = '<section class="surface invoices-panel" aria-label="Invoices">' +
        '<h2>Invoices</h2>' +
        '<p class="hint">Invoice management is linked to clients. Select a client to track related billing.</p>' +
        '<button type="button" class="btn btn-secondary" data-action-id="nav-clients">Back to Clients</button>' +
        '</section>';
    } else {
      panelContent = renderOperationsMain(state, clients, selected);
    }

    return '<div class="surface client-operations">' +
      '<div class="metrics-row">' +
      metricCard('Total Clients', counts.clients) +
      metricCard('Active', counts.active) +
      metricCard('Total Balance', formatCurrency(counts.totalBalance)) +
      metricCard('Expenses', state.expenses.length) +
      '</div>' +
      panelContent +
      renderExpenseModal(state) +
      '</div>';
  }

  function metricCard(label, value) {
    return '<div class="metric-card">' +
      '<div class="metric-label">' + escapeHtml(label) + '</div>' +
      '<div class="metric-value">' + escapeHtml(value) + '</div>' +
      '</div>';
  }

  function renderOperationsMain(state, clients, selected) {
    var ui = state.ui;
    var savedFilterOptions = state.savedFilters.map(function (f) {
      return '<button type="button" class="btn btn-sm" data-action-id="ACT_APPLY_FILTER" data-id="' + escapeHtml(f.id) + '">' + escapeHtml(f.label) + '</button>';
    }).join('');

    var tableRows = clients.map(function (c) {
      var isSelected = selected && selected.id === c.id ? 'selected-row' : '';
      return '<tr class="' + isSelected + '">' +
        '<td><button type="button" class="link-button" data-action-id="ACT_SELECT_RECORD" data-id="' + escapeHtml(c.id) + '">' + escapeHtml(c.name) + '</button></td>' +
        '<td>' + escapeHtml(c.company || '—') + '</td>' +
        '<td>' + escapeHtml(c.email) + '</td>' +
        '<td>' + escapeHtml(c.city || '—') + '</td>' +
        '<td>' + statusBadge(c.status) + '</td>' +
        '<td class="numeric">' + escapeHtml(formatCurrency(c.balance)) + '</td>' +
        '<td class="row-actions">' +
        '<button type="button" class="btn btn-sm" data-action-id="ACT_EDIT_CLIENT" data-id="' + escapeHtml(c.id) + '">edit</button>' +
        '<button type="button" class="btn btn-sm btn-danger" data-action-id="ACT_DELETE_CLIENT" data-id="' + escapeHtml(c.id) + '">delete</button>' +
        '</td>' +
        '</tr>';
    }).join('');

    var emptyState = clients.length ? '' : '<div class="empty-state"><p>No clients match the current filters.</p>' +
      '<button type="button" class="btn btn-primary" data-action-id="ACT_CREATE_RECORD">Create Client</button>' +
      '</div>';

    var selectedPanel = '';
    if (selected) {
      selectedPanel = '<aside class="preview-panel">' +
        '<h3>' + escapeHtml(selected.name) + '</h3>' +
        '<p><strong>Company:</strong> ' + escapeHtml(selected.company || '—') + '</p>' +
        '<p><strong>Email:</strong> ' + escapeHtml(selected.email) + '</p>' +
        '<p><strong>Address:</strong> ' + escapeHtml([selected.address, selected.city, selected.zip].filter(Boolean).join(', ')) + '</p>' +
        '<p><strong>Status:</strong> ' + statusBadge(selected.status) + '</p>' +
        '<p><strong>Balance:</strong> ' + escapeHtml(formatCurrency(selected.balance)) + '</p>' +
        '<div class="preview-actions">' +
        '<button type="button" class="btn btn-primary" data-action-id="ACT_EDIT_CLIENT" data-id="' + escapeHtml(selected.id) + '">Edit</button>' +
        '<button type="button" class="btn btn-secondary" data-action-id="ACT_SELECT_RECORD">Clear selection</button>' +
        '</div>' +
        '</aside>';
    }

    return '<section class="operations-section" aria-label="Client operations">' +
      '<div class="toolbar">' +
      '<input type="text" class="search-input" placeholder="Search clients, invoices..." data-action-id="ACT_SEARCH_RECORDS" value="' + escapeHtml(ui.searchQuery) + '" />' +
      '<div class="filter-group">' +
      filterButton('All', 'all', ui.statusFilter) +
      filterButton('Active', 'active', ui.statusFilter) +
      filterButton('On Hold', 'on-hold', ui.statusFilter) +
      filterButton('Inactive', 'inactive', ui.statusFilter) +
      '</div>' +
      '<div class="saved-filters">' + savedFilterOptions + '</div>' +
      '<button type="button" class="btn btn-secondary" data-action-id="ACT_RETRY_LOAD">Retry Load</button>' +
      '</div>' +
      '<div class="operations-layout">' +
      '<div class="table-wrap">' +
      '<table class="data-table">' +
      '<thead><tr><th>Name</th><th>Company</th><th>Email</th><th>City</th><th>Status</th><th class="numeric">Balance</th><th>Actions</th></tr></thead>' +
      '<tbody>' + tableRows + '</tbody>' +
      '</table>' +
      emptyState +
      '</div>' +
      selectedPanel +
      '</div>' +
      '</section>';
  }

  function filterButton(label, value, current) {
    var active = value === current ? 'active' : '';
    return '<button type="button" class="btn btn-sm ' + active + '" data-action-id="ACT_FILTER_STATUS" data-value="' + escapeHtml(value) + '">' + escapeHtml(label) + '</button>';
  }

  function renderClientEditor(state) {
    var client = state.ui.editingClient || {};
    var isNew = !client.id;
    var errors = state.ui.validationErrors || {};

    function field(name, type, label, placeholder, value, required) {
      return '<label class="field-label" for="' + name + '">' + escapeHtml(label) + (required ? ' *' : '') + '</label>' +
        '<input type="' + type + '" id="' + name + '" name="' + name + '" placeholder="' + escapeHtml(placeholder || '') + '" value="' + escapeHtml(value || '') + '" ' + (required ? 'required' : '') + ' />' +
        (errors[name] ? '<span class="error-text">' + escapeHtml(errors[name]) + '</span>' : '');
    }

    var statusOptions = ['active', 'on-hold', 'inactive'].map(function (s) {
      return '<option value="' + s + '" ' + (client.status === s ? 'selected' : '') + '>' + escapeHtml(s.replace('-', ' ')) + '</option>';
    }).join('');

    return '<div class="surface client-editor">' +
      '<div class="editor-header">' +
      '<button type="button" class="btn btn-secondary" data-action-id="ACT_GO_BACK">Go back</button>' +
      '<h2>' + escapeHtml(isNew ? 'New Client' : 'Edit ' + client.name) + '</h2>' +
      '</div>' +
      '<form class="editor-form" data-form-action="ACT_SAVE_RECORD" novalidate>' +
      '<div class="form-grid">' +
      '<div class="field">' + field('name', 'text', 'Client name', 'Acme Design', client.name, true) + '</div>' +
      '<div class="field">' + field('company', 'text', 'Company', 'Optional', client.company, false) + '</div>' +
      '<div class="field">' + field('email', 'email', 'Email', 'billing@example.com', client.email, true) + '</div>' +
      '<div class="field">' + field('address', 'text', 'Address', '123 Business Rd, Suite 100', client.address, false) + '</div>' +
      '<div class="field">' + field('city', 'text', 'City', 'Metropolis', client.city, false) + '</div>' +
      '<div class="field">' + field('zip', 'text', 'ZIP', '10001', client.zip, false) + '</div>' +
      '<div class="field">' +
      '<label class="field-label" for="status">Status</label>' +
      '<select id="status" name="status">' + statusOptions + '</select>' +
      '</div>' +
      '<div class="field">' + field('balance', 'number', 'Opening balance', '0', client.balance, false) + '</div>' +
      '</div>' +
      (errors.form ? '<div class="form-error">' + escapeHtml(errors.form) + '</div>' : '') +
      '<div class="form-actions">' +
      '<button type="button" class="btn btn-secondary" data-action-id="ACT_CANCEL_EDIT">Cancel</button>' +
      '<button type="submit" class="btn btn-primary" data-action-id="ACT_SAVE_RECORD">Save Client</button>' +
      '</div>' +
      '</form>' +
      '</div>';
  }

  function renderInsights(state) {
    var metrics = window.LedgerState.metrics();
    var counts = window.LedgerState.counts();
    var distribution = counts.clients ? [
      { label: 'Active', value: counts.active, pct: Math.round((counts.active / counts.clients) * 100) },
      { label: 'On Hold', value: counts.onHold, pct: Math.round((counts.onHold / counts.clients) * 100) },
      { label: 'Inactive', value: counts.inactive, pct: Math.round((counts.inactive / counts.clients) * 100) }
    ] : [];

    var eventsHtml = metrics.recentEvents.map(function (e) {
      return '<li><span class="event-message">' + escapeHtml(e.message) + '</span><span class="event-time">' + escapeHtml(formatDate(e.timestamp)) + '</span></li>';
    }).join('') || '<li>No recent activity</li>';

    var hints = [];
    if (counts.onHold > 0) hints.push('Follow up with ' + counts.onHold + ' on-hold client(s).');
    if (counts.totalBalance > 0) hints.push('Outstanding balance: ' + formatCurrency(counts.totalBalance) + '.');
    if (counts.inactive > 0) hints.push(counts.inactive + ' inactive client(s) may need reactivation.');
    var hintsHtml = hints.length ? hints.map(function (h) { return '<li>' + escapeHtml(h) + '</li>'; }).join('') : '<li>All caught up.</li>';

    return '<div class="surface insights">' +
      '<h2>Insights</h2>' +
      '<div class="metrics-row">' +
      metricCard('Total Clients', metrics.totalClients) +
      metricCard('Active Clients', metrics.activeClients) +
      metricCard('Total Balance', formatCurrency(metrics.totalBalance)) +
      metricCard('Total Expenses', formatCurrency(metrics.totalExpenses)) +
      '</div>' +
      '<div class="insights-layout">' +
      '<section class="insight-card">' +
      '<h3>Recent Activity</h3>' +
      '<ul class="activity-list">' + eventsHtml + '</ul>' +
      '</section>' +
      '<section class="insight-card">' +
      '<h3>Status Distribution</h3>' +
      '<div class="distribution">' + distribution.map(function (d) {
        return '<div class="dist-row"><span>' + escapeHtml(d.label) + '</span><span>' + d.value + ' (' + d.pct + '%)</span></div>' +
          '<div class="dist-bar"><div class="dist-fill dist-' + escapeHtml(d.label.toLowerCase().replace(' ', '-')) + '" style="width:' + d.pct + '%"></div></div>';
      }).join('') + '</div>' +
      '</section>' +
      '<section class="insight-card">' +
      '<h3>Actionable Hints</h3>' +
      '<ul class="hint-list">' + hintsHtml + '</ul>' +
      '<button type="button" class="btn btn-secondary" data-action-id="ACT_EXPORT_SUMMARY">Export</button>' +
      '</section>' +
      '</div>' +
      '</div>';
  }

  function renderSettings(state) {
    var prefs = state.preferences;
    var filtersHtml = state.savedFilters.map(function (f) {
      return '<li class="filter-row">' +
        '<span>' + escapeHtml(f.label) + '</span>' +
        '<div>' +
        '<button type="button" class="btn btn-sm" data-action-id="ACT_APPLY_FILTER" data-id="' + escapeHtml(f.id) + '">apply</button>' +
        '<button type="button" class="btn btn-sm btn-danger" data-action-id="ACT_REMOVE_FILTER" data-id="' + escapeHtml(f.id) + '">remove</button>' +
        '</div>' +
        '</li>';
    }).join('') || '<li class="filter-row">No saved filters</li>';

    return '<div class="surface settings">' +
      '<h2>Settings and Preferences</h2>' +
      '<form class="settings-form" data-form-action="ACT_SAVE_PREFERENCES">' +
      '<section class="settings-section">' +
      '<h3>Preferences</h3>' +
      '<fieldset>' +
      '<legend>Default view</legend>' +
      '<label><input type="radio" name="defaultView" value="list" ' + (prefs.defaultView === 'list' ? 'checked' : '') + ' /> List</label>' +
      '<label><input type="radio" name="defaultView" value="board" ' + (prefs.defaultView === 'board' ? 'checked' : '') + ' /> Board</label>' +
      '</fieldset>' +
      '<label class="checkbox-label"><input type="checkbox" name="notifications" ' + (prefs.notifications ? 'checked' : '') + ' /> Enable notifications</label>' +
      '<fieldset>' +
      '<legend>Density</legend>' +
      '<label><input type="radio" name="density" value="compact" ' + (prefs.density === 'compact' ? 'checked' : '') + ' /> Compact</label>' +
      '<label><input type="radio" name="density" value="comfortable" ' + (prefs.density === 'comfortable' ? 'checked' : '') + ' /> Comfortable</label>' +
      '</fieldset>' +
      '</section>' +
      '<div class="form-actions">' +
      '<button type="button" class="btn btn-secondary" data-action-id="ACT_CANCEL_PREFERENCES">Cancel</button>' +
      '<button type="submit" class="btn btn-primary" data-action-id="ACT_SAVE_PREFERENCES">Preferences</button>' +
      '</div>' +
      '</form>' +
      '<section class="settings-section">' +
      '<h3>Saved Filters</h3>' +
      '<ul class="filter-list">' + filtersHtml + '</ul>' +
      '<form class="add-filter-form">' +
      '<input type="text" name="filterLabel" placeholder="Filter label" />' +
      '<select name="filterStatus">' +
      '<option value="all">Any status</option>' +
      '<option value="active">Active</option>' +
      '<option value="on-hold">On Hold</option>' +
      '<option value="inactive">Inactive</option>' +
      '</select>' +
      '<button type="button" class="btn btn-secondary" data-action-id="ACT_ADD_FILTER">New</button>' +
      '</form>' +
      '</section>' +
      '<section class="settings-section">' +
      '<h3>Data Reset</h3>' +
      '<p>Reset all local data back to the default seed.</p>' +
      '<button type="button" class="btn btn-danger" data-action-id="ACT_RESET_DATA">Reset State</button>' +
      '</section>' +
      '</div>';
  }

  function renderExpenseModal(state) {
    if (!state.ui.expenseModalOpen) return '';
    return '<div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Add expense">' +
      '<div class="modal">' +
      '<h3>Add Expense</h3>' +
      '<form class="expense-form">' +
      '<label class="field-label">Description</label>' +
      '<input type="text" name="description" placeholder="Office supplies" />' +
      '<label class="field-label">Amount</label>' +
      '<input type="number" name="amount" step="0.01" placeholder="0.00" />' +
      '<label class="field-label">Date</label>' +
      '<input type="date" name="date" value="' + new Date().toISOString().slice(0, 10) + '" />' +
      '<label class="field-label">Category</label>' +
      '<input type="text" name="category" placeholder="general" />' +
      '<div class="form-actions">' +
      '<button type="button" class="btn btn-secondary" data-action-id="ACT_CLOSE_MODAL">Cancel</button>' +
      '<button type="button" class="btn btn-primary" data-action-id="ACT_SAVE_EXPENSE">Save</button>' +
      '</div>' +
      '</form>' +
      '</div>' +
      '</div>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
