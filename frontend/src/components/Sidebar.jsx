import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowLeftRight,
  BrainCircuit,
  BarChart3,
  UserCheck,
  Building2
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Bank Accounts', path: '/accounts', icon: CreditCard },
    { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { label: 'ML Prediction', path: '/ml-predict', icon: BrainCircuit },
    { label: 'ML Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'My Profile', path: '/profile', icon: UserCheck },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      padding: '1.5rem 1rem'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem 2rem 0.75rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
        }}>
          <Building2 size={22} />
        </div>
        <div>
          <div style={{ fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.03em', color: '#fff' }}>ApexBank</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>ANALYTICS PLATFORM</div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? '#fff' : 'var(--text-muted)',
                background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(6,182,212,0.15))' : 'transparent',
                border: isActive ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              })}
            >
              <IconComponent size={20} color={item.path === '/ml-predict' ? '#06b6d4' : 'currentColor'} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* ML Engine Status Banner */}
      <div style={{
        marginTop: 'auto',
        background: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: 'var(--radius-sm)',
        padding: '1rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#818cf8', textTransform: 'uppercase' }}>ML Model Active</div>
        <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff', marginTop: '0.2rem' }}>XGBoost Classifier</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>ROC-AUC: 93.01%</div>
      </div>
    </aside>
  );
};

export default Sidebar;
