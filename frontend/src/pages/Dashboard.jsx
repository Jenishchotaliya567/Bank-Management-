import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import StatCard from '../components/StatCard';
import { BarChart, DoughnutChart } from '../components/Charts';
import { Users, CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, BrainCircuit, Sparkles, Plus, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    dashboardApi.getStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error fetching stats:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Bank Management Dashboard...</div>;
  }

  const summary = stats?.summary || {};
  const accountBreakdown = stats?.account_breakdown || {};
  const jobBreakdown = stats?.job_breakdown || {};

  // Doughnut Chart Data for Accounts
  const accountChartData = {
    labels: Object.keys(accountBreakdown),
    datasets: [{
      data: Object.values(accountBreakdown),
      backgroundColor: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
      borderWidth: 0
    }]
  };

  // Bar Chart Data for Customer Jobs
  const jobChartData = {
    labels: Object.keys(jobBreakdown).slice(0, 7),
    datasets: [{
      label: 'Customers by Profession',
      data: Object.values(jobBreakdown).slice(0, 7),
      backgroundColor: 'rgba(99, 102, 241, 0.7)',
      borderColor: '#6366f1',
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  return (
    <div>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>Banking Management Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time telemetry, accounts ledger, and ML predictions</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/ml-predict" className="btn btn-primary">
            <Sparkles size={18} />
            <span>Predict Term Subscription</span>
          </Link>
          <Link to="/customers" className="btn btn-secondary">
            <Plus size={18} />
            <span>New Customer</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid-4">
        <StatCard
          title="Total Customers"
          value={summary.total_customers?.toLocaleString() || 0}
          icon={Users}
          color="indigo"
          subtext="Active Customer Profiles"
        />
        <StatCard
          title="Active Accounts"
          value={summary.total_accounts?.toLocaleString() || 0}
          icon={CreditCard}
          color="cyan"
          subtext="Savings & Checking"
        />
        <StatCard
          title="Total Liquidity"
          value={`$${summary.total_balance?.toLocaleString() || 0}`}
          icon={DollarSign}
          color="emerald"
          subtext="Aggregate Deposits"
        />
        <StatCard
          title="High Potential Leads"
          value={summary.high_potential_subscribers?.toLocaleString() || 0}
          icon={BrainCircuit}
          color="amber"
          subtext="ML Verified Prospects"
        />
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">
            <CreditCard size={20} color="#06b6d4" />
            <span>Account Type Distribution</span>
          </div>
          <DoughnutChart data={accountChartData} />
        </div>

        <div className="card">
          <div className="card-title">
            <Users size={20} color="#6366f1" />
            <span>Customer Profession Demographics</span>
          </div>
          <BarChart data={jobChartData} />
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div className="card-title" style={{ margin: 0 }}>
            <ArrowUpRight size={20} color="#10b981" />
            <span>Recent Account Transactions</span>
          </div>
          <Link to="/transactions" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            View Ledger <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Transaction #</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Post Balance</th>
                <th>Description</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent_transactions?.length > 0 ? (
                stats.recent_transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{tx.transaction_number}</td>
                    <td>
                      <span className={`badge ${tx.type === 'Deposit' || tx.type === 'Transfer In' ? 'badge-success' : 'badge-danger'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: '700', color: tx.type === 'Deposit' || tx.type === 'Transfer In' ? '#34d399' : '#f87171' }}>
                      {tx.type === 'Deposit' || tx.type === 'Transfer In' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </td>
                    <td>${tx.post_balance.toLocaleString()}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{tx.description}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No recent transactions recorded.
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

export default Dashboard;
