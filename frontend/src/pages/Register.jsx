import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, UserPlus, User, Mail, Lock, ShieldCheck, 
  CheckCircle2, Copy, ArrowRight, Server, KeyRound, Check
} from 'lucide-react';

const AUTHORIZATION_CATEGORIES = [
  {
    id: 'bank_manager',
    name: 'Bank Manager / Executive',
    tier: 'Tier 2 (Management Level)',
    icon: '🏢',
    description: 'Branch oversight, credit risk ML analysis, customer management, transaction oversight',
    permissions: [
      'Full Customer Ledger & Accounts Control',
      'ML Risk & Term Deposit Subscription Predictions',
      'Transaction Overrides & High-Value Approval',
      'Branch Analytics & Performance Audits'
    ]
  },
  {
    id: 'admin',
    name: 'System Administrator',
    tier: 'Tier 1 (Root Access)',
    icon: '👑',
    description: 'Complete system control, role permissions governance, audit logs & security setup',
    permissions: [
      'User Access & Role Assignment Control',
      'System Audit Logging & Security Monitor',
      'Database Direct Operations & Backup',
      'API Key & Integration Management'
    ]
  },
  {
    id: 'bank_teller',
    name: 'Bank Teller / Cashier',
    tier: 'Tier 3 (Operational Level)',
    icon: '💳',
    description: 'Front-desk operations, cash deposits, withdrawals, and account status verifications',
    permissions: [
      'Process Cash Deposits & Withdrawals',
      'Execute Account Transfers',
      'Customer Identification & Verification',
      'Account Ledger Search & Balance Check'
    ]
  },
  {
    id: 'analyst',
    name: 'Financial & ML Analyst',
    tier: 'Tier 4 (Analytic Level)',
    icon: '📊',
    description: 'Read-only analytics access to ML prediction models, campaign performance & metrics',
    permissions: [
      'Term Deposit ML Model Metrics Inspection',
      'Customer Demographic & Feature Analysis',
      'Historical Prediction Logs Auditing',
      'Export Financial Analytics Reports'
    ]
  },
  {
    id: 'customer',
    name: 'Customer / Account Holder',
    tier: 'Tier 5 (End-User Level)',
    icon: '👤',
    description: 'Personal banking access to balances, personal transfers, and account statements',
    permissions: [
      'View Personal Bank Accounts & Balances',
      'Transfer Funds to Other Accounts',
      'Download Personal Transaction History',
      'Request Credit & Term Deposit Evaluation'
    ]
  }
];

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('bank_manager');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdAccount, setCreatedAccount] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register(fullName, email, password, selectedCategory);
      const categoryObj = AUTHORIZATION_CATEGORIES.find(c => c.id === selectedCategory);
      
      const pastedTextSnippet = `==================================================
APEXBANK MANAGEMENT SYSTEM - NEW ACCOUNT CONFIRMATION
==================================================
Account Holder Name   : ${fullName}
Email Address         : ${email}
Authorization Category: ${categoryObj?.name || selectedCategory}
Category ID           : ${selectedCategory}
Security Level        : ${categoryObj?.tier}
Account Status        : ACTIVE & VERIFIED (HTTP 201 Created)
System User ID        : #${res.user?.id || 'AUTO'}
Registered Timestamp  : ${new Date().toLocaleString()}
Access Token (Bearer) : ${res.token ? res.token.substring(0, 32) + '...' : 'GENERATED'}

AUTHORIZED PERMISSIONS & PROPERTIES:
${categoryObj?.permissions.map(p => ` - ${p}`).join('\n')}
==================================================`;

      setCreatedAccount({
        user: res.user,
        token: res.token,
        category: categoryObj,
        pastedText: pastedTextSnippet
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || (err.code === 'ERR_NETWORK'
        ? 'Cannot reach the banking server. Please ensure backend is running on http://127.0.0.1:8000.'
        : 'Registration failed. Please check your inputs and try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPastedText = () => {
    if (createdAccount?.pastedText) {
      navigator.clipboard.writeText(createdAccount.pastedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const activeCategoryObj = AUTHORIZATION_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, rgba(6, 182, 212, 0.18) 0%, #0b0f19 75%)',
      padding: '2rem 1.5rem'
    }}>
      <div style={{ width: '100%', maxWidth: createdAccount ? '720px' : '900px' }}>
        
        {/* SUCCESS CREATED ACCOUNT MODAL / CARD SHOWING PASTED TEXT */}
        {createdAccount ? (
          <div className="card" style={{ padding: '2.5rem', border: '1px solid rgba(52, 211, 153, 0.4)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(52, 211, 153, 0.2)',
                border: '2px solid #34d399',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
                marginBottom: '1rem'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <span className="badge badge-success" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Account Successfully Created & Verified
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '0.5rem' }}>
                Welcome, {createdAccount.user?.full_name}!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Your new account with <strong>{createdAccount.category?.name}</strong> authorization category is live.
              </p>
            </div>

            {/* Pasted Text Confirmation Container */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📋 Created Account Properties & Pasted Text Confirmation:
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCopyPastedText}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.4rem' }}
                >
                  {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Pasted Text'}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={12}
                value={createdAccount.pastedText}
                style={{
                  width: '100%',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '0.82rem',
                  lineHeight: '1.45',
                  backgroundColor: '#05070d',
                  color: '#34d399',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            {/* Properties Summary Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '2rem',
              border: '1px solid var(--border-color)'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Category</div>
                <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                  {createdAccount.category?.name}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Security Level</div>
                <div style={{ fontWeight: '700', color: '#38bdf8', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                  {createdAccount.category?.tier}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</div>
                <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                  {createdAccount.user?.email}
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
              onClick={() => navigate('/')}
            >
              <span>Proceed to Banking Dashboard</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          
          /* REGISTRATION FORM & AUTHORIZATION CATEGORIES CHOICE */
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                marginBottom: '1rem',
                boxShadow: '0 8px 20px rgba(6, 182, 212, 0.4)'
              }}>
                <Building2 size={32} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>Create Bank System Account</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Select an Authorization Category and define your account credentials
              </p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Server size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* Account Credentials */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-control"
                      style={{ paddingLeft: '2.8rem' }}
                      placeholder="e.g. Jenish Chotaliya"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      className="form-control"
                      style={{ paddingLeft: '2.8rem' }}
                      placeholder="e.g. jenish@bank.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label className="form-label">Account Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    className="form-control"
                    style={{ paddingLeft: '2.8rem' }}
                    placeholder="At least 8 characters"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Authorization Category Selection Section */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <ShieldCheck size={18} color="var(--primary)" />
                  <label className="form-label" style={{ marginBottom: 0, fontSize: '0.95rem', color: '#fff' }}>
                    Select Authorization Category (Role & Security Tier)
                  </label>
                </div>

                {/* Category Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.85rem' }}>
                  {AUTHORIZATION_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{
                          padding: '1rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          background: isSelected ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '1.3rem' }}>{cat.icon}</span>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '12px',
                              background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                              color: isSelected ? '#000' : 'var(--text-muted)'
                            }}>
                              {cat.tier}
                            </span>
                          </div>
                          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: isSelected ? '#fff' : 'var(--text-secondary)' }}>
                            {cat.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: '1.35' }}>
                            {cat.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Category Permissions Box */}
              {activeCategoryObj && (
                <div style={{
                  background: 'rgba(6, 182, 212, 0.06)',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.75rem'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#38bdf8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    Granted Properties & Permissions for {activeCategoryObj.name}:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.4rem' }}>
                    {activeCategoryObj.permissions.map((perm, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <CheckCircle2 size={14} color="#34d399" style={{ flexShrink: 0 }} />
                        <span>{perm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', gap: '0.5rem' }}
                disabled={loading}
              >
                <UserPlus size={18} />
                <span>{loading ? 'Creating Account & Registering...' : 'Create Bank Account'}</span>
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                Sign In Here
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Register;
