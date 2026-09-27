import React from 'react';
import { Box, Container, Typography, Paper, Divider, Button, Alert, Link, Breadcrumbs } from '@mui/material';
import { Shield as ShieldIcon, Email as EmailIcon, Gavel as GavelIcon, Link as RouterLink } from '@mui/icons-material';

const PrivacyPolicy = () => {
  return (
    <Box sx={{ py: 6, bg: 'background.default' }}>
      <Container maxWidth="md">
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            Home
          </Link>
          <Typography color="text.primary">Privacy Policy &amp; DPDP Notice</Typography>
        </Breadcrumbs>

        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <ShieldIcon color="primary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="h4" fontWeight={900} color="primary.main">
                Privacy Policy &amp; DPDP Data Notice
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Digital Personal Data Protection Act, 2023 (DPDP) &amp; DPDP Rules 2025 Compliant
              </Typography>
            </Box>
          </Box>

          <Alert severity="info" sx={{ my: 3, borderRadius: 2 }}>
            This policy outlines how KDS Electronics ("Data Fiduciary") collects, uses, stores, and protects your personal data in accordance with the <strong>Digital Personal Data Protection Act 2023 (India)</strong>.
          </Alert>

          <Divider sx={{ my: 3 }} />

          {/* Section 1 */}
          <Typography variant="h6" fontWeight={700} gutterBottom>
            1. Data Fiduciary Identity &amp; Contact Details
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            <strong>Data Fiduciary:</strong> KDS Electronics Pvt. Ltd.<br />
            <strong>Registered Address:</strong> Archana Inventory Hub, Electronics City, Maharashtra, India.<br />
            <strong>Data Protection Officer (DPO):</strong> Compliance &amp; Privacy Officer<br />
            <strong>DPO Email:</strong> <Link href="mailto:info@ekdselectronics.com">info@ekdselectronics.com</Link>
          </Typography>

          {/* Section 2 */}
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
            2. Personal Data We Collect &amp; Purpose of Processing
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            We process your personal data strictly for specified, lawful purposes based on your explicit consent or legal obligations:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>Account Registration &amp; Authentication:</strong> Full name, email address, mobile number, password hash (Identity Management).
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>B2B Order Fulfillment &amp; Invoicing:</strong> Company Name, Shipping Address, Billing Address, GSTIN / Tax ID (Order processing &amp; GST compliance).
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>RFQs &amp; Bulk Procurement Quotes:</strong> Contact details, customized component requirements, target pricing.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>Technical Security:</strong> IP Address, Session Token, Browser User Agent (Fraud prevention &amp; audit logging).
              </Typography>
            </li>
          </ul>

          {/* Section 3 */}
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
            3. Your Rights as a Data Principal under DPDP Act 2023
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            As a Data Principal, you are entitled to the following statutory rights under the DPDP Act 2023:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>Right to Access Summary of Personal Data:</strong> View and export a digital copy of all personal details processed by us.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>Right to Correction &amp; Erasure:</strong> Update inaccurate data or request erasure of your account data ("Right to be Forgotten").
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>Right to Withdraw Consent:</strong> Revoke consent for non-essential processing at any time through your User Profile dashboard.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>Right of Grievance Redressal:</strong> Submit privacy complaints directly to our Data Protection Officer with guaranteed resolution timelines.
              </Typography>
            </li>
          </ul>

          {/* Section 4 */}
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
            4. Data Retention &amp; Erasure Policy
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            Personal data is retained only for as long as necessary to fulfill the processing purpose. Financial transactions, tax invoices, and order history are retained for <strong>7 years</strong> to comply with Indian GST and tax laws. Inactive account profile data is automatically purged or anonymized after 3 years of inactivity.
          </Typography>

          {/* Section 5 */}
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
            5. Grievance Redressal &amp; Dispute Resolution
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            If you have questions or wish to exercise your rights, contact our Data Protection Officer at <Link href="mailto:info@ekdselectronics.com">info@ekdselectronics.com</Link>. If unsatisfied with our response, you have the right to file a complaint with the <strong>Data Protection Board of India (DPBI)</strong>.
          </Typography>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Last Updated: March 2026 | Compliant with DPDP Act 2023 &amp; Rules 2025
            </Typography>
            <Button component={RouterLink} to="/" variant="contained" color="primary">
              Return to Store
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
