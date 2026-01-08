import { TodoItem } from '@/types';

const STORAGE_KEY = 'Solventless_todos';

export const loadTodos = (): TodoItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load todos:', error);
    return [];
  }
};

export const saveTodos = (todos: TodoItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('Failed to save todos:', error);
  }
};

export const addTodo = (text: string): TodoItem => {
  const todos = loadTodos();
  const newTodo: TodoItem = {
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.push(newTodo);
  saveTodos(todos);
  return newTodo;
};

export const toggleTodo = (id: string): void => {
  const todos = loadTodos();
  const updatedTodos = todos.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTodos(updatedTodos);
};

export const deleteTodo = (id: string): void => {
  const todos = loadTodos();
  const filtered = todos.filter(t => t.id !== id);
  saveTodos(filtered);
};

