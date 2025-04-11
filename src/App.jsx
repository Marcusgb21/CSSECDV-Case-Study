import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

function App() {
  const { loggedInUser } = useSelector((state) => state.user);

  // If user is logged in, redirect to home page
  // Otherwise, redirect to login page
  return (
    <Navigate to={loggedInUser ? '/' : '/login'} replace />
  )
}

export default App
