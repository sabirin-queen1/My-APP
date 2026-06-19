import React, { useState, useEffect } from 'react';
import { paymentsAPI } from '../services/api';
import './WalletPage.css';

const QUICK = [10, 50, 100, 200, 500];

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    paymentsAPI.getWallet()
      .then(r => { setBalance(r.data.balance); setPayments(r.data.payments); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const deposit = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { setMsg('Enter a valid amount'); return; }
    setDepositing(true);
    setMsg('');
    try {
      const r = await paymentsAPI.deposit(amt);
      setBalance(r.data.balance);
      setAmount('');
      setMsg(r.data.message);
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Deposit failed');
    } finally { setDepositing(false); }
  };

  if (loading) return <div className="loading">Loading wallet...</div>;

  return (
    <div className="wallet-page">
      <div className="container">
        <div className="page-header">
          <h1>💳 My Wallet</h1>
          <p>Top up your balance to pay the 30% contract commission</p>
        </div>

        {/* Balance card */}
        <div className="wallet-balance-card">
          <span className="wb-label">Current Balance</span>
          <span className="wb-amount">${balance.toFixed(2)}</span>
          <span className="wb-currency">USD</span>
        </div>

        {/* Deposit */}
        <div className="card wallet-deposit">
          <h3>➕ Add Money (Shub Lacag)</h3>
          <p className="wd-note">In a real deployment this connects to EVC Plus / ZAAD. For testing, enter any amount.</p>
          <div className="quick-amounts">
            {QUICK.map(q => (
              <button key={q} className="quick-amount" onClick={() => setAmount(String(q))}>${q}</button>
            ))}
          </div>
          <div className="deposit-row">
            <input type="number" min="1" placeholder="Enter amount (USD)" value={amount} onChange={e => setAmount(e.target.value)} />
            <button className="btn btn-primary" onClick={deposit} disabled={depositing}>
              {depositing ? 'Adding...' : 'Add to Wallet'}
            </button>
          </div>
          {msg && <div className="wallet-msg">{msg}</div>}
        </div>

        {/* History */}
        <div className="card wallet-history">
          <h3>Transaction History</h3>
          {payments.length === 0 ? (
            <p className="wh-empty">No transactions yet</p>
          ) : (
            <div className="wh-list">
              {payments.map(p => (
                <div key={p._id} className="wh-row">
                  <div className="wh-icon" style={{ background: p.type === 'deposit' ? '#dcfce7' : '#fee2e2' }}>
                    {p.type === 'deposit' ? '➕' : '➖'}
                  </div>
                  <div className="wh-info">
                    <h4>{p.type === 'deposit' ? 'Wallet Top-up' : '30% Contract Commission'}</h4>
                    <p>{new Date(p.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="wh-amount">
                    <span style={{ color: p.type === 'deposit' ? '#16a34a' : '#dc2626' }}>
                      {p.type === 'deposit' ? '+' : '−'}${p.amount}
                    </span>
                    <span className="wh-balance">Bal: ${p.balanceAfter}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
