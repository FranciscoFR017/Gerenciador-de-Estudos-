// State & LocalStorage Keys
const STORAGE_KEY_SUBJECTS = 'agy_subjects';
const STORAGE_KEY_CONTENTS = 'agy_contents';
const STORAGE_KEY_TOPICS = 'agy_topics';
const STORAGE_KEY_TASKS = 'agy_tasks';
const STORAGE_KEY_HISTORY = 'agy_history';
const STORAGE_KEY_REVISIONS = 'agy_revisions';

// Default Demo Data (3 Levels)
const DEFAULT_SUBJECTS = [
  { id: 'sub-1', name: 'Português', color: '#3b82f6' },
  { id: 'sub-2', name: 'Matemática', color: '#a855f7' },
  { id: 'sub-3', name: 'História', color: '#f59e0b' }
];

const DEFAULT_CONTENTS = [
  { id: 'cont-1', subjectId: 'sub-1', name: 'Gramática' },
  { id: 'cont-2', subjectId: 'sub-1', name: 'Literatura' },
  { id: 'cont-3', subjectId: 'sub-2', name: 'Cálculo' },
  { id: 'cont-4', subjectId: 'sub-2', name: 'Álgebra' },
  { id: 'cont-5', subjectId: 'sub-3', name: 'Brasil Colônia' }
];

const DEFAULT_TOPICS = [
  { id: 'top-1', contentId: 'cont-1', name: 'Análise Sintática' },
  { id: 'top-2', contentId: 'cont-1', name: 'Ortografia' },
  { id: 'top-3', contentId: 'cont-2', name: 'Barroco' },
  { id: 'top-4', contentId: 'cont-3', name: 'Limites' },
  { id: 'top-5', contentId: 'cont-3', name: 'Derivadas' },
  { id: 'top-6', contentId: 'cont-4', name: 'Equações de 2º Grau' },
  { id: 'top-7', contentId: 'cont-5', name: 'Ciclo do Ouro' }
];

const DEFAULT_TASKS = [
  { id: 'task-1', title: 'Fazer exercícios de Análise Sintática (predicado)', subjectId: 'sub-1', dueDate: '2026-07-15', priority: 'high', completed: false },
  { id: 'task-2', title: 'Resolver lista de Limites', subjectId: 'sub-2', dueDate: '2026-07-13', priority: 'medium', completed: true },
  { id: 'task-3', title: 'Ler sobre Ciclo do Ouro', subjectId: 'sub-3', dueDate: '2026-07-18', priority: 'low', completed: false }
];

// History stores durations in SECONDS
const DEFAULT_HISTORY = [
  { id: 'hist-1', subjectId: 'sub-1', contentId: 'cont-1', topicId: 'top-1', durationSeconds: 1500, date: Date.now() - 86400000 * 3 }, // 25m
  { id: 'hist-2', subjectId: 'sub-2', contentId: 'cont-3', topicId: 'top-4', durationSeconds: 3000, date: Date.now() - 86400000 * 2 }, // 50m
  { id: 'hist-3', subjectId: 'sub-2', contentId: 'cont-3', topicId: 'top-5', durationSeconds: 1800, date: Date.now() - 86400000 * 2 }, // 30m
  { id: 'hist-4', subjectId: 'sub-1', contentId: 'cont-1', topicId: 'top-2', durationSeconds: 900, date: Date.now() - 86400000 },    // 15m
  { id: 'hist-5', subjectId: 'sub-3', contentId: 'cont-5', topicId: 'top-7', durationSeconds: 3600, date: Date.now() }            // 60m
];

const DEFAULT_REVISIONS = [
  {
    id: 'rev-1',
    subjectId: 'sub-1',
    contentId: 'cont-1',
    topicId: 'top-1',
    days: 1,
    nextReviewDate: Date.now() - 3600000, // overdue (1h ago)
    level: 'ruim',
    completed: false,
    completionHistory: []
  },
  {
    id: 'rev-2',
    subjectId: 'sub-2',
    contentId: 'cont-3',
    topicId: 'top-4',
    days: 7,
    nextReviewDate: Date.now() + 86400000 * 4,
    level: 'medio',
    completed: false,
    completionHistory: []
  }
];

// App State
let state = {
  subjects: [],
  contents: [],
  topics: [],
  tasks: [],
  history: [],
  revisions: [],
  currentFilter: 'all',
  currentRevFilter: 'today',
  timer: {
    mode: 'focus', // focus, shortBreak, longBreak
    status: 'paused', // paused, running
    timeRemaining: 1500,
    totalDuration: 1500,
    secondsElapsed: 0, 
    intervalId: null
  }
};

// Mode Configs
const TIMER_CONFIGS = {
  focus: 1500,
  shortBreak: 300,
  longBreak: 900
};

// Active review for completion modal
let activeReviewToComplete = null;

// DOM Elements
const timerHoursEl = document.getElementById('timer-hours');
const timerMinutesEl = document.getElementById('timer-minutes');
const timerSecondsEl = document.getElementById('timer-seconds');
const btnTimerToggle = document.getElementById('btn-timer-toggle');
const btnTimerReset = document.getElementById('btn-timer-reset');
const btnTimerSave = document.getElementById('btn-timer-save');
const timerSubjectSelect = document.getElementById('timer-subject');
const timerContentSelect = document.getElementById('timer-content');
const timerTopicSelect = document.getElementById('timer-topic');
const btnQuickAddContent = document.getElementById('btn-quick-add-content');
const btnQuickAddTopic = document.getElementById('btn-quick-add-topic');
const progressRingCircle = document.querySelector('.progress-ring__circle-mini');

// Tab Navigation
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Subjects Manager
const btnShowSubjectForm = document.getElementById('btn-show-subject-form');
const formAddSubject = document.getElementById('form-add-subject');
const btnCancelSubject = document.getElementById('btn-cancel-subject');
const subjectNameInput = document.getElementById('subject-name');
const subjectsListContainer = document.getElementById('subjects-list-container');

// Tasks Manager
const formAddTask = document.getElementById('form-add-task');
const taskTitleInput = document.getElementById('task-title');
const taskSubjectSelect = document.getElementById('task-subject');
const taskDueDateInput = document.getElementById('task-due-date');
const taskPrioritySelect = document.getElementById('task-priority');
const tasksListContainer = document.getElementById('tasks-list-container');

// Revisions Manager
const formAddRevision = document.getElementById('form-add-revision');
const reviewSubjectSelect = document.getElementById('review-subject');
const reviewContentSelect = document.getElementById('review-content');
const reviewTopicSelect = document.getElementById('review-topic');
const reviewIntervalSelect = document.getElementById('review-interval');
const revisionsListContainer = document.getElementById('revisions-list-container');

// Reports & History
const reportsBreakdownContainer = document.getElementById('reports-breakdown-container');
const historyListContainer = document.getElementById('history-list-container');
const btnClearHistory = document.getElementById('btn-clear-history');

// Modals
const modalCompleteReview = document.getElementById('modal-complete-review');
const modalReviewTitle = document.getElementById('modal-review-title');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnSubmitModalReview = document.getElementById('btn-submit-modal-review');

const modalQuickAddContent = document.getElementById('modal-quick-add-content');
const modalQuickAddTopic = document.getElementById('modal-quick-add-topic');
const labelQuickContentSubject = document.getElementById('label-quick-content-subject');
const labelQuickTopicPath = document.getElementById('label-quick-topic-path');
const inputQuickContentName = document.getElementById('input-quick-content-name');
const inputQuickTopicName = document.getElementById('input-quick-topic-name');
const formQuickAddContent = document.getElementById('form-quick-add-content');
const formQuickAddTopic = document.getElementById('form-quick-add-topic');

