import React, { useState } from 'react'

interface PillowAuthProps {
  onAuthenticated: () => void;
  onCancel: () => void;
}

export default function PillowAuth({ onAuthenticated, onCancel }: PillowAuthProps) {
  const [pass, setPass] = useState('')
  const [status, setStatus] = useState('AWAITING_KEY')

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // if (pass === import.meta.env.VITE_PILLOW_SECRET) {
      if (pass === "admin") {
      setStatus('ACCESS_GRANTED');
      setTimeout(onAuthenticated, 1000);
    } else {
      setStatus('ACCESS_DENIED');
      setPass('');
    }
  }

  return (
    <div className="auth-overlay">
      <div className="auth-terminal">
        <div className="status-line">SYS_STATUS: {status}</div>
        <form onSubmit={handleVerify}>
          <input 
            type="password" 
            autoFocus 
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="ENTER_NEURAL_KEY..."
          />
        </form>
      </div>
      <style>{`
        .auth-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.95); z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          font-family: 'monospace';
        }
        .auth-terminal { width: 300px; color: #0f0; }
        input { 
          background: transparent; border: none; border-bottom: 1px solid #333;
          color: #fff; width: 100%; padding: 10px 0; outline: none;
        }
      `}</style>
    </div>
  )
}