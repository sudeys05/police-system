
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  Download, 
  Edit, 
  Trash2,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  TrendingUp,
  BarChart3,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import './Reports.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    content: '',
    status: 'Pending',
    priority: 'Medium',
    caseId: '',
    obId: '',
    evidenceId: ''
  });

  // Fetch reports from MongoDB
  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching reports from MongoDB...');
      const response = await fetch('/api/reports');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Response Error:', {
          status: response.status,
          statusText: response.statusText,
          responseText: errorText.substring(0, 200)
        });
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('❌ Expected JSON but got:', contentType, responseText.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      console.log('📊 Received reports from API:', data);
      
      setReports(data.reports || []);
      console.log('✅ Reports set in state:', (data.reports || []).length, 'reports');
    } catch (err) {
      console.error('❌ Failed to fetch reports:', err);
      setError('Failed to fetch reports: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter reports based on search term, type, and status
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingReport) {
        // Update existing report
        console.log('🔄 Updating report:', editingReport.id, 'with data:', formData);
        const response = await fetch(`/api/reports/${editingReport.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error(`Failed to update report: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Report updated successfully:', data);
        
        // Update the reports list
        setReports(prevReports =>
          prevReports.map(report =>
            report.id === editingReport.id ? data.report : report
          )
        );
      } else {
        // Create new report
        console.log('📝 Creating new report with data:', formData);
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error(`Failed to create report: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Report created successfully:', data);
        
        // Add the new report to the list
        setReports(prevReports => [data.report, ...prevReports]);
      }

      // Reset form and close modal
      resetForm();
      setShowAddModal(false);
      setEditingReport(null);
    } catch (err) {
      console.error('❌ Failed to save report:', err);
      setError('Failed to save report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      console.log('🗑️ Deleting report:', reportId);
      
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete report: ${response.status}`);
      }

      console.log('✅ Report deleted successfully');
      
      // Remove the report from the list
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
    } catch (err) {
      console.error('❌ Failed to delete report:', err);
      setError('Failed to delete report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setFormData({
      type: report.type || '',
      title: report.title || '',
      content: report.content || '',
      status: report.status || 'Pending',
      priority: report.priority || 'Medium',
      caseId: report.caseId || '',
      obId: report.obId || '',
      evidenceId: report.evidenceId || ''
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: '',
      title: '',
      content: '',
      status: 'Pending',
      priority: 'Medium',
      caseId: '',
      obId: '',
      evidenceId: ''
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="status-icon completed" size={16} />;
      case 'Approved':
        return <CheckCircle className="status-icon approved" size={16} />;
      case 'Pending':
        return <Clock className="status-icon pending" size={16} />;
      case 'Rejected':
        return <XCircle className="status-icon rejected" size={16} />;
      default:
        return <AlertCircle className="status-icon" size={16} />;
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High':
      case 'Urgent':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'Incident':
        return <AlertTriangle size={16} />;
      case 'Case Summary':
        return <FileCheck size={16} />;
      case 'Evidence':
        return <BarChart3 size={16} />;
      case 'Investigation':
        return <TrendingUp size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="reports-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Loading Reports</h3>
          <p>Please wait while we fetch your reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="header-left">
          <h1>Professional Reports Center</h1>
          <p>Generate, manage, and analyze comprehensive police reports with advanced tools</p>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-button"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh Reports"
          >
            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
          </button>
          <button 
            className="add-button"
            onClick={() => setShowAddModal(true)}
            disabled={loading}
          >
            <Plus size={20} />
            Generate New Report
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="reports-controls">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search reports by title, content, or report number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Report Types</option>
            <option value="Incident">Incident Reports</option>
            <option value="Case Summary">Case Summaries</option>
            <option value="Evidence">Evidence Reports</option>
            <option value="Warranty">Warranty Reports</option>
            <option value="Investigation">Investigation Reports</option>
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="reports-grid">
        {filteredReports.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} />
            <h3>No Reports Found</h3>
            <p>
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'No reports match your current search criteria. Try adjusting your filters or search terms.'
                : 'You haven\'t generated any reports yet. Click "Generate New Report" to create your first professional report.'}
            </p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <div className="report-info">
                  <h3>{report.title}</h3>
                  <span className="report-number">{report.reportNumber}</span>
                </div>
                <div className={`priority-badge ${getPriorityClass(report.priority)}`}>
                  {report.priority} Priority
                </div>
              </div>

              <div className="report-content">
                <div className="report-type">
                  {getReportTypeIcon(report.type)}
                  {report.type}
                </div>
                <p className="report-description">
                  {report.content?.substring(0, 180)}
                  {report.content?.length > 180 ? '...' : ''}
                </p>
              </div>

              <div className="report-meta">
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>Created {new Date(report.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="meta-item">
                  <User size={16} />
                  <span>System Admin</span>
                </div>
                <div className="meta-item status">
                  {getStatusIcon(report.status)}
                  <span>{report.status}</span>
                </div>
              </div>

              <div className="report-actions">
                <button 
                  className="action-button view"
                  title="View Full Report"
                  onClick={() => console.log('View report:', report.id)}
                >
                  <Eye size={16} />
                </button>
                <button 
                  className="action-button download"
                  title="Download Report"
                  onClick={() => console.log('Download report:', report.id)}
                >
                  <Download size={16} />
                </button>
                <button 
                  className="action-button edit"
                  title="Edit Report"
                  onClick={() => handleEdit(report)}
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="action-button delete"
                  title="Delete Report"
                  onClick={() => handleDelete(report.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enhanced Add/Edit Report Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {editingReport ? 'Edit Professional Report' : 'Generate New Professional Report'}
              </h2>
              <button 
                className="close-button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingReport(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="report-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Report Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                  >
                    <option value="">Select Report Type</option>
                    <option value="Incident">Incident Report</option>
                    <option value="Case Summary">Case Summary Report</option>
                    <option value="Evidence">Evidence Analysis Report</option>
                    <option value="Warranty">Warranty Compliance Report</option>
                    <option value="Investigation">Investigation Report</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Priority</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Report Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter a descriptive title for your report"
                  required
                />
              </div>

              <div className="form-group">
                <label>Report Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Provide detailed information, findings, and analysis for this report..."
                  rows={8}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Report Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Pending">Pending Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Related Case ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.caseId}
                    onChange={(e) => setFormData({...formData, caseId: e.target.value})}
                    placeholder="Link to related case file"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Related OB Entry ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.obId}
                    onChange={(e) => setFormData({...formData, obId: e.target.value})}
                    placeholder="Link to occurrence book entry"
                  />
                </div>

                <div className="form-group">
                  <label>Related Evidence ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.evidenceId}
                    onChange={(e) => setFormData({...formData, evidenceId: e.target.value})}
                    placeholder="Link to evidence record"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingReport(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (editingReport ? 'Update Report' : 'Generate Report')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
