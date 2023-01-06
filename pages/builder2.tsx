import { ChangeEvent, useEffect, useState } from 'react';
import styles from '../styles/Builder.module.css';

type Text = {
  content: string,
  color: string,
  fontWeight: number
};

export default function Builder() {
  const [rows, setRows] = useState<Text[][]>([]);
  const [editingText, setEditingText] = useState(-1);
  const [editingRow, setEditingRow] = useState(-1);
  const [text, setText] = useState("");
  const [color, setColor] = useState("#FFFFFF");
  const [fontWeight, setFontWeight] = useState(300);

  // handle
  const addRow = () => setRows(old => [...old, []]);

  const toggleRow = (index: number) => {
    if (index >= rows.length || index < 0)
      return;

    setEditingRow(index);
    if (editingText === index)
      manualStateFetch(editingRow, editingText);
    else 
      setEditingText(old => rows[index].length > 0 ? 0 : (old !== -1 ? -1 : old));
  };

  const addText = () => {
    if (editingRow === -1)
      return;
    
    setRows(old => {
      var updated = [...old];
      updated[editingRow] = [...updated[editingRow], { content: "", color: "#FFFFFF", fontWeight: 300 }];
      return updated;
    });
  };

  const editNewText = (e: ChangeEvent<HTMLSelectElement>) =>
    toggleEditingText(Number.parseInt(e.target.value));
  
  const toggleEditingText = (index: number) => {
    if (editingRow === -1)
      return;
    
    var texts = rows[editingRow];
    if (index >= texts.length || index < 0)
      return;

    setEditingText(index);
  };

  const saveEditingText = () => {
    if (editingRow === -1 || editingText === -1)
      return;
    
    setRows(old => {
      const updated = [...old];
      updated[editingRow][editingText] = { content: text, color, fontWeight };
      return updated;
    });
  };

  const manualStateFetch = (rowIndex: number, textIndex: number) => {
    if (rowIndex === -1 || textIndex === -1)
      return;
    
    const obj = rows[rowIndex][textIndex];
    console.log(obj);
    setText(obj.content || "");
    setColor(obj.color);
    setFontWeight(obj.fontWeight);
  };

  useEffect(() => {
    if (editingRow === -1 || editingText !== -1)
      return;

    // update text if single
    toggleEditingText(0);
  }, [rows]);

  useEffect(() => {
    if (editingText === -1) {
      setText("");
      setColor("#FFFFFF");
      setFontWeight(300);
      return;
    }
    manualStateFetch(editingRow, editingText);
  }, [editingText]);

  return (
    <div className={styles.container}>
      <div className={styles.builder}>
        <div className={styles.header}>
          <p>Build your own <span>FACEIT</span> overlay</p>
          <p>Copy Build</p>
        </div>
        <div className={styles.content}>
          <div className={styles.rows}>
            <div className={styles['rows-header']}>
              <p>Rows</p>
              <button className={styles['primary-btn']} onClick={addRow}>Add Row</button>
            </div>
            {/* LIMIT THE CONTENT HEIGHT AND ENABLE SCROLLING */}
            <div className={styles['rows-content']}>
              {rows.map((_, index) => (
                // ON CLICK
                <div key={`row-${index}`} className={`${styles['rows-content-row']} ${editingRow === index ? styles['active-row'] : ''}`} onClick={() => toggleRow(index)}>
                  <p>Row {index+1}</p>
                </div>
              ))}
            </div>
          </div>
          <div className={styles['vertical-divider']}></div>
          <div className={styles['row-data']}>
            {editingRow >= 0 && (
              <>
                <div className={styles['row-data-header']}>
                  <select name='rows' id='row-select' value={editingText} onChange={editNewText}>
                    {rows[editingRow].map((_, index) => (
                      <option key={`row-text-${index}`} value={index}>Text {index+1}</option>
                    ))}
                  </select>
                  <button className={styles['primary-btn']} onClick={addText}>Add Text</button>
                </div>
                <div className={styles['row-data-content']}>
                  {editingText !== -1 && (
                    <>
                      <input placeholder='Set a text here' value={text} onChange={e => setText(e.target.value)}></input>
                      <div>
                        <div>
                          <div>
                            <div style={{ backgroundColor: color }}></div>
                            <input placeholder='#FFFFFF' value={color} onChange={e => setColor(e.target.value)}></input> 
                          </div>
                          <select name='fontweights' id='fontweights' value={fontWeight} onChange={e => setFontWeight(Number.parseInt(e.target.value))}>
                            <option value={300}>Light</option>
                            <option value={400}>Regular</option>
                            <option value={500}>Bold</option>
                          </select>
                        </div>
                        <button className={`${styles['primary-btn']} ${styles['save-btn']}`} onClick={saveEditingText}>Save</button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}