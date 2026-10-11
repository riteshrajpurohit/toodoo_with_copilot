const STORAGE_KEY = 'toodoo.tasks';

const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const list = document.querySelector('#todo-list');
const emptyState = document.querySelector('#empty-state');
const taskCount = document.querySelector('#task-count');
const clearCompleted = document.querySelector('#clear-completed');
const filterButtons = document.querySelectorAll('[data-filter]');

let tasks = loadTasks();
let currentFilter = 'all';

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function visibleTasks() {
  if (currentFilter === 'active') return tasks.filter((task) => !task.completed);
  if (currentFilter === 'completed') return tasks.filter((task) => task.completed);
  return tasks;
}

function render() {
  const shownTasks = visibleTasks();
  const activeCount = tasks.filter((task) => !task.completed).length;

  list.replaceChildren(...shownTasks.map(createTaskElement));
  emptyState.hidden = shownTasks.length > 0;
  taskCount.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} left`;
  clearCompleted.disabled = !tasks.some((task) => task.completed);
}

function createTaskElement(task) {
  const item = document.createElement('li');
  item.className = `todo-item${task.completed ? ' completed' : ''}`;

  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => updateTask(task.id, { completed: checkbox.checked }));

  const checkmark = document.createElement('span');
  checkmark.className = 'checkmark';
  checkmark.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.className = 'todo-text';
  text.textContent = task.text;

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-button';
  deleteButton.type = 'button';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => deleteTask(task.id));

  label.append(checkbox, checkmark, text);
  item.append(label, deleteButton);
  return item;
}

function updateTask(id, changes) {
  tasks = tasks.map((task) => task.id === id ? { ...task, ...changes } : task);
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  tasks.unshift({ id: crypto.randomUUID(), text, completed: false });
  saveTasks();
  input.value = '';
  render();
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => filterButton.classList.toggle('active', filterButton === button));
    render();
  });
});

clearCompleted.addEventListener('click', () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

render();