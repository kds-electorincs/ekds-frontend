import React, { useState } from 'react';
import { 
  Box, Container, Typography, Grid, Paper, TextField, Button, 
  Accordion, AccordionSummary, AccordionDetails, Chip, Stack, Alert, CircularProgress
} from '@mui/material';
import { 
  Phone as PhoneIcon, 
  Email as EmailIcon, 
  LocationOn as LocationIcon, 
  AccessTime as TimeIcon, 
  ExpandMore as ExpandMoreIcon, 
  Send as SendIcon,
  ContactSupport as HelpIcon
} from '@mui/icons-material';
import notification from '../utils/notification';
import { submitToWeb3Forms } from '../services/web3formsService';

const FAQS = [
  {
    q: 'How do I place a bulk B2B or OEM component order?',
    a: 'You can upload your bill of materials (BOM) on our Quotations page, or submit a request directly via our contact form. Our procurement team will generate formal volume pricing within 24 business hours.'
  },
  {
    q: 'Are all electronic components factory-certified and traceable?',
    a: 'Yes. Every component shipped by KDS Electronics includes manufacturer lot traceability certificates and anti-counterfeit protection adhering to ISO 9001:2015 standards.'
  },
  {
    q: 'What are your cut-off times for same-day dispatch?',
    a: 'In-stock orders confirmed before 17:00 IST Monday through Friday ship out the same day via priority courier partners.'
  },
  {
    q: 'Can I request product samples before placing a large production order?',
    a: 'Absolutely! Contact our sales team with your project requirements and component part numbers to request sample kits for prototyping.'
  }
];

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      notification.error('Please fill in all required fields (Name, Email, and Message).');
      return;
    }

    if (!isValidEmail(formData.email.trim())) {
      notification.error('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setSubmitted(false);

    const success = await submitToWeb3Forms({
      subject: formData.subject.trim() || `Customer Contact Inquiry - ${formData.name.trim()}`,
      fromName: formData.name.trim(),
      formData: {
        'Full Name': formData.name.trim(),
        'Email Address': formData.email.trim(),
        'Phone Number': formData.phone.trim() || 'N/A',
        'Inquiry Subject': formData.subject.trim() || 'General Inquiry',
        'Message Details': formData.message.trim()
      }
    });

    setSubmitting(false);

    if (success) {
      setSubmitted(true);
      notification.success('Thank you! Your enquiry has been dispatched to our sales team.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } else {
      setErrorMessage('Failed to send message. Please try again later or email Prakash@kdselectronics.com directly.');
      notification.error('Submission failed. Please check your internet connection and try again.');
    }
  };

  return (
    <Box sx={{ pb: 8, bgcolor: 'background.default' }}>
      
      {/* 1. HERO BANNER */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: '#ffffff',
          py: { xs: 6, md: 8 },
          mb: 8,
          background: 'linear-gradient(135deg, #111B2C 0%, #243A5E 100%)',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Chip label="GET IN TOUCH" size="small" sx={{ bgcolor: 'secondary.main', color: 'primary.dark', fontWeight: 900, mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>
            Contact Customer Support & Sales
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', maxWidth: 640, mx: 'auto' }}>
            Have questions about part specifications, stock availability, or corporate pricing? Our engineering support team is here to assist you.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        
        {/* 2. CONTACT CARDS & FORM */}
        <Grid container spacing={5} sx={{ mb: 10 }}>
          
          {/* Left Side: Contact Information Cards */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mb: 3 }}>
              Contact Information
            </Typography>

            <Stack spacing={3}>
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2ECF5', display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#EDF4FA', color: 'primary.main' }}>
                  <PhoneIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Phone & Sales Hotline</Typography>
                  <Typography variant="body2" color="text.secondary">+91 22 8900 4321</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">Mon - Sat: 9:00 - 19:00 IST</Typography>
                </Box>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2ECF5', display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#EDF4FA', color: 'primary.main' }}>
                  <EmailIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Email Inquiries</Typography>
                  <Typography variant="body2" color="text.secondary">sales@kdselectronics.com</Typography>
                  <Typography variant="body2" color="text.secondary">support@kdselectronics.com</Typography>
                </Box>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2ECF5', display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#EDF4FA', color: 'primary.main' }}>
                  <LocationIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Corporate Headquarters</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Industrial Electronics Hub, Plot 42, MIDC Andheri East, Mumbai, MH, 400093
                  </Typography>
                </Box>
              </Paper>
            </Stack>
          </Grid>

          {/* Right Side: Contact Form */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: { xs: 4, md: 5 }, borderRadius: 3, border: '1px solid #E2ECF5', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mb: 1 }}>
                Send Us a Message
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Fill out the form below and an engineer will respond within 2 to 4 business hours.
              </Typography>

              {submitted && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                  Your message has been received successfully! Our team will contact you shortly.
                </Alert>
              )}

              {errorMessage && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {errorMessage}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Full Name *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={submitting}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Email Address *"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={submitting}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={submitting}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Inquiry Subject"
                      placeholder="e.g. Stock availability, BOM quote"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      disabled={submitting}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Message Details *"
                      placeholder="Specify part numbers, required quantities, or technical questions..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      disabled={submitting}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      sx={{ px: 4, py: 1.5, fontWeight: 900, borderRadius: 2 }}
                    >
                      {submitting ? 'Sending Message...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* 3. FREQUENTLY ASKED QUESTIONS */}
        <Box id="faq" sx={{ mb: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="caption" sx={{ fontWeight: 900, color: 'secondary.dark', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              BUYER & ENGINEER SUPPORT
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main' }}>
              Frequently Asked Questions
            </Typography>
          </Box>

          <Box sx={{ maxWidth: 840, mx: 'auto' }}>
            {FAQS.map((faq, index) => (
              <Accordion key={index} sx={{ mb: 1.5, borderRadius: '8px !important', border: '1px solid #E2ECF5', boxShadow: 'none', '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

      </Container>
    </Box>
  );
};

export default Contact;
