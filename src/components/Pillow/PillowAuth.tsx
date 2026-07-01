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
    
    // Reverted back to the local test bypass so it actually works!
    if (pass === "admin") { 
      setStatus('ACCESS_GRANTED');
      setTimeout(onAuthenticated, 1000);
    } else {
      setStatus('ACCESS_DENIED');
      setPass('');
    }
  }

  return (
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
      <style>{`
        .auth-terminal { 
          width: 300px; 
          color: #0f0; 
          font-family: 'monospace';
          text-align: left;
        }
        input { 
          background: transparent; 
          border: none; 
          border-bottom: 1px solid #333;
          color: #fff; 
          width: 100%; 
          padding: 10px 0; 
          outline: none;
          font-family: 'monospace';
        }
      `}</style>
    </div>
  )
}