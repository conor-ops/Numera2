import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, ListTodo } from 'lucide-react';
import { TodoItem } from '../types';
import { loadTodos, addTodo, toggleTodo, deleteTodo, saveTodos } from '../services/todoService'; // Added saveTodos
import { triggerHaptic } from '../services/hapticService';
import { ImpactStyle } from '@capacitor/haptics';

interface TodoListProps {
  isPro: boolean;
  onUpgradeClick: () => void;
  onClose: () => void;
}

const FREE_TODO_LIMIT = 10;

const TodoList: React.FC<TodoListProps> = ({ isPro, onUpgradeClick, onClose }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');

  useEffect(() => {
    setTodos(loadTodos());
  }, []);

  const canAddMore = isPro || todos.length < FREE_TODO_LIMIT;

  const handleAdd = async () => {
    await triggerHaptic(ImpactStyle.Medium);
    
    if (!canAddMore) {
      onUpgradeClick();
      return;
    }

    if (newTodoText.trim()) {
      addTodo(newTodoText.trim());
      setTodos(loadTodos());
      setNewTodoText('');
    }
  };

  const handleToggle = async (id: string) => {
    await triggerHaptic(ImpactStyle.Light);
    toggleTodo(id);
    setTodos(loadTodos());
  };

  const handleDelete = async (id: string) => {
    await triggerHaptic(ImpactStyle.Heavy);
    deleteTodo(id);
    setTodos(loadTodos());
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="flex flex-col h-full">
      
      {/* Add Task Form */}
      <div className="p-6 border-b-2 border-black bg-gray-50 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={canAddMore ? "What needs to be done?" : `Upgrade for more than ${FREE_TODO_LIMIT} tasks`}
            disabled={!canAddMore}
            className="flex-1 p-3 border-2 border-black font-medium disabled:bg-gray-200 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleAdd}
            disabled={!canAddMore || !newTodoText.trim()}
            className={`px-6 py-3 font-bold uppercase text-sm border-2 border-black flex items-center gap-2 ${
              canAddMore && newTodoText.trim()
                ? 'bg-brand-blue text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </div>

      {/* Todo Lists */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* Active Tasks */}
        {activeTodos.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase text-gray-500 mb-3">Active Tasks ({activeTodos.length})</h3>
            <div className="space-y-2">
              {activeTodos.map(todo => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-3 border-2 border-black bg-white hover:bg-gray-50 transition-colors group"
                >
                  <button
                    onClick={() => handleToggle(todo.id)}
                    className="text-gray-400 hover:text-brand-blue transition-colors"
                  >
                    <Circle size={24} />
                  </button>
                  <span className="flex-1 font-medium">{todo.text}</span>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTodos.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase text-gray-500 mb-3">Completed ({completedTodos.length})</h3>
            <div className="space-y-2">
              {completedTodos.map(todo => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-3 border-2 border-gray-300 bg-gray-50 transition-colors group"
                >
                  <button
                    onClick={() => handleToggle(todo.id)}
                    className="text-brand-blue"
                  >
                    <CheckCircle2 size={24} />
                  </button>
                  <span className="flex-1 font-medium line-through text-gray-500">{todo.text}</span>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {todos.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <ListTodo size={48} className="mx-auto mb-4 opacity-50" />
            <p>No tasks yet</p>
            <p className="text-sm">Add your first task above</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {todos.length > 0 && (
        <div className="p-4 border-t-2 border-black bg-gray-50 text-sm font-medium text-gray-600 flex justify-between items-center">
          <span>{activeTodos.length} active • {completedTodos.length} completed • {todos.length} total</span>
          {completedTodos.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Delete all completed tasks?')) {
                  setTodos(todos.filter(t => !t.completed));
                  saveTodos(todos.filter(t => !t.completed)); // Update localStorage
                }
              }}
              className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 font-bold uppercase transition-colors border-2 border-black"
            >
              Clear Completed
            </button>
          )}
        </div>
      )}
    </div>
