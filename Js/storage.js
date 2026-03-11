/**
 * storage.js
 * Handles all localStorage operations and seed data.
 * Depends on: config.js, utils.js
 */
const Storage = (() => {

  // ── READ ────────────────────────────────────────────────
  function load() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      console.warn('[Storage] Failed to parse tasks, resetting.');
      return null;
    }
  }

  // ── WRITE ───────────────────────────────────────────────
  function save(tasks) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('[Storage] Save failed:', e);
    }
  }

  // ── SEED DATA (shown on very first load) ────────────────
  function getSeedTasks() {
    const today = new Date();
    const add = n => {
      const d = new Date(today);
      d.setDate(d.getDate() + n);
      return d.toISOString().split('T')[0];
    };

    return [
      {
        id: Utils.uid(), title: 'Design system color palette',
        description: 'Define primary, secondary, and semantic color tokens.',
        priority: 'high', status: 'done',
        due: add(-3), createdAt: Date.now() - 86400000 * 4, updatedAt: Date.now(),
      },
      {
        id: Utils.uid(), title: 'Build authentication flow',
        description: 'Implement login, register, and password reset with JWT.',
        priority: 'high', status: 'inprogress',
        due: add(2), createdAt: Date.now() - 86400000 * 2, updatedAt: Date.now(),
      },
      {
        id: Utils.uid(), title: 'Write API documentation',
        description: 'Document all REST endpoints using OpenAPI 3.0 spec.',
        priority: 'medium', status: 'inprogress',
        due: add(5), createdAt: Date.now() - 86400000, updatedAt: Date.now(),
      },
      {
        id: Utils.uid(), title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment.',
        priority: 'medium', status: 'todo',
        due: add(7), createdAt: Date.now(), updatedAt: Date.now(),
      },
      {
        id: Utils.uid(), title: 'Conduct user research interviews',
        description: 'Schedule and run 5 interviews to gather feedback on the MVP.',
        priority: 'low', status: 'todo',
        due: add(10), createdAt: Date.now(), updatedAt: Date.now(),
      },
      {
        id: Utils.uid(), title: 'Fix critical security audit findings',
        description: 'Address all vulnerabilities from the latest security report.',
        priority: 'high', status: 'todo',
        due: add(-1), createdAt: Date.now(), updatedAt: Date.now(),
      },
    ];
  }

  // ── INIT: load or seed ──────────────────────────────────
  function init() {
    const existing = load();
    if (existing && existing.length > 0) return existing;
    const seed = getSeedTasks();
    save(seed);
    return seed;
  }

  return { load, save, init };
})();