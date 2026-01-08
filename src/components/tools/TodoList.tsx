import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('Solventless_todos');
    if (saved) {
      setTodos(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('Solventless_todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newTodo.trim()) return;
    
    const todo: TodoItem = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    
    setTodos([todo, ...todos]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-3 border-2 border-black focus:ring-2 focus:ring-black focus:outline-none font-mono"
        />
        <button
          onClick={addTodo}
          className="px-6 py-3 bg-black text-white font-bold uppercase hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus size={20} strokeWidth={2.5} />
          Add
        </button>
      </div>

      <div className="space-y-2">
        {todos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg font-bold uppercase">No tasks yet</p>
            <p className="text-sm">Add your first task above</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`p-4 border-2 border-black bg-white flex items-center gap-3 ${
                todo.completed ? 'opacity-50' : ''
              }`}
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`w-6 h-6 border-2 border-black flex items-center justify-center flex-shrink-0 ${
                  todo.completed ? 'bg-black' : 'bg-white'
                }`}
              >
                {todo.completed && <Check size={16} className="text-white" strokeWidth={3} />}
              </button>
              
              <span
                className={`flex-1 font-mono ${
                  todo.completed ? 'line-through text-gray-500' : 'text-black'
                }`}
              >
                {todo.text}
              </span>
              
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={18} strokeWidth={2.5} />
              </button>
            </div>
          ))
        )}
      </div>

      {todos.length > 0 && (
<<<<<<< HEAD
        <div className="pt-4 border-t-2 border-gray-200 text-sm text-gray-600 font-mono">
          {todos.filter(t => !t.completed).length} active • {todos.filter(t => t.completed).length} completed
=======
        <div className="pt-4 border-t-2 border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600 font-mono">
            {todos.filter(t => !t.completed).length} active • {todos.filter(t => t.completed).length} completed
          </div>
          {todos.some(t => t.completed) && (
            <button
              onClick={() => {
                if (window.confirm('Delete all completed tasks?')) {
                  setTodos(todos.filter(t => !t.completed));
                }
              }}
              className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 font-bold uppercase transition-colors"
            >
              Clear Completed
            </button>
          )}
>>>>>>> 77ba376b604355ede97c1706d992f9306b3b7b4a
        </div>
      )}
    </div>
  );
};

export default TodoList;

