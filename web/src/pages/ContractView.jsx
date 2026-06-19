import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { contractsAPI, paymentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ContractView.css';

export default function ContractView() {
  const { id } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    contractsAPI.getById(id).then(r => setContract(r.data)).finally(() => setLoading(false));
  }, [id]);

  const handlePayCommission = async () => {
    setPaying(true);
    try {
      await paymentsAPI.payCommission(id);
      const res = await contractsAPI.getById(id);
      setContract(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    } finally { setPaying(false); }
  };

  const handleSign = async () => {
    setSigning(true);
    try {
      const signature = user?.name + ' (Digital Signature)';
      const res = await contractsAPI.sign(id, { signature });
      setContract(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to sign contract');
    } finally { setSigning(false); }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this contract?')) return;
    try {
      await contractsAPI.cancel(id);
      navigate(-1);
    } catch { alert('Failed to cancel'); }
  };

  if (loading) return <div className="loading">Loading contract...</div>;
  if (!contract) return <div className="empty-state"><h3>Contract not found</h3></div>;

  const canSign = (role === 'household' && !contract.familySigned) || (role === 'worker' && !contract.workerSigned);
  const statusColor = { active: 'success', pending: 'warning', cancelled: 'danger', completed: 'primary', expired: 'danger' };

  return (
    <div className="contract-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        <div className="contract-card card">
          <div className="contract-header">
            <div>
              <h1>📋 Employment Contract</h1>
              <p className="contract-id">Contract #{contract._id?.slice(-8).toUpperCase()}</p>
            </div>
            <span className={`badge badge-${statusColor[contract.status] || 'primary'}`}>
              {contract.status?.charAt(0).toUpperCase() + contract.status?.slice(1)}
            </span>
          </div>

          <div className="contract-body">
            <h2>Contract Details</h2>
            <table className="contract-table">
              <tbody>
                <tr><td>Worker</td><td><strong>{contract.worker?.name}</strong></td></tr>
                <tr><td>Job Type</td><td>{contract.jobType}</td></tr>
                {contract.duties && <tr><td>Job Duties</td><td>{contract.duties}</td></tr>}
                <tr><td>Salary</td><td><strong>${contract.salary} / Month</strong></td></tr>
                <tr><td>Contract Period</td><td>{contract.contractPeriod || 'Custom'}</td></tr>
                <tr><td>Start Date</td><td>{new Date(contract.startDate).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</td></tr>
                <tr><td>End Date</td><td>{new Date(contract.endDate).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</td></tr>
                <tr><td>Household</td><td>{contract.household?.name}</td></tr>
              </tbody>
            </table>

            <div className="terms-section">
              <h3>Terms & Conditions</h3>
              <ol className="terms-list">
                {contract.termsAndConditions?.map((term, i) => <li key={i}>{term}</li>)}
              </ol>
            </div>

            {/* Commission payment — required before signing */}
            {contract.status === 'pending' && (
              <div className="commission-section">
                <h3>💰 Commission Payment (30%)</h3>
                <p className="commission-note">
                  Both family and worker must each pay a 30% commission of ${contract.salary}
                  {' '}(= <strong>${contract.commissionAmount || Math.round(contract.salary * 0.3)}</strong>) before the contract can be signed.
                  Pay from your <Link to="/wallet">Wallet</Link>.
                </p>
                <div className="commission-grid">
                  <div className={`commission-box ${contract.familyPaid ? 'paid' : ''}`}>
                    <span className="cm-label">Family (30%)</span>
                    <span className="cm-status">{contract.familyPaid ? '✅ Paid' : '⏳ Not paid'}</span>
                  </div>
                  <div className={`commission-box ${contract.workerPaid ? 'paid' : ''}`}>
                    <span className="cm-label">Worker (30%)</span>
                    <span className="cm-status">{contract.workerPaid ? '✅ Paid' : '⏳ Not paid'}</span>
                  </div>
                </div>
                {((role === 'household' && !contract.familyPaid) || (role === 'worker' && !contract.workerPaid)) && (
                  <button className="btn btn-primary commission-pay" onClick={handlePayCommission} disabled={paying}>
                    {paying ? 'Processing...' : `💳 Pay My 30% ($${contract.commissionAmount || Math.round(contract.salary * 0.3)})`}
                  </button>
                )}
                {contract.familyPaid && contract.workerPaid && (
                  <div className="commission-done">✅ Both parties paid — you can now sign the contract below.</div>
                )}
              </div>
            )}

            <div className="signatures-section">
              <h3>Signatures</h3>
              <div className="signatures-grid">
                <div className={`signature-box ${contract.familySigned ? 'signed' : ''}`}>
                  <p className="sig-label">Family Signature</p>
                  <div className="sig-area">
                    {contract.familySigned ? (
                      <><p className="sig-text">{contract.familySignature}</p><span className="sig-check">✅</span></>
                    ) : <p className="sig-placeholder">Awaiting signature...</p>}
                  </div>
                </div>
                <div className={`signature-box ${contract.workerSigned ? 'signed' : ''}`}>
                  <p className="sig-label">Worker Signature</p>
                  <div className="sig-area">
                    {contract.workerSigned ? (
                      <><p className="sig-text">{contract.workerSignature}</p><span className="sig-check">✅</span></>
                    ) : <p className="sig-placeholder">Awaiting signature...</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="contract-actions">
            {canSign && contract.status === 'pending' && (
              contract.familyPaid && contract.workerPaid ? (
                <button className="btn btn-primary" onClick={handleSign} disabled={signing}>
                  {signing ? 'Signing...' : '✍️ Sign Contract'}
                </button>
              ) : (
                <button className="btn btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                  🔒 Sign (after both pay 30%)
                </button>
              )
            )}
            {contract.status === 'active' && role === 'household' && (
              <button className="btn btn-outline" onClick={() => navigate(`/reviews/${contract.worker?._id}`)}>
                ⭐ Leave Review
              </button>
            )}
            {contract.status === 'pending' && (
              <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
