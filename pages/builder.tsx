import React, { useState } from 'react';
import styles from '../styles/Builder.module.css';
import dynamic from "next/dynamic";
import 'suneditor/dist/css/suneditor.min.css';
import { complex } from 'suneditor-react/dist/misc/buttonList';
import Head from 'next/head';

const SunEditor = dynamic(
  () => import("suneditor-react"), 
  { ssr: false }
);

export default function Builder() {
  const [content, setContent] = useState('<p><span style="font-family: Arial; color: rgb(0, 0, 0); font-size: 20px;"><span style="color: rgb(255, 94, 0);">{elo}</span> <span style="color: rgb(140, 140, 140);">(</span> <span style="color: rgb(255, 228, 0);">Level {level}</span> </span><span style="color: rgb(140, 140, 140); font-size: 20px; font-family: Arial;">)</span><br></p><p><span style="font-size: 20px; font-family: Arial;">{elo_today_formatted||<span style="color: rgb(140, 140, 140);">+-0 today||</span><span style="color: rgb(171, 242, 0);">{elo_today}</span><span style="color: rgb(140, 140, 140);">&nbsp;today||</span><span style="color: rgb(241, 95, 95);">{elo_today}</span><span style="color: rgb(140, 140, 140);">&nbsp;today</span>}&nbsp;<span style="color: rgb(53, 53, 53);">|&nbsp;</span><span style="color: rgb(255, 94, 0);">W: {wins_today}, L: {losses_today}</span></span></p>');
  const [username, setUsername] = useState("");
  const [timezone, setTimezone] = useState<string | undefined>();
  const [tint, setTint] = useState<number>(0.0);

  const copy = () => {
    if (username.length === 0)
      return;

    const link = `https://faceitstat.vercel.app?user=${username}${timezone !== undefined ? `&tz=${timezone}` : ''}&tint=${tint}&content=${encodeURIComponent(content)}`;
    navigator.clipboard.writeText(link);
  };
  
  return (
    <>
      <Head>
        <title>Faceit Base Overlay Builder</title>
        <meta name="description" content="The builder for FACEIT overlays." />
      </Head>
      <div className={styles.container}>
        <div>
          <div>
            <code className={styles.tag}>{`{elo} - user ELO`}</code>
            <code className={styles.tag}>{`{level} - user level`}</code>
            <code className={styles.tag}>{`{elo_today} - user's ELO difference today`}</code>
          </div>
          <code className={styles.tag}>{`{elo_today_formatted||zero||negative||positive} - ELO difference today in a formatted manner with zero, negative and positive allocations`}</code>
        </div>
        <SunEditor 
          width='50%' 
          defaultValue={content} 
          onChange={c => setContent(c)} 
          setOptions={{
            buttonList: complex
          }}
        />
        <div>
          <label>Username <span style={{ color: "red" }}>*</span>:</label>
          <input placeholder='Enter the username' value={username} onChange={e => setUsername(e.target.value)}></input>
          <label>TimeZone:</label>
          <input placeholder='Europe/Stockholm' value={timezone} onChange={e => setTimezone(e.target.value)}></input>
          <label>Tint ( {tint} ):</label>
          <input type="range" min={0.0} max={1.0} step={0.1} value={tint} onChange={e => setTint(Number.parseFloat(e.target.value))}></input>
          <button onClick={copy}>Copy Source</button>
        </div>
      </div>
    </>
  );
}