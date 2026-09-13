/**
 * Web3Forms Email Submission Utility
 * Delivers customer-facing form submissions to Prakash@kdselectronics.com via Web3Forms API.
 */
import notification from '../utils/notification';

const RECIPIENT_EMAIL = 'Prakash@kdselectronics.com';
const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

/**
 * Submit form data dynamically to Web3Forms API.
 * 
 * @param {Object} options
 * @param {string} options.subject - Subject line for the email submission.
 * @param {Object} options.formData - Key-value pair object containing submitted form fields.
 * @param {string} [options.fromName] - Optional sender name identifier.
 * @returns {Promise<boolean>} True if submission succeeded, false otherwise.
 */
export const submitToWeb3Forms = async ({ subject, formData, fromName }) => {
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

  if (!accessKey || accessKey === 'your_web3forms_access_key') {
    console.warn('[Web3Forms] Access key is missing or set to placeholder in environment variables.');
  }

  const payload = {
    access_key: accessKey || '',
    subject: subject || 'Customer Form Submission - KDS Electronics',
    from_name: fromName || 'KDS Electronics Website',
    recipient: RECIPIENT_EMAIL,
    ...formData,
  };

  try {
    const response = await fetch(WEB3FORMS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return true;
    } else {
      console.error('[Web3Forms Submission Failed]:', result.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('[Web3Forms Network Error]:', error?.message || 'Network request failed');
    return false;
  }
};
