import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { loginUser, getErrorMessage } from '../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(form);
      localStorage.setItem('user', JSON.stringify({ id: res.id, username: res.username, email: res.email }));
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <GraduationCap className="w-10 h-10 text-[#569cd6]" />
          <h1 className="text-2xl font-bold text-white font-mono">CodeTutor</h1>
          <p className="text-sm text-[#858585]">Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[#252526] border border-[#3c3c3c] rounded p-6">
          {error && <p className="text-xs text-[#f48771] bg-[#5a1d1d] border border-[#f48771]/30 rounded px-3 py-2">{error}</p>}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#cccccc]">Email</label>
            <input type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="bg-[#3c3c3c] border border-[#555] rounded px-3 py-2 text-sm text-[#cccccc] focus:outline-none focus:border-[#569cd6]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#cccccc]">Password</label>
            <input type="password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="bg-[#3c3c3c] border border-[#555] rounded px-3 py-2 text-sm text-[#cccccc] focus:outline-none focus:border-[#569cd6]" />
          </div>
          <button type="submit" disabled={loading}
            className="mt-1 bg-[#0e639c] hover:bg-[#1177bb] disabled:opacity-50 text-white text-sm font-medium py-2 rounded transition-colors cursor-pointer">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-xs text-[#858585] mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#569cd6] hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
