/**
 * Top 50 US Metropolitan Statistical Areas (MSAs)
 * Source: US Census Bureau Population Estimates (2023)
 * Ranked by population
 */

export interface Metro {
  id: string;
  name: string;
  stateCodes: string[]; // Primary state(s) for the metro
  rank: number;
}

// Top 50 US Metros by population (2023 Census estimates)
export const TOP_50_METROS: Metro[] = [
  {
    id: "new-york-newark-jersey-city",
    name: "New York-Newark-Jersey City",
    stateCodes: ["NY", "NJ", "PA"],
    rank: 1,
  },
  {
    id: "los-angeles-long-beach-anaheim",
    name: "Los Angeles-Long Beach-Anaheim",
    stateCodes: ["CA"],
    rank: 2,
  },
  {
    id: "chicago-naperville-elgin",
    name: "Chicago-Naperville-Elgin",
    stateCodes: ["IL", "IN", "WI"],
    rank: 3,
  },
  {
    id: "dallas-fort-worth-arlington",
    name: "Dallas-Fort Worth-Arlington",
    stateCodes: ["TX"],
    rank: 4,
  },
  {
    id: "houston-the-woodlands-sugar-land",
    name: "Houston-The Woodlands-Sugar Land",
    stateCodes: ["TX"],
    rank: 5,
  },
  {
    id: "atlanta-sandy-springs-roswell",
    name: "Atlanta-Sandy Springs-Roswell",
    stateCodes: ["GA"],
    rank: 6,
  },
  {
    id: "washington-arlington-alexandria",
    name: "Washington-Arlington-Alexandria",
    stateCodes: ["DC", "VA", "MD", "WV"],
    rank: 7,
  },
  {
    id: "philadelphia-camden-wilmington",
    name: "Philadelphia-Camden-Wilmington",
    stateCodes: ["PA", "NJ", "DE", "MD"],
    rank: 8,
  },
  {
    id: "miami-fort-lauderdale-west-palm-beach",
    name: "Miami-Fort Lauderdale-West Palm Beach",
    stateCodes: ["FL"],
    rank: 9,
  },
  {
    id: "phoenix-mesa-chandler",
    name: "Phoenix-Mesa-Chandler",
    stateCodes: ["AZ"],
    rank: 10,
  },
  {
    id: "boston-cambridge-newton",
    name: "Boston-Cambridge-Newton",
    stateCodes: ["MA", "NH"],
    rank: 11,
  },
  {
    id: "riverside-san-bernardino-ontario",
    name: "Riverside-San Bernardino-Ontario",
    stateCodes: ["CA"],
    rank: 12,
  },
  {
    id: "san-francisco-oakland-berkeley",
    name: "San Francisco-Oakland-Berkeley",
    stateCodes: ["CA"],
    rank: 13,
  },
  {
    id: "detroit-warren-dearborn",
    name: "Detroit-Warren-Dearborn",
    stateCodes: ["MI"],
    rank: 14,
  },
  {
    id: "seattle-tacoma-bellevue",
    name: "Seattle-Tacoma-Bellevue",
    stateCodes: ["WA"],
    rank: 15,
  },
  {
    id: "minneapolis-st-paul-bloomington",
    name: "Minneapolis-St. Paul-Bloomington",
    stateCodes: ["MN", "WI"],
    rank: 16,
  },
  {
    id: "san-diego-chula-vista-carlsbad",
    name: "San Diego-Chula Vista-Carlsbad",
    stateCodes: ["CA"],
    rank: 17,
  },
  {
    id: "tampa-st-petersburg-clearwater",
    name: "Tampa-St. Petersburg-Clearwater",
    stateCodes: ["FL"],
    rank: 18,
  },
  {
    id: "denver-aurora-lakewood",
    name: "Denver-Aurora-Lakewood",
    stateCodes: ["CO"],
    rank: 19,
  },
  {
    id: "baltimore-columbia-towson",
    name: "Baltimore-Columbia-Towson",
    stateCodes: ["MD"],
    rank: 20,
  },
  {
    id: "orlando-kissimmee-sanford",
    name: "Orlando-Kissimmee-Sanford",
    stateCodes: ["FL"],
    rank: 21,
  },
  {
    id: "charlotte-concord-gastonia",
    name: "Charlotte-Concord-Gastonia",
    stateCodes: ["NC", "SC"],
    rank: 22,
  },
  {
    id: "st-louis",
    name: "St. Louis",
    stateCodes: ["MO", "IL"],
    rank: 23,
  },
  {
    id: "san-antonio-new-braunfels",
    name: "San Antonio-New Braunfels",
    stateCodes: ["TX"],
    rank: 24,
  },
  {
    id: "portland-vancouver-hillsboro",
    name: "Portland-Vancouver-Hillsboro",
    stateCodes: ["OR", "WA"],
    rank: 25,
  },
  {
    id: "pittsburgh",
    name: "Pittsburgh",
    stateCodes: ["PA"],
    rank: 26,
  },
  {
    id: "sacramento-roseville-folsom",
    name: "Sacramento-Roseville-Folsom",
    stateCodes: ["CA"],
    rank: 27,
  },
  {
    id: "las-vegas-henderson-paradise",
    name: "Las Vegas-Henderson-Paradise",
    stateCodes: ["NV"],
    rank: 28,
  },
  {
    id: "austin-round-rock-georgetown",
    name: "Austin-Round Rock-Georgetown",
    stateCodes: ["TX"],
    rank: 29,
  },
  {
    id: "cincinnati",
    name: "Cincinnati",
    stateCodes: ["OH", "KY", "IN"],
    rank: 30,
  },
  {
    id: "kansas-city",
    name: "Kansas City",
    stateCodes: ["MO", "KS"],
    rank: 31,
  },
  {
    id: "columbus",
    name: "Columbus",
    stateCodes: ["OH"],
    rank: 32,
  },
  {
    id: "indianapolis-carmel-anderson",
    name: "Indianapolis-Carmel-Anderson",
    stateCodes: ["IN"],
    rank: 33,
  },
  {
    id: "cleveland-elyria",
    name: "Cleveland-Elyria",
    stateCodes: ["OH"],
    rank: 34,
  },
  {
    id: "san-jose-sunnyvale-santa-clara",
    name: "San Jose-Sunnyvale-Santa Clara",
    stateCodes: ["CA"],
    rank: 35,
  },
  {
    id: "nashville-davidson-murfreesboro-franklin",
    name: "Nashville-Davidson-Murfreesboro-Franklin",
    stateCodes: ["TN"],
    rank: 36,
  },
  {
    id: "virginia-beach-norfolk-newport-news",
    name: "Virginia Beach-Norfolk-Newport News",
    stateCodes: ["VA", "NC"],
    rank: 37,
  },
  {
    id: "providence-warwick",
    name: "Providence-Warwick",
    stateCodes: ["RI", "MA"],
    rank: 38,
  },
  {
    id: "milwaukee-waukesha",
    name: "Milwaukee-Waukesha",
    stateCodes: ["WI"],
    rank: 39,
  },
  {
    id: "jacksonville",
    name: "Jacksonville",
    stateCodes: ["FL"],
    rank: 40,
  },
  {
    id: "oklahoma-city",
    name: "Oklahoma City",
    stateCodes: ["OK"],
    rank: 41,
  },
  {
    id: "raleigh-cary",
    name: "Raleigh-Cary",
    stateCodes: ["NC"],
    rank: 42,
  },
  {
    id: "memphis",
    name: "Memphis",
    stateCodes: ["TN", "MS", "AR"],
    rank: 43,
  },
  {
    id: "richmond",
    name: "Richmond",
    stateCodes: ["VA"],
    rank: 44,
  },
  {
    id: "new-orleans-metairie",
    name: "New Orleans-Metairie",
    stateCodes: ["LA"],
    rank: 45,
  },
  {
    id: "buffalo-cheektowaga",
    name: "Buffalo-Cheektowaga",
    stateCodes: ["NY"],
    rank: 46,
  },
  {
    id: "birmingham-hoover",
    name: "Birmingham-Hoover",
    stateCodes: ["AL"],
    rank: 47,
  },
  {
    id: "salt-lake-city",
    name: "Salt Lake City",
    stateCodes: ["UT"],
    rank: 48,
  },
  {
    id: "hartford-east-hartford-middletown",
    name: "Hartford-East Hartford-Middletown",
    stateCodes: ["CT"],
    rank: 49,
  },
  {
    id: "rochester",
    name: "Rochester",
    stateCodes: ["NY"],
    rank: 50,
  },
];

// Helper functions
export function getMetroById(id: string): Metro | undefined {
  return TOP_50_METROS.find((metro) => metro.id === id);
}

export function getMetroByName(name: string): Metro | undefined {
  return TOP_50_METROS.find(
    (metro) => metro.name.toLowerCase() === name.toLowerCase()
  );
}

export function getMetrosByState(stateCode: string): Metro[] {
  return TOP_50_METROS.filter((metro) =>
    metro.stateCodes.includes(stateCode.toUpperCase())
  );
}

export function getMetroName(id: string): string {
  return getMetroById(id)?.name ?? id;
}

// Sorted lists for dropdowns
export const METROS_BY_NAME = [...TOP_50_METROS].sort((a, b) =>
  a.name.localeCompare(b.name)
);

export const METROS_BY_RANK = [...TOP_50_METROS].sort((a, b) => a.rank - b.rank);