// Stat Cards
const statTotalTimeValue = document.querySelector('#stat-total-time .stat-value');
const statTasksValue = document.querySelector('#stat-tasks .stat-value');
const statReviewsPendingValue = document.querySelector('#stat-reviews-pending .stat-value');

// Progress Circle setup
let circumference = 0;
if (progressRingCircle) {
  const radius = progressRingCircle.r.baseVal.value;
  circumference = radius * 2 * Math.PI;
  progressRingCircle.style.strokeDasharray = `${circumference} ${circumference}`;
  progressRingCircle.style.strokeDashoffset = circumference;
}

// Sound Synthesizer via Web Audio API
function playChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const playTone = (freq, delay, duration) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
      gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + duration);
    };
    playTone(523.25, 0, 0.4);      // C5
    playTone(659.25, 0.12, 0.4);    // E5
    playTone(783.99, 0.24, 0.6);    // G5
  } catch (e) {
    console.warn("Audio Context blocked or unsupported.", e);
  }
}

// LocalStorage helpers
function loadState() {
  const localSubjects = localStorage.getItem(STORAGE_KEY_SUBJECTS);
  const localContents = localStorage.getItem(STORAGE_KEY_CONTENTS);
  const localTopics = localStorage.getItem(STORAGE_KEY_TOPICS);
  const localTasks = localStorage.getItem(STORAGE_KEY_TASKS);
  const localHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
  const localRevisions = localStorage.getItem(STORAGE_KEY_REVISIONS);

  if (localSubjects && localContents && localTopics && localTasks && localHistory && localRevisions) {
    state.subjects = JSON.parse(localSubjects);
    state.contents = JSON.parse(localContents);
    state.topics = JSON.parse(localTopics);
    state.tasks = JSON.parse(localTasks);
    state.history = JSON.parse(localHistory);
    state.revisions = JSON.parse(localRevisions);
    recalculateProgressCompletion();
  } else {
    state.subjects = [...DEFAULT_SUBJECTS];
    state.contents = [...DEFAULT_CONTENTS];
    state.topics = [...DEFAULT_TOPICS];
    state.tasks = [...DEFAULT_TASKS];
    state.history = [...DEFAULT_HISTORY];
    state.revisions = [...DEFAULT_REVISIONS];
    recalculateProgressCompletion();
    saveState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(state.subjects));
  localStorage.setItem(STORAGE_KEY_CONTENTS, JSON.stringify(state.contents));
  localStorage.setItem(STORAGE_KEY_TOPICS, JSON.stringify(state.topics));
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(state.tasks));
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(state.history));
  localStorage.setItem(STORAGE_KEY_REVISIONS, JSON.stringify(state.revisions));
}

// Helper: Format seconds to readable string
function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  } else {
    return `${seconds}s`;
  }
}

