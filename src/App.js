import React, { useState, useCallback } from "react";
import Block from "./components/Block";
import Sidebar from "./components/Sidebar";
import Toolbar from "./components/Toolbar";
import BlockEditor from "./components/BlockEditor";
import "./App.css";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const App = () => {
  const [blocks, setBlocks] = useState([]);
  const [components, setComponents] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [executedResults, setExecutedResults] = useState({});
  const [plots, setPlots] = useState({});

  // Add a new code block
  const addBlock = useCallback(() => {
    const newBlock = {
      id: Date.now(),
      type: "code",
      x: Math.random() * 400,
      y: Math.random() * 400,
      content: "",
      language: "javascript",
      output: "",
    };
    setBlocks((prevBlocks) => [...prevBlocks, newBlock]);
    setComponents((prevComponents) => [
      ...prevComponents,
      { id: newBlock.id, type: newBlock.type },
    ]);
  }, []);

  // Update block properties
  const updateBlock = useCallback((id, updates) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  }, []);

  // Remove a block
  const removeBlock = useCallback((id) => {
    setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));
    setComponents((prevComponents) =>
      prevComponents.filter((component) => component.id !== id)
    );
    setPlots((prevPlots) => {
      const newPlots = { ...prevPlots };
      delete newPlots[id];
      return newPlots;
    });
  }, []);

  // Move a block within the canvas
  const moveBlock = useCallback(
    (id, x, y) => {
      updateBlock(id, { x, y });
    },
    [updateBlock]
  );

  // Handle content changes for a block
  const handleContentChange = (id, newContent) => {
    updateBlock(id, { content: newContent });
  };

  // Handle language changes for a block
  const handleLanguageChange = (id, newLanguage) => {
    updateBlock(id, { language: newLanguage });
  };

  // Execute a single block of code
  const handleExecute = async (id) => {
    const block = blocks.find((block) => block.id === id);
    if (block && block.type === "code") {
      try {
        const response = await fetch("http://localhost:8000/api/execute/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: block.content,
            language: block.language,
            block_id: id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error: ${errorData.detail || response.statusText}`);
        }

        const data = await response.json();
        if (data.error) {
          updateBlock(id, { output: data.error });
        } else {
          updateBlock(id, { output: data.output });
          if (data.plot) {
            setPlots((prev) => ({ ...prev, [id]: data.plot }));
          }
          setExecutedResults((prevResults) => ({
            ...prevResults,
            [id]: data.output,
          }));
        }
      } catch (error) {
        console.error("Error executing block:", error);
        updateBlock(id, { output: "Error executing code: " + error.message });
      }
    }
  };

  const handleExecuteAll = async () => {
    if (blocks.length > 0) {
      const codeBlocks = blocks.map((block) => ({
        block_id: block.id,
        code: block.content,
        language: block.language, 
      }));

      try {
        const response = await fetch("http://localhost:8000/api/execute_all/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code_blocks: codeBlocks }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error: ${errorData.detail || response.statusText}`);
        }

        const data = await response.json();
        Object.entries(data).forEach(([blockId, result]) => {
          const id = Number(blockId);
          if (result.error) {
            updateBlock(id, { output: result.error });
          } else {
            updateBlock(id, { output: result.output });
          }
        });
      } catch (error) {
        console.error("Error executing all blocks:", error);
        blocks.forEach((block) => {
          updateBlock(block.id, {
            output: "Error executing all blocks: " + error.message,
          });
        });
      }
    }
  };

  // Handle searching for components
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  
  const [{ isOver }, drop] = useDrop({
    accept: "BLOCK",
    drop: () => {
      addBlock(); 
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <header>
          <div className="logo">MyApp</div>
          <nav>
            <a href="#">Home</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
          </nav>
        </header>

        <div className="container">
          <Sidebar
            components={components}
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            addBlock={addBlock}
          />

          <main>
            <Toolbar addBlock={addBlock} />

            
              

            <div
              id="canvas"
              ref={drop}
              className={`canvas ${isOver ? "is-over" : ""}`}
            >
              {blocks.map((block) => (
                <Block
                  key={block.id}
                  id={block.id}
                  type={block.type}
                  content={block.content}
                  x={block.x}
                  y={block.y}
                  moveBlock={moveBlock}
                  deleteBlock={removeBlock}
                  onSelect={() => setSelectedBlock(block)}
                  onContentChange={handleContentChange}
                  onExecute={() => handleExecute(block.id)}
                  language={block.language}
                  onLanguageChange={handleLanguageChange}
                  output={executedResults[block.id] || block.output}
                  plot={plots[block.id]}
                />
              ))}
            </div>
          </main>

          {selectedBlock && (
            <BlockEditor
              block={selectedBlock}
              onSave={(updates) => updateBlock(selectedBlock.id, updates)}
              onClose={() => setSelectedBlock(null)}
            />
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default App;
