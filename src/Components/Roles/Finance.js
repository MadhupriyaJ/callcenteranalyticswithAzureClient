import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Finance = () => {
    const [authenticated, setAuthenticated] = useState(true); 
    const navigate = useNavigate();

    const handleLogout = () => {      
      localStorage.removeItem("authenticated");
      localStorage.removeItem("userRole");
      setAuthenticated(false);// Redirect to the login page
      navigate("/");
      };
  return (
    <div>

      <div className='text-center rounded-md grid'>      
        <button className='place-self-end mr-3 w-20 h-10 bg-gray-500 uppercase transition hover:duration-150' onClick={handleLogout}>Logout</button>   
      </div>
      <div className='grid h-screen place-items-center'>
          Welcome To Finance page
      </div>
        
    </div>
  )
}

export default Finance