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
  tint: number
}

export default function Home() {
  const router = useRouter();
  const [config, setConfig] = useState<Config>({
    user: "",
    timezone: undefined,
    tint: 0.0
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

      setConfig({
        user, 
        timezone: typeof timezone === 'string' ? timezone : undefined,
        tint
      });
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

  const TodayComponent = () => {
    const diff = result?.todayEloDiff;
    if (!diff || diff === '0')
      return <p style={{ color: 'var(--default)' }}>+-0 idag</p>
    return <p style={{ color: `var(--${diff.charCodeAt(0) === 43 ? 'positive' : 'negative'})`}}>{diff} <span style={{ color: "var(--default)" }}>idag</span></p>;
  };

  const Base = () => {
    return (
      <>
        <div className={styles.top}>
          <p style={{ color: 'var(--eloWinsLosses)' }}>{result?.elo}</p>
          <span style={{ color: 'var(--level)' }}>
            <span style={{ color: 'var(--default)' }}> {'('} </span>
            Level {result?.lvl}
            <span style={{ color: 'var(--default)' }}> {')'}</span>
          </span>
        </div>
        <div className={styles.bottom}>
          {<TodayComponent/>}
          <span style={{ color: 'var(--todayBracket)' }}>|</span>
          <p style={{ color: 'var(--eloWinsLosses)' }}>W: {result?.latestMatchesTrend?.score?.wins}, L: {result?.latestMatchesTrend?.score?.loses}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Faceit Base Overlay</title>
        <meta name="description" content="a simple faceit.com overlay" />
      </Head>
      {error 
        ? <p>{error}</p> 
        : (
          <div className={styles.container}>
            {config.tint <= 0.0 || config.tint > 1.0 ? <Base/> : (
              <div className={styles.tinted} style={{ backgroundColor: `rgba(0, 0, 0, ${config.tint})` }}>
                {<Base/>}
              </div>
            )}
          </div>
        )
      }
    </>
  )
}
