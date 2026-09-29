import React, { useEffect, useState } from 'react';
import { transactionApi, accountApi } from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, Send, Search } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'deposit', 'withdrawal', 'transfer', null
  const [toast, setToast] = useState(null);

  // Form states
  const [depositForm, setDepositForm] = useState({ account_number: '', amount: 500, description: 'Cash deposit' });
  const [withdrawalForm, setWithdrawalForm] = useState({ account_number: '', amount: 200, description: 'ATM withdrawal' });
  const [transferForm, setTransferForm] = useState({ sender_account_number: '', recipient_account_number: '', amount: 300, description: 'Fund transfer' });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      transactionApi.getAll(),
      accountApi.getAll()
    ]).then(([txRes, accRes]) => {
      setTransactions(txRes.data);
      setAccounts(accRes.data);
      if (accRes.data.length > 0) {
        const defaultAcc = accRes.data[0].account_number;
        setDepositForm(prev => ({ ...prev, account_number: defaultAcc }));
        setWithdrawalForm(prev => ({ ...prev, account_number: defaultAcc }));
        setTransferForm(prev => ({ ...prev, sender_account_number: defaultAcc, recipient_account_number: accRes.data[1]?.account_number || defaultAcc }));
      }
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      await transactionApi.deposit({
        ...depositForm,
        amount: parseFloat(depositForm.amount)
      });
      setToast({ message: 'Deposit successful!', type: 'success' });
      setActiveModal(null);
      fetchData();
    } catch (err) {
      setToast({ message: err.response?.data?.detail || 'Deposit failed.', type: 'error' });
    }
  };

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    try {
      await transactionApi.withdrawal({
        ...withdrawalForm,
        amount: parseFloat(withdrawalForm.amount)
      });
      setToast({ message: 'Withdrawal successful!', type: 'success' });
      setActiveModal(null);
      fetchData();
    } catch (err) {
      setToast({ message: err.response?.data?.detail || 'Withdrawal failed.', type: 'error' });
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      await transactionApi.transfer({
        ...transferForm,
        amount: parseFloat(transferForm.amount)
      });
      setToast({ message: 'Transfer executed successfully!', type: 'success' });
      setActiveModal(null);
      fetchData();
    } catch (err) {
      setToast({ message: err.response?.data?.detail || 'Transfer failed.', type: 'error' });
    }
  };

  const filteredTransactions = transactions.filter(t =>
    t.transaction_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>Transaction Ledger</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time deposit, withdrawal, and transfer auditing</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-success" onClick={() => setActiveModal('deposit')}>
            <ArrowDownLeft size={18} />
            <span>Deposit</span>
          </button>
          <button className="btn btn-danger" onClick={() => setActiveModal('withdrawal')}>
            <ArrowUpRight size={18} />
            <span>Withdrawal</span>
          </button>
          <button className="btn btn-primary" onClick={() => setActiveModal('transfer')}>
            <Send size={18} />
            <span>Transfer Funds</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.8rem' }}
            placeholder="Search by transaction ID, type, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading transaction audit history...</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Post Balance</th>
                  <th>Description</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
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
                      <td style={{ fontWeight: '600' }}>${tx.post_balance.toLocaleString()}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{tx.description}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(tx.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No transaction records match search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      <Modal isOpen={activeModal === 'deposit'} onClose={() => setActiveModal(null)} title="Execute Account Deposit">
        <form onSubmit={handleDeposit}>
          <div className="form-group">
            <label className="form-label">Target Bank Account</label>
            <select
              className="form-select"
              value={depositForm.account_number}
              onChange={(e) => setDepositForm(prev => ({ ...prev, account_number: e.target.value }))}
              required
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.account_number}>
                  {acc.account_number} (Bal: ${acc.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Deposit Amount ($)</label>
            <input
              type="number"
              className="form-control"
              value={depositForm.amount}
              onChange={(e) => setDepositForm(prev => ({ ...prev, amount: e.target.value }))}
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description / Memo</label>
            <input
              type="text"
              className="form-control"
              value={depositForm.description}
              onChange={(e) => setDepositForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="modal-footer" style={{ paddingRight: 0, paddingBottom: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
            <button type="submit" className="btn btn-success">Confirm Deposit</button>
          </div>
        </form>
      </Modal>

      {/* Withdrawal Modal */}
      <Modal isOpen={activeModal === 'withdrawal'} onClose={() => setActiveModal(null)} title="Execute Cash Withdrawal">
        <form onSubmit={handleWithdrawal}>
          <div className="form-group">
            <label className="form-label">Source Bank Account</label>
            <select
              className="form-select"
              value={withdrawalForm.account_number}
              onChange={(e) => setWithdrawalForm(prev => ({ ...prev, account_number: e.target.value }))}
              required
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.account_number}>
                  {acc.account_number} (Bal: ${acc.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Withdrawal Amount ($)</label>
            <input
              type="number"
              className="form-control"
              value={withdrawalForm.amount}
              onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description / Reason</label>
            <input
              type="text"
              className="form-control"
              value={withdrawalForm.description}
              onChange={(e) => setWithdrawalForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="modal-footer" style={{ paddingRight: 0, paddingBottom: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
            <button type="submit" className="btn btn-danger">Confirm Withdrawal</button>
          </div>
        </form>
      </Modal>

      {/* Transfer Modal */}
      <Modal isOpen={activeModal === 'transfer'} onClose={() => setActiveModal(null)} title="Transfer Funds Between Accounts">
        <form onSubmit={handleTransfer}>
          <div className="form-group">
            <label className="form-label">Sender Account</label>
            <select
              className="form-select"
              value={transferForm.sender_account_number}
              onChange={(e) => setTransferForm(prev => ({ ...prev, sender_account_number: e.target.value }))}
              required
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.account_number}>
                  {acc.account_number} (Bal: ${acc.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Recipient Account</label>
            <select
              className="form-select"
              value={transferForm.recipient_account_number}
              onChange={(e) => setTransferForm(prev => ({ ...prev, recipient_account_number: e.target.value }))}
              required
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.account_number}>
                  {acc.account_number} (Bal: ${acc.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Transfer Amount ($)</label>
            <input
              type="number"
              className="form-control"
              value={transferForm.amount}
              onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Transfer Memo</label>
            <input
              type="text"
              className="form-control"
              value={transferForm.description}
              onChange={(e) => setTransferForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="modal-footer" style={{ paddingRight: 0, paddingBottom: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Execute Transfer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Transactions;
