import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import TaskForm from '../components/TaskForm';
import { format } from 'date-fns';

export default function Home({ supabaseSession }) {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async function init() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    })();
  }, []);

  useEffect(() => { if (user) fetchTasks(); }, [user, filter, search]);

  async function fetchTasks() {
    setLoading(true);
    try {
      let q = supabase.from('tasks').select('*').order('inserted_at', { ascending: false });
      if (filter !== 'all') q = q.eq('status', filter);
      if (search.trim()) q = q.filter('title', 'ilike', `%${search}%`).or(`description.ilike.%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setTasks([]);
  }

  return (
    <div className="container">
      <header>
        <h1>Task Tracker</h1>
        {user ? (
          <div>
            <span>{user.email}</span>
            <button onClick={signOut}>Sign out</button>
          </div>
        ) : (
          <a href="/auth">Sign in / Sign up</a>
        )}
      </header>

      <main>
        <section className="controls">
          <div>
            <label>Filter:</label>
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            <button onClick={fetchTasks}>Refresh</button>
          </div>
        </section>

        <section>
          <TaskForm user={user} onSaved={() => { fetchTasks(); setEditing(null); }} editing={editing} />
        </section>

        <section>
          {loading ? <p>Loading...</p> : (
            <ul>
              {tasks.map(t => (
                <li key={t.id}>
                  <h3>{t.title}</h3>
                  <p>{t.description}</p>
                  <p>Due: {t.due_date ? format(new Date(t.due_date), 'yyyy-MM-dd') : '—'}</p>
                  <p>Priority: {t.priority} | Status: {t.status}</p>
                  <button onClick={() => setEditing(t)}>Edit</button>
                  <button onClick={async () => {
                    if (!confirm('Delete this task?')) return;
                    const { error } = await supabase.from('tasks').delete().eq('id', t.id);
                    if (error) return alert(error.message);
                    fetchTasks();
                  }}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <style jsx>{`
        .container { max-width: 900px; margin: 0 auto; padding: 1rem; }
        header { display:flex; justify-content:space-between; align-items:center }
        ul { list-style:none; padding:0 }
        li { border:1px solid #ddd; padding:0.8rem; margin-bottom:0.6rem; border-radius:8px }
      `}</style>
    </div>
  );
}
