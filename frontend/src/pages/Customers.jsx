import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { Users, Plus, Search, Eye, Trash2, ShieldAlert } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    age: 35,
    job: 'management',
    marital: 'married',
    education: 'tertiary',
    default_status: 'no',
    balance: 1000,
    housing_loan: 'no',
    personal_loan: 'no',
    contact_type: 'cellular'
  });

  const fetchCustomers = () => {
    setLoading(true);
    customerApi.getAll()
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await customerApi.create({
        ...formData,
        age: parseInt(formData.age, 10),
        balance: parseFloat(formData.balance)
      });
      setToast({ message: 'New customer profile created successfully!', type: 'success' });
      setIsModalOpen(false);
      fetchCustomers();
      setFormData({
        first_name: '', last_name: '', email: '', phone: '', age: 35,
        job: 'management', marital: 'married', education: 'tertiary',
        default_status: 'no', balance: 1000, housing_loan: 'no', personal_loan: 'no', contact_type: 'cellular'
      });
    } catch (err) {
      setToast({ message: err.response?.data?.detail || 'Failed to create customer.', type: 'error' });
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer? All associated accounts will be removed.')) {
      try {
        await customerApi.delete(id);
        setToast({ message: 'Customer record removed.', type: 'info' });
        fetchCustomers();
      } catch (err) {
        setToast({ message: 'Failed to delete customer.', type: 'error' });
      }
    }
  };

  const filteredCustomers = customers.filter((c) =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>Customer Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage bank account holders and demographic profiles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.8rem' }}
            placeholder="Search customers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading customer directory...</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Job Profession</th>
                  <th>Marital</th>
                  <th>Aggregate Balance</th>
                  <th>Default Risk</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((cust) => (
                    <tr key={cust.id}>
                      <td style={{ fontWeight: '700', color: 'var(--text-muted)' }}>#{cust.id}</td>
                      <td style={{ fontWeight: '700' }}>{cust.first_name} {cust.last_name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{cust.email}</td>
                      <td>{cust.age} yrs</td>
                      <td style={{ textTransform: 'capitalize' }}>{cust.job}</td>
                      <td style={{ textTransform: 'capitalize' }}>{cust.marital}</td>
                      <td style={{ fontWeight: '700', color: '#34d399' }}>${cust.balance?.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${cust.default_status === 'no' ? 'badge-success' : 'badge-danger'}`}>
                          {cust.default_status === 'no' ? 'Clean' : 'Defaulted'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link to={`/customers/${cust.id}`} className="btn btn-secondary btn-sm" title="View Profile & ML Score">
                            <Eye size={14} />
                          </Link>
                          <button onClick={() => handleDeleteCustomer(cust.id)} className="btn btn-danger btn-sm" title="Delete Profile">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No customer records found matching '{searchTerm}'.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Customer Profile">
        <form onSubmit={handleCreateCustomer}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input type="text" name="first_name" className="form-control" value={formData.first_name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input type="text" name="last_name" className="form-control" value={formData.last_name} onChange={handleInputChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleInputChange} placeholder="+1-555-0199" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input type="number" name="age" className="form-control" value={formData.age} onChange={handleInputChange} min="18" max="100" required />
            </div>
            <div className="form-group">
              <label className="form-label">Job</label>
              <select name="job" className="form-select" value={formData.job} onChange={handleInputChange}>
                <option value="management">Management</option>
                <option value="technician">Technician</option>
                <option value="blue-collar">Blue-Collar</option>
                <option value="admin.">Admin</option>
                <option value="services">Services</option>
                <option value="retired">Retired</option>
                <option value="self-employed">Self-Employed</option>
                <option value="entrepreneur">Entrepreneur</option>
                <option value="student">Student</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Marital</label>
              <select name="marital" className="form-select" value={formData.marital} onChange={handleInputChange}>
                <option value="married">Married</option>
                <option value="single">Single</option>
                <option value="divorced">Divorced</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Education</label>
              <select name="education" className="form-select" value={formData.education} onChange={handleInputChange}>
                <option value="tertiary">Tertiary (University)</option>
                <option value="secondary">Secondary (High School)</option>
                <option value="primary">Primary</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Initial Balance ($)</label>
              <input type="number" name="balance" className="form-control" value={formData.balance} onChange={handleInputChange} step="0.01" min="0" required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Credit Default</label>
              <select name="default_status" className="form-select" value={formData.default_status} onChange={handleInputChange}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Housing Loan</label>
              <select name="housing_loan" className="form-select" value={formData.housing_loan} onChange={handleInputChange}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Personal Loan</label>
              <select name="personal_loan" className="form-select" value={formData.personal_loan} onChange={handleInputChange}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ paddingRight: 0, paddingBottom: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Profile</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
