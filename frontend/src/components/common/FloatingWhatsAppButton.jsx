import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import { FaWhatsapp } from 'react-icons/fa';
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '../../constants/whatsapp';

const FloatingWhatsAppButton = () => {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <Tooltip title="Chat with us on WhatsApp" placement="right" arrow>
      <Fab
        component="a"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        sx={{
          position: 'fixed',
          bottom: { xs: 20, md: 24 },
          left: { xs: 20, md: 24 },
          zIndex: 1300,
          backgroundColor: '#25D366',
          color: '#FFFFFF',
          width: { xs: 54, md: 60 },
          height: { xs: 54, md: 60 },
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.25)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            backgroundColor: '#128C7E',
            transform: 'scale(1.08)',
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.35)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        <FaWhatsapp style={{ fontSize: '32px' }} />
      </Fab>
    </Tooltip>
  );
};

export default FloatingWhatsAppButton;
