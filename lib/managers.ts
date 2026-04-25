export interface ManagerEntry {
  name: string;
  teams: Partial<Record<number, string>>;
}

export const MANAGERS: ManagerEntry[] = [
  {
    name: 'Soe',
    teams: {
      2019: 'The Champion',
      2020: 'The Champion',
      2021: 'Raphael Dias Belloli FC',
      2022: 'Harchester United (C)',
      2023: 'Harchester United',
      2024: 'Harchester United',
      2025: 'Harchester United',
    },
  },
  {
    name: 'MD',
    teams: {
      2019: 'The Honest Toun',
      2020: 'The Honest Toun',
      2021: 'FC Conte',
      2022: 'Electric City FC',
      2023: 'Electric City FC',
      2024: 'Electric City FC',
    },
  },
  {
    name: 'Tom',
    teams: {
      2019: 'Hazard Left Us',
      2020: 'Hazard Left Us',
      2021: 'Start Jack Grealish FC',
      2022: 'H',
      2023: 'H',
      2024: 'H',
      2025: 'H',
    },
  },
  {
    name: 'Jeff',
    teams: {
      2019: 'Mr Big News FC',
      2020: 'Mr Big News FC',
      2021: 'Purple Hearted FC',
      2022: 'Concert Hall FC',
      2023: 'Long Shot FC',
      2024: 'Mauritius FC',
      2025: "I'm Last FC",
    },
  },
  {
    name: 'Jon',
    teams: {
      2019: 'Freaky Styley FC',
      2020: 'Money Moves FC',
      2021: 'Chrome Dixie FC',
      2022: 'Cairo Memories FC',
      2023: 'Secrets of Saratoga FC',
      2024: 'Secrets of Saratoga FC',
      2025: 'Malibu Brad FC',
    },
  },
  {
    name: 'Tsultrim',
    teams: {
      2019: 'Every Year is Our Year FC',
      2020: 'Papal Clean Sheets',
      2021: 'Aldi Self Checkout FC',
      2022: 'How do I do that again FC',
      2023: 'How do I do that again FC',
      2024: "Definitely Not Chris' Team",
      2025: 'Papal Wood FC',
    },
  },
  {
    name: 'Fahad',
    teams: {
      2019: 'Golani Brigade',
      2020: 'Fantasy BUSTS FC',
      2021: 'Fantasy Busts',
      2022: 'Diablito',
      2023: 'Romero & Casemigos',
      2024: 'Sweet Summerville',
      2025: "Thomas Frank's Franks",
    },
  },
  {
    name: 'Admir',
    teams: {
      2019: "Frank Lampard's Haberdashery",
      2020: "Frank Lampard's Haberdashery",
      2021: 'Tommy Tuch and the Funky Bunch',
      2022: 'Daddy Koul',
      2023: 'Amortization FC',
      2024: 'Amortization FC',
    },
  },
  {
    name: 'Chris',
    teams: {
      2023: 'Future Campeones FC',
      2024: 'Total Futbol FC',
      2025: 'Total Futbol FC',
    },
  },
  {
    name: 'Will',
    teams: {
      2019: "Hammarskjöld's Hammers",
      2020: "Hammarskjöld's Hammers",
      2021: "Hammarskjöld's Hammers",
      2022: "Hammarskjöld's Håmmers",
      2023: "Hammarskjöld's Håmmers",
      2024: "Hammarskjöld's Håmmers",
      2025: "Hammarskjöld's Håmmers",
    },
  },
  {
    name: 'Ivan',
    teams: {
      2019: 'Butters FC',
      2020: 'Professor Chaos FC',
      2021: 'Traore is a fucking traitor FC',
      2022: 'No trades',
      2023: 'Trades? Idk shoot your shot',
      2024: 'Trades? Idk shoot your shot',
      2025: 'md and admir gone but not forgotten',
    },
  },
];

// Normalize curly/smart quotes to ASCII so comparison is quote-agnostic
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’‚‛′‵]/g, "'") // curly single quotes → '
    .replace(/[“”„‟″‶]/g, '"'); // curly double quotes → "
}

// year → { normalized teamName → manager display name }
export function buildManagerLookup(): Map<number, Map<string, string>> {
  const lookup = new Map<number, Map<string, string>>();
  for (const mgr of MANAGERS) {
    for (const [yearStr, teamName] of Object.entries(mgr.teams)) {
      if (!teamName) continue;
      const year = Number(yearStr);
      if (!lookup.has(year)) lookup.set(year, new Map());
      lookup.get(year)!.set(norm(teamName), mgr.name);
    }
  }
  return lookup;
}

export function resolveManager(
  year: number,
  teamName: string,
  lookup: Map<number, Map<string, string>>
): string {
  return lookup.get(year)?.get(norm(teamName)) ?? teamName;
}
