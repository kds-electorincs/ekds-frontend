import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Divider, Alert, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions, Chip, Stack,
  CircularProgress, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel
} from '@mui/material';
import {
  Download as DownloadIcon, DeleteForever as DeleteIcon, Shield as ShieldIcon,
  CheckCircle as CheckIcon, Warning as WarningIcon, Lock as LockIcon,
  PersonAdd as NomineeIcon, Gavel as GrievanceIcon, Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import notification from '../../utils/notification';
import { privacyService } from '../../services/apiServices';
import { Link as RouterLink } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  // Consents State
  const [consents, setConsents] = useState([]);
  const [consentHistory, setConsentHistory] = useState([]);
  const [consentLoading, setConsentLoading] = useState(false);

  // Re-auth Modal State
  const [reauthOpen, setReauthOpen] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthPendingAction, setReauthPendingAction] = useState(null); // 'export' | 'erasure' | 'nominee'
  const [reauthLoading, setReauthLoading] = useState(false);

  // Data Export State
  const [downloading, setDownloading] = useState(false);

  // Erasure State
  const [openErasureModal, setOpenErasureModal] = useState(false);
  const [erasureStatus, setErasureStatus] = useState(null);
  const [erasureLoading, setErasureLoading] = useState(false);

  // Nominee State
  const [nominee, setNominee] = useState(null);
  const [nomineeForm, setNomineeForm] = useState({ name: '', relationship: '', email: '', phone: '' });
  const [nomineeLoading, setNomineeLoading] = useState(false);

  // Fetch Consents, Erasure, Nominee on load
  const loadPrivacyData = async () => {
    setConsentLoading(true);
    try {
      const res = await privacyService.getConsents();
      setConsents(res?.current || []);
      setConsentHistory(res?.history || []);
    } catch (e) {}
    setConsentLoading(false);

    try {
      const eRes = await privacyService.getErasureStatus();
      setErasureStatus(eRes);
    } catch (e) {
      setErasureStatus(null);
    }

    try {
      const nRes = await privacyService.getNominee();
      setNominee(nRes);
      if (nRes) {
        setNomineeForm({ name: nRes.name, relationship: nRes.relationship, email: nRes.email, phone: nRes.phone || '' });
      }
    } catch (e) {
      setNominee(null);
    }
  };

  useEffect(() => {
    if (user) {
      loadPrivacyData();
    }
  }, [user]);

  // Consents toggle handler
  const handleToggleConsent = async (purpose, currentGranted) => {
    if (purpose === 'TERMS') {
      notification.warning('TERMS consent is required to keep your account. To remove it, request account erasure.');
      return;
    }
    const action = currentGranted ? 'WITHDRAW' : 'GRANT';
    try {
      const res = await privacyService.changeConsent(purpose, action);
      setConsents(res?.current || []);
      setConsentHistory(res?.history || []);
      notification.success(`Marketing consent ${action === 'GRANT' ? 'granted' : 'withdrawn'} successfully.`);
    } catch (err) {
      notification.error(err?.response?.data?.title || 'Failed to update consent');
    }
  };

  // Re-authentication triggers
  const triggerReauth = (action) => {
    setReauthPendingAction(action);
    setReauthPassword('');
    setReauthOpen(true);
  };

  const handleExecuteReauth = async () => {
    if (!reauthPassword) {
      notification.warning('Please enter your password to confirm identity.');
      return;
    }
    setReauthLoading(true);
    const reauthBody = { currentPassword: reauthPassword };
    try {
      if (reauthPendingAction === 'export') {
        setReauthOpen(false);
        await executeExport(reauthBody);
      } else if (reauthPendingAction === 'erasure') {
        setReauthOpen(false);
        await executeErasureRequest(reauthBody);
      } else if (reauthPendingAction === 'nominee') {
        setReauthOpen(false);
        await executeNomineeUpsert(reauthBody);
      }
    } catch (err) {
      notification.error(err?.response?.data?.title || 'We could not confirm your identity. Try again.');
    } finally {
      setReauthLoading(false);
    }
  };

  // 1. Data Export execution via blob
  const executeExport = async (reauthBody) => {
    setDownloading(true);
    try {
      const blob = await privacyService.exportData(reauthBody);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      link.setAttribute('download', `kds-personal-data-${today}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      URL.revokeObjectURL(url);
      notification.success('Personal data downloaded successfully.');
    } catch (err) {
      if (err?.response?.status === 429) {
        notification.error('Rate limit reached. Try again later.');
      } else {
        notification.error(err?.response?.data?.title || 'Data export failed.');
      }
    } finally {
      setDownloading(false);
    }
  };

  // 2. Erasure Request execution
  const executeErasureRequest = async (reauthBody) => {
    setErasureLoading(true);
    try {
      const res = await privacyService.requestErasure(reauthBody);
      setErasureStatus(res);
      notification.success('Erasure request submitted. 48-hour waiting period initiated.');
    } catch (err) {
      const data = err?.response?.data;
      if (data?.reason === 'PENDING_EXISTS') {
        notification.info('You already have a pending deletion request.');
      } else if (data?.reason === 'OPEN_ORDERS') {
        notification.warning('You have orders or payments that are not complete. You can request deletion after they are delivered or settled.');
      } else if (data?.reason === 'ADMIN_ACCOUNT') {
        notification.error('Administrator accounts cannot be deleted here. Contact the site owner.');
      } else {
        notification.error(data?.title || 'Erasure request failed');
      }
    } finally {
      setErasureLoading(false);
      setOpenErasureModal(false);
    }
  };

  const handleCancelErasure = async () => {
    try {
      await privacyService.cancelErasure();
      setErasureStatus(null);
      notification.success('Erasure request cancelled.');
    } catch (err) {
      notification.error('Failed to cancel erasure request.');
    }
  };

  // 3. Nominee Upsert execution
  const executeNomineeUpsert = async (reauthBody) => {
    setNomineeLoading(true);
    try {
      const payload = {
        ...reauthBody,
        name: nomineeForm.name,
        relationship: nomineeForm.relationship,
        email: nomineeForm.email,
        phone: nomineeForm.phone || undefined
      };
      const res = await privacyService.upsertNominee(payload);
      setNominee(res);
      notification.success('Data Nominee saved successfully!');
    } catch (err) {
      notification.error(err?.response?.data?.title || 'Failed to save nominee.');
    } finally {
      setNomineeLoading(false);
    }
  };

  const handleDeleteNominee = async () => {
    try {
      await privacyService.deleteNominee();
      setNominee(null);
      setNomineeForm({ name: '', relationship: '', email: '', phone: '' });
      notification.info('Nominee removed.');
    } catch (err) {
      notification.error('Failed to remove nominee.');
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Account Settings &amp; Privacy Rights
      </Typography>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #D6E4EE', overflow: 'hidden' }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ borderBottom: '1px solid #E2ECF5', bgcolor: '#F8FAFC', px: 3 }}>
          <Tab label="Consents Management" sx={{ fontWeight: 700 }} />
          <Tab label="Download &amp; Data Rights" sx={{ fontWeight: 700 }} />
          <Tab label="Delete Account" sx={{ fontWeight: 700 }} />
          <Tab label="Data Rights Nominee" sx={{ fontWeight: 700 }} />
        </Tabs>

        {/* Tab 0: Consent Management */}
        {activeTab === 0 && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom color="primary.main">
              DPDP Act 2023 Consent Controls
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Under Section 6 of the DPDP Act 2023, you have full authority to grant or withdraw consent for marketing processing.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 3 }}>
              {/* TERMS row */}
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F8FAFC' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800}>TERMS Consent (Account Operation)</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Required to keep your account. To remove it, request account erasure.
                  </Typography>
                </Box>
                <Chip label="Required (Granted)" color="primary" size="small" sx={{ fontWeight: 700 }} />
              </Paper>

              {/* MARKETING row */}
              {(() => {
                const mConsent = consents.find(c => c.purpose === 'MARKETING');
                const isGranted = mConsent?.granted ?? false;
                return (
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>MARKETING Consent</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Receive component price drop alerts, BOM trends, and wholesale promotions.
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isGranted}
                          onChange={() => handleToggleConsent('MARKETING', isGranted)}
                          color="primary"
                        />
                      }
                      label={isGranted ? 'Granted' : 'Withdrawn'}
                    />
                  </Paper>
                );
              })()}
            </Box>

            {consentHistory.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom>Consent Audit History</Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#EDF4FA' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Purpose</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Notice Version</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {consentHistory.map((h, i) => (
                        <TableRow key={i}>
                          <TableCell>{h.purpose}</TableCell>
                          <TableCell><Chip label={h.action} size="small" color={h.action === 'GRANT' ? 'success' : 'warning'} /></TableCell>
                          <TableCell>{h.noticeVersion}</TableCell>
                          <TableCell>{new Date(h.createdAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}

        {/* Tab 1: Download my data */}
        {activeTab === 1 && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom color="primary.main">
              Download My Personal Data
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              We will prepare a JSON file containing all personal data, saved addresses, orders, and consent records we hold about you.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              onClick={() => triggerReauth('export')}
              disabled={downloading}
              sx={{ px: 4, py: 1.2, fontWeight: 700, borderRadius: 2 }}
            >
              {downloading ? 'Preparing JSON File…' : 'Export My Personal Data (JSON)'}
            </Button>
          </Box>
        )}

        {/* Tab 2: Delete my account (Erasure) */}
        {activeTab === 2 && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={800} color="error.main" gutterBottom>
              Delete My Account &amp; Personal Data (Erasure)
            </Typography>

            {erasureStatus && erasureStatus.status === 'PENDING' ? (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={800}>Deletion Scheduled</Typography>
                Deletion scheduled for <strong>{new Date(erasureStatus.executeAfter).toLocaleString()}</strong>.
                You can cancel any time before then.
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={handleCancelErasure}>
                    Cancel Deletion
                  </Button>
                </Box>
              </Alert>
            ) : erasureStatus && erasureStatus.status === 'FAILED' ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                We could not complete your deletion. Our team has been notified.
                <Button component={RouterLink} to="/privacy-grievance" variant="text" color="error" sx={{ ml: 2, fontWeight: 700 }}>
                  Raise Grievance
                </Button>
              </Alert>
            ) : (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={800}>Important Notice Before Requesting Deletion:</Typography>
                  <ul>
                    <li>Your account will be deleted after a <strong>48-hour waiting period</strong>; you can cancel any time before then.</li>
                    <li><strong>Deleted:</strong> profile, saved addresses, tax details, cart, active sessions.</li>
                    <li><strong>Kept for legal reasons:</strong> order and invoice records, payment records, and consent history. Order records are kept for the period tax law requires.</li>
                    <li>After deletion you cannot log in and your data cannot be restored.</li>
                  </ul>
                </Alert>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setOpenErasureModal(true)}
                  sx={{ px: 4, py: 1.2, fontWeight: 700, borderRadius: 2 }}
                >
                  Initiate Account Deletion
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Tab 3: Nominee */}
        {activeTab === 3 && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom color="primary.main">
              Data Protection Nominee (DPDP Act Section 14)
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              A nominee can exercise your data rights on your behalf if you pass away or become unable to exercise them.
            </Typography>

            <Grid container spacing={3} sx={{ maxWidth: 600 }}>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth size="small" label="Nominee Full Name" value={nomineeForm.name} onChange={(e) => setNomineeForm({ ...nomineeForm, name: e.target.value })} required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Relationship" value={nomineeForm.relationship} onChange={(e) => setNomineeForm({ ...nomineeForm, relationship: e.target.value })} required placeholder="e.g. Spouse, Child, Legal Heir" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Nominee Email" type="email" value={nomineeForm.email} onChange={(e) => setNomineeForm({ ...nomineeForm, email: e.target.value })} required />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth size="small" label="Nominee Phone (Optional)" value={nomineeForm.phone} onChange={(e) => setNomineeForm({ ...nomineeForm, phone: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" onClick={() => triggerReauth('nominee')} disabled={nomineeLoading}>
                  {nominee ? 'Update Nominee' : 'Set Nominee'}
                </Button>
                {nominee && (
                  <Button variant="outlined" color="error" onClick={handleDeleteNominee}>
                    Remove Nominee
                  </Button>
                )}
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Shared Re-authentication Modal (Section 3.1) */}
      <Dialog open={reauthOpen} onClose={() => setReauthOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Your Identity</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            For your privacy and security, please re-enter your account password to confirm this action.
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={reauthPassword}
            onChange={(e) => setReauthPassword(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReauthOpen(false)} disabled={reauthLoading}>Cancel</Button>
          <Button variant="contained" onClick={handleExecuteReauth} disabled={reauthLoading}>
            {reauthLoading ? 'Confirming...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Erasure Confirmation Modal */}
      <Dialog open={openErasureModal} onClose={() => setOpenErasureModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>Confirm Account Deletion</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" paragraph>
            Are you sure you want to request account deletion? You will enter a 48-hour waiting period during which you can cancel at any time.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenErasureModal(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => { setOpenErasureModal(false); triggerReauth('erasure'); }}>
            Proceed to Verification
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
