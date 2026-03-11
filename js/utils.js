/**
 * utils.js
 * Pure helper functions. No DOM access. No side effects.
 * Depends only on: config.js
 */
const Utils = (() => {

  /** Generate a short unique ID */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /** Escape HTML special characters to prevent XSS */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Format a JS Date or ISO string → "Jan 14, 2025" */
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
  }

  /** Today's date as YYYY-MM-DD string */
  function todayStr() {
    return new Date().toISOString().split('T')[0];
  }

  /** Return true if a due date string is in the past */
  function isOverdue(dueDateStr) {
    return !!dueDateStr && dueDateStr < todayStr();
  }

  /**
   * Debounce — delays fn execution until ms have passed
   * since the last call. Used for live search.
   */
  function debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  /**
   * Sort an array of task objects.
   * @param {Array}  tasks
   * @param {string} method — one of CONFIG.SORT_OPTIONS values
   */
  function sortTasks(tasks, method) {
    const copy = [...tasks];
    const pRank = { low: 1, medium: 2, high: 3 };
    switch (method) {
      case 'created_asc':   return copy.sort((a, b) => a.createdAt - b.createdAt);
      case 'created_desc':  return copy.sort((a, b) => b.createdAt - a.createdAt);
      case 'due_asc':       return copy.sort((a, b) => (a.due || '9999') > (b.due || '9999') ? 1 : -1);
      case 'priority_desc': return copy.sort((a, b) => pRank[b.priority] - pRank[a.priority]);
      default:              return copy;
    }
  }

  /**
   * Filter tasks by a search string (checks title + description)
   * and optionally by status.
   */
  function filterTasks(tasks, { search = '', status = 'all' } = {}) {
    const q = search.toLowerCase();
    return tasks.filter(t => {
      if (status !== 'all' && t.status !== status) return false;
      if (q && !t.title.toLowerCase().includes(q) &&
               !(t.description || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }

  /** Truncate a string to maxLen chars, appending ellipsis if needed */
  function truncate(str, maxLen = 100) {
    if (!str) return '';
    return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
  }

  return {
    uid, esc, formatDate, todayStr, isOverdue,
    debounce, sortTasks, filterTasks, truncate,
  };
})();