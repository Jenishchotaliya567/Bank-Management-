import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const typeConfig = {
    success: { bg: 'rgba(16, 185, 129, 0.9)', icon: CheckCircle2 },
    error: { bg: 'rgba(239, 68, 68, 0.9)', icon: AlertTriangle },
    info: { bg: 'rgba(6, 182, 212, 0.9)', icon: Info }
  };

  const config = typeConfig[type] || typeConfig.info;
  const IconComponent = config.icon;

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      background: config.bg,
      color: '#fff',
      padding: '0.85rem 1.25rem',
      borderRadius: 'var(--radius-sm)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      zIndex: 2000,
      backdropFilter: 'blur(8px)',
      fontWeight: '600',
      fontSize: '0.9rem'
    }}>
      <IconComponent size={20} />
      <span>{message}</span>
      <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '0.5rem' }}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
