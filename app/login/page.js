'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/authService';
import { COLORS } from '@/lib/utils/colors';
import { inputStyle, btnPrimary } from '@/lib/utils/styles';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.signIn(email, password);
      router.replace('/resumen');
    } catch (err) {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.snow,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          padding: 36,
          borderRadius: 16,
          border: `1px solid ${COLORS.pink}`,
          width: 360,
          boxShadow: '0 4px 20px rgba(138,100,132,0.12)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <img src="/logo.png" alt="Nevara" style={{ width: 56, height: 56, marginBottom: 10 }} />
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: COLORS.mauveDark }}>Nevara</div>
          <div style={{ fontSize: 11, color: COLORS.gold, letterSpacing: 3 }}>BEAUTY MAKEUP</div>
        </div>

        <label style={{ fontSize: 12, color: COLORS.inkSoft, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block' }}>
          Correo
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ ...inputStyle, width: '100%', marginBottom: 14 }}
          placeholder="tucorreo@ejemplo.com"
        />

        <label style={{ fontSize: 12, color: COLORS.inkSoft, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block' }}>
          Contraseña
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ ...inputStyle, width: '100%', marginBottom: 18 }}
          placeholder="••••••••"
        />

        {error && (
          <div style={{ background: '#FBEAEA', color: COLORS.danger, padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={{ ...btnPrimary, width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
