// components/TaskForm.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TaskForm({ user, onSaved, editing }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || '');
      setDescription(editing.description || '');
      setDueDate(editing.due_date ? editing.due_date.split('T')[0] : '');
      setPriority(editing.priority || 'medium');
      setStatus(editing.status || 'todo');
    } else {
      setTitle(''); setDescription(''); setDueDate(''); setPriority('medium'); setStatus('todo');
    }
  }, [editing]);

  if (!user) return <p>Please sign in to manage tasks.</p>;

  async function handleSave(e) {
    e.preventDefault();
    if (!title.trim()) return alert('Title is required');
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase.from('tasks').update({ title, description, due_date: dueDate || null, priority, status }).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('tasks').insert([{ owner_id: user.id, title, description, due_date: dueDate || null, priority, status }]);
        if (error) throw error;
      }
      onSaved?.();
    } catch (err) {
      alert(err.message);
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSave} style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, marginBottom: 12 }}>
      <h2>{editing ? 'Edit task' : 'New task'}</h2>
      <div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title*" />
      </div>
      <div>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
      </div>
      <div>
        <label>Due</label>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
      </div>
      <div>
        <label>Priority</label>
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div>
        <label>Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}
