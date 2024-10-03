import React, { useRef, useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import "./Block.css";

const languageOptions = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "r", label: "R" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "java", label: "Java" },  
];


const Block = ({
  id,
  type,
  content,
  x,
  y,
  moveBlock,
  deleteBlock,
  onSelect,
  onContentChange,
  onExecute,
  language,
  onLanguageChange,
  output,
  plot,
}) => {
  const [editing, setEditing] = useState(false);
  const blockRef = useRef(null);

  const [, drag] = useDrag({
    type: "BLOCK",
    item: { id, x, y },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        moveBlock(item.id, dropResult.x, dropResult.y);
      }
    },
  });

  const [, drop] = useDrop({
    accept: "BLOCK",
    hover: (item, monitor) => {
      const offset = monitor.getDifferenceFromInitialOffset();
      const xOffset = Math.round(item.x + offset.x);
      const yOffset = Math.round(item.y + offset.y);
      moveBlock(item.id, xOffset, yOffset);
    },
  });

  useEffect(() => {
    if (blockRef.current) {
      blockRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  }, [x, y]);

  const handleContentChange = (e) => {
    onContentChange(id, e.target.value);
  };

  const handleExecute = () => {
    onExecute(id);
  };

  const handleDelete = () => {
    deleteBlock(id);
  };

  const toggleEditing = () => {
    setEditing(!editing);
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className="block"
      style={{ left: x, top: y }}
      onClick={onSelect}
    >
      <div className="block-header">
        <span className="block-type">{type} Block</span>
        <button onClick={handleDelete} className="delete-button">
          &times;
        </button>
      </div>
      {editing ? (
        <textarea
          className="block-content"
          value={content}
          onChange={handleContentChange}
          onBlur={toggleEditing} 
          autoFocus
        />
      ) : (
        <div className="block-content" onClick={toggleEditing}>
          {content || "Click to edit"}
        </div>
      )}
      <div className="block-actions">
        <select
          value={language}
          onChange={(e) => onLanguageChange(id, e.target.value)}
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button onClick={handleExecute}>Execute</button>
      </div>
      <div className="block-output">
        <strong>Output:</strong>
        {/* Handling output rendering */}
        <pre>
          {typeof output === 'object' ? (
            JSON.stringify(output, null, 2) 
          ) : (
            output 
          )}
        </pre>
        {plot && <img src={`data:image/png;base64,${plot}`} alt="Plot" />}
      </div>
    </div>
  );
};

export default Block;
