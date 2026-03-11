/**
 * config.js
 * App-wide constants. Edit here to customise TASKFLOW.
 */
const CONFIG = Object.freeze({

  // LocalStorage key (change if you want a fresh slate)
  STORAGE_KEY: 'taskflow_tasks_v2',

  // Max recent searches saved
  MAX_RECENT: 6,

  // Kanban column definitions — add/remove columns here
  COLUMNS: [
    { id: 'todo',       label: 'TO-DO'       },
    { id: 'inprogress', label: 'IN PROGRESS' },
    { id: 'done',       label: 'DONE'        },
  ],

  // Priority levels — add/remove priorities here
  PRIORITIES: [
    { value: 'low',    label: 'Low',    color: '#06d6a0' },
    { value: 'medium', label: 'Medium', color: '#ffd166' },
    { value: 'high',   label: 'High',   color: '#ff4d6d' },
  ],

  // Sort options shown in the toolbar dropdown
  SORT_OPTIONS: [
    { value: 'created_desc', label: 'Newest First'  },
    { value: 'created_asc',  label: 'Oldest First'  },
    { value: 'due_asc',      label: 'Due Date ↑'    },
    { value: 'priority_desc',label: 'Priority ↑'    },
  ],

  // Toast duration in milliseconds
  TOAST_DURATION: 3000,
});