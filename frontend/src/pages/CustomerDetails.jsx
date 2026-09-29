import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { customerApi, accountApi, mlApi } from '../services/api';
import Toast from '../components/Toast';
import { User, Mail, Phone, Briefcase, GraduationCap, DollarSign, ShieldAlert, CreditCard, Sparkles, ArrowLeft } from 'lucide-react';

const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mlScore, setMlScore] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      customerApi.getById(id),
      accountApi.getAll()
    ]).then(([custRes, accsRes]) => {
      setCustomer(custRes.data);
      const custAccs = accsRes.data.filter(a => a.customer_id === parseInt(id, 10));
      setAccounts(custAccs);
    }).catch(err => {
      console.error(err);
      setToast({ message: 'Customer profile not found.', type: 'error' });
    }).finally(() => setLoading(false));
  }, [id]);

  const handleRunMlEvaluation = async () => {
    if (!customer) return;
    setMlLoading(true);
    try {
      const mlInput = {
        customer_id: customer.id,
        age: customer.age,
        job: customer.job,
        marital: customer.marital,
        education: customer.education,
        default: customer.default_status,
        balance: customer.balance,
        housing: customer.housing_loan,
        loan: customer.personal_loan,
        contact: customer.contact_type || 'cellular',
        day: 15,
        month: 'may',
        duration: 350,
        campaign: 1,
        pdays: -1,
        previous: 0,
        poutcome: 'unknown'
      };
      const res = await mlApi.predict(mlInput);
      setMlScore(res.data);
      setToast({ message: 'ML Evaluation complete!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to run ML evaluation.', type: 'error' });
    } finally {
      setMlLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Customer Profile...</div>;
  if (!customer) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Customer Not Found</div>;

  return (
    <div>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/customers" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Customer Directory
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>
            {customer.first_name} {customer.last_name}
          </h1>
          <button className="btn btn-primary" onClick={handleRunMlEvaluation} disabled={mlLoading}>
            <Sparkles size={18} />
            <span>{mlLoading ? 'Evaluating Model...' : 'Evaluate Term Deposit Propensity'}</span>
          </button>
        </div>
      </div>

      {/* Profile Overview & ML Banner Grid */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">
            <User size={20} color="#6366f1" />
            <span>Demographic & Financial Attributes</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Email</div>
              <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>{customer.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Phone</div>
              <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>{customer.phone || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Age</div>
              <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>{customer.age} years old</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Profession</div>
              <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem', textTransform: 'capitalize' }}>{customer.job}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Marital Status</div>
              <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem', textTransform: 'capitalize' }}>{customer.marital}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Education Level</div>
              <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem', textTransform: 'capitalize' }}>{customer.education}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Housing Loan</div>
              <div style={{ fontWeight: '700', color: customer.housing_loan === 'yes' ? '#fbbf24' : '#34d399' }}>{customer.housing_loan.toUpperCase()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Personal Loan</div>
              <div style={{ fontWeight: '700', color: customer.personal_loan === 'yes' ? '#fbbf24' : '#34d399' }}>{customer.personal_loan.toUpperCase()}</div>
            </div>
          </div>
        </div>

        {/* ML Propensity Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.12))', border: '1px solid rgba(99,102,241,0.3)' }}>
          <div className="card-title">
            <Sparkles size={20} color="#06b6d4" />
            <span>AI Subscription Propensity Assessment</span>
          </div>

          {mlScore ? (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>PREDICTED DECISION</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: mlScore.prediction === 1 ? '#34d399' : '#f87171' }}>
                    {mlScore.prediction_label}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>CONFIDENCE SCORE</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#38bdf8' }}>
                    {mlScore.confidence_percentage}%
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Marketing Category</div>
                <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem', marginTop: '0.2rem' }}>{mlScore.risk_level}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Key Predictive Drivers:</div>
                <ul style={{ paddingLeft: '1.2rem', color: '#d1d5db', fontSize: '0.85rem' }}>
                  {mlScore.key_factors.map((factor, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>{factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              Click "Evaluate Term Deposit Propensity" above to trigger real-time ML inference using XGBoost model.
            </div>
          )}
        </div>
      </div>

      {/* Customer Accounts Ledger */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-title">
          <CreditCard size={20} color="#10b981" />
          <span>Associated Bank Accounts ({accounts.length})</span>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Account Type</th>
                <th>Current Balance</th>
                <th>Account Status</th>
                <th>Date Opened</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length > 0 ? (
                accounts.map((acc) => (
                  <tr key={acc.id}>
                    <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{acc.account_number}</td>
                    <td>{acc.account_type}</td>
                    <td style={{ fontWeight: '700', color: '#34d399' }}>${acc.balance.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${acc.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                        {acc.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(acc.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No bank accounts linked to this customer profile.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
