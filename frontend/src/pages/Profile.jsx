import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Mail, Shield, Calendar, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>Manager Profile Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Account security credentials and administrative privileges</p>
      </div>

      <div className="card" style={{ maxWidth: '650px', padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.8rem',
            fontWeight: '800'
          }}>
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>{user?.full_name}</h2>
            <span className="badge badge-success" style={{ marginTop: '0.3rem' }}>
              {user?.role?.toUpperCase() || 'BANK MANAGER'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Mail size={20} color="var(--text-muted)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>EMAIL ADDRESS</div>
              <div style={{ fontWeight: '700', color: '#fff', fontSize: '1rem' }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Shield size={20} color="var(--text-muted)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>ROLE & PERMISSIONS</div>
              <div style={{ fontWeight: '700', color: '#fff', fontSize: '1rem' }}>Full Bank Management & ML Inference Access</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Calendar size={20} color="var(--text-muted)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>ACCOUNT CREATED</div>
              <div style={{ fontWeight: '700', color: '#fff', fontSize: '1rem' }}>
                {user?.created_at ? new Date(user.created_at).toLocaleString() : 'System Admin Default'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={logout} className="btn btn-danger">
            <LogOut size={18} />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
