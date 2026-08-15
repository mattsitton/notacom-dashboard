import Clock from "@/components/Clock";
import { Droplets, Thermometer, ThermometerSun, Sunrise, Sunset, Moon } from "lucide-react";

async function getWeatherData() {
  // Coordinates for Lacy Lakeview, Texas
  const lat = 31.63;
  const lon = -97.10;
  
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,cloud_cover,wet_bulb_temperature_2m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FChicago`,
    { next: { revalidate: 300 } } // Refreshes data every 5 minutes
  );
  
  if (!res.ok) throw new Error("Failed to fetch weather data");
  return res.json();
}

export default async function Home() {
  const weather = await getWeatherData();
  const current = weather.current;
  const daily = weather.daily;

  // Process today's solar data
  const todaySunrise = new Date(daily.sunrise[0]);
  const todaySunset = new Date(daily.sunset[0]);
  
  // Approximate last light (Civil twilight ends ~30 mins after sunset)
  const lastLight = new Date(todaySunset.getTime() + 30 * 60000);

  const formatTime = (date: Date) => date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Dashboard</h1>
      
      {/* Top Row: Time and Current Environment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Clock />
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg flex flex-col justify-center">
          <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-4">Lacy Lakeview, TX - Live Metrics</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Thermometer className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-zinc-100">{Math.round(current.temperature_2m)}°F</p>
                <p className="text-xs text-zinc-500">Feels like {Math.round(current.apparent_temperature)}°F</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Droplets className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-zinc-100">{Math.round(current.wet_bulb_temperature_2m)}°F</p>
                <p className="text-xs text-zinc-500">Wet-Bulb Temp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solar Events */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Sunrise", time: formatTime(todaySunrise), icon: Sunrise, color: "text-amber-400" },
          { label: "Sunset", time: formatTime(todaySunset), icon: Sunset, color: "text-orange-400" },
          { label: "Last Light", time: formatTime(lastLight), icon: Moon, color: "text-indigo-400" },
        ].map((event, i) => {
          const Icon = event.icon;
          return (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex items-center gap-4">
              <Icon className={`w-8 h-8 ${event.color}`} />
              <div>
                <p className="text-zinc-400 text-sm font-medium uppercase">{event.label}</p>
                <p className="text-xl font-bold text-zinc-100">{event.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 7-Day Forecast */}
      <h2 className="text-xl font-semibold text-zinc-100 mt-8 mb-4">7-Day Forecast</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        {daily.time.map((dateStr: string, i: number) => {
          const date = new Date(dateStr + "T00:00:00");
          const dayName = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
          
          return (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg flex flex-col items-center text-center hover:bg-zinc-800/50 transition-colors">
              <p className="text-zinc-100 font-medium mb-3">{dayName}</p>
              
              <div className="flex items-center gap-1 mb-1">
                <ThermometerSun className="w-4 h-4 text-orange-400" />
                <span className="text-zinc-100 font-bold">{Math.round(daily.temperature_2m_max[i])}°</span>
              </div>
              <div className="flex items-center gap-1 mb-4 text-sm text-zinc-500">
                <span>Low: {Math.round(daily.temperature_2m_min[i])}°</span>
              </div>
              
              <div className="w-full space-y-2 border-t border-zinc-800 pt-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1 text-blue-400"><Droplets className="w-3 h-3"/> Rain</span>
                  <span className="text-zinc-300 font-medium">{daily.precipitation_probability_max[i]}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
