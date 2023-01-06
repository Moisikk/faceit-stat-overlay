import Head from 'next/head'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css'

type FaceitResponse = {
  elo: number,
  lvl: number,
  todayEloDiff: string,
  latestMatchesTrend: {
    score: {
      loses: number,
      wins: number
    }
  }
};

type Config = {
  user: string,
  timezone: string | undefined,
  tint: number,
  html: string
}

export default function Home() {
  const router = useRouter();
  const [config, setConfig] = useState<Config>({
    user: "",
    timezone: undefined,
    tint: 0.0,
    html: '<p><span style="font-family: Arial; color: rgb(0, 0, 0); font-size: 20px;"><span style="color: rgb(255, 94, 0);">{elo}</span> <span style="color: rgb(140, 140, 140);">(</span> <span style="color: rgb(255, 228, 0);">Level {level}</span> </span><span style="color: rgb(140, 140, 140); font-size: 20px; font-family: Arial;">)</span><br></p><p><span style="font-size: 20px; font-family: Arial;">{elo_today_formatted||<span style="color: rgb(140, 140, 140);">+-0 today||</span><span style="color: rgb(171, 242, 0);">{elo_today}</span><span style="color: rgb(140, 140, 140);">&nbsp;today||</span><span style="color: rgb(241, 95, 95);">{elo_today}</span><span style="color: rgb(140, 140, 140);">&nbsp;today</span>}&nbsp;<span style="color: rgb(53, 53, 53);">|&nbsp;</span><span style="color: rgb(255, 94, 0);">W: {wins_today}, L: {losses_today}</span></span></p>'
  });
  const [error, setError] = useState<string | undefined>();
  const [result, setResult] = useState<FaceitResponse | undefined>();

  const ReadUser = async () => {
    const { user, timezone } = config;
    const response = await fetch(`https://api.satont.dev/faceit?nick=${user}${timezone ? `&timezone=${timezone}` : ""}`);
    
    if (!response.ok)
      return undefined;

    const data = await response.json();
    return data as FaceitResponse;
  };

  const Handle = async () => {
    try {
      if (config.user.length == 0) {
        setError("Waiting for user passage...");
        return;
      }

      const read = await ReadUser();
      if (!read)
        return setError("Missing or invalid username.");

      setError(undefined);
      setResult(read);
    } catch {
      setError("Internal error. Check bindings.")
    }
  };

  const getProcessedHtml = () => {
    const raw = config.html;
    const today = !result ? '0' : result.todayEloDiff;
    return !result ? raw : raw
      .replaceAll("{elo}", result.elo.toString())
      .replaceAll("{level}", result.lvl.toString())
      .replaceAll("{wins_today}", result.latestMatchesTrend.score.wins.toString())
      .replaceAll("{losses_today}", result.latestMatchesTrend.score.loses.toString())
      .replaceAll(/\{elo_today_formatted\|\|(.+)\|\|(.+)\|\|(.+)\}/gm, today === '0' ? '$1' : (today.charAt(0) === '-' ? '$2' : '$3'))
      .replaceAll("{elo_today}", today.toString());
  };

  const isTinted = () => config.tint > 0.0 && config.tint <= 1.0;

  useEffect(
    () => {
      const user = router.query["user"];
      if (typeof user !== 'string')
        return;

      if (config.user.length != 0)
        return;

      const timezone = router.query["tz"];
      const rawTint = router.query["tint"];

      let tint = 0.0;
      if (typeof rawTint === 'string') {
        try { tint = Number.parseFloat(rawTint); }
        catch { }

        if (tint > 1.0 || tint < 0.0)
          tint = 0.0;
      }

      const content = router.query["content"];
      setConfig(old => ({
        user,
        timezone: typeof timezone === 'string' ? timezone : undefined,
        tint,
        html: typeof content === 'string' ? decodeURIComponent(content) : old.html
      }));
    }, 
    [router.query]
  );

  useEffect(
    () => {
      Handle();
      const int = setInterval(Handle, 30_000);
      return () => clearInterval(int);
    }, 
    [config]
  );

  return (
    <>
      <Head>
        <title>Faceit Base Overlay</title>
        <meta name="description" content="a simple faceit.com overlay" />
      </Head>
      {error 
        ? <p>{error}</p> 
        : <div 
            className={`${styles.container} ${isTinted() ? styles.tinted : ''}`}
            style={{ backgroundColor: `rgba(0, 0, 0, ${isTinted() ? config.tint : 0.0})` }}
            dangerouslySetInnerHTML={{ __html: getProcessedHtml() }}
          />
      }
    </>
  )
}
