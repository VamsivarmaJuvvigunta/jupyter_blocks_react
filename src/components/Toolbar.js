import React from "react";
import './Toolbar.css';

const Toolbar = ({ addBlock, createNewNotebook }) => {
  return (
    <div className="toolbar">
      <button onClick={() => addBlock("code")}>Add Code Block</button>
      
    </div>
  );
};

export default Toolbar;
