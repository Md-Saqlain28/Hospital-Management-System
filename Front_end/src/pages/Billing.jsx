import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { ReceiptText } from 'lucide-react';
import './Shared.css';

const Billing = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Billing & Payments</h1>
          <p className="text-muted">Generate bills and track patient payments</p>
        </div>
        <Button icon={<ReceiptText size={18} />}>Generate Bill</Button>
      </div>

      <Card>
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ReceiptText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No recent transactions</h3>
          <p>Generate a new bill to see it here.</p>
        </div>
      </Card>
    </div>
  );
};

export default Billing;
