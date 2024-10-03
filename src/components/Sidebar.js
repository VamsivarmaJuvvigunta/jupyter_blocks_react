import React from 'react';
import { useDrag } from 'react-dnd';
import './Sidebar.css';

const SidebarItem = ({ id, type, text, addBlock }) => {
  const [, drag] = useDrag({
    type: 'BLOCK',
    item: { id, type },
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        addBlock(item.type); 
      }
    },
  });

  return (
    <li ref={drag} className="sidebar-item">
      {text}
    </li>
  );
};

const Sidebar = ({ components = [], searchTerm = '', handleSearch, addBlock }) => {
  
  
  const codeBlocks = [
    { id: 1001, type: 'code', text: 'JavaScript Code Block' },
    { id: 1002, type: 'code', text: 'Python Code Block' },
    { id: 1003, type: 'html', text: 'HTML Block' },
    { id: 1004, type: 'css', text: 'CSS Block' },
  ];

  
  const safeSearchTerm = searchTerm.toLowerCase ? searchTerm.toLowerCase() : '';

  
  const filteredItems = [
    ...components.filter(component =>
      component.type && component.type.toLowerCase().includes(safeSearchTerm)
    ),
    ...codeBlocks.filter(block =>
      block.text && block.text.toLowerCase().includes(safeSearchTerm)
    ),
  ];

  return (
    <aside className="sidebar">
      <h2>Saved Components</h2>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
        className="sidebar-search"
      />
      <ul className="sidebar-list">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <SidebarItem
              key={item.id}
              id={item.id}
              type={item.type}
              text={item.text || item.type} 
              addBlock={addBlock} 
            />
          ))
        ) : (
          <li className="no-results">No matching components found</li>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
