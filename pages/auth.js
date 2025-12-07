import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUp(e) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return alert(error.message);
    alert('Check your email for confirmation link (if enabled)');
  }

  async function signIn(e) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return alert(error.message);
    window.location.href = '/';
  }

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto' }}>
      <h1>Auth</h1>
      <form onSubmit={signIn}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <div style={{ marginTop: 8 }}>
          <button onClick={signIn} disabled={loading}>Sign in</button>
          <button onClick={signUp} disabled={loading} style={{ marginLeft: 8 }}>Sign up</button>
        </div>
      </form>
    </div>
  );
}
