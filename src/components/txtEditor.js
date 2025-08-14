import React, { useState, useRef, useEffect } from 'react';
import '../txtEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = "Write your detailed office report here..." }) => {
  const editorRef = useRef(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const insertList = (type) => {
    executeCommand(type === 'ordered' ? 'insertOrderedList' : 'insertUnorderedList');
  };

  const formatBlock = (tag) => {
    executeCommand('formatBlock', tag);
  };

  const insertTable = () => {
    const table = `
      <table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 1</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 2</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 3</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 4</td>
        </tr>
      </table>
    `;
    executeCommand('insertHTML', table);
  };

  const insertHorizontalRule = () => {
    executeCommand('insertHorizontalRule');
  };

  const handleKeyDown = (e) => {
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      executeCommand('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  };

  const getPlainText = () => {
    if (editorRef.current) {
      return editorRef.current.innerText || editorRef.current.textContent;
    }
    return '';
  };

  const wordCount = getPlainText().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = getPlainText().length;

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className={`editor-toolbar ${!isToolbarVisible ? 'hidden' : ''}`}>
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => executeCommand('bold')}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => executeCommand('italic')}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => executeCommand('underline')}
            title="Underline"
          >
            <u>U</u>
          </button>
        </div>

        <div className="toolbar-group">
          <select
            className="toolbar-select"
            onChange={(e) => formatBlock(e.target.value)}
            defaultValue=""
          >
            <option value="">Format</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="p">Paragraph</option>
          </select>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => executeCommand('justifyLeft')}
            title="Align Left"
          >
            ≡
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => executeCommand('justifyCenter')}
            title="Align Center"
          >
            ≣
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => executeCommand('justifyRight')}
            title="Align Right"
          >
            ≢
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertList('unordered')}
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => insertList('ordered')}
            title="Numbered List"
          >
            1. List
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={insertTable}
            title="Insert Table"
          >
            ⊞ Table
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={insertHorizontalRule}
            title="Insert Line"
          >
            ― Line
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => executeCommand('undo')}
            title="Undo"
          >
            ↶
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => executeCommand('redo')}
            title="Redo"
          >
            ↷
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => setIsToolbarVisible(!isToolbarVisible)}
            title="Toggle Toolbar"
          >
            {isToolbarVisible ? '⌃' : '⌄'}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable={true}
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
        style={{ minHeight: '350px' }}
      />

      {/* Status Bar */}
      <div className="editor-status">
        <span>Words: {wordCount} | Characters: {charCount}</span>
        <span className="editor-tips">
          <strong>Tips:</strong> Use toolbar for formatting. Press Tab for indentation.
        </span>
      </div>
    </div>
  );
};

export default RichTextEditor;