// Helper: Get start of various temporal boundaries
function getTemporalBoundaries() {
  const now = new Date();
  
  // 1. Today Start (00:00:00)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  // 2. This Week Start (Monday at 00:00:00)
  const mondayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = mondayStart.getDay();
  const diff = mondayStart.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday (0) to get Monday (1)
  const weekStart = new Date(mondayStart.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  const weekStartTime = weekStart.getTime();

  // 3. This Month Start (1st of month at 00:00:00)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // 4. This Year Start (Jan 1st at 00:00:00)
  const yearStart = new Date(now.getFullYear(), 0, 1).getTime();

  return { todayStart, weekStartTime, monthStart, yearStart };
}

// Logic: Core UI Renderers
function updateDashboardStats() {
  // Total focused time in seconds
  const totalSeconds = state.history.reduce((sum, item) => sum + (item.durationSeconds || 0), 0);
  if (statTotalTimeValue) statTotalTimeValue.textContent = formatDuration(totalSeconds);

  // Tasks ratio
  const completedTasks = state.tasks.filter(t => t.completed).length;
  const totalTasks = state.tasks.length;
  statTasksValue.textContent = `${completedTasks}/${totalTasks}`;

  // Pending reviews for today
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const pendingReviews = state.revisions.filter(r => !r.completed && r.nextReviewDate <= todayEnd.getTime()).length;
  statReviewsPendingValue.textContent = pendingReviews.toString();

  // Render temporal stats in the reports tab
  updateTemporalStatsUI();
}

function updateTemporalStatsUI() {
  const { todayStart, weekStartTime, monthStart, yearStart } = getTemporalBoundaries();

  let todaySum = 0;
  let weekSum = 0;
  let monthSum = 0;
  let yearSum = 0;
  let alwaysSum = 0;

  state.history.forEach(item => {
    const sec = item.durationSeconds || 0;
    alwaysSum += sec;

    if (item.date >= todayStart) {
      todaySum += sec;
    }
    if (item.date >= weekStartTime) {
      weekSum += sec;
    }
    if (item.date >= monthStart) {
      monthSum += sec;
    }
    if (item.date >= yearStart) {
      yearSum += sec;
    }
  });

  const todayEl = document.querySelector('#temp-stat-today .temp-stat-val');
  const weekEl = document.querySelector('#temp-stat-week .temp-stat-val');
  const monthEl = document.querySelector('#temp-stat-month .temp-stat-val');
  const yearEl = document.querySelector('#temp-stat-year .temp-stat-val');
  const alwaysEl = document.querySelector('#temp-stat-always .temp-stat-val');

  if (todayEl) todayEl.textContent = formatDuration(todaySum);
  if (weekEl) weekEl.textContent = formatDuration(weekSum);
  if (monthEl) monthEl.textContent = formatDuration(monthSum);
  if (yearEl) yearEl.textContent = formatDuration(yearSum);
  if (alwaysEl) alwaysEl.textContent = formatDuration(alwaysSum);
}

function renderSubjects() {
  // Populate the 3-level tree list in subjects card
  subjectsListContainer.innerHTML = '';
  if (state.subjects.length === 0) {
    subjectsListContainer.innerHTML = '<p class="empty-state">Nenhuma matéria criada ainda.</p>';
  } else {
    state.subjects.forEach(subject => {
      const subjectSeconds = state.history
        .filter(h => h.subjectId === subject.id)
        .reduce((sum, h) => sum + (h.durationSeconds || 0), 0);
      
      const timeStr = subjectSeconds > 0 ? formatDuration(subjectSeconds) : '0s';

      const subjectNode = document.createElement('div');
      subjectNode.className = 'tree-subject-node';
      subjectNode.dataset.subjectId = subject.id;
      
      let subjectHeaderHtml = `
        <div class="tree-node-header tree-subject-header" style="border-left-color: ${subject.color}">
          <div class="tree-node-info">
            <i class="fa-solid fa-chevron-right tree-chevron tree-chevron-sub"></i>
            <span class="subject-color-dot" style="background-color: ${subject.color}"></span>
            <span>${subject.name}</span>
            <span class="subject-time" style="color: var(--text-muted); font-size: 0.75rem; font-weight: normal; margin-left: 0.5rem;">(${timeStr})</span>
          </div>
          <div class="tree-node-actions">
            <button class="tree-btn-action btn-add-content" data-subject-id="${subject.id}" title="Adicionar Conteúdo">
              <i class="fa-solid fa-folder-plus"></i>
            </button>
            <button class="tree-btn-action btn-delete btn-delete-subject" data-id="${subject.id}" title="Excluir Matéria">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;

      const subContents = state.contents.filter(c => c.subjectId === subject.id);
      let contentsListHtml = '';

      if (subContents.length > 0) {
        contentsListHtml = `<div class="tree-content-list">`;
        subContents.forEach(content => {
          const contentSeconds = state.history
            .filter(h => h.contentId === content.id)
            .reduce((sum, h) => sum + (h.durationSeconds || 0), 0);
          const cTimeStr = contentSeconds > 0 ? formatDuration(contentSeconds) : '0s';

          const contentTopics = state.topics.filter(t => t.contentId === content.id);
          let topicsListHtml = '';

          if (contentTopics.length > 0) {
            topicsListHtml = `<div class="tree-topic-list">`;
            contentTopics.forEach(topic => {
              const topicSeconds = state.history
                .filter(h => h.topicId === topic.id)
                .reduce((sum, h) => sum + (h.durationSeconds || 0), 0);
              const tTimeStr = topicSeconds > 0 ? formatDuration(topicSeconds) : '0s';

              topicsListHtml += `
                <div class="tree-topic-node">
                  <div class="tree-node-header tree-topic-header">
                    <div class="tree-node-info">
                      <i class="fa-solid fa-tag" style="color: var(--text-dark); font-size: 0.7rem;"></i>
                      <span>${topic.name}</span>
                      <span class="subject-time" style="color: var(--text-dark); font-size: 0.7rem; font-weight: normal; margin-left: 0.3rem;">(${tTimeStr})</span>
                    </div>
                    <div class="tree-node-actions">
                      <button class="tree-btn-action btn-delete btn-delete-topic" data-id="${topic.id}" title="Excluir Assunto">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                </div>
              `;
            });
            topicsListHtml += `</div>`;
          } else {
            topicsListHtml = `<div class="tree-topic-list"><p class="empty-state" style="padding: 0.5rem 12px; font-size: 0.7rem;">Nenhum assunto cadastrado.</p></div>`;
          }

          contentsListHtml += `
            <div class="tree-content-node" data-content-id="${content.id}">
              <div class="tree-node-header tree-content-header">
                <div class="tree-node-info">
                  <i class="fa-solid fa-chevron-right tree-chevron tree-chevron-cont"></i>
                  <i class="fa-solid fa-folder-open" style="color: ${subject.color}; font-size: 0.75rem;"></i>
                  <span>${content.name}</span>
                  <span class="subject-time" style="color: var(--text-muted); font-size: 0.7rem; font-weight: normal; margin-left: 0.4rem;">(${cTimeStr})</span>
                </div>
                <div class="tree-node-actions">
                  <button class="tree-btn-action btn-add-topic" data-content-id="${content.id}" title="Adicionar Assunto">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                  <button class="tree-btn-action btn-delete btn-delete-content" data-id="${content.id}" title="Excluir Conteúdo">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
              ${topicsListHtml}
            </div>
          `;
        });
        contentsListHtml += `</div>`;
      } else {
        contentsListHtml = `<div class="tree-content-list"><p class="empty-state" style="padding: 0.75rem 14px; font-size: 0.75rem;">Nenhum conteúdo cadastrado.</p></div>`;
      }

      subjectNode.innerHTML = subjectHeaderHtml + contentsListHtml;
      subjectsListContainer.appendChild(subjectNode);
    });
  }

  // Populate Dropdowns: timer & task & reviews subjects
  const subjectDropdowns = [timerSubjectSelect, taskSubjectSelect, reviewSubjectSelect];
  subjectDropdowns.forEach(dropdown => {
    if (!dropdown) return;
    const prevVal = dropdown.value;
    const isFirstSelect = dropdown.options[0]?.disabled;
    
    dropdown.innerHTML = isFirstSelect 
      ? `<option value="" disabled selected>${dropdown.options[0].text}</option>`
      : '<option value="">Selecione a matéria...</option>';

    state.subjects.forEach(subject => {
      const opt = document.createElement('option');
      opt.value = subject.id;
      opt.textContent = subject.name;
      if (subject.id === prevVal) opt.selected = true;
      dropdown.appendChild(opt);
    });
  });

  // Manter a aba de progresso sincronizada
  renderProgressTab();
}

// Logic: Encadeamento de seletores (Subjects -> Contents -> Topics)
function setupChainSelectors(subjSelect, contSelect, topSelect, addContBtn, addTopBtn) {
  if (!subjSelect) return;

  subjSelect.addEventListener('change', () => {
    const subjectId = subjSelect.value;
    
    contSelect.innerHTML = '<option value="" disabled selected>Selecione o conteúdo...</option>';
    contSelect.disabled = !subjectId;
    if (addContBtn) addContBtn.disabled = !subjectId;

    topSelect.innerHTML = '<option value="" disabled selected>Selecione o assunto...</option>';
    topSelect.disabled = true;
    if (addTopBtn) addTopBtn.disabled = true;

    if (subjectId) {
      const subContents = state.contents.filter(c => c.subjectId === subjectId);
      if (subContents.length > 0) {
        contSelect.innerHTML = '<option value="">Selecione o conteúdo...</option>';
        subContents.forEach(content => {
          const opt = document.createElement('option');
          opt.value = content.id;
          opt.textContent = content.name;
          contSelect.appendChild(opt);
        });
      } else {
        contSelect.innerHTML = '<option value="" disabled selected>Sem conteúdos cadastrados</option>';
      }
    }
  });

  contSelect.addEventListener('change', () => {
    const contentId = contSelect.value;

    topSelect.innerHTML = '<option value="" disabled selected>Selecione o assunto...</option>';
    topSelect.disabled = !contentId;
    if (addTopBtn) addTopBtn.disabled = !contentId;

    if (contentId) {
      const subTopics = state.topics.filter(t => t.contentId === contentId);
      if (subTopics.length > 0) {
        topSelect.innerHTML = '<option value="">Selecione o assunto...</option>';
        subTopics.forEach(topic => {
          const opt = document.createElement('option');
          opt.value = topic.id;
          opt.textContent = topic.name;
          topSelect.appendChild(opt);
        });
      } else {
        topSelect.innerHTML = '<option value="" disabled selected>Sem assuntos cadastrados</option>';
      }
    }
  });
}

function renderTasks() {
  tasksListContainer.innerHTML = '';
  
  let filteredTasks = state.tasks;
  if (state.currentFilter === 'pending') {
    filteredTasks = state.tasks.filter(t => !t.completed);
  } else if (state.currentFilter === 'completed') {
    filteredTasks = state.tasks.filter(t => t.completed);
  }

  if (filteredTasks.length === 0) {
    tasksListContainer.innerHTML = '<p class="empty-state">Nenhuma tarefa encontrada.</p>';
    return;
  }

  filteredTasks.forEach(task => {
    const subject = state.subjects.find(s => s.id === task.subjectId);
    const subjectName = subject ? subject.name : 'Sem Matéria';
    const subjectColor = subject ? subject.color : '#64748b';

    let dateHtml = '';
    if (task.dueDate) {
      const parts = task.dueDate.split('-');
      const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : task.dueDate;
      dateHtml = `<span class="task-date"><i class="fa-regular fa-calendar"></i> ${formattedDate}</span>`;
    }

    const priorityLabels = { low: 'Baixa', medium: 'Média', high: 'Alta' };

    const taskDiv = document.createElement('div');
    taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskDiv.innerHTML = `
      <div class="task-main-info">
        <label class="custom-checkbox">
          <input type="checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
          <span class="checkmark"></span>
        </label>
        <div class="task-details">
          <span class="task-title-text">${task.title}</span>
          <div class="task-tags">
            <span class="task-subject-tag" style="background-color: ${subjectColor}20; color: ${subjectColor}">
              ${subjectName}
            </span>
            <span class="task-priority-tag priority-${task.priority}">
              ${priorityLabels[task.priority]}
            </span>
            ${dateHtml}
          </div>
        </div>
      </div>
      <button class="btn-delete-task" data-id="${task.id}" title="Excluir Tarefa">
        <i class="fa-regular fa-trash-can"></i>
      </button>
    `;
    tasksListContainer.appendChild(taskDiv);
  });
}

function renderRevisions() {
  revisionsListContainer.innerHTML = '';
  
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  
  let filteredRevisions = [];
  
  if (state.currentRevFilter === 'today') {
    filteredRevisions = state.revisions.filter(r => !r.completed && r.nextReviewDate <= todayEnd.getTime());
  } else if (state.currentRevFilter === 'upcoming') {
    filteredRevisions = state.revisions.filter(r => !r.completed && r.nextReviewDate > todayEnd.getTime());
  } else if (state.currentRevFilter === 'done') {
    filteredRevisions = state.revisions.filter(r => r.completed);
  }
 
  if (state.currentRevFilter === 'upcoming') {
    filteredRevisions.sort((a, b) => a.nextReviewDate - b.nextReviewDate);
  } else {
    filteredRevisions.sort((a, b) => b.nextReviewDate - a.nextReviewDate);
  }
 
  if (filteredRevisions.length === 0) {
    let msg = 'Nenhuma revisão agendada para hoje.';
    if (state.currentRevFilter === 'upcoming') msg = 'Nenhuma revisão futura agendada.';
    if (state.currentRevFilter === 'done') msg = 'Nenhuma revisão concluída ainda.';
    revisionsListContainer.innerHTML = `<p class="empty-state">${msg}</p>`;
    return;
  }
 
  filteredRevisions.forEach(rev => {
    const subject = state.subjects.find(s => s.id === rev.subjectId);
    const subjectName = subject ? subject.name : 'Matéria Excluída';
    const subjectColor = subject ? subject.color : '#64748b';
    
    const topic = state.topics.find(t => t.id === rev.topicId);
    const topicName = topic ? topic.name : (rev.topic || 'Assunto Excluído');
 
    const date = new Date(rev.nextReviewDate);
    const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
 
    const levelLabels = { ruim: 'Ruim 🙁', medio: 'Médio 😐', bom: 'Bom 🙂' };
 
    let diffMsg = '';
    if (!rev.completed) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const revDay = new Date(rev.nextReviewDate);
      revDay.setHours(0, 0, 0, 0);
      const diffTime = revDay - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 
      if (diffDays < 0) {
        diffMsg = `<span style="color: var(--danger); font-weight: 600;">(Atrasada: ${Math.abs(diffDays)}d)</span>`;
      } else if (diffDays === 0) {
        diffMsg = `<span style="color: var(--warning); font-weight: 600;">(Hoje)</span>`;
      } else {
        diffMsg = `(Em ${diffDays} dias)`;
      }
    }
 
    const revDiv = document.createElement('div');
    revDiv.className = 'revision-item';
    revDiv.innerHTML = `
      <div class="revision-main-info">
        <div class="revision-title-row">
          <span class="subject-color-dot" style="background-color: ${subjectColor}"></span>
          <span class="revision-title">${topicName}</span>
        </div>
        <div class="revision-meta">
          <span class="task-subject-tag" style="background-color: ${subjectColor}15; color: ${subjectColor}">
            ${subjectName}
          </span>
          <span class="knowledge-badge level-${rev.level}">
            ${levelLabels[rev.level]}
          </span>
          <span class="revision-days-tag">
            <i class="fa-solid fa-clock"></i> Ciclo: ${rev.days}d
          </span>
          <span class="revision-date-sub">
            Agendada: ${dateStr} ${diffMsg}
          </span>
        </div>
      </div>
      <div class="revision-actions">
        ${!rev.completed ? `
          <button class="btn-complete-revision" data-id="${rev.id}" title="Marcar como revisado">
            <i class="fa-solid fa-check"></i>
          </button>
        ` : ''}
        <button class="btn-delete-revision" data-id="${rev.id}" title="Excluir agendamento">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
    revisionsListContainer.appendChild(revDiv);
  });
}

function renderReports() {
  reportsBreakdownContainer.innerHTML = '';
  
  if (state.subjects.length === 0 || state.history.length === 0) {
    reportsBreakdownContainer.innerHTML = '<p class="empty-state">Dados de estudos insuficientes para gerar relatórios.</p>';
    return;
  }

  state.subjects.forEach(subject => {
    const subjSessions = state.history.filter(h => h.subjectId === subject.id);
    const totalSubjectSeconds = subjSessions.reduce((sum, h) => sum + (h.durationSeconds || 0), 0);

    if (totalSubjectSeconds === 0) return;

    // Group by Content
    const contentsMap = {};
    subjSessions.forEach(session => {
      const contentId = session.contentId || 'unknown';
      if (!contentsMap[contentId]) {
        contentsMap[contentId] = {
          seconds: 0,
          topics: {}
        };
      }
      contentsMap[contentId].seconds += (session.durationSeconds || 0);

      // Group by Topic
      const topicId = session.topicId || 'unknown';
      if (!contentsMap[contentId].topics[topicId]) {
        contentsMap[contentId].topics[topicId] = 0;
      }
      contentsMap[contentId].topics[topicId] += (session.durationSeconds || 0);
    });

    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item';
    
    let subContentsHtml = '';
    
    Object.entries(contentsMap).forEach(([contentId, data]) => {
      const content = state.contents.find(c => c.id === contentId);
      const contentName = content ? content.name : 'Geral / Outros';
      const formattedContentTime = formatDuration(data.seconds);

      let topicsRowsHtml = '';
      Object.entries(data.topics).forEach(([topicId, topicSeconds]) => {
        const topic = state.topics.find(t => t.id === topicId);
        const topicName = topic ? topic.name : 'Outros';
        topicsRowsHtml += `
          <div class="topic-row">
            <span class="topic-title">${topicName}</span>
            <span class="topic-time">${formatDuration(topicSeconds)}</span>
          </div>
        `;
      });

      subContentsHtml += `
        <div class="accordion-content-header">
          <span><i class="fa-solid fa-folder-open"></i> ${contentName}</span>
          <span>${formattedContentTime}</span>
        </div>
        <div class="accordion-content-list">
          ${topicsRowsHtml}
        </div>
      `;
    });

    accordionItem.innerHTML = `
      <div class="accordion-header" style="border-left-color: ${subject.color}">
        <div class="accordion-header-left">
          <span class="accordion-arrow"><i class="fa-solid fa-chevron-right"></i></span>
          <span class="subject-color-dot" style="background-color: ${subject.color}"></span>
          <span>${subject.name}</span>
        </div>
        <span class="subject-time" style="color: ${subject.color}">${formatDuration(totalSubjectSeconds)}</span>
      </div>
      <div class="accordion-content">
        ${subContentsHtml}
      </div>
    `;

    reportsBreakdownContainer.appendChild(accordionItem);
  });

  // Attach togglers
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

function renderHistory() {
  historyListContainer.innerHTML = '';
  
  if (state.history.length === 0) {
    historyListContainer.innerHTML = '<p class="empty-state">Nenhuma sessão registrada.</p>';
    return;
  }

  const sortedHistory = [...state.history].sort((a, b) => b.date - a.date);

  sortedHistory.forEach(item => {
    const subject = state.subjects.find(s => s.id === item.subjectId);
    const subjectName = subject ? subject.name : 'Matéria Excluída';
    const subjectColor = subject ? subject.color : '#64748b';
    
    const content = state.contents.find(c => c.id === item.contentId);
    const contentName = content ? content.name : 'Geral';

    const topic = state.topics.find(t => t.id === item.topicId);
    const topicName = topic ? topic.name : 'Geral';

    const date = new Date(item.date);
    const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    const historyDiv = document.createElement('div');
    historyDiv.className = 'history-item';
    historyDiv.innerHTML = `
      <div class="history-main">
        <span class="history-subj-dot" style="background-color: ${subjectColor}"></span>
        <div style="display: flex; flex-direction: column;">
          <span class="history-subj-name" style="font-size: 0.8rem;">${subjectName}</span>
          <span class="history-topic-name" style="font-size: 0.7rem; color: var(--text-muted);">
            ${contentName} » ${topicName}
          </span>
        </div>
        <span class="history-duration">${formatDuration(item.durationSeconds || 0)}</span>
      </div>
      <div class="history-right">
        <span class="history-date">${dateStr}</span>
        <button class="btn-delete-log" data-id="${item.id}" title="Remover registro"><i class="fa-solid fa-xmark"></i></button>
      </div>
    `;
    historyListContainer.appendChild(historyDiv);
  });
}

function recalculateProgressCompletion() {
  // For each content, if it has topics, compute completion
  state.contents.forEach(content => {
    const contentTopics = state.topics.filter(t => t.contentId === content.id);
    if (contentTopics.length > 0) {
      content.completed = contentTopics.every(t => t.completed === true);
    }
  });

  // For each subject, if it has contents, compute completion
  state.subjects.forEach(subject => {
    const subContents = state.contents.filter(c => c.subjectId === subject.id);
    if (subContents.length > 0) {
      subject.completed = subContents.every(c => c.completed === true);
    }
  });
}

function renderProgressTab() {
  const container = document.getElementById('progress-list-container');
  if (!container) return;

  container.innerHTML = '';

  if (state.subjects.length === 0) {
    container.innerHTML = '<p class="empty-state">Nenhuma matéria cadastrada.</p>';
    return;
  }

  // Recalculate automatic states first
  recalculateProgressCompletion();

  state.subjects.forEach(subject => {
    // 1. Calculate total reviews count
    const subjectRevisions = state.revisions.filter(r => r.subjectId === subject.id);
    const totalReviews = subjectRevisions.reduce((sum, r) => sum + (r.completionHistory ? r.completionHistory.length : 0), 0);

    // 2. Calculate days since last review
    const timestamps = [];
    subjectRevisions.forEach(r => {
      if (r.completionHistory) {
        timestamps.push(...r.completionHistory);
      }
    });

    const subjectHistory = state.history.filter(h => h.subjectId === subject.id);
    subjectHistory.forEach(h => {
      if (h.date) {
        timestamps.push(h.date);
      }
    });

    let daysSinceLastReviewStr = 'Nunca revisada';
    let daysBadgeClass = '';

    if (timestamps.length > 0) {
      const latest = Math.max(...timestamps);
      const diffTime = Date.now() - latest;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        daysSinceLastReviewStr = 'Revisada hoje';
        daysBadgeClass = 'badge-days-ok';
      } else if (diffDays === 1) {
        daysSinceLastReviewStr = 'Revisada ontem';
        daysBadgeClass = 'badge-days-ok';
      } else {
        daysSinceLastReviewStr = `Sem revisar há ${diffDays} dias`;
        daysBadgeClass = diffDays > 7 ? 'badge-days-alert' : 'badge-days-ok';
      }
    }

    const card = document.createElement('div');
    const isCompleted = subject.completed || false;
    card.className = `progress-subject-card ${isCompleted ? 'completed-subject' : ''}`;
    card.dataset.subjectId = subject.id;

    const subContents = state.contents.filter(c => c.subjectId === subject.id);
    const hasContents = subContents.length > 0;

    // Calculate progress metrics
    let totalItems = 0;
    let completedItems = 0;

    if (hasContents) {
      subContents.forEach(content => {
        const contentTopics = state.topics.filter(t => t.contentId === content.id);
        if (contentTopics.length > 0) {
          totalItems += contentTopics.length;
          completedItems += contentTopics.filter(t => t.completed).length;
        } else {
          totalItems += 1;
          if (content.completed) completedItems += 1;
        }
      });
    } else {
      totalItems = 1;
      if (isCompleted) completedItems = 1;
    }

    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Header HTML
    let headerHtml = `
      <div class="progress-subject-header" style="border-left: 4px solid ${subject.color}">
        <div class="progress-subject-left">
          <input type="checkbox" class="progress-subject-checkbox" ${isCompleted ? 'checked' : ''} ${hasContents ? 'disabled title="Calculado automaticamente a partir dos conteúdos"' : 'title="Marcar matéria como concluída"'}>
          <span class="progress-subject-name">
            <span class="subject-color-dot" style="background-color: ${subject.color}"></span>
            ${subject.name}
          </span>
        </div>
        <div class="progress-subject-right">
          ${isCompleted ? `<span class="progress-badge badge-completed"><i class="fa-solid fa-circle-check"></i> Concluída</span>` : ''}
          <span class="progress-badge badge-reviews"><i class="fa-solid fa-rotate"></i> ${totalReviews} ${totalReviews === 1 ? 'revisão' : 'revisões'}</span>
          <span class="progress-badge ${daysBadgeClass}"><i class="fa-solid fa-calendar-check"></i> ${daysSinceLastReviewStr}</span>
          <i class="fa-solid fa-chevron-down progress-chevron" style="color: var(--text-dark); transition: transform 0.3s ease; margin-left: 4px;"></i>
        </div>
      </div>
    `;

    // Progress Bar HTML
    const progressBarHtml = `
      <div class="progress-bar-wrapper">
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${progressPercentage}%; background-color: ${subject.color}"></div>
        </div>
        <div class="progress-info-row">
          <span>Progresso da Matéria</span>
          <span class="progress-percentage-text">${progressPercentage}% (${completedItems}/${totalItems} concluídos)</span>
        </div>
      </div>
    `;

    // Contents Tree HTML
    let contentsHtml = '';

    if (hasContents) {
      contentsHtml = `<div class="progress-content-list">`;
      subContents.forEach(content => {
        const contentTopics = state.topics.filter(t => t.contentId === content.id);
        const hasTopics = contentTopics.length > 0;
        const isContentCompleted = content.completed || false;
        
        let topicsHtml = '';
        if (hasTopics) {
          topicsHtml = '<div style="margin-left: 20px; padding-left: 8px; border-left: 1px dashed rgba(255,255,255,0.05);">';
          contentTopics.forEach(topic => {
            const isTopicCompleted = topic.completed || false;
            topicsHtml += `
              <div class="progress-topic-item ${isTopicCompleted ? 'completed-topic' : ''}" data-topic-id="${topic.id}">
                <input type="checkbox" class="progress-topic-checkbox" ${isTopicCompleted ? 'checked' : ''} title="Marcar assunto como concluído">
                <i class="fa-solid fa-tag" style="font-size: 0.65rem; color: var(--text-dark);"></i>
                <span>${topic.name}</span>
              </div>
            `;
          });
          topicsHtml += '</div>';
        }

        contentsHtml += `
          <div class="progress-content-item ${isContentCompleted ? 'completed-content' : ''}" data-content-id="${content.id}">
            <input type="checkbox" class="progress-content-checkbox" ${isContentCompleted ? 'checked' : ''} ${hasTopics ? 'disabled title="Calculado automaticamente a partir dos assuntos"' : 'title="Marcar conteúdo como concluído"'}>
            <i class="fa-solid fa-folder-open" style="color: ${subject.color}; font-size: 0.8rem;"></i>
            <span style="font-weight: 500;">${content.name}</span>
          </div>
          ${topicsHtml}
        `;
      });
      contentsHtml += `</div>`;
    } else {
      contentsHtml = `<div class="progress-content-list"><p class="empty-state" style="padding: 0.75rem 0; font-size: 0.75rem;">Nenhum conteúdo cadastrado.</p></div>`;
    }

    card.innerHTML = headerHtml + progressBarHtml + contentsHtml;

    // Attach click events on header to expand/collapse (avoiding checkbox)
    card.querySelector('.progress-subject-header').addEventListener('click', (e) => {
      if (e.target.closest('.progress-subject-checkbox')) return;
      
      const expanded = card.classList.toggle('expanded');
      const chevron = card.querySelector('.progress-chevron');
      if (chevron) {
        chevron.style.transform = expanded ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });

    // Attach subject checkbox event listener (only if enabled, though change fires anyway)
    card.querySelector('.progress-subject-checkbox').addEventListener('change', (e) => {
      subject.completed = e.target.checked;
      recalculateProgressCompletion();
      saveState();
      renderProgressTab();
      updateDashboardStats();
    });

    // Attach content checkbox event listener (only for non-disabled ones)
    card.querySelectorAll('.progress-content-checkbox:not([disabled])').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const itemEl = e.target.closest('.progress-content-item');
        const contentId = itemEl.dataset.contentId;
        const content = state.contents.find(c => c.id === contentId);
        if (content) {
          content.completed = e.target.checked;
          recalculateProgressCompletion();
          saveState();
          renderProgressTab();
          updateDashboardStats();
        }
      });
    });

    // Attach topic checkbox event listener
    card.querySelectorAll('.progress-topic-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const itemEl = e.target.closest('.progress-topic-item');
        const topicId = itemEl.dataset.topicId;
        const topic = state.topics.find(t => t.id === topicId);
        if (topic) {
          topic.completed = e.target.checked;
          recalculateProgressCompletion();
          saveState();
          renderProgressTab();
          updateDashboardStats();
        }
      });
    });

    container.appendChild(card);
  });
}

