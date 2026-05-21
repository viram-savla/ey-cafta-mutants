export const MODEL = {
  // Revenue & EBITDA
  revenue: 18500,
  ebitda: 2146,
  ebitdaMargin: 0.116,
  fy24Ebitda: 2627,
  fy24Margin: 0.142,
  marginCompression: 260,
  // Commodity
  ironOrePrice: 120,
  ironOrePriceLive: 110,
  ironOreVolume: 1200000,
  coalPrice: 210,
  coalVolume: 600000,
  freightRate: 17.20,
  freightRateC5: 15,
  freightRateC3: 36.90,
  totalBulkVolume: 1800000,
  // FX
  usdInrBase: 83.25,
  eurInrBase: 90,
  usdExports: 620,
  usdImports: 480,
  eurExports: 110,
  netUsdPosition: 140,
  // FX hedge ladder
  fxLadder: [
    { bucket: '0–3M', exposure: 35, ratio: 0.80, forwardRate: 84.50, instrument: 'Forward' },
    { bucket: '3–6M', exposure: 35, ratio: 0.50, forwardRate: 84.75, instrument: 'Zero-cost collar' },
    { bucket: '6–12M', exposure: 70, ratio: 0.20, forwardRate: 85.00, instrument: 'Participating forward' },
  ],
  wahr: 84.8125,
  // Debt & SOFR
  loanPrincipal: 150,
  sofr: 0.0359,
  creditSpread: 0.022,
  allInRate: 0.0579,
  annualInterestUsd: 8.685,
  annualInterestInr: 72.3,
  loanMaturityYears: 4,
  collarCap: 0.045,
  collarFloor: 0.030,
  collarNotional: 90,
  floatingNotional: 60,
  // Working capital
  inventoryDaysCurrent: 71,
  inventoryDaysTarget: 55,
  dailyRmCost: 24.64,
  wcRelease: 394,
  // Nigeria
  nigeriaMonthlyImport: 40,
  nigeriaBuffer: 43,
  nigeriaBufferDays: 32.25,
  nigeriaGreenFloor: 45,
  nigeriaAmberFloor: 30,
  nigeriaCreditFacility: 100,
  // KPI targets
  ebitdaFloor: 0.11,
  hedgeCoverageTarget: 0.80,
  wahRangeLow: 83.50,
  wahRangeHigh: 85.50,
  inventoryTarget: 55,
  icTarget: 2.0,
  sofRTarget: 0.06,
  cfarFloor: 0.08,
  debtMaturityTarget: 3,
  // Hedge ratios
  commodityHedge0to3: 0.80,
  commodityHedge3to6: 0.50,
  commodityHedge6to12: 0.20,
  // Monte Carlo params
  fxMean: 83.25,
  fxStd: 2.50,
  sofrMean: 0.0359,
  sofrStd: 0.005,
  ironOreMean: 120,
  ironOreStd: 8,
};

export const PRESETS = {
  base: {
    label: 'Base Case',
    ironOreShock: 0, inrRate: 83.25, freightShock: 0,
    unhedgedMargin: 0.1160, hedgedMargin: 0.1160,
    unhedgedEbitda: 2146, hedgedEbitda: 2146,
    bpsUnhedged: 0, bpsHedged: 0, bpsSaved: 0,
  },
  ironOre: {
    label: 'Iron Ore Crisis',
    ironOreShock: 0.15, inrRate: 83.25, freightShock: 0,
    unhedgedMargin: 0.1063, hedgedMargin: 0.1141,
    unhedgedEbitda: 1966, hedgedEbitda: 2110,
    bpsUnhedged: -97, bpsHedged: -19, bpsSaved: 78,
  },
  inrStress: {
    label: 'INR Stress',
    ironOreShock: 0, inrRate: 88, freightShock: 0,
    unhedgedMargin: 0.1196, hedgedMargin: 0.1167,
    unhedgedEbitda: 2213, hedgedEbitda: 2159,
    bpsUnhedged: +36, bpsHedged: +7, bpsSaved: -29,
  },
  combined: {
    label: 'Combined Shock',
    ironOreShock: 0.15, inrRate: 88, freightShock: 0.20,
    unhedgedMargin: 0.1071, hedgedMargin: 0.1142,
    unhedgedEbitda: 1981, hedgedEbitda: 2113,
    bpsUnhedged: -89, bpsHedged: -18, bpsSaved: 71,
  },
};

export const NIGERIA_TIER1 = [
  'Hard-currency floor enforcement: Indian parent pre-funds when buffer drops below 60 days',
  'FX allocation hierarchy: All USD directed to raw material procurement first',
  'Multi-bank diversification: ≥3 local AD banks (Zenith, GTBank, Stanbic IBTC)',
  'Centralised treasury visibility: Real-time NGN sweeps, positions visible to Mumbai HQ by 09:00 WAT',
  'USD 100M committed credit facility: Bilateral bank/ECA with Indian parent as guarantor',
];

export const NIGERIA_TIER2 = [
  'Offshore billing and routing: Invoice via Non-Resident Accounts (Mauritius/Dubai)',
  'USD intercompany loan structure: SOFR-linked facility from Indian parent',
  'NOTAP registration: All royalty/management fee flows registered within 30 days',
  'Digital asset settlement (USD stablecoins): Under CBN evaluation for 2026+',
];
