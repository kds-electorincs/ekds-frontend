import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Chip, Button,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, CircularProgress, Alert
} from '@mui/material';
import {
  Visibility as ViewIcon, Edit as EditIcon, Refresh as RefreshIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { adminPrivacyService, adminManagementService } from '../../services/apiServices';
import notification from '../../utils/notification';

const DashboardPrivacy = () => {
  const [activeTab, setActiveTab] = useState(0);

  // ─── Tab 0: Erasure Requests ──────────────────────────────────────────────
  const [erasureRequests, setErasureRequests] = useState([]);
  const [erasureLoading, setErasureLoading] = useState(false);

  // ─── Tab 1: Grievance Management ──────────────────────────────────────────
  const [grievances, setGrievances] = useState([]);
  const [grievanceLoading, setGrievanceLoading] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [grievanceModalOpen, setGrievanceModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editResolutionNote, setEditResolutionNote] = useState('');
  const [savingGrievance, setSavingGrievance] = useState(false);

  // ─── Tab 2: Breach Register ───────────────────────────────────────────────
  const [breaches, setBreaches] = useState([]);
  const [breachLoading, setBreachLoading] = useState(false);
  const [selectedBreach, setSelectedBreach] = useState(null);
  const [breachModalOpen, setBreachModalOpen] = useState(false);
  const [createBreachOpen, setCreateBreachOpen] = useState(false);
  
  // Breach Form
  const [breachForm, setBreachForm] = useState({
    detectedAt: new Date().toISOString().slice(0, 16),
    nature: '',
    description: '',
    affectedCount: ''
  });
  const [editBreachForm, setEditBreachForm] = useState({
    status: 'OPEN',
    affectedCount: '',
    consequences: '',
    mitigation: ''
  });
  const [savingBreach, setSavingBreach] = useState(false);

  // ─── Fetchers ─────────────────────────────────────────────────────────────
  const fetchErasures = async () => {
    setErasureLoading(true);
    try {
      const res = await adminPrivacyService.listErasureRequests({ page: 0, size: 50 });
      const content = res?.content || res?.data?.content || [];
      setErasureRequests(content);
    } catch {
      setErasureRequests([]);
    } finally {
      setErasureLoading(false);
    }
  };

  const fetchGrievances = async () => {
    setGrievanceLoading(true);
    try {
      const res = await adminPrivacyService.listGrievances({ page: 0, size: 50 });
      const content = res?.content || res?.data?.content || [];
      setGrievances(content);
    } catch {
      setGrievances([]);
    } finally {
      setGrievanceLoading(false);
    }
  };

  const fetchBreaches = async () => {
    setBreachLoading(true);
    try {
      const res = await adminPrivacyService.listBreaches({ page: 0, size: 50 });
      const content = res?.content || res?.data?.content || [];
      setBreaches(content);
    } catch {
      setBreaches([]);
    } finally {
      setBreachLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 0) fetchErasures();
    if (activeTab === 1) fetchGrievances();
    if (activeTab === 2) fetchBreaches();
  }, [activeTab]);

  // Grievance Handlers
  const handleOpenGrievance = async (id) => {
    try {
      const detail = await adminPrivacyService.getGrievance(id);
      setSelectedGrievance(detail);
      setEditStatus(detail.status);
      setEditResolutionNote(detail.resolutionNote || '');
      setGrievanceModalOpen(true);
    } catch {
      notification.error('Failed to load grievance detail.');
    }
  };

  const handleSaveGrievance = async () => {
    if (selectedGrievance?.status === 'RESOLVED' || selectedGrievance?.status === 'REJECTED') {
      notification.warning('Closed grievances cannot be modified.');
      return;
    }
    setSavingGrievance(true);
    try {
      await adminPrivacyService.updateGrievance(selectedGrievance.id, {
        status: editStatus,
        resolutionNote: editResolutionNote || undefined
      });
      notification.success('Grievance updated successfully.');
      setGrievanceModalOpen(false);
      fetchGrievances();
    } catch (err) {
      notification.error(err?.response?.data?.title || 'Failed to update grievance');
    } finally {
      setSavingGrievance(false);
    }
  };

  // Breach Handlers
  const handleCreateBreach = async () => {
    if (!breachForm.nature || !breachForm.description) {
      notification.warning('Nature and Description are required.');
      return;
    }
    setSavingBreach(true);
    try {
      await adminPrivacyService.createBreach({
        detectedAt: new Date(breachForm.detectedAt).toISOString(),
        nature: breachForm.nature,
        description: breachForm.description,
        affectedCount: breachForm.affectedCount ? Number(breachForm.affectedCount) : undefined
      });
      notification.success('Breach incident logged into statutory register.');
      setCreateBreachOpen(false);
      setBreachForm({ detectedAt: new Date().toISOString().slice(0, 16), nature: '', description: '', affectedCount: '' });
      fetchBreaches();
    } catch (err) {
      notification.error(err?.response?.data?.title || 'Failed to log breach');
    } finally {
      setSavingBreach(false);
    }
  };

  const handleOpenBreach = async (id) => {
    try {
      const detail = await adminPrivacyService.getBreach(id);
      setSelectedBreach(detail);
      setEditBreachForm({
        status: detail.status,
        affectedCount: detail.affectedCount ?? '',
        consequences: detail.consequences || '',
        mitigation: detail.mitigation || ''
      });
      setBreachModalOpen(true);
    } catch {
      notification.error('Failed to load breach details.');
    }
  };

  const handleSaveBreach = async () => {
    setSavingBreach(true);
    try {
      await adminPrivacyService.updateBreach(selectedBreach.id, {
        status: editBreachForm.status,
        affectedCount: editBreachForm.affectedCount ? Number(editBreachForm.affectedCount) : undefined,
        consequences: editBreachForm.consequences || undefined,
        mitigation: editBreachForm.mitigation || undefined
      });
      notification.success('Breach register record updated.');
      setBreachModalOpen(false);
      fetchBreaches();
    } catch (err) {
      notification.error(err?.response?.data?.title || 'Failed to update breach');
    } finally {
      setSavingBreach(false);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
            DPDP Privacy &amp; Compliance Center
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage data erasure requests, user grievances, statutory breach registers, and retention rules.
          </Typography>
        </Box>
        {activeTab === 2 && (
          <Button variant="contained" color="error" onClick={() => setCreateBreachOpen(true)} sx={{ fontWeight: 800 }}>
            Log New Security Breach Incident
          </Button>
        )}
      </Box>

      <Paper sx={{ borderRadius: 3, border: '1px solid #D6E4EE', overflow: 'hidden' }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ borderBottom: '1px solid #E2ECF5', bgcolor: '#F8FAFC', px: 3 }}>
          <Tab label="Data Erasure Requests" sx={{ fontWeight: 700 }} />
          <Tab label="Grievances SLA Queue" sx={{ fontWeight: 700 }} />
          <Tab label="Statutory Breach Register (72h DPBI)" sx={{ fontWeight: 700 }} />
        </Tabs>

        {/* Tab 0: Erasure Requests */}
        {activeTab === 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#EDF4FA' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Request ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>User ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Requested At</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Scheduled Execution</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Completed At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {erasureLoading ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
                ) : erasureRequests.length > 0 ? (
                  erasureRequests.map((r) => (
                    <TableRow key={r.id} hover sx={{ bgcolor: r.status === 'FAILED' ? '#FFF8F8' : 'inherit' }}>
                      <TableCell sx={{ fontWeight: 700 }}>#{r.id}</TableCell>
                      <TableCell>User #{r.userId}</TableCell>
                      <TableCell>
                        <Chip label={r.status} color={r.status === 'FAILED' ? 'error' : r.status === 'PENDING' ? 'warning' : 'success'} size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>{new Date(r.requestedAt).toLocaleString()}</TableCell>
                      <TableCell>{new Date(r.executeAfter).toLocaleString()}</TableCell>
                      <TableCell>{r.completedAt ? new Date(r.completedAt).toLocaleString() : '—'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No data erasure requests found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 1: Grievances */}
        {activeTab === 1 && (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#EDF4FA' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Ticket #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Overdue SLA</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Due By</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Submitted Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grievanceLoading ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
                ) : grievances.length > 0 ? (
                  grievances.map((g) => (
                    <TableRow key={g.id} hover sx={{ bgcolor: g.overdue ? '#FFF8F8' : 'inherit' }}>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{g.ticket}</TableCell>
                      <TableCell>{g.category}</TableCell>
                      <TableCell>
                        <Chip label={g.status} color={g.status === 'RESOLVED' ? 'success' : g.status === 'REJECTED' ? 'error' : 'warning'} size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>
                        {g.overdue ? <Chip label="OVERDUE" color="error" size="small" sx={{ fontWeight: 900 }} /> : <Chip label="ON TIME" color="success" variant="outlined" size="small" />}
                      </TableCell>
                      <TableCell>{new Date(g.dueBy).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(g.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => handleOpenGrievance(g.id)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>No privacy grievances found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 2: Breach Register */}
        {activeTab === 2 && (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#EDF4FA' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Nature</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>DPBI 72h SLA</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Detected At</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {breachLoading ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
                ) : breaches.length > 0 ? (
                  breaches.map((b) => (
                    <TableRow key={b.id} hover sx={{ bgcolor: b.boardReportOverdue ? '#FFF8F8' : 'inherit' }}>
                      <TableCell sx={{ fontWeight: 700 }}>#{b.id}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{b.nature}</TableCell>
                      <TableCell>
                        <Chip label={b.status} color={b.status === 'CLOSED' ? 'success' : 'error'} size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>
                        {b.boardReportOverdue ? (
                          <Chip label="DPBI REPORT OVERDUE" color="error" size="small" sx={{ fontWeight: 900 }} />
                        ) : (
                          <Typography variant="caption" fontWeight={700}>Due: {new Date(b.boardReportDueAt).toLocaleString()}</Typography>
                        )}
                      </TableCell>
                      <TableCell>{new Date(b.detectedAt).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => handleOpenBreach(b.id)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No breach incidents recorded in register.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Grievance Detail & Update Modal */}
      <Dialog open={grievanceModalOpen} onClose={() => setGrievanceModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Grievance #{selectedGrievance?.ticket}</DialogTitle>
        <DialogContent dividers>
          {selectedGrievance && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Contact Requester:</Typography>
              <Typography variant="body2" fontWeight={700}>{selectedGrievance.contactName || 'Anonymous'} ({selectedGrievance.contactEmail})</Typography>
              
              <Typography variant="subtitle2" color="text.secondary">Message Content:</Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#F8FAFC' }}>
                <Typography variant="body2">{selectedGrievance.message}</Typography>
              </Paper>

              <Divider sx={{ my: 1 }} />

              <TextField select fullWidth label="Status" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                <MenuItem value="OPEN">OPEN</MenuItem>
                <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
                <MenuItem value="RESOLVED">RESOLVED</MenuItem>
                <MenuItem value="REJECTED">REJECTED</MenuItem>
              </TextField>

              <TextField
                fullWidth multiline rows={3}
                label="Resolution Note (Emailed to requester upon closing)"
                value={editResolutionNote}
                onChange={(e) => setEditResolutionNote(e.target.value)}
                slotProps={{ htmlInput: { maxLength: 4000 } }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setGrievanceModalOpen(false)}>Close</Button>
          <Button variant="contained" onClick={handleSaveGrievance} disabled={savingGrievance}>
            {savingGrievance ? 'Saving...' : 'Save & Update Grievance'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Breach Modal */}
      <Dialog open={createBreachOpen} onClose={() => setCreateBreachOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>Log Security Breach Incident</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              type="datetime-local"
              fullWidth
              label="Detected At"
              value={breachForm.detectedAt}
              onChange={(e) => setBreachForm({ ...breachForm, detectedAt: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth required label="Nature of Breach" placeholder="e.g. Unauthorized Access, Leak, Disruption"
              value={breachForm.nature} onChange={(e) => setBreachForm({ ...breachForm, nature: e.target.value })}
              slotProps={{ htmlInput: { maxLength: 40 } }}
            />
            <TextField
              fullWidth required multiline rows={4} label="Full Description"
              value={breachForm.description} onChange={(e) => setBreachForm({ ...breachForm, description: e.target.value })}
              slotProps={{ htmlInput: { maxLength: 10000 } }}
            />
            <TextField
              fullWidth type="number" label="Affected User Count (Estimate)"
              value={breachForm.affectedCount} onChange={(e) => setBreachForm({ ...breachForm, affectedCount: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateBreachOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleCreateBreach} disabled={savingBreach}>
            {savingBreach ? 'Logging...' : 'Log Breach Incident'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Breach Modal */}
      <Dialog open={breachModalOpen} onClose={() => setBreachModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Update Breach Incident #{selectedBreach?.id}</DialogTitle>
        <DialogContent dividers>
          {selectedBreach && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity={selectedBreach.boardReportOverdue ? 'error' : 'warning'}>
                <strong>DPBI 72-Hour Report Deadline:</strong> {new Date(selectedBreach.boardReportDueAt).toLocaleString()}
              </Alert>

              <TextField select fullWidth label="Status" value={editBreachForm.status} onChange={(e) => setEditBreachForm({ ...editBreachForm, status: e.target.value })}>
                <MenuItem value="OPEN">OPEN</MenuItem>
                <MenuItem value="CONTAINED">CONTAINED</MenuItem>
                <MenuItem value="CLOSED">CLOSED</MenuItem>
              </TextField>

              <TextField type="number" fullWidth label="Affected Count" value={editBreachForm.affectedCount} onChange={(e) => setEditBreachForm({ ...editBreachForm, affectedCount: e.target.value })} />
              <TextField fullWidth multiline rows={2} label="Consequences" value={editBreachForm.consequences} onChange={(e) => setEditBreachForm({ ...editBreachForm, consequences: e.target.value })} />
              <TextField fullWidth multiline rows={2} label="Mitigation Taken" value={editBreachForm.mitigation} onChange={(e) => setEditBreachForm({ ...editBreachForm, mitigation: e.target.value })} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBreachModalOpen(false)}>Close</Button>
          <Button variant="contained" onClick={handleSaveBreach} disabled={savingBreach}>
            {savingBreach ? 'Saving...' : 'Update Breach Record'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardPrivacy;
