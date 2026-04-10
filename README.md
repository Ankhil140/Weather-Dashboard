# Advanced Live Weather Dashboard

A premium, React-based web application that provides real-time and 10-day forecasts for any city across the globe. Built meticulously using Vite, React 19, and the Open-Meteo REST API, this dashboard delivers highly responsive performance draped in a beautiful glassmorphism aesthetic.

## Features

1. **Auto Geolocation API**: Pinpoints your exact location natively and displays a customized 10-day graph of your current conditions without typing.
2. **Deep Weather Metrics**: Evaluates live cloud cover percentages, calculates precipitation possibilities, and maps out bright sunshine durations.
3. **Dynamic Charting**: Fully responsive double Area Charts built in Recharts visualize exactly 5 days of historical weather bounds and 5 days of predictive limits simultaneously.
4. **Celsius / Fahrenheit Binding**: Instantly swap entire metric systems mathematically across all elements, graphs, and windspeeds.
5. **Persistent Saved Locations**: Star your favorite cities! `localStorage` binds these to your browser so they are easily accessible each time you sign in.

## Deployment (Vercel)

This responsive application handles all computations natively in the React client and uses external open-source weather APIs for logic. It is completely ready to drop into a standard Vercel environment!

1. Import this GitHub repository into your Vercel Dashboard.
2. Ensure Vercel detects `Vite` as the framework preset!
3. Vercel will build and distribute it automatically over its global Edge Network.

## Local Development

```bash
npm install
npm run dev
```
