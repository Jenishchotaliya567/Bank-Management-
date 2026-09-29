import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mlApi } from '../services/api';
import Toast from '../components/Toast';
import { BrainCircuit, Sparkles, Sliders, ArrowRight } from 'lucide-react';

const MLPrediction = () => {
  const [features, setFeatures] = useState(null);
  const [formData, setFormData] = useState({
    age: 38,
    job: 'management',
    marital: 'married',
    education: 'tertiary',
    default: 'no',
    balance: 2500,
    housing: 'no',
    loan: 'no',
    contact: 'cellular',
    day: 15,
    month: 'may',
    duration: 320,
    campaign: 1,
    pdays: -1,
    previous: 0,
    poutcome: 'unknown'
  });
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    mlApi.getFeatures()
      .then((res) => {
        setFeatures(res.data);
      })
      .catch((err) => {
        console.error(err);
        setToast({ message: 'Failed to fetch model feature schema.', type: 'error' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPredicting(true);
    try {
      const res = await mlApi.predict(formData);
      // Navigate to results page with prediction state
      navigate('/ml-results', { state: { prediction: res.data, inputData: formData } });
    } catch (err) {
      setToast({ message: err.response?.data?.detail || 'Prediction failed.', type: 'error' });
    } finally {
      setPredicting(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading AI Model Feature Schema...</div>;

  return (
    <div>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>ML Term Deposit Subscription Predictor</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Evaluate client propensity to subscribe to long-term deposit products powered by XGBoost Classifier
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Dynamic Form Sections */}
        <div className="grid-2">
          {/* Section 1: Customer Demographic & Balance Attributes */}
          <div className="card">
            <div className="card-title">
              <Sliders size={20} color="#6366f1" />
              <span>Demographic & Account Features</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Age (Years)</label>
                <input type="number" name="age" className="form-control" value={formData.age} onChange={handleChange} min="18" max="100" required />
              </div>

              <div className="form-group">
                <label className="form-label">Account Balance ($)</label>
                <input type="number" name="balance" className="form-control" value={formData.balance} onChange={handleChange} step="1" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Profession / Job</label>
                <select name="job" className="form-select" value={formData.job} onChange={handleChange}>
                  {features?.cat_options?.job?.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Marital Status</label>
                <select name="marital" className="form-select" value={formData.marital} onChange={handleChange}>
                  {features?.cat_options?.marital?.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Education Level</label>
                <select name="education" className="form-select" value={formData.education} onChange={handleChange}>
                  {features?.cat_options?.education?.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Credit Default Status</label>
                <select name="default" className="form-select" value={formData.default} onChange={handleChange}>
                  {features?.cat_options?.default?.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Housing Loan</label>
                <select name="housing" className="form-select" value={formData.housing} onChange={handleChange}>
                  {features?.cat_options?.housing?.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Personal Loan</label>
                <select name="loan" className="form-select" value={formData.loan} onChange={handleChange}>
                  {features?.cat_options?.loan?.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Campaign Telemetry & Historical Contact Attributes */}
          <div className="card">
            <div className="card-title">
              <BrainCircuit size={20} color="#06b6d4" />
              <span>Campaign & Contact Behavioral Features</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Contact Channel</label>
                <select name="contact" className="form-select" value={formData.contact} onChange={handleChange}>
                  {features?.cat_options?.contact?.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Last Contact Month</label>
                <select name="month" className="form-select" value={formData.month} onChange={handleChange}>
                  {features?.cat_options?.month?.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Last Contact Day (1-31)</label>
                <input type="number" name="day" className="form-control" value={formData.day} onChange={handleChange} min="1" max="31" required />
              </div>

              <div className="form-group">
                <label className="form-label">Call Duration (Seconds)</label>
                <input type="number" name="duration" className="form-control" value={formData.duration} onChange={handleChange} min="0" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Campaign Contact Count</label>
                <input type="number" name="campaign" className="form-control" value={formData.campaign} onChange={handleChange} min="1" required />
              </div>

              <div className="form-group">
                <label className="form-label">Pdays (-1 if never contacted)</label>
                <input type="number" name="pdays" className="form-control" value={formData.pdays} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Previous Contacts Count</label>
                <input type="number" name="previous" className="form-control" value={formData.previous} onChange={handleChange} min="0" required />
              </div>

              <div className="form-group">
                <label className="form-label">Previous Campaign Outcome</label>
                <select name="poutcome" className="form-select" value={formData.poutcome} onChange={handleChange}>
                  {features?.cat_options?.poutcome?.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="card" style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }} disabled={predicting}>
            <Sparkles size={20} />
            <span>{predicting ? 'Computing AI Prediction...' : 'Generate Prediction'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MLPrediction;
