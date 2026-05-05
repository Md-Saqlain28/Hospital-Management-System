import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { ReceiptText } from 'lucide-react';
import { api } from '../lib/api';
import './Shared.css';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    room_id: '',
    amount: '',
    description: 'General Charges',
    discount: '0',
    tax_rate: '0'
  });

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await api.get('/billing');
      setBills(res || []);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        patient_id: parseInt(formData.patient_id, 10),
        items: [{ description: formData.description, amount: parseFloat(formData.amount) }],
        discount: parseFloat(formData.discount || 0),
        tax_rate: parseFloat(formData.tax_rate || 0)
      };
      
      if (formData.appointment_id) payload.appointment_id = parseInt(formData.appointment_id, 10);
      if (formData.room_id) payload.room_id = parseInt(formData.room_id, 10);

      await api.post('/billing', payload);
      setIsModalOpen(false);
      setFormData({
        patient_id: '', appointment_id: '', room_id: '', amount: '',
        description: 'General Charges', discount: '0', tax_rate: '0'
      });
      fetchBills();
    } catch (error) {
      alert(error.message || 'Failed to generate bill');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async (id) => {
    if (!window.confirm('Mark this bill as paid (Cash)?')) return;
    try {
      await api.patch(`/billing/${id}/pay`, { payment_method: 'Cash' });
      fetchBills();
    } catch (error) {
      alert(error.message || 'Failed to mark as paid');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Billing & Payments</h1>
          <p className="text-muted">Generate bills and track patient payments</p>
        </div>
        <Button icon={<ReceiptText size={18} />} onClick={() => setIsModalOpen(true)}>Generate Bill</Button>
      </div>

      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Patient ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>Loading...</td></tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <ReceiptText size={48} style={{ marginBottom: '1rem', opacity: 0.5, display: 'inline-block' }} />
                    <h3>No recent transactions</h3>
                    <p>Generate a new bill to see it here.</p>
                  </td>
                </tr>
              ) : bills.map((bill) => (
                <tr key={bill.bill_id}>
                  <td>#{bill.bill_id}</td>
                  <td style={{ fontWeight: 500 }}>#{bill.patient_id}</td>
                  <td className="text-muted">{new Date(bill.billing_date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 'bold' }}>${parseFloat(bill.final_amount).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${bill.payment_status === 'Paid' ? 'status-active' : (bill.payment_status === 'Pending' ? 'status-maintenance' : 'status-inactive')}`}>
                      {bill.payment_status}
                    </span>
                  </td>
                  <td>
                    {bill.payment_status === 'Pending' && (
                      <Button variant="ghost" className="text-sm" onClick={() => handlePay(bill.bill_id)}>Mark Paid</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate New Bill">
        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label>Patient ID</label>
            <input type="number" name="patient_id" value={formData.patient_id} onChange={handleChange} required min="1" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Appointment ID (Optional)</label>
              <input type="number" name="appointment_id" value={formData.appointment_id} onChange={handleChange} min="1" />
            </div>
            <div className="form-group">
              <label>Room ID (Optional)</label>
              <input type="number" name="room_id" value={formData.room_id} onChange={handleChange} min="1" />
            </div>
          </div>
          <div className="form-group">
            <label>Description of Charges</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Amount ($)</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} required min="0" step="0.01" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Discount (%)</label>
              <input type="number" name="discount" value={formData.discount} onChange={handleChange} min="0" max="100" />
            </div>
            <div className="form-group">
              <label>Tax Rate (%)</label>
              <input type="number" name="tax_rate" value={formData.tax_rate} onChange={handleChange} min="0" max="100" />
            </div>
          </div>
          <Button type="submit" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            {submitting ? 'Generating...' : 'Generate Bill'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Billing;
