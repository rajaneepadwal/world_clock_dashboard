import React, { useState, useEffect, useRef, useMemo } from "react";const ZONES = [
  { city: "New York", country: "USA", zone: "America/New_York", flag: "🇺🇸" },
  { city: "London", country: "UK", zone: "Europe/London", flag: "🇬🇧" },
  { city: "Tokyo", country: "Japan", zone: "Asia/Tokyo", flag: "🇯🇵" },
  { city: "Sydney", country: "Australia", zone: "Australia/Sydney", flag: "🇦🇺" },
  { city: "Dubai", country: "UAE", zone: "Asia/Dubai", flag: "🇦🇪" },
  { city: "Singapore", country: "Singapore", zone: "Asia/Singapore", flag: "🇸🇬" },
  { city: "Paris", country: "France", zone: "Europe/Paris", flag: "🇫🇷" },
  { city: "Los Angeles", country: "USA", zone: "America/Los_Angeles", flag: "🇺🇸" },
  { city: "Kolkata", country: "India", zone: "Asia/Kolkata", flag: "🇮🇳" }
];

const pad = (n) => String(n).padStart(2, "0");

function timeParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  return Object.fromEntries(parts.map((p) => [p.type, p.value]));
}

function formatTime(date, timeZone, use24) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !use24
  }).format(date);
}

function formatDate(date, timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone, weekday: "long", day: "numeric", month: "long", year: "numeric"
  }).format(date);
}

function getOffset(date, timeZone) {
  const parts = timeParts(date, timeZone);
  const utcDate = new Date(Date.UTC(
    date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
    Number(parts.hour), Number(parts.minute), Number(parts.second)
  ));
  const minutes = Math.round((utcDate.getTime() - date.getTime()) / 60000);
  const sign = minutes >= 0 ? "+" : "−";
  return `UTC${sign}${pad(Math.floor(Math.abs(minutes) / 60))}:${pad(Math.abs(minutes) % 60)}`;
}

function AnalogClock({ date, timeZone }) {
  const p = timeParts(date, timeZone);
  const hour = Number(p.hour) % 12;
  const minute = Number(p.minute);
  const second = Number(p.second);
  const hourDeg = (hour + minute / 60) * 30;
  const minuteDeg = (minute + second / 60) * 6;
  const secondDeg = second * 6;

  return (
    <div className="analog-clock" aria-label={`Analog clock showing ${formatTime(date, timeZone, true)}`}>
      {Array.from({ length: 12 }, (_, i) => (
        <span className="clock-number" key={i} style={{ transform: `rotate(${i * 30}deg) translateY(-91px) rotate(${-i * 30}deg)` }}>
          {i === 0 ? "12" : i}
        </span>
      ))}
      <div className="hand hour-hand" style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }} />
      <div className="hand minute-hand" style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }} />
      <div className="hand second-hand" style={{ transform: `translateX(-50%) rotate(${secondDeg}deg)` }} />
      <div className="clock-pin" />
    </div>
  );
}