// Logic: Tab Switcher
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    const targetTab = btn.dataset.tab;
    const targetEl = document.getElementById(targetTab);
    if (targetEl) targetEl.classList.add('active');

    if (targetTab === 'tab-timer') {
      renderSubjects();
    } else if (targetTab === 'tab-reviews') {
      renderRevisions();
    } else if (targetTab === 'tab-progress') {
      renderProgressTab();
    } else if (targetTab === 'tab-reports') {
      renderReports();
      renderHistory();
      updateDashboardStats();
    }
  });
});

// Logic: Progressive Stopwatch (Stopwatch Management)
function updateTimerDisplay() {
  const hours = Math.floor(state.timer.secondsElapsed / 3600);
  const minutes = Math.floor((state.timer.secondsElapsed % 3600) / 60);
  const seconds = state.timer.secondsElapsed % 60;
  
  if (timerHoursEl) timerHoursEl.textContent = hours.toString().padStart(2, '0');
  if (timerMinutesEl) timerMinutesEl.textContent = minutes.toString().padStart(2, '0');
  if (timerSecondsEl) timerSecondsEl.textContent = seconds.toString().padStart(2, '0');

  if (progressRingCircle) {
    const percent = (seconds / 60) * 100;
    const offset = circumference - (percent / 100 * circumference);
    progressRingCircle.style.strokeDashoffset = offset;
  }

  const timeStr = `${hours > 0 ? hours.toString().padStart(2, '0') + ':' : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  document.title = `${timeStr} | Estudando - Gerenciador de Estudos`;
}

function toggleTimer() {
  if (state.timer.status === 'running') {
    clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;
    state.timer.status = 'paused';
    btnTimerToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
  } else {
    const subjectId = timerSubjectSelect.value;
    if (!subjectId) {
      alert("Por favor, selecione pelo menos a Matéria antes de iniciar!");
      return;
    }

    state.timer.status = 'running';
    btnTimerToggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
    
    state.timer.intervalId = setInterval(() => {
      state.timer.secondsElapsed++;
      
      if (state.timer.secondsElapsed > 0) {
        btnTimerSave.classList.remove('hidden');
      }
      updateTimerDisplay();
    }, 1000);
  }
}

function resetTimer() {
  if (state.timer.intervalId) {
    clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;
  }
  state.timer.status = 'paused';
  state.timer.secondsElapsed = 0;
  btnTimerToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
  btnTimerSave.classList.add('hidden');
  updateTimerDisplay();
}

// Logic: Salvar Tempo Líquido Parcial/Completo
btnTimerSave.addEventListener('click', () => {
  if (state.timer.secondsElapsed <= 0) return;

  if (state.timer.status === 'running') {
    toggleTimer();
  }

  const subjectId = timerSubjectSelect.value;
  const contentId = timerContentSelect.value || null;
  const topicId = timerTopicSelect.value || null;

  if (!subjectId) {
    alert("Escolha pelo menos a Matéria para salvar seu progresso!");
    return;
  }

  const durationSeconds = state.timer.secondsElapsed;
  const session = {
    id: 'hist-' + Date.now(),
    subjectId,
    contentId,
    topicId,
    durationSeconds,
    date: Date.now()
  };
  state.history.push(session);
  saveState();

  const subject = state.subjects.find(s => s.id === subjectId);
  const content = contentId ? state.contents.find(c => c.id === contentId) : null;
  const topic = topicId ? state.topics.find(t => t.id === topicId) : null;

  const pathStr = [
    subject.name,
    content ? content.name : null,
    topic ? topic.name : null
  ].filter(Boolean).join(' » ');

  // Reset timer
  state.timer.secondsElapsed = 0;
  btnTimerSave.classList.add('hidden');
  updateTimerDisplay();

  updateDashboardStats();
  renderSubjects();
  renderProgressTab();

  const confirmMsg = `Excelente! Você registrou ${formatDuration(durationSeconds)} de estudo em:\n${pathStr}.\n\nDeseja programar uma revisão para este assunto?`;
  
  if (topicId && confirm(confirmMsg)) {
    const revTabBtn = document.querySelector('.tab-btn[data-tab="tab-reviews"]');
    if (revTabBtn) {
      revTabBtn.click();
      
      reviewSubjectSelect.value = subjectId;
      const event = new Event('change');
      reviewSubjectSelect.dispatchEvent(event);
      
      reviewContentSelect.value = contentId;
      reviewContentSelect.dispatchEvent(event);
      
      reviewTopicSelect.value = topicId;
    }
  } else if (!topicId) {
    alert(`Parabéns! Você registrou ${formatDuration(durationSeconds)} de estudo em: ${pathStr}.\n(Nota: Para agendar revisões automáticas, selecione um assunto específico).`);
  }
});

// Logic: Collapsible Tree interactive event listeners
subjectsListContainer.addEventListener('click', (e) => {
  // If clicked on an action button, do NOT expand/collapse
  if (e.target.closest('.tree-btn-action')) return;

  // Collapse/Expand Subject
  const subjectHeader = e.target.closest('.tree-subject-header');
  if (subjectHeader) {
    const parentNode = subjectHeader.closest('.tree-subject-node');
    if (parentNode) {
      parentNode.classList.toggle('expanded');
    }
    return;
  }

  // Collapse/Expand Content
  const contentHeader = e.target.closest('.tree-content-header');
  if (contentHeader) {
    const parentNode = contentHeader.closest('.tree-content-node');
    if (parentNode) {
      parentNode.classList.toggle('expanded');
    }
  }
});

// Logic: Subjects/Content/Topic Creation & Management
btnShowSubjectForm.addEventListener('click', () => {
  formAddSubject.classList.toggle('hidden');
  subjectNameInput.focus();
});

btnCancelSubject.addEventListener('click', () => {
  formAddSubject.classList.add('hidden');
  subjectNameInput.value = '';
});

let selectedColor = '#a855f7';

// Delegar clique no seletor de cores para que funcione com qualquer quantidade de opções
const colorsGrid = document.querySelector('.colors-grid');
if (colorsGrid) {
  colorsGrid.addEventListener('click', (e) => {
    const opt = e.target.closest('.color-option');
    if (!opt) return;
    
    colorsGrid.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    selectedColor = opt.dataset.color;
  });
}


formAddSubject.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = subjectNameInput.value.trim();
  if (!name) return;

  const newSubject = {
    id: 'sub-' + Date.now(),
    name: name,
    color: selectedColor
  };

  state.subjects.push(newSubject);
  saveState();
  renderSubjects();

  formAddSubject.classList.add('hidden');
  subjectNameInput.value = '';
});

// Modais - Quick Adding Actions
let quickSubjectIdForContent = null;
let quickContentIdForTopic = null;

subjectsListContainer.addEventListener('click', (e) => {
  const addContentBtn = e.target.closest('.btn-add-content');
  if (addContentBtn) {
    const subjectId = addContentBtn.dataset.subjectId;
    const subject = state.subjects.find(s => s.id === subjectId);
    if (subject) {
      quickSubjectIdForContent = subjectId;
      labelQuickContentSubject.textContent = subject.name;
      labelQuickContentSubject.style.color = subject.color;
      inputQuickContentName.value = '';
      modalQuickAddContent.classList.remove('hidden');
      inputQuickContentName.focus();
    }
    return;
  }

  const addTopicBtn = e.target.closest('.btn-add-topic');
  if (addTopicBtn) {
    const contentId = addTopicBtn.dataset.contentId;
    const content = state.contents.find(c => c.id === contentId);
    if (content) {
      const subject = state.subjects.find(s => s.id === content.subjectId);
      quickContentIdForTopic = contentId;
      labelQuickTopicPath.textContent = `${subject.name} » ${content.name}`;
      labelQuickTopicPath.style.color = subject.color;
      inputQuickTopicName.value = '';
      modalQuickAddTopic.classList.remove('hidden');
      inputQuickTopicName.focus();
    }
    return;
  }

  const deleteSubBtn = e.target.closest('.btn-delete-subject');
  if (deleteSubBtn) {
    const id = deleteSubBtn.dataset.id;
    const subj = state.subjects.find(s => s.id === id);
    if (confirm(`Excluir a matéria "${subj.name}"? Isso removerá permanentemente TODOS os conteúdos, assuntos, tarefas, históricos e revisões associados!`)) {
      state.subjects = state.subjects.filter(s => s.id !== id);
      state.contents = state.contents.filter(c => c.subjectId !== id);
      state.topics = state.topics.filter(t => !state.contents.find(c => c.id === t.contentId));
      state.tasks = state.tasks.filter(t => t.subjectId !== id);
      state.history = state.history.filter(h => h.subjectId !== id);
      state.revisions = state.revisions.filter(r => r.subjectId !== id);
      saveState();
      updateDashboardStats();
      renderSubjects();
      renderTasks();
    }
    return;
  }

  const deleteContBtn = e.target.closest('.btn-delete-content');
  if (deleteContBtn) {
    const id = deleteContBtn.dataset.id;
    const cont = state.contents.find(c => c.id === id);
    if (confirm(`Excluir o conteúdo "${cont.name}"? Isso removerá os assuntos, históricos e revisões vinculados.`)) {
      state.contents = state.contents.filter(c => c.id !== id);
      state.topics = state.topics.filter(t => t.contentId !== id);
      state.history = state.history.filter(h => h.contentId !== id);
      state.revisions = state.revisions.filter(r => r.contentId !== id);
      saveState();
      updateDashboardStats();
      renderSubjects();
    }
    return;
  }

  const deleteTopicBtn = e.target.closest('.btn-delete-topic');
  if (deleteTopicBtn) {
    const id = deleteTopicBtn.dataset.id;
    const topic = state.topics.find(t => t.id === id);
    if (confirm(`Excluir o assunto "${topic.name}"? Isso removerá o histórico e as revisões do mesmo.`)) {
      state.topics = state.topics.filter(t => t.id !== id);
      state.history = state.history.filter(h => h.topicId !== id);
      state.revisions = state.revisions.filter(r => r.topicId !== id);
      saveState();
      updateDashboardStats();
      renderSubjects();
    }
    return;
  }
});

// Close quick add modais
document.querySelectorAll('.btn-close-quick-modal').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modalId = btn.dataset.modal;
    document.getElementById(modalId).classList.add('hidden');
    quickSubjectIdForContent = null;
    quickContentIdForTopic = null;
  });
});

btnQuickAddContent.addEventListener('click', () => {
  const subjectId = timerSubjectSelect.value;
  const subject = state.subjects.find(s => s.id === subjectId);
  if (subject) {
    quickSubjectIdForContent = subjectId;
    labelQuickContentSubject.textContent = subject.name;
    labelQuickContentSubject.style.color = subject.color;
    inputQuickContentName.value = '';
    modalQuickAddContent.classList.remove('hidden');
    inputQuickContentName.focus();
  }
});

btnQuickAddTopic.addEventListener('click', () => {
  const contentId = timerContentSelect.value;
  const content = state.contents.find(c => c.id === contentId);
  if (content) {
    const subject = state.subjects.find(s => s.id === content.subjectId);
    quickContentIdForTopic = contentId;
    labelQuickTopicPath.textContent = `${subject.name} » ${content.name}`;
    labelQuickTopicPath.style.color = subject.color;
    inputQuickTopicName.value = '';
    modalQuickAddTopic.classList.remove('hidden');
    inputQuickTopicName.focus();
  }
});

formQuickAddContent.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = inputQuickContentName.value.trim();
  if (!name || !quickSubjectIdForContent) return;

  const newContent = {
    id: 'cont-' + Date.now(),
    subjectId: quickSubjectIdForContent,
    name: name
  };

  state.contents.push(newContent);
  saveState();
  renderSubjects();

  // If we added via timer select row, update and auto-select
  if (timerSubjectSelect.value === quickSubjectIdForContent) {
    const event = new Event('change');
    timerSubjectSelect.dispatchEvent(event);
    timerContentSelect.value = newContent.id;
    timerContentSelect.dispatchEvent(event);
  }

  // Also auto-expand newly modified subject node in the tree sidebar
  const subjectNode = document.querySelector(`.tree-subject-node[data-subject-id="${quickSubjectIdForContent}"]`);
  if (subjectNode) {
    subjectNode.classList.add('expanded');
  }

  modalQuickAddContent.classList.add('hidden');
  quickSubjectIdForContent = null;
});

formQuickAddTopic.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = inputQuickTopicName.value.trim();
  if (!name || !quickContentIdForTopic) return;

  const newTopic = {
    id: 'top-' + Date.now(),
    contentId: quickContentIdForTopic,
    name: name
  };

  state.topics.push(newTopic);
  saveState();
  renderSubjects();

  if (timerContentSelect.value === quickContentIdForTopic) {
    const event = new Event('change');
    timerContentSelect.dispatchEvent(event);
    timerTopicSelect.value = newTopic.id;
  }

  // Auto-expand content node in tree view
  const contentNode = document.querySelector(`.tree-content-node[data-content-id="${quickContentIdForTopic}"]`);
  if (contentNode) {
    contentNode.classList.add('expanded');
    // Also expand parent subject node
    const parentSubNode = contentNode.closest('.tree-subject-node');
    if (parentSubNode) parentSubNode.classList.add('expanded');
  }

  modalQuickAddTopic.classList.add('hidden');
  quickContentIdForTopic = null;
});

// Logic: Tasks actions
formAddTask.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = taskTitleInput.value.trim();
  const subjectId = taskSubjectSelect.value;
  const dueDate = taskDueDateInput.value;
  const priority = taskPrioritySelect.value;

  if (!title || !subjectId) return;

  const newTask = {
    id: 'task-' + Date.now(),
    title,
    subjectId,
    dueDate,
    priority,
    completed: false
  };

  state.tasks.push(newTask);
  saveState();

  updateDashboardStats();
  renderTasks();

  taskTitleInput.value = '';
  taskDueDateInput.value = '';
  taskPrioritySelect.value = 'medium';
});

tasksListContainer.addEventListener('click', (e) => {
  const checkbox = e.target.closest('.custom-checkbox input');
  if (checkbox) {
    const id = checkbox.dataset.id;
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      task.completed = checkbox.checked;
      saveState();
      updateDashboardStats();
      setTimeout(renderTasks, 150);
    }
    return;
  }

  const deleteBtn = e.target.closest('.btn-delete-task');
  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveState();
    updateDashboardStats();
    renderTasks();
  }
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    state.currentFilter = e.target.dataset.filter;
    renderTasks();
  });
});

// Logic: Revisions actions
formAddRevision.addEventListener('submit', (e) => {
  e.preventDefault();
  const subjectId = reviewSubjectSelect.value;
  const contentId = reviewContentSelect.value;
  const topicId = reviewTopicSelect.value;
  const days = parseInt(reviewIntervalSelect.value);
  
  const levelRadio = document.querySelector('input[name="knowledge-level"]:checked');
  const level = levelRadio ? levelRadio.value : 'medio';

  if (!subjectId || !contentId || !topicId || isNaN(days)) {
    alert("Selecione a Matéria, o Conteúdo e o Assunto Específico para agendar!");
    return;
  }

  const scheduledTime = Date.now() + days * 86400000;

  const newRevision = {
    id: 'rev-' + Date.now(),
    subjectId,
    contentId,
    topicId,
    days,
    nextReviewDate: scheduledTime,
    level,
    completed: false,
    completionHistory: []
  };

  state.revisions.push(newRevision);
  saveState();
  
  updateDashboardStats();
  renderRevisions();
  renderProgressTab();

  // Reset inputs
  reviewIntervalSelect.value = '7';
  document.querySelector('input[name="knowledge-level"][value="medio"]').checked = true;

  alert("Revisão agendada com sucesso!");
});

revisionsListContainer.addEventListener('click', (e) => {
  const completeBtn = e.target.closest('.btn-complete-revision');
  if (completeBtn) {
    const id = completeBtn.dataset.id;
    const rev = state.revisions.find(r => r.id === id);
    if (rev) {
      activeReviewToComplete = rev;
      
      const topicObj = state.topics.find(t => t.id === rev.topicId);
      modalReviewTitle.textContent = topicObj ? topicObj.name : (rev.topic || 'Assunto');
      
      document.querySelectorAll('input[name="modal-knowledge-level"]').forEach(radio => {
        radio.checked = radio.value === rev.level;
      });
      document.getElementById('modal-next-interval').value = 'none';

      modalCompleteReview.classList.remove('hidden');
    }
    return;
  }

  const deleteBtn = e.target.closest('.btn-delete-revision');
  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    if (confirm("Deseja excluir esta revisão?")) {
      state.revisions = state.revisions.filter(r => r.id !== id);
      saveState();
      updateDashboardStats();
      renderRevisions();
      renderProgressTab();
    }
  }
});

btnCloseModal.addEventListener('click', () => {
  modalCompleteReview.classList.add('hidden');
  activeReviewToComplete = null;
});

btnSubmitModalReview.addEventListener('click', () => {
  if (!activeReviewToComplete) return;

  const newLevelRadio = document.querySelector('input[name="modal-knowledge-level"]:checked');
  const nextInterval = document.getElementById('modal-next-interval').value;

  if (newLevelRadio) {
    activeReviewToComplete.level = newLevelRadio.value;
  }

  activeReviewToComplete.completionHistory.push(Date.now());

  if (nextInterval === 'none') {
    activeReviewToComplete.completed = true;
    activeReviewToComplete.nextReviewDate = Date.now();
  } else {
    const days = parseInt(nextInterval);
    activeReviewToComplete.days = days;
    activeReviewToComplete.nextReviewDate = Date.now() + days * 86400000;
    activeReviewToComplete.completed = false;
  }

  saveState();
  updateDashboardStats();
  renderRevisions();
  renderProgressTab();

  modalCompleteReview.classList.add('hidden');
  activeReviewToComplete = null;
});

document.querySelectorAll('.rev-filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.rev-filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    state.currentRevFilter = e.target.dataset.filter;
    renderRevisions();
  });
});

// Logic: History actions
btnClearHistory.addEventListener('click', () => {
  if (confirm('Deseja limpar todo o histórico?')) {
    state.history = [];
    saveState();
    updateDashboardStats();
    renderSubjects();
    renderHistory();
    renderReports();
  }
});

historyListContainer.addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('.btn-delete-log');
  if (!deleteBtn) return;

  const id = deleteBtn.dataset.id;
  state.history = state.history.filter(h => h.id !== id);
  saveState();
  updateDashboardStats();
  renderSubjects();
  renderHistory();
  renderReports();
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  updateDashboardStats();
  renderSubjects();
  renderTasks();

  setupChainSelectors(timerSubjectSelect, timerContentSelect, timerTopicSelect, btnQuickAddContent, btnQuickAddTopic);
  setupChainSelectors(reviewSubjectSelect, reviewContentSelect, reviewTopicSelect, null, null);

  btnTimerToggle.addEventListener('click', toggleTimer);
  btnTimerReset.addEventListener('click', resetTimer);

  updateTimerDisplay();
});
