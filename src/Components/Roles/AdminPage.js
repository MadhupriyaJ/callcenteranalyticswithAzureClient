import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {

    const [authenticated, setAuthenticated] = useState(true); 
    const navigate = useNavigate();

    const handleLogout = () => {
      
      localStorage.removeItem("authenticated");
      localStorage.removeItem("userRole");
      setAuthenticated(false);// Redirect to the login page
      navigate("/");
      };

  return (
    <div>AdminPage
    <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default AdminPage