function App() {
  const [now, setNow] = useState(() => new Date());
  const [use24, setUse24] = useState(true);
  const [dark, setDark] = useState(true);
  const [selectedZone, setSelectedZone] = useState("Asia/Kolkata");
  const [zones, setZones] = useState(["America/New_York", "Europe/London", "Asia/Tokyo", "Australia/Sydney"]);
  const [zoneToAdd, setZoneToAdd] = useState("Asia/Dubai");
  const [alarms, setAlarms] = useState([]);
  const [alarmTime, setAlarmTime] = useState("07:00");
  const [alarmLabel, setAlarmLabel] = useState("");
  const [notice, setNotice] = useState("");
  const firedRef = useRef(new Set());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const local = timeParts(now, Intl.DateTimeFormat().resolvedOptions().timeZone);
    const current = `${local.hour}:${local.minute}`;
    alarms.forEach((alarm) => {
      const key = `${alarm.id}-${now.toDateString()}-${current}`;
      if (alarm.enabled && alarm.time === current && !firedRef.current.has(key)) {
        firedRef.current.add(key);
        setNotice(`Alarm: ${alarm.label || "Reminder"} (${alarm.time})`);
        playBeep();
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Chronos Alarm", { body: alarm.label || "Your alarm is ringing." });
        }
      }
    });
  }, [now, alarms]);

  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localCity = useMemo(() => ZONES.find(z => z.zone === localZone), [localZone]);
  const selectedCity = ZONES.find(z => z.zone === selectedZone) || ZONES[8];

  function addZone() {
    if (!zones.includes(zoneToAdd)) setZones([...zones, zoneToAdd]);
  }

  function removeZone(zone) {
    setZones(zones.filter(z => z !== zone));
  }

  function addAlarm(e) {
    e.preventDefault();
    setAlarms([...alarms, { id: Date.now(), time: alarmTime, label: alarmLabel.trim(), enabled: true }]);
    setAlarmLabel("");
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  function toggleAlarm(id) {
    setAlarms(alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  }

  function deleteAlarm(id) {
    setAlarms(alarms.filter(a => a.id !== id));
  }

  const availableZones = ZONES.filter(z => !zones.includes(z.zone));

  return (
    <main className={dark ? "app dark" : "app light"}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="shell">
        <header className="topbar">
          <a className="brand" href="#" aria-label="Chronos home">
            <span className="brand-mark">◷</span>
            <span>CHRONOS<span className="brand-dot">.</span></span>
          </a>
          <div className="top-actions">
            <span className="live-indicator"><i /> LIVE SYSTEM</span>
            <button className="icon-button" onClick={() => setDark(!dark)} aria-label="Toggle theme">
              {dark ? "☼" : "☾"}
            </button>
          </div>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">TIME • EVERYWHERE</p>
            <p className="welcome-copy">A clear view of time across the places that matter to you.</p>
          </div>
          <div className="date-chip">
            <span className="date-icon">▦</span>
            <div><small>TODAY</small><strong>{new Intl.DateTimeFormat("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(now)}</strong></div>
          </div>
        </section>

        <section className="main-grid">
          <article className="panel hero-clock">
            <div className="panel-heading">
              <div><p className="eyebrow">YOUR LOCAL TIME</p><h2>{localCity ? `${localCity.flag} ${localCity.city}` : "Local Time"}</h2></div>
              <span className="live-pill"><i /> LIVE</span>
            </div>
            <div className="clock-stage">
              <AnalogClock date={now} timeZone={localZone} />
            </div>
            <div className="digital-time">{formatTime(now, localZone, use24)}</div>
            <div className="clock-subline">{formatDate(now, localZone)}</div>
            <div className="clock-footer">
              <span>{localZone.replaceAll("_", " ")}</span>
              <span>{getOffset(now, localZone)}</span>
              <button className="text-button" onClick={() => setUse24(!use24)}>{use24 ? "24-HOUR" : "12-HOUR"} ↗</button>
            </div>
          </article>

          <article className="panel world-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">GLOBAL OVERVIEW</p><h2>World clocks</h2></div>
              <span className="count-badge">{zones.length} CITIES</span>
            </div>
            <div className="zone-list">
              {zones.map(zone => {
                const city = ZONES.find(z => z.zone === zone);
                if (!city) return null;
                return (
                  <div className={`zone-row ${selectedZone === zone ? "selected" : ""}`} key={zone}>
                    <button className="zone-main" onClick={() => setSelectedZone(zone)}>
                      <span className="flag">{city.flag}</span>
                      <span className="zone-name"><strong>{city.city}</strong><small>{city.country} · {getOffset(now, zone)}</small></span>
                    </button>
                    <span className="zone-time">{formatTime(now, zone, use24)}</span>
                    <button className="remove-zone" onClick={() => removeZone(zone)} aria-label={`Remove ${city.city}`}>×</button>
                  </div>
                );
              })}
            </div>
            <div className="add-zone">
              <select value={zoneToAdd} onChange={e => setZoneToAdd(e.target.value)} aria-label="Choose a time zone">
                {availableZones.length === 0 && <option value="">All cities added</option>}
                {availableZones.map(z => <option value={z.zone} key={z.zone}>{z.city}, {z.country}</option>)}
              </select>
              <button onClick={addZone} disabled={!availableZones.length}>+ Add city</button>
            </div>
          </article>
        </section>

        <section className="detail-grid">
          <article className="panel selected-panel">
            <div className="panel-heading"><div><p className="eyebrow">TIME ZONE DETAIL</p><h2>Selected location</h2></div><span className="detail-globe">◎</span></div>
            <div className="selected-location">
              <span className="selected-flag">{selectedCity.flag}</span>
              <div><h3>{selectedCity.city}</h3><p>{selectedCity.country} · {selectedCity.zone}</p></div>
            </div>
            <div className="selected-time">{formatTime(now, selectedZone, use24)}</div>
            <div className="selected-bottom"><span>{formatDate(now, selectedZone)}</span><strong>{getOffset(now, selectedZone)}</strong></div>
          </article>

          <article className="panel alarm-panel">
            <div className="panel-heading"><div><p className="eyebrow">STAY ON SCHEDULE</p><h2>Alarms & reminders</h2></div><span className="alarm-icon">◷</span></div>
            <form className="alarm-form" onSubmit={addAlarm}>
              <label>TIME<input type="time" value={alarmTime} onChange={e => setAlarmTime(e.target.value)} required /></label>
              <label>LABEL<input type="text" placeholder="e.g. Morning workout" value={alarmLabel} onChange={e => setAlarmLabel(e.target.value)} maxLength="32" /></label>
              <button type="submit">＋ Set alarm</button>
            </form>
            <div className="alarm-list">
              {alarms.length === 0 ? <p className="empty-state">No alarms yet. Set one to keep your day on track.</p> : alarms.map(alarm => (
                <div className="alarm-row" key={alarm.id}>
                  <div><strong>{alarm.time}</strong><small>{alarm.label || "Reminder"}</small></div>
                  <button className={`toggle ${alarm.enabled ? "on" : ""}`} onClick={() => toggleAlarm(alarm.id)} aria-label="Toggle alarm"><span /></button>
                  <button className="remove-alarm" onClick={() => deleteAlarm(alarm.id)} aria-label="Delete alarm">×</button>
                </div>
              ))}
            </div>
            <p className="alarm-note">Keep this dashboard open for alarms to trigger. Browser notifications require permission.</p>
          </article>
        </section>

        <footer className="footer">
          <span><b>CHRONOS.</b> Built for every time zone.</span>
          <span>Updates every second <i className="footer-dot" /> {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
        </footer>
      </div>

      {notice && <div className="toast" role="status"><span>◷</span><div><strong>{notice}</strong><small>Your reminder is active.</small></div><button onClick={() => setNotice("")}>×</button></div>}
    </main>
  );
}

function playBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.12, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.7);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.7);
    oscillator.onended = () => context.close();
  } catch {
    // Audio may be unavailable if the browser blocks playback.
  }
}

export default App;
