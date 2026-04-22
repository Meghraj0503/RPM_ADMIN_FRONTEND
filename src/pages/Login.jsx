import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3006';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://43.204.30.135:3006';
export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/admin/auth/login`, { email, password });
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminName',  res.data.name);
      localStorage.setItem('adminRole',  res.data.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #E8FBF7 0%, #F4F6F9 60%, #EBF5FF 100%)'
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, padding: '44px 40px', width: 400,
        boxShadow: '0 8px 40px rgba(0,0,0,0.10)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, background: 'linear-gradient(135deg,#00C9A7,#2D9EF0)',
            borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, color: '#fff', fontWeight: 800, marginBottom: 12
          }}>A</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D23', margin: 0 }}>AAYU Admin</h1>
          <p style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>Sign in to your admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
              Email Address
            </label>
            <input
              type="email"
              style={{
                width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB',
                borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box', transition: 'border-color 0.2s'
              }}
              placeholder="admin@aayu.health"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#00C9A7'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              required
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
              Password
            </label>
            <input
              type="password"
              style={{
                width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB',
                borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box', transition: 'border-color 0.2s'
              }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#00C9A7'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              required
            />
          </div>

          {error && (
            <div style={{
              background: '#FFF0F0', color: '#FF5C5C', borderRadius: 8,
              padding: '10px 14px', fontSize: 13, marginBottom: 16, borderLeft: '3px solid #FF5C5C'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', background: loading ? '#9CA3AF' : '#00C9A7',
              color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: '14px', background: '#F4F6F9', borderRadius: 10 }}>
          <p style={{ fontSize: 12, color: '#6B7280', margin: 0, fontWeight: 600 }}>Default Credentials</p>
          <p style={{ fontSize: 12, color: '#374151', margin: '4px 0 0' }}>
            📧 admin@aayu.health &nbsp;|&nbsp; 🔑 Admin@123
          </p>
        </div>
      </div>
    </div>
  );
}
