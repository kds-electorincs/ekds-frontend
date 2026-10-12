import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Divider, Button, Alert, Link, Breadcrumbs } from '@mui/material';
import { Shield as ShieldIcon, Email as EmailIcon, Gavel as GavelIcon, Link as RouterLink } from '@mui/icons-material';
import { privacyService } from '../services/apiServices';

const PrivacyPolicy = () => {
  const [notice, setNotice] = useState(null);
  const [officerContact, setOfficerContact] = useState(null);

  useEffect(() => {
    privacyService.getNotice().then((res) => setNotice(res)).catch(() => {});
    privacyService.getContact().then((res) => setOfficerContact(res)).catch(() => {});
  }, []);

  return (
    <Box sx={{ py: 6, bg: 'background.default' }}>
      <Container maxWidth="md">
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            Home
          </Link>
          <Typography color="text.primary">Privacy Notice &amp; Policy</Typography>
        </Breadcrumbs>

        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <ShieldIcon color="primary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="h4" fontWeight={900} color="primary.main">
                Privacy Notice &amp; DPDP Policy
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Version: <strong>{notice?.version || 'draft-0'}</strong> | Digital Personal Data Protection Act, 2023 Compliant
              </Typography>
            </Box>
          </Box>

          <Alert severity="info" sx={{ my: 3, borderRadius: 2 }}>
            This statutory privacy notice outlines how KDS Electronics ("Data Fiduciary") collects, uses, stores, and protects your personal data under the <strong>Digital Personal Data Protection Act 2023 (India)</strong>.
          </Alert>

          <Divider sx={{ my: 3 }} />

          {/* Section 1: Dynamic DPO Officer Contact Details */}
          <Typography variant="h6" fontWeight={700} gutterBottom>
            1. Data Fiduciary Identity &amp; Officer Contact Details
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            <strong>Data Fiduciary:</strong> KDS Electronics Industrial Supply Ltd.<br />
            <strong>Registered Address:</strong> {officerContact?.address || 'K&DS Electronic Limited, MM Enterprise, Maruti Munchies, 7- Mani nagar, Rajkot, Gujarat 360004'}<br />
            <strong>Data Protection Officer (DPO):</strong> {officerContact?.name || 'Data Protection Officer'}<br />
            <strong>DPO Email:</strong> <Link href={`mailto:${officerContact?.email || 'sales@kdselectronics.com'}`}>{officerContact?.email || 'sales@kdselectronics.com'}</Link><br />
            <strong>DPO Hotline:</strong> {officerContact?.phone || '+91 99258 01333'}
          </Typography>

          {/* Section 2 */}
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
            2. Personal Data We Collect &amp; Purpose of Processing
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            We process your personal data strictly for specified, lawful purposes based on your explicit consent or statutory obligations:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>Account Registration &amp; Authentication:</strong> Full name, email address, mobile number, age confirmation, notice acceptance.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>B2B Order Fulfillment &amp; Invoicing:</strong> Shipping Address with 2-digit GST state code, Billing Address, GSTIN / Tax ID.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>Grievances &amp; Rights Exercise:</strong> Grievance message logs, ticket reference IDs, resolution notes.
              </Typography>
            </li>
          </ul>

          {/* Section 3 */}
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
            3. Your Statutory Rights under DPDP Act 2023
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            As a Data Principal, you are entitled to statutory rights:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>Right to Access Summary:</strong> View and export a digital JSON copy of all personal details processed.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>Right to Erasure:</strong> Request 48-hour scheduled deletion of your account and personal data.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>Right to Withdraw Consent:</strong> Toggle marketing consent easily without dark patterns.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>Right to Nominate:</strong> Nominate a representative to exercise data rights on your behalf.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>Right of Grievance Redressal:</strong> Submit privacy complaints directly with guaranteed due-date SLA.
              </Typography>
            </li>
          </ul>

          {/* Section 4 */}
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
            4. Data Retention &amp; Tax Compliance
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            Financial transactions, GST tax invoices, and payment records are retained for statutory legal periods required under Indian GST tax law. Profile data is anonymized or purged upon request completion.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Notice Version: {notice?.version || 'draft-0'} | Compliant with DPDP Act 2023
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button component={RouterLink} to="/privacy-grievance" variant="outlined" color="primary">
                Raise Grievance Ticket
              </Button>
              <Button component={RouterLink} to="/" variant="contained" color="primary">
                Return to Store
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
