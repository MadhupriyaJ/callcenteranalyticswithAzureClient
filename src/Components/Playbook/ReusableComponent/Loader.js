import React from "react";
import './Loader.css';


const Loader = () =>{

    return <div className="fixed z-10 inset-0 ml-36 bg-opacity-40 flex items-center justify-end">
            <div className="loader"></div>
        </div>
}

export default Loader;