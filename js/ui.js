/**
 * ui.js
 * All DOM rendering, template builders, modal control,
 * toast notifications, and skeleton states.
 * Depends on: config.js, utils.js
 * Never reads/writes localStorage directly.
 */
const UI = (() => {

  const $ = id => document.getElementById(id);

  // ── TOAST ──────────────────────────────────────────────
  function toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast${type === 'error' ? ' toast--error' : ''}`;
    el.textContent = msg;
    $('toastContainer').appendChild(el);
    setTimeout(() => el.remove(), CONFIG.TOAST_DURATION);
  }

  // ── MODAL ──────────────────────────────────────────────
  function openModal({ task = null } = {}) {
    const isEdit = !!task;
    $('modalTitle').textContent = isEdit ? 'EDIT TASK' : 'NEW TASK';

    $('fTitle').value       = task?.title       ?? '';
    $('fDesc').value        = task?.description ?? '';
    $('fPriority').value    = task?.priority    ?? 'medium';
    $('fStatus').value      = task?.status      ?? 'todo';
    $('fDue').value         = task?.due         ?? '';
    $('modalTaskId').value  = task?.id          ?? '';

    $('modalOverlay').classList.add('open');
    setTimeout(() => $('fTitle').focus(), 80);
  }

  function closeModal() {
    $('modalOverlay').classList.remove('open');
  }

  function getModalValues() {
    return {
      title:       $('fTitle').value.trim(),
      description: $('fDesc').value.trim(),
      priority:    $('fPriority').value,
      status:      $('fStatus').value,
      due:         $('fDue').value,
      id:          $('modalTaskId').value,
    };
  }

  // ── DELETE CONFIRM ────────────────────────────────────
  function openConfirm(onConfirm) {
    $('confirmOverlay').classList.add('open');
    $('confirmDeleteBtn').onclick = () => {
      onConfirm();
      closeConfirm();
    };
  }

  function closeConfirm() {
    $('confirmOverlay').classList.remove('open');
  }

  // ── STATS BAR + PROGRESS ─────────────────────────────
  function renderStats(tasks) {
    const total   = tasks.length;
    const done    = tasks.filter(t => t.status === 'done').length;
    const overdue = tasks.filter(t =>
      Utils.isOverdue(t.due) && t.status !== 'done'
    ).length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    $('statTotal').textContent   = total;
    $('statDone').textContent    = done;
    $('statOverdue').textContent = overdue;
    $('progressPct').textContent = `${pct}%`;
    $('progressFill').style.width = `${pct}%`;
  }

  // ── SORT DROPDOWN ─────────────────────────────────────
  function buildSortOptions() {
    const sel = $('sortSelect');
    sel.innerHTML = CONFIG.SORT_OPTIONS
      .map(o => `<option value="${o.value}">${Utils.esc(o.label)}</option>`)
      .join('');
  }

  // ── SINGLE TASK CARD HTML ─────────────────────────────
  function taskCardHTML(task) {
    const overdue = Utils.isOverdue(task.due) && task.status !== 'done';
    const isDone  = task.status === 'done';
    const today   = Utils.todayStr();
    const colOrder = CONFIG.COLUMNS.map(c => c.id);
    const colIdx   = colOrder.indexOf(task.status);

    return `
      <div class="task-card${isDone ? ' task-card--done' : ''}"
           data-priority="${Utils.esc(task.priority)}"
           data-id="${Utils.esc(task.id)}">

        <div class="task-top">
          <div class="task-title">${Utils.esc(task.title)}</div>
          <div class="task-actions">
            <button class="action-btn js-edit"   data-id="${task.id}" title="Edit">✏️</button>
            <button class="action-btn action-btn--delete js-delete" data-id="${task.id}" title="Delete">🗑</button>
          </div>
        </div>

        ${task.description
          ? `<div class="task-desc">${Utils.esc(Utils.truncate(task.description))}</div>`
          : ''}

        <div class="task-meta">
          <span class="tag tag--${Utils.esc(task.priority)}">${Utils.esc(task.priority)}</span>
          ${task.due
            ? `<span class="task-date${overdue ? ' task-date--overdue' : ''}">
                 ${overdue ? '⚠ ' : ''}${Utils.formatDate(task.due)}
               </span>`
            : '<span class="task-date">no due date</span>'}
        </div>

        <div class="task-move">
          <button class="move-btn js-move" data-id="${task.id}" data-dir="-1"
            ${colIdx === 0 ? 'disabled' : ''}>← Back</button>
          <button class="move-btn js-move" data-id="${task.id}" data-dir="1"
            ${colIdx === colOrder.length - 1 ? 'disabled' : ''}>Forward →</button>
        </div>
      </div>`;
  }

  // ── EMPTY COLUMN STATE ────────────────────────────────
  function emptyColHTML() {
    return `<div class="col-empty">
      <div class="col-empty__icon">□</div>
      <div>No tasks here</div>
    </div>`;
  }

  // ── RENDER ALL COLUMNS ────────────────────────────────
  /**
   * @param {Array}  tasks     — already filtered + sorted
   * @param {Array}  allTasks  — full unfiltered list (for stats)
   */
  function renderColumns(tasks, allTasks) {
    renderStats(allTasks);

    CONFIG.COLUMNS.forEach(col => {
      const colTasks = tasks.filter(t => t.status === col.id);
      const bodyEl   = document.getElementById(`col-body-${col.id}`);
      const countEl  = document.getElementById(`col-count-${col.id}`);

      if (!bodyEl) return;
      countEl.textContent = colTasks.length;
      bodyEl.innerHTML    = colTasks.length
        ? colTasks.map(taskCardHTML).join('')
        : emptyColHTML();
    });
  }

  // ── COLUMN SCAFFOLDING (built once on init) ───────────
  function buildColumns() {
    const wrap = $('columnsWrap');
    wrap.innerHTML = CONFIG.COLUMNS.map(col => `
      <div class="column column--${col.id}">
        <div class="col-header">
          <span class="col-title">${Utils.esc(col.label)}</span>
          <span class="col-count" id="col-count-${col.id}">0</span>
        </div>
        <div class="col-body" id="col-body-${col.id}"></div>
      </div>
    `).join('');
  }

  return {
    toast,
    openModal, closeModal, getModalValues,
    openConfirm, closeConfirm,
    renderColumns, buildColumns,
    buildSortOptions,
  };
})();