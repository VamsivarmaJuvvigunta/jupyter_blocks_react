import React, { useState } from 'react';
import './BlockEditor.css';

const BlockEditor = ({ block, onSave, onClose }) => {
  
  const [content, setContent] = useState(block.content);

  
  const handleSave = () => {
    onSave({ content });
    onClose();
  };

  return (
    <div className="block-editor">
      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
        placeholder='Edit code here...' 
      />
      <div className="editor-actions">
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default BlockEditor;
