import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const BrandLogo = ({ variant = 'default', light = false, sx = {} }) => {
  const [imgError, setImgError] = useState(false);
  const logoSrc = '/logo.svg';

  return (
    <Box
      component={RouterLink}
      to="/"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.5,
        textDecoration: 'none',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'transform 0.25s ease, filter 0.25s ease',
        '&:hover': {
          transform: 'translateY(-1px) scale(1.01)',
          filter: 'drop-shadow(0 4px 12px rgba(143, 182, 216, 0.4))'
        },
        ...sx
      }}
    >
      {!imgError ? (
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
          style={{ cursor: 'pointer', display: 'inline-flex' }}
        >
          <Box
            component="img"
            src={logoSrc}
            alt="KDS Electronics Logo"
            onError={() => setImgError(true)}
            sx={{
              height: variant === 'small' ? 36 : variant === 'large' ? 56 : 44,
              width: 'auto',
              objectFit: 'contain',
              cursor: 'pointer',
              filter: light ? 'brightness(1.1) contrast(1.1)' : 'none'
            }}
          />
        </motion.div>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              background: light ? 'linear-gradient(135deg, #ffffff 0%, #8FB6D8 100%)' : 'linear-gradient(135deg, #16243C 0%, #243A5E 100%)',
              color: light ? '#16243C' : '#ffffff',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              fontWeight: 900,
              fontSize: variant === 'small' ? '1rem' : '1.25rem',
              letterSpacing: '-0.03em',
              boxShadow: light ? '0 4px 14px rgba(255,255,255,0.2)' : '0 4px 14px rgba(36, 58, 94, 0.3)',
              border: light ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(143, 182, 216, 0.3)'
            }}
          >
            KDS
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: light ? '#ffffff' : '#16243C',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                fontSize: variant === 'small' ? '1.05rem' : variant === 'large' ? '1.5rem' : '1.25rem'
              }}
            >
              KDS{' '}
              <Box 
                component="span" 
                sx={{ 
                  background: light 
                    ? 'linear-gradient(135deg, #8FB6D8 0%, #ffffff 100%)' 
                    : 'linear-gradient(135deg, #243A5E 0%, #5F86A6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900
                }}
              >
                ELECTRONICS
              </Box>
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.625rem',
                color: light ? 'rgba(255,255,255,0.75)' : '#5F86A6',
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                mt: 0.3
              }}
            >
              INDUSTRIAL STORE
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BrandLogo;
