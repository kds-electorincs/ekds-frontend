export default {
  // Pass urlPathname to the client to know where we are initially
  passToClient: ['urlPathname'],
  
  // Disable Vike's client router so React Router can own the client-side navigation
  clientRouting: false
};
