/**
 * US States and DC for location filtering
 * USA-only enforcement as per platform requirements
 */

export interface Location {
  code: string; // Two-letter state code
  name: string; // Full state name
}

// All US states + DC
// Source: USPS State Abbreviations
export const US_STATES: Location[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

// Helper functions
export function getStateByCode(code: string): Location | undefined {
  return US_STATES.find((state) => state.code === code.toUpperCase());
}

export function getStateByName(name: string): Location | undefined {
  return US_STATES.find(
    (state) => state.name.toLowerCase() === name.toLowerCase()
  );
}

export function getStateName(code: string): string {
  return getStateByCode(code)?.name ?? code;
}

export function getStateCode(name: string): string | undefined {
  return getStateByName(name)?.code;
}

// Alphabetical lists for dropdowns
export const US_STATES_BY_NAME = [...US_STATES].sort((a, b) =>
  a.name.localeCompare(b.name)
);

export const US_STATES_BY_CODE = [...US_STATES].sort((a, b) =>
  a.code.localeCompare(b.code)
);
