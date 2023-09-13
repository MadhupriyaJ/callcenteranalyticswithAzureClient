import React, { useState } from "react";
import Login from "./LOGIN/Login";
import Register from "./LOGIN/Register";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DataTables from "./Components/Tables/DataTables";
import Tables from "./Components/Tables/Tables";
import ChatRecord from "./Components/Tables/ChatRecord";
import SnowflakeHeader from "./Components/Header/SnowflakeHeader";




const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
 

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Login setAuthenticated={setAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/snowflake"
            element={
              authenticated ? (
                <SnowflakeHeader />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;








// import React, { useState } from "react";
// import Login from "./LOGIN/Login";
// import Register from "./LOGIN/Register";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import DataTables from "./Components/Tables/DataTables";
// import Tables from "./Components/Tables/Tables";
// import ChatRecord from "./Components/Tables/ChatRecord";
// import SnowflakeHeader from "./Components/Header/SnowflakeHeader";


// const App = () => {
  

//   return (
//     <div>
//       <Router>
//         <Routes>
//           <Route path="/" element={<Login />} />
//           <Route path="/register" element={<Register />} />
          
//           <Route path="/snowflake" element={<SnowflakeHeader />} />
//         </Routes>
//       </Router>
//     </div>
//   );
// };

// export default App;
