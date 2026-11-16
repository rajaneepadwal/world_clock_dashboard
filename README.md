# Chronos — World Clock Dashboard

A responsive React world-clock dashboard with:
- Live analog and digital local clock
- Multiple world time zones with add/remove controls
- Selected-location time-zone detail
- 12/24-hour display switch
- Light/dark theme toggle
- Add, enable/disable and delete alarms
- Alarm sound and optional browser notifications

## Requirements
- Node.js (18 or later recommended)
- npm
- Visual Studio Code (optional)
- Google Chrome or another modern browser

## Run the project

1. Extract the ZIP file.
2. Open the `world-clock-dashboard` folder in VS Code.
3. Open the integrated terminal in that folder.
4. Install dependencies:

   ```bash
   npm install
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the local URL printed by Vite, usually `http://localhost:5173`.

## Build for production

```bash
npm run build
```

## Notes about alarms
Alarms use the computer's local time and work while the dashboard tab is open. Allow browser notifications if you want desktop notifications. Browser audio may require the user to interact with the page before it can play.

## Main components
- `App`: dashboard state, live updates, time-zone management and alarms
- `AnalogClock`: analog clock hands calculated from the selected time zone
- `main.jsx`: React application entry point
- `App.css`: responsive layout, theme styling and animations
