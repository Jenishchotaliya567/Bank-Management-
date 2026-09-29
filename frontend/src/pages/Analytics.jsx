import React, { useEffect, useState } from 'react';
import { mlApi } from '../services/api';
import StatCard from '../components/StatCard';
import { BarChart } from '../components/Charts';
import { BarChart3, Cpu, Target, Award, CheckCircle2, AlertCircle } from 'lucide-react';

const Analytics = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mlApi.getModelInfo()
      .then((res) => setModelInfo(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Model Telemetry & Evaluation Metrics...</div>;

  const allModels = modelInfo?.all_models_evaluated || {};
  const featureImportances = modelInfo?.feature_importances || [];
  const metrics = modelInfo?.metrics || {};

  // Feature Importance Bar Chart
  const featureChartData = {
    labels: featureImportances.slice(0, 10).map(f => f.feature),
    datasets: [{
      label: 'Feature Weight / Importance',
      data: featureImportances.slice(0, 10).map(f => f.importance),
      backgroundColor: 'rgba(6, 182, 212, 0.7)',
      borderColor: '#06b6d4',
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  const cm = metrics.confusion_matrix || [[0, 0], [0, 0]];
  const tn = cm[0]?.[0] || 0;
  const fp = cm[0]?.[1] || 0;
  const fn = cm[1]?.[0] || 0;
  const tp = cm[1]?.[1] || 0;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>Machine Learning Telemetry & Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Comparative benchmarks, confusion matrix, and feature attribution</p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid-4">
        <StatCard
          title="ML Problem Type"
          value={modelInfo?.problem_type || 'Classification'}
          icon={Target}
          color="indigo"
          subtext="Binary Subscription Status"
        />
        <StatCard
          title="Selected Engine"
          value={modelInfo?.selected_model || 'XGBoost'}
          icon={Cpu}
          color="cyan"
          subtext="Best F1 & ROC-AUC Model"
        />
        <StatCard
          title="ROC-AUC Score"
          value={`${((metrics.roc_auc || 0) * 100).toFixed(2)}%`}
          icon={Award}
          color="emerald"
          subtext="Discriminative Ability"
        />
        <StatCard
          title="Recall Score"
          value={`${((metrics.recall || 0) * 100).toFixed(2)}%`}
          icon={BarChart3}
          color="amber"
          subtext="Subscriber Capture Rate"
        />
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-title">
          <Award size={20} color="#6366f1" />
          <span>Model Benchmark Comparison Matrix</span>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Model Architecture</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1-Score</th>
                <th>ROC-AUC</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(allModels).map(([name, m]) => {
                const isSelected = name === modelInfo?.selected_model;
                return (
                  <tr key={name} style={{ background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'transparent' }}>
                    <td style={{ fontWeight: '700', color: isSelected ? '#818cf8' : '#fff' }}>{name}</td>
                    <td>{(m.accuracy * 100).toFixed(2)}%</td>
                    <td>{(m.precision * 100).toFixed(2)}%</td>
                    <td>{(m.recall * 100).toFixed(2)}%</td>
                    <td style={{ fontWeight: '700' }}>{(m.f1_score * 100).toFixed(2)}%</td>
                    <td style={{ fontWeight: '700', color: '#38bdf8' }}>{(m.roc_auc * 100).toFixed(2)}%</td>
                    <td>
                      {isSelected ? (
                        <span className="badge badge-success">Selected Best</span>
                      ) : (
                        <span className="badge badge-info">Evaluated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Importance & Confusion Matrix Grid */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">
            <BarChart3 size={20} color="#06b6d4" />
            <span>Top Predictive Feature Attribution</span>
          </div>
          <BarChart data={featureChartData} />
        </div>

        {/* Confusion Matrix Card */}
        <div className="card">
          <div className="card-title">
            <CheckCircle2 size={20} color="#10b981" />
            <span>Confusion Matrix (Test Evaluation Set)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#34d399', textTransform: 'uppercase' }}>True Negatives (TN)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '0.3rem' }}>{tn.toLocaleString()}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Correctly predicted No</div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#f87171', textTransform: 'uppercase' }}>False Positives (FP)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '0.3rem' }}>{fp.toLocaleString()}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Predicted Yes, Actual No</div>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fbbf24', textTransform: 'uppercase' }}>False Negatives (FN)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '0.3rem' }}>{fn.toLocaleString()}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Predicted No, Actual Yes</div>
            </div>

            <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#818cf8', textTransform: 'uppercase' }}>True Positives (TP)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '0.3rem' }}>{tp.toLocaleString()}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Correctly predicted Subscriber</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
