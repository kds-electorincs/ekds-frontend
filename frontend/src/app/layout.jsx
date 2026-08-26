import '../index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClientProviders from './ClientProviders';

export const metadata = {
  title: 'B2B Electronics Marketplace',
  description: 'Enterprise-grade electronics distribution platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        <ClientProviders>
          {children}
        </ClientProviders>
        <ToastContainer position="bottom-right" theme="light" />
      </body>
    </html>
  );
}
