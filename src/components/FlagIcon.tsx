import React from 'react';

// Maps 3-letter FIFA codes or team IDs to lowercase ISO country codes for FlagCDN
const TEAM_ISO_MAP: Record<string, string> = {
  t1: 'qa', // Qatar
  t2: 'ec', // Ecuador
  t3: 'sn', // Senegal
  t4: 'nl', // Netherlands
  t5: 'gb-eng', // England
  t6: 'ir', // Iran
  t7: 'us', // USA
  t8: 'gb-wls', // Wales
  t9: 'ar', // Argentina
  t10: 'sa', // Saudi Arabia
  t11: 'mx', // Mexico
  t12: 'pl', // Poland
  t13: 'fr', // France
  t14: 'au', // Australia
  t15: 'dk', // Denmark
  t16: 'tn', // Tunisia
  t17: 'es', // Spain
  t18: 'cr', // Costa Rica
  t19: 'de', // Germany
  t20: 'jp', // Japan
  t21: 'be', // Belgium
  t22: 'ca', // Canada
  t23: 'ma', // Morocco
  t24: 'hr', // Croatia
  t25: 'br', // Brazil
  t26: 'rs', // Serbia
  t27: 'ch', // Switzerland
  t28: 'cm', // Cameroon
  t29: 'pt', // Portugal
  t30: 'gh', // Ghana
  t31: 'uy', // Uruguay
  t32: 'kr', // South Korea
  // Fallbacks by shortCode
  QAT: 'qa',
  ECU: 'ec',
  SEN: 'sn',
  NED: 'nl',
  ENG: 'gb-eng',
  IRN: 'ir',
  USA: 'us',
  WAL: 'gb-wls',
  ARG: 'ar',
  KSA: 'sa',
  MEX: 'mx',
  POL: 'pl',
  FRA: 'fr',
  AUS: 'au',
  DEN: 'dk',
  TUN: 'tn',
  ESP: 'es',
  CRC: 'cr',
  GER: 'de',
  JPN: 'jp',
  BEL: 'be',
  CAN: 'ca',
  MAR: 'ma',
  CRO: 'hr',
  BRA: 'br',
  SRB: 'rs',
  SUI: 'ch',
  CMR: 'cm',
  POR: 'pt',
  GHA: 'gh',
  URU: 'uy',
  KOR: 'kr'
};

interface FlagIconProps {
  teamIdOrCode: string | null | undefined;
  className?: string; // custom classes (e.g. size, shadow)
  shadow?: boolean;
}

export default function FlagIcon({ teamIdOrCode, className = 'h-6 w-8', shadow = true }: FlagIconProps) {
  if (!teamIdOrCode) {
    return <span className="inline-block">⚽</span>;
  }

  const code = TEAM_ISO_MAP[teamIdOrCode] || TEAM_ISO_MAP[teamIdOrCode.toUpperCase()] || null;

  if (!code) {
    // Return a default ball/flag if code is unknown
    return <span className="inline-block text-xl">⚽</span>;
  }

  // flagcdn.com offers high quality PNG flag assets.
  // We use the 40px width format or 80px width format depending on context.
  // England and Wales are supported dynamically by flagcdn.
  const flagUrl = `https://flagcdn.com/w80/${code}.png`;

  return (
    <img
      src={flagUrl}
      alt={teamIdOrCode}
      className={`inline-block object-cover rounded-md border border-slate-700/60 select-none ${className} ${
        shadow ? 'shadow-sm active:scale-95 transition-transform' : ''
      }`}
      loading="lazy"
      onError={(e) => {
        // Fallback to soccer ball icon if URL loading fails
        e.currentTarget.onerror = null;
        e.currentTarget.style.display = 'none';
        const parent = e.currentTarget.parentElement;
        if (parent) {
          const fallbackSpan = document.createElement('span');
          fallbackSpan.className = 'inline-block text-xl';
          fallbackSpan.innerText = '⚽';
          parent.appendChild(fallbackSpan);
        }
      }}
    />
  );
}
