export function calcScenario(params) {
  const {
    ironOreShock = 0,
    inrRate = 83.25,
    freightShock = 0,
    hedgeRatio = 0.80,
  } = params;
  const rev = 18500;
  const baseEbitda = 2146;
  const ironOrePrice = 120;
  const ironOreVol = 1200000;
  const freightRate = 17.20;
  const totalVol = 1800000;
  const baseFx = 83.25;

  const ironOreImpact = ironOreVol * (ironOrePrice * ironOreShock) * inrRate / 1e7;
  const ironOreHedgeGain = ironOreImpact * hedgeRatio;
  const netIronOreImpact = ironOreImpact - ironOreHedgeGain;

  const fxDelta = inrRate - baseFx;
  const exportGain = 620 * fxDelta / 10;
  const importCost = 480 * fxDelta / 10;
  const netFxImpact = exportGain - importCost;

  const freightImpact = totalVol * (freightRate * freightShock) * inrRate / 1e7;
  const freightHedgeGain = freightImpact * hedgeRatio;
  const netFreightImpact = freightImpact - freightHedgeGain;

  const ebitdaChange = -netIronOreImpact + netFxImpact - netFreightImpact;
  const ebitda = baseEbitda + ebitdaChange;
  const margin = ebitda / rev;
  const bpsVsBase = (margin - 0.116) * 10000;
  const boardFloorBreached = margin < 0.11;

  return {
    ebitda: Math.round(ebitda * 100) / 100,
    margin,
    bpsVsBase: Math.round(bpsVsBase * 10) / 10,
    boardFloorBreached,
    boardFloorBuffer: (margin - 0.11) * 10000,
    components: {
      ironOreImpact: -netIronOreImpact,
      fxImpact: netFxImpact,
      freightImpact: -netFreightImpact,
    }
  };
}

export function calcHedgedVsUnhedged(ironOreShock, inrRate, freightShock) {
  const unhedged = calcScenario({ ironOreShock, inrRate, freightShock, hedgeRatio: 0 });
  const hedged = calcScenario({ ironOreShock, inrRate, freightShock, hedgeRatio: 0.80 });
  return {
    unhedged,
    hedged,
    bpsSaved: (hedged.margin - unhedged.margin) * 10000,
    hedgeValueCrore: hedged.ebitda - unhedged.ebitda,
  };
}

export function calcIC(ebitda = 2146, interestInr = 72.3) {
  return ebitda / interestInr;
}

export function calcNigeriaBufferDays(bufferUsd, monthlyImport = 40) {
  return (bufferUsd / monthlyImport) * 30;
}

export function calcWAHR(ladder) {
  const totalNotional = ladder.reduce((s, b) => s + b.exposure, 0);
  const weighted = ladder.reduce((s, b) => s + b.exposure * b.forwardRate, 0);
  return weighted / totalNotional;
}

export function calcNigeriaWithFacility(currentBuffer, facility, monthlyImport) {
  const drawRequired = Math.max(0, (monthlyImport * 2) - currentBuffer);
  const drawActual = Math.min(facility, drawRequired);
  const newBuffer = currentBuffer + drawActual;
  const remaining = facility - drawActual;
  const newBufferDays = (newBuffer / monthlyImport) * 30;
  const additionalCushionDays = (remaining / monthlyImport) * 30;
  return { newBuffer, newBufferDays, additionalCushionDays, drawActual };
}

export function calcBreachThreshold(inrRate = 83.25, freightShock = 0, hedgeRatio = 0.80) {
  let low = 0, high = 1.0;
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const result = calcScenario({ ironOreShock: mid, inrRate, freightShock, hedgeRatio });
    if (result.margin > 0.11) low = mid;
    else high = mid;
  }
  const breachShock = (low + high) / 2;
  return {
    ironOreBreachPct: breachShock * 100,
    ironOreBreachPrice: 120 * (1 + breachShock),
  };
}

export function runMonteCarlo(nPaths = 1000, fxStd = 2.50, ironOreStd = 8, hedgeRatio = 0.80) {
  const results = [];
  for (let i = 0; i < nPaths; i++) {
    const u1 = Math.random(), u2 = Math.random();
    const u3 = Math.random(), u4 = Math.random();
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
    const z3 = Math.sqrt(-2 * Math.log(u3)) * Math.cos(2 * Math.PI * u4);

    const fxSim = 83.25 + fxStd * z1;
    const ironOreSim = 120 + ironOreStd * z3;
    const ironOreShock = (ironOreSim - 120) / 120;

    const result = calcScenario({
      ironOreShock: Math.max(ironOreShock, -0.5),
      inrRate: Math.max(fxSim, 70),
      freightShock: 0,
      hedgeRatio,
    });
    results.push(result.margin);
    void z2;
  }
  results.sort((a, b) => a - b);
  const p5 = results[Math.floor(nPaths * 0.05)];
  const p50 = results[Math.floor(nPaths * 0.50)];
  const mean = results.reduce((s, v) => s + v, 0) / nPaths;
  const pctAboveFloor = results.filter(m => m >= 0.11).length / nPaths * 100;
  return { paths: results, p5, mean, p50, pctAboveFloor };
}

export function calcHedgeValueCrore(ironOreShock, inrRate, freightShock) {
  const { hedgeValueCrore } = calcHedgedVsUnhedged(ironOreShock, inrRate, freightShock);
  return Math.max(0, Math.round(hedgeValueCrore));
}

export function getRAGStatus(kpiId, value) {
  switch (kpiId) {
    case 'ebitdaHedged':
    case 'ebitdaUnhedged':
      if (value >= 0.11) return 'green';
      if (value >= 0.108) return 'amber';
      return 'red';
    case 'hedgeCoverage':
      if (value >= 0.80) return 'green';
      if (value >= 0.60) return 'amber';
      return 'red';
    case 'wahr':
      if (value >= 83.50 && value <= 85.50) return 'green';
      if (value >= 82.50 && value <= 86.50) return 'amber';
      return 'red';
    case 'inventoryDays':
      if (value <= 55) return 'green';
      if (value <= 65) return 'amber';
      return 'red';
    case 'nigeriaBuffer':
      if (value >= 45) return 'green';
      if (value >= 30) return 'amber';
      return 'red';
    case 'ic':
      if (value >= 2.0) return 'green';
      if (value >= 1.5) return 'amber';
      return 'red';
    case 'debtMaturity':
      if (value >= 3) return 'green';
      if (value >= 2) return 'amber';
      return 'red';
    case 'sofr':
      if (value < 0.06) return 'green';
      if (value < 0.065) return 'amber';
      return 'red';
    case 'cfar':
      if (value >= 0.08) return 'green';
      if (value >= 0.075) return 'amber';
      return 'red';
    default:
      return 'green';
  }
}
