import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Grid, TextField, Button, MenuItem,
  Alert, Divider, Chip, CircularProgress, Link
} from '@mui/material';
import { Gavel as GrievanceIcon, Search as SearchIcon, Shield as ShieldIcon } from '@mui/icons-material';
import { privacyService } from '../services/apiServices';
import notification from '../utils/notification';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { value: 'ACCESS', label: 'Access to Personal Data' },
  { value: 'CORRECTION', label: 'Correction / Updating of Data' },
  { value: 'ERASURE', label: 'Erasure / Account Deletion' },
  { value: 'CONSENT', label: 'Consent Management & Preferences' },
  { value: 'BREACH', label: 'Security & Data Breach Concerns' },
  { value: 'OTHER', label: 'Other Privacy Inquiries' },
];

const PublicGrievanceForm = () => {
  const { user } = useAuth();

  // Form State
  const [contactName, setContactName] = useState(user?.name || user?.fullName || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [category, setCategory] = useState('ACCESS');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // Status Lookup State
  const [lookupTicket, setLookupTicket] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [statusResult, setStatusResult] = useState(null);
  const [lookupError, setLookupError] = useState(false);

  useEffect(() => {
    if (user) {
      if (!contactName) setContactName(user.name || user.fullName || '');
      if (!contactEmail) setContactEmail(user.email || '');
    }
  }, [user]);

  const handleSubmitGrievance = async (e) => {
    e.preventDefault();
    if (!contactEmail || !message) {
      notification.warning('Please enter your email and grievance message.');
      return;
    }
    setSubmitting(true);
    setReceipt(null);
    try {
      const payload = {
        contactName: contactName || undefined,
        contactEmail,
        category,
        message,
      };
      const res = await privacyService.submitGrievance(payload);
      setReceipt(res);
      setMessage('');
      notification.success('Grievance submitted successfully!');
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) {
        notification.error('Rate limit reached (3 per hour). Please try again later.');
      } else {
        const msg = err?.response?.data?.title || 'Failed to submit grievance.';
        notification.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookupStatus = async (e) => {
    e.preventDefault();
    if (!lookupTicket || !lookupEmail) {
      notification.warning('Please enter both Ticket Reference and Email Address.');
      return;
    }
    setLookingUp(true);
    setStatusResult(null);
    setLookupError(false);
    try {
      const res = await privacyService.getGrievanceStatus(lookupTicket.trim(), lookupEmail.trim());
      setStatusResult(res);
    } catch (err) {
      // DPDP Section 4.3 rule: Wrong ticket and wrong email return the same 404. Show generic message.
      setLookupError(true);
    } finally {
      setLookingUp(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={900} color="primary.main" gutterBottom sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
          <GrievanceIcon fontSize="large" color="primary" /> Data Privacy Grievance Redressal
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={700} mx="auto">
          Under the Digital Personal Data Protection Act 2023, you have the statutory right to register privacy grievances directly with our Data Protection Officer.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Submit Form */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #D6E4EE' }}>
            <Typography variant="h6" fontWeight={800} color="primary.main" mb={2}>
              Raise a Privacy Complaint
            </Typography>

            {receipt ? (
              <Alert severity="success" sx={{ mb: 3, p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                  Grievance Ticket Generated!
                </Typography>
                <Typography variant="body2" paragraph>
                  Save this reference number; you need it with your email to check status.
                </Typography>
                <Box sx={{ p: 2, bgcolor: '#ffffff', borderRadius: 1.5, border: '1px border', borderColor: 'success.main', my: 2 }}>
                  <Typography variant="body2" color="text.secondary">Ticket Reference:</Typography>
                  <Typography variant="h5" fontWeight={900} color="primary.main" sx={{ letterSpacing: 1 }}>
                    {receipt.ticket}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Guaranteed Resolution Due Date: <strong>{new Date(receipt.dueBy).toLocaleDateString()}</strong>
                  </Typography>
                </Box>
                <Button variant="outlined" size="small" onClick={() => setReceipt(null)}>
                  Submit Another Grievance
                </Button>
              </Alert>
            ) : (
              <form onSubmit={handleSubmitGrievance}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Your Name (Optional)"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      slotProps={{ htmlInput: { maxLength: 120 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      required
                      type="email"
                      label="Email Address"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      slotProps={{ htmlInput: { maxLength: 255 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      select
                      fullWidth
                      required
                      label="Grievance Category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORIES.map((c) => (
                        <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      required
                      multiline
                      rows={5}
                      label="Grievance Description"
                      placeholder="Please describe your privacy concern or request in detail..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      slotProps={{ htmlInput: { maxLength: 4000 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
                      sx={{ px: 4, py: 1.4, fontWeight: 800, borderRadius: 2 }}
                    >
                      {submitting ? 'Submitting...' : 'Submit Grievance Ticket'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Status Lookup */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #D6E4EE', bgcolor: '#F8FAFC' }}>
            <Typography variant="h6" fontWeight={800} color="primary.main" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SearchIcon color="primary" /> Track Grievance Status
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Already submitted a ticket? Enter your reference ticket number and email address below to check the current resolution status.
            </Typography>

            <form onSubmit={handleLookupStatus}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Ticket Reference Number"
                  value={lookupTicket}
                  onChange={(e) => setLookupTicket(e.target.value)}
                />
                <TextField
                  fullWidth
                  size="small"
                  required
                  type="email"
                  label="Contact Email"
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="outlined"
                  color="primary"
                  disabled={lookingUp}
                  sx={{ fontWeight: 800, py: 1 }}
                >
                  {lookingUp ? 'Searching...' : 'Check Ticket Status'}
                </Button>
              </Box>
            </form>

            {lookupError && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                We could not find a grievance with those details. Please check your ticket number and email address.
              </Alert>
            )}

            {statusResult && (
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: '#ffffff', mt: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">Ticket Reference:</Typography>
                <Typography variant="subtitle2" fontWeight={800} color="primary.main">{statusResult.ticket}</Typography>
                
                <Box sx={{ my: 1.5 }}>
                  <Chip
                    label={statusResult.status}
                    color={
                      statusResult.status === 'RESOLVED' ? 'success' :
                      statusResult.status === 'REJECTED' ? 'error' :
                      statusResult.status === 'IN_PROGRESS' ? 'info' : 'warning'
                    }
                    sx={{ fontWeight: 800 }}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary" display="block">Target Resolution Due Date:</Typography>
                <Typography variant="body2" fontWeight={700}>{new Date(statusResult.dueBy).toLocaleDateString()}</Typography>

                {statusResult.resolutionNote && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: '#EDF4FA', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="primary.main" fontWeight={800} display="block">DPO Resolution Note:</Typography>
                    <Typography variant="body2" color="text.primary">{statusResult.resolutionNote}</Typography>
                  </Box>
                )}
              </Paper>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PublicGrievanceForm;
