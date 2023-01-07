import React, { useRef, useState } from 'react';
import styles from '../styles/Builder.module.css';
import dynamic from "next/dynamic";
import 'suneditor/dist/css/suneditor.min.css';
import { complex } from 'suneditor-react/dist/misc/buttonList';
import Head from 'next/head';
import SunEditorCore from 'suneditor/src/lib/core';

const SunEditor = dynamic(
  () => import("suneditor-react"), 
  { ssr: false }
);

export default function Builder() {
  const editor = useRef<SunEditorCore>();
  const [content, setContent] = useState('<p><span style="font-family: Arial; color: rgb(0, 0, 0); font-size: 20px;"><span style="color: rgb(255, 94, 0);">{elo}</span> <span style="color: rgb(140, 140, 140);">(</span> <span style="color: rgb(255, 228, 0);">Level {level}</span> </span><span style="color: rgb(140, 140, 140); font-size: 20px; font-family: Arial;">)</span><br></p><p><span style="font-size: 20px; font-family: Arial;">{elo_today_formatted||<span style="color: rgb(140, 140, 140);">+-0 today||</span><span style="color: rgb(241, 95, 95);">{elo_today}</span><span style="color: rgb(140, 140, 140);">&nbsp;today||</span><span style="color: rgb(171, 242, 0);">{elo_today}</span><span style="color: rgb(140, 140, 140);">&nbsp;today</span>}&nbsp;<span style="color: rgb(53, 53, 53);">|&nbsp;</span><span style="color: rgb(255, 94, 0);">W: {wins_today}, L: {losses_today}</span></span></p>');
  const [username, setUsername] = useState("");
  const [timezone, setTimezone] = useState<string | undefined>();
  const [tint, setTint] = useState<number>(0.0);
  const [toImport, setToImport] = useState("");

  const getSunEditorInstance = (sunEditor: SunEditorCore) =>
    editor.current = sunEditor;

  const copy = () => {
    if (username.length === 0)
      return;

    const link = `https://faceitstat.vercel.app?user=${username}${timezone !== undefined ? `&tz=${timezone}` : ''}&tint=${tint}&content=${encodeURIComponent(content)}`;
    navigator.clipboard.writeText(link);
  };

  const importOld = () => {
    if (!toImport.startsWith('https://faceitstat.vercel.app') && !toImport.startsWith('http://faceitstat.vercel.app'))
      return;
    
    const matches = Array.from(toImport.matchAll(/(https||http):\/\/faceitstat\.vercel\.app\/?.*content=(.+).*/gm), m => m[2]);
    if (matches.length !== 1)
      return;

    const value = decodeURIComponent(matches[0]);
    setContent(value);
    editor.current?.setContents(value);
  };

  const ProcessedHtml = (today: string) => {
    const processed = content
      .replaceAll("{elo}", "777")
      .replaceAll("{level}", "7")
      .replaceAll("{wins_today}", "7")
      .replaceAll("{losses_today}", "7")
      .replaceAll(/\{elo_today_formatted\|\|(.+)\|\|(.+)\|\|(.+)\}/gm, today === '0' ? '$1' : (today.charAt(0) === '-' ? '$2' : '$3'))
      .replaceAll("{elo_today}", today);
    return <div dangerouslySetInnerHTML={{ __html: processed }}/>
  };
  
  return (
    <>
      <Head>
        <title>Faceit Base Overlay Builder</title>
        <meta name="description" content="The builder for FACEIT overlays." />
      </Head>
      <div className={styles.container}>
        <div className={styles.tags}>
          <div>
            <code className={styles.tag}>{`{elo} - user ELO`}</code>
            <code className={styles.tag}>{`{level} - user level`}</code>
            <code className={styles.tag}>{`{elo_today} - user's ELO difference today`}</code>
          </div>
          <code className={styles.tag}>{`{elo_today_formatted||zero||negative||positive} - ELO difference today in a formatted manner with zero, negative and positive allocations`}</code>
        </div>
        <div className={styles['import-container']}>
          <input placeholder='https://faceitstat.vercel.app?user=...' value={toImport} onChange={e => setToImport(e.target.value)}></input>
          <button onClick={importOld}>Import</button>
        </div>
        <SunEditor 
          width='50%' 
          defaultValue={content}
          onChange={c => setContent(c)} 
          setOptions={{
            buttonList: complex
          }}
          getSunEditorInstance={getSunEditorInstance}
        />
        <div className={styles.info}>
          <label>Username <span style={{ color: "red" }}>*</span>:</label>
          <input placeholder='Enter the username' value={username} onChange={e => setUsername(e.target.value)}></input>
          <label>TimeZone:</label>
          <input placeholder='Europe/Stockholm' value={timezone} onChange={e => setTimezone(e.target.value)}></input>
          <label>Tint ( {tint} ):</label>
          <input type="range" min={0.0} max={1.0} step={0.1} value={tint} onChange={e => setTint(Number.parseFloat(e.target.value))}></input>
          <button onClick={copy}>Copy Source</button>
        </div>
        <div className={styles.previews}>
          {ProcessedHtml("0")}
          {ProcessedHtml("-7")}
          {ProcessedHtml("+7")};
        </div>
      </div>
    </>
  );
}