import React, { useEffect, useState } from 'react';
import { accountApi, customerApi } from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { CreditCard, Plus, Search, DollarSign } from 'lucide-react';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    account_type: 'Savings',
    initial_deposit: 500
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      accountApi.getAll(),
      customerApi.getAll()
    ]).then(([accsRes, custsRes]) => {
      setAccounts(accsRes.data);
      setCustomers(custsRes.data);
      if (custsRes.data.length > 0) {
        setFormData(prev => ({ ...prev, customer_id: custsRes.data[0].id }));
      }
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      await accountApi.create({
        customer_id: parseInt(formData.customer_id, 10),
        account_type: formData.account_type,
        initial_deposit: parseFloat(formData.initial_deposit)
      });
      setToast({ message: 'New bank account opened successfully!', type: 'success' });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setToast({ message: err.response?.data?.detail || 'Failed to open account.', type: 'error' });
    }
  };

  const getCustomerName = (cust_id) => {
    const cust = customers.find(c => c.id === cust_id);
    return cust ? `${cust.first_name} ${cust.last_name}` : `Customer #${cust_id}`;
  };

  const filteredAccounts = accounts.filter(a =>
    a.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.account_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>Bank Accounts Registry</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Monitor deposit checking, savings, and term accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>Open New Account</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.8rem' }}
            placeholder="Search by account number or account type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Accounts Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading accounts ledger...</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Customer Owner</th>
                  <th>Account Type</th>
                  <th>Current Balance</th>
                  <th>Account Status</th>
                  <th>Date Opened</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((acc) => (
                    <tr key={acc.id}>
                      <td style={{ fontWeight: '700', fontFamily: 'monospace', color: '#38bdf8' }}>{acc.account_number}</td>
                      <td style={{ fontWeight: '600' }}>{getCustomerName(acc.customer_id)}</td>
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
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No bank account records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Open Account Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Open New Bank Account">
        <form onSubmit={handleCreateAccount}>
          <div className="form-group">
            <label className="form-label">Select Customer</label>
            <select
              className="form-select"
              value={formData.customer_id}
              onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
              required
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  #{c.id} - {c.first_name} {c.last_name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select
              className="form-select"
              value={formData.account_type}
              onChange={(e) => setFormData(prev => ({ ...prev, account_type: e.target.value }))}
            >
              <option value="Savings">Savings Account</option>
              <option value="Checking">Checking Account</option>
              <option value="Term Deposit">Term Deposit Account</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Initial Opening Deposit ($)</label>
            <input
              type="number"
              className="form-control"
              value={formData.initial_deposit}
              onChange={(e) => setFormData(prev => ({ ...prev, initial_deposit: e.target.value }))}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="modal-footer" style={{ paddingRight: 0, paddingBottom: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Open Account</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Accounts;
