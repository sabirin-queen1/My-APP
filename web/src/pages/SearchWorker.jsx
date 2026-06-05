import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workersAPI } from '../services/api';
import './SearchWorker.css';

const JOB_TYPES = ['', 'House Cleaning', 'Cooking', 'Babysitter', 'Nanny', 'Driver', 'Gardener', 'Security Guard', 'Elder Care'];
const LOCATIONS = ['', 'Mogadishu', 'Hargeisa', 'Bosaso', 'Kismayo', 'Beledweyne'];
const SALARY_RANGES = [
  { label: 'Any', min: '', max: '' },
  { label: '$50 - $150', min: 50, max: 150 },
  { label: '$150 - $300', min: 150, max: 300 },
  { label: '$300 - $500', min: 300, max: 500 },
  { label: '$500+', min: 500, max: '' },
];

export default function SearchWorker() {
  const [workers, setWorkers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ jobType: '', location: '', salaryMin: '', salaryMax: '', page: 1 });

  useEffect(() => { fetchWorkers(); }, [filters]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await workersAPI.search(params);
      setWorkers(res.data.workers);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  return (
    <div className="search-page">
      <div className="container">
        <div className="page-header">
          <h1>Search Worker</h1>
          <p>Find the perfect match for your family</p>
        </div>

        <div className="search-layout">
          <aside className="search-filters card">
            <h3>Filters</h3>

            <div className="form-group">
              <label>Job Type</label>
              <select value={filters.jobType} onChange={e => setFilter('jobType', e.target.value)}>
                {JOB_TYPES.map(j => <option key={j} value={j}>{j || 'All Job Types'}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Location</label>
              <select value={filters.location} onChange={e => setFilter('location', e.target.value)}>
                {LOCATIONS.map(l => <option key={l} value={l}>{l || 'All Locations'}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Salary Range</label>
              <div className="salary-options">
                {SALARY_RANGES.map((r, i) => (
                  <label key={i} className="radio-option">
                    <input
                      type="radio"
                      name="salary"
                      checked={filters.salaryMin === r.min && filters.salaryMax === r.max}
                      onChange={() => setFilters(f => ({ ...f, salaryMin: r.min, salaryMax: r.max, page: 1 }))}
                    />
                    {r.label}
                  </label>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={fetchWorkers}>
              🔍 Search
            </button>
          </aside>

          <main className="search-results">
            <div className="results-header">
              <p>{total} workers found</p>
            </div>

            {loading ? (
              <div className="loading">Searching...</div>
            ) : workers.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: 48 }}>🔍</div>
                <h3>No workers found</h3>
                <p>Try adjusting your filters</p>
              </div>
            ) : (
              <div className="results-grid">
                {workers.map(worker => (
                  <Link to={`/workers/${worker._id}`} key={worker._id} className="result-card card">
                    <div className="result-top">
                      <div className="result-avatar">{worker.name.charAt(0)}</div>
                      <div className="result-info">
                        <h4>{worker.name}</h4>
                        <p className="result-jobs">{worker.jobTypes?.join(' • ')}</p>
                        <div className="result-rating">
                          ⭐ <strong>{worker.rating || '0.0'}</strong>
                          <span>({worker.totalReviews} Reviews)</span>
                        </div>
                      </div>
                      <button className="fav-btn">🤍</button>
                    </div>
                    <div className="result-skills">
                      {worker.skills?.slice(0, 4).map(s => (
                        <span key={s} className="skill-tag">✅ {s}</span>
                      ))}
                    </div>
                    <div className="result-footer">
                      <div>
                        <span className="exp-label">Experience</span>
                        <span className="exp-value">{worker.experience} Years</span>
                      </div>
                      <div>
                        <span className="exp-label">Nationality</span>
                        <span className="exp-value">{worker.nationality}</span>
                      </div>
                      <div className="result-salary">${worker.salary?.min}/Month</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
