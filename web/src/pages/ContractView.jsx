import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ContractView.css';

export default function ContractView() {
  const { id } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    contractsAPI.getById(id).then(r => setContract(r.data)).finally(() => setLoading(false));
  }, [id]);

  const handleSign = async () => {
    setSigning(true);
    try {
      const signature = user?.name + ' (Digital Signature)';
      const res = await contractsAPI.sign(id, { signature });
      setContract(res.data);
    } catch (err) {
      alert('Failed to sign contract');
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
              <button className="btn btn-primary" onClick={handleSign} disabled={signing}>
                {signing ? 'Signing...' : '✍️ Sign Contract'}
              </button>
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
