import { useEffect, useState } from 'react';
import SunIcon from '@heroicons/react/outline/SunIcon';
import MoonIcon from '@heroicons/react/outline/MoonIcon';

const THEME = {
  DAY: 'light',
  NIGHT: 'night'
}

const DarkModeToggle = () => {

  const [mode, setMode] = useState(THEME.DAY);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  return (
    <div className="relative rounded-full flex flex-row justify-between items-center bg-base-200 cursor-pointer border-4 border-base-200">
      <div className={`absolute z-0  box-content rounded-full bg-base-content w-5 h-5 p-2 transition-all ${(mode === THEME.DAY) ? 'translate-x-0' : 'translate-x-full'}`}>.</div>
      <div className={`relative z-10 p-2 rounded-full`} onClick={() => setMode(THEME.DAY)}>
        <SunIcon
          className={`w-5 h-5 ${(mode === THEME.DAY) ? 'text-base-100' : ''}`}
        />
      </div>
      <div className={`relative z-10 p-2 rounded-full`} onClick={() => setMode(THEME.NIGHT)}>
        <MoonIcon
          className={`w-5 h-5 ${(mode === THEME.NIGHT) ? 'text-base-100' : ''}`}
        />
      </div>
    </div>
  );
}

export default DarkModeToggle;