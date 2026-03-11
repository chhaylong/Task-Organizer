/**
 * app.js
 * Application controller.
 * Wires Storage ↔ UI ↔ Events.
 * This is the ONLY file that imports from all other modules.
 * Depends on: config.js, utils.js, storage.js, ui.js
 */
const App = (() => {

  // ── State ─────────────────────────────────────────────
  let _tasks       = [];
  let _filter      = 'all';
  let _search      = '';
  let _sort        = 'created_desc';
  let _editingId   = null;

  // ── Derived: apply filter + sort, then render ─────────
  function _refresh() {
    const filtered = Utils.filterTasks(_tasks, {
      search: _search,
      status: _filter,
    });
    const sorted = Utils.sortTasks(filtered, _sort);
    UI.renderColumns(sorted, _tasks);
  }

  // ── CRUD ──────────────────────────────────────────────

  function _createTask(values) {
    const task = {
      id:          Utils.uid(),
      title:       values.title,
      description: values.description,
      priority:    values.priority,
      status:      values.status,
      due:         values.due,
      createdAt:   Date.now(),
      updatedAt:   Date.now(),
    };
    _tasks.push(task);
    Storage.save(_tasks);
    _refresh();
    UI.toast('Task created ✓');
  }

  function _updateTask(id, values) {
    const idx = _tasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    _tasks[idx] = {
      ..._tasks[idx],
      title:       values.title,
      description: values.description,
      priority:    values.priority,
      status:      values.status,
      due:         values.due,
      updatedAt:   Date.now(),
    };
    Storage.save(_tasks);
    _refresh();
    UI.toast('Task updated ✓');
  }

  function _deleteTask(id) {
    _tasks = _tasks.filter(t => t.id !== id);
    Storage.save(_tasks);
    _refresh();
    UI.toast('Task deleted');
  }

  function _moveTask(id, direction) {
    const colOrder = CONFIG.COLUMNS.map(c => c.id);
    const task     = _tasks.find(t => t.id === id);
    if (!task) return;
    const newIdx = colOrder.indexOf(task.status) + direction;
    if (newIdx < 0 || newIdx >= colOrder.length) return;
    task.status    = colOrder[newIdx];
    task.updatedAt = Date.now();
    Storage.save(_tasks);
    _refresh();
  }

  // ── MODAL SAVE ────────────────────────────────────────
  function _handleModalSave() {
    const values = UI.getModalValues();
    if (!values.title) {
      UI.toast('Title is required.', 'error');
      return;
    }
    if (values.id) {
      _updateTask(values.id, values);
    } else {
      _createTask(values);
    }
    UI.closeModal();
  }

  // ── EVENT DELEGATION ──────────────────────────────────
  function _bindColumnEvents() {
    document.getElementById('columnsWrap').addEventListener('click', e => {

      // Edit button
      const editBtn = e.target.closest('.js-edit');
      if (editBtn) {
        const task = _tasks.find(t => t.id === editBtn.dataset.id);
        if (task) { _editingId = task.id; UI.openModal({ task }); }
        return;
      }

      // Delete button
      const deleteBtn = e.target.closest('.js-delete');
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        UI.openConfirm(() => _deleteTask(id));
        return;
      }

      // Move buttons
      const moveBtn = e.target.closest('.js-move');
      if (moveBtn) {
        _moveTask(moveBtn.dataset.id, parseInt(moveBtn.dataset.dir, 10));
        return;
      }

      // Card click → open edit
      const card = e.target.closest('.task-card');
      if (card && !e.target.closest('button')) {
        const task = _tasks.find(t => t.id === card.dataset.id);
        if (task) UI.openModal({ task });
      }
    });
  }

  // ── ALL OTHER EVENTS ──────────────────────────────────
  function _bindEvents() {
    // New task button
    document.getElementById('newTaskBtn')
      .addEventListener('click', () => UI.openModal());

    // Modal save
    document.getElementById('modalSaveBtn')
      .addEventListener('click', _handleModalSave);

    // Modal cancel / close
    document.getElementById('modalCancelBtn')
      .addEventListener('click', UI.closeModal);
    document.getElementById('modalOverlay')
      .addEventListener('click', e => { if (e.target.id === 'modalOverlay') UI.closeModal(); });

    // Confirm cancel
    document.getElementById('confirmCancelBtn')
      .addEventListener('click', UI.closeConfirm);
    document.getElementById('confirmOverlay')
      .addEventListener('click', e => { if (e.target.id === 'confirmOverlay') UI.closeConfirm(); });

    // Search
    document.getElementById('searchInput')
      .addEventListener('input', Utils.debounce(e => {
        _search = e.target.value;
        _refresh();
      }, 250));

    // Filter buttons
    document.getElementById('filterGroup')
      .addEventListener('click', e => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        document.querySelectorAll('.filter-btn')
          .forEach(b => b.classList.remove('filter-btn--active'));
        btn.classList.add('filter-btn--active');
        _filter = btn.dataset.filter;
        _refresh();
      });

    // Sort dropdown
    document.getElementById('sortSelect')
      .addEventListener('change', e => { _sort = e.target.value; _refresh(); });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        UI.openModal();
      }
      if (e.key === 'Escape') {
        UI.closeModal();
        UI.closeConfirm();
      }
    });

    // Delegate column events (edit, delete, move)
    _bindColumnEvents();
  }

  // ── INIT ──────────────────────────────────────────────
  function init() {
    _tasks = Storage.init();         // load or seed
    UI.buildColumns();               // scaffold column HTML
    UI.buildSortOptions();           // fill sort <select>
    _bindEvents();                   // attach all listeners
    _refresh();                      // first render
    console.log('[App] TASKFLOW ready — ', _tasks.length, 'tasks loaded');
  }

  return { init };
})();

// Bootstrap
document.addEventListener('DOMContentLoaded', App.init);