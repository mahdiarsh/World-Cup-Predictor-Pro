import React from 'react';

// Maps 3-letter FIFA codes or team IDs to lowercase ISO country codes for FlagCDN
const TEAM_ISO_MAP: Record<string, string> = {
  // Group A
  't-mex': 'mx', MEX: 'mx', mex: 'mx',
  't-rsa': 'za', RSA: 'za', rsa: 'za',
  't-kor': 'kr', KOR: 'kr', kor: 'kr',
  't-cze': 'cz', CZE: 'cz', cze: 'cz',

  // Group B
  't-can': 'ca', CAN: 'ca', can: 'ca',
  't-bih': 'ba', BIH: 'ba', bih: 'ba',
  't-qat': 'qa', QAT: 'qa', qat: 'qa',
  't-sui': 'ch', SUI: 'ch', sui: 'ch',

  // Group C
  't-bra': 'br', BRA: 'br', bra: 'br',
  't-mar': 'ma', MAR: 'ma', mar: 'ma',
  't-hai': 'ht', HAI: 'ht', hai: 'ht',
  't-sco': 'gb-sct', SCO: 'gb-sct', sco: 'gb-sct',

  // Group D
  't-usa': 'us', USA: 'us', usa: 'us',
  't-par': 'py', PAR: 'py', par: 'py',
  't-aus': 'au', AUS: 'au', aus: 'au',
  't-tur': 'tr', TUR: 'tr', tur: 'tr',

  // Group E
  't-ger': 'de', GER: 'de', ger: 'de',
  't-cuw': 'cw', CUW: 'cw', cuw: 'cw',
  't-civ': 'ci', CIV: 'ci', civ: 'ci',
  't-ecu': 'ec', ECU: 'ec', ecu: 'ec',

  // Group F
  't-ned': 'nl', NED: 'nl', ned: 'nl',
  't-jpn': 'jp', JPN: 'jp', jpn: 'jp',
  't-swe': 'se', SWE: 'se', swe: 'se',
  't-tun': 'tn', TUN: 'tn', tun: 'tn',

  // Group G
  't-bel': 'be', BEL: 'be', bel: 'be',
  't-egy': 'eg', EGY: 'eg', egy: 'eg',
  't-irn': 'ir', IRN: 'ir', irn: 'ir',
  't-nzl': 'nz', NZL: 'nz', nzl: 'nz',

  // Group H
  't-esp': 'es', ESP: 'es', esp: 'es',
  't-cpv': 'cv', CPV: 'cv', cpv: 'cv',
  't-uru': 'uy', URU: 'uy', uru: 'uy',
  't-ksa': 'sa', KSA: 'sa', ksa: 'sa',

  // Group I
  't-fra': 'fr', FRA: 'fr', fra: 'fr',
  't-sen': 'sn', SEN: 'sn', sen: 'sn',
  't-irq': 'iq', IRQ: 'iq', irq: 'iq',
  't-nor': 'no', NOR: 'no', nor: 'no',

  // Group J
  't-arg': 'ar', ARG: 'ar', arg: 'ar',
  't-alg': 'dz', ALG: 'dz', alg: 'dz',
  't-aut': 'at', AUT: 'at', aut: 'at',
  't-jor': 'jo', JOR: 'jo', jor: 'jo',

  // Group K
  't-por': 'pt', POR: 'pt', por: 'pt',
  't-cod': 'cd', COD: 'cd', cod: 'cd',
  't-uzb': 'uz', UZB: 'uz', uzb: 'uz',
  't-col': 'co', COL: 'co', col: 'co',

  // Group L
  't-eng': 'gb-eng', ENG: 'gb-eng', eng: 'gb-eng',
  't-cro': 'hr', CRO: 'hr', cro: 'hr',
  't-gha': 'gh', GHA: 'gh', gha: 'gh',
  't-pan': 'pa', PAN: 'pa', pan: 'pa'
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
