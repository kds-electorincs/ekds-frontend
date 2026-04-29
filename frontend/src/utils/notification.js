import { toast } from 'react-toastify';

const notification = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message || 'Something went wrong'),
  info: (message) => toast.info(message),
  warning: (message) => toast.warning(message),
};

export default notification;
