const laborCategoryRates = {
  "Software Engineer": [62, 70, 74, 82, 89, 95, 102, 110],
  "Data Scientist": [68, 75, 79, 84, 90, 98, 106, 114],
  "Cybersecurity Analyst": [58, 64, 69, 76, 83, 92, 100, 108],
  "Program Manager": [72, 80, 86, 93, 101, 109, 118, 128],
  "Cloud Architect": [78, 85, 91, 99, 108, 116, 125, 135],
};

const clearancePremiums = {
  "None": { min: 0, max: 0, default: 0 },
  "Secret": { min: 5, max: 5, default: 5 },
  "Top Secret": { min: 15, max: 15, default: 15 },
  "TS/SCI": { min: 25, max: 25, default: 25 },
  "TS/SCI w/Poly": { min: 30, max: 30, default: 30 },
};

const categorySelect = document.getElementById("categorySelect");
const agingInput = document.getElementById("agingInput");
const clearanceSelect = document.getElementById("clearanceSelect");
const premiumInput = document.getElementById("premiumInput");
const premiumGuidance = document.getElementById("premiumGuidance");
const summaryBody = document.getElementById("summaryBody");
const rawDataBody = document.getElementById("rawDataBody");
const clearanceTableBody = document.getElementById("clearanceTableBody");

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function formatCurrency(rate) {
  return `$${rate.toFixed(2)}`;
}

function formatPremiumRange(min, max) {
  return min === max ? `${min}%` : `${min}% to ${max}%`;
}

function clampAgingRate(value) {
  if (Number.isNaN(value)) return 2;
  if (value < 1) return 1;
  if (value > 4) return 4;
  return value;
}

function clampPremiumRate(value) {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 60) return 60;
  return value;
}

function renderRawDataTable() {
  rawDataBody.innerHTML = "";

  Object.entries(laborCategoryRates).forEach(([category, rates]) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${category}</td><td>${rates.map((r) => formatCurrency(r)).join(", ")}</td>`;
    rawDataBody.appendChild(row);
  });
}

function renderClearanceTable() {
  clearanceTableBody.innerHTML = "";

  Object.entries(clearancePremiums).forEach(([clearance, premium]) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${clearance}</td><td>${formatPremiumRange(premium.min, premium.max)}</td><td>${premium.default}%</td>`;
    clearanceTableBody.appendChild(row);
  });
}

function renderSummary() {
  const category = categorySelect.value;
  const rates = laborCategoryRates[category] ?? [];

  const agingPct = clampAgingRate(parseFloat(agingInput.value));
  agingInput.value = agingPct;
  const premiumPct = clampPremiumRate(parseFloat(premiumInput.value));
  premiumInput.value = premiumPct;

  const percentiles = [25, 50, 75, 90];

  summaryBody.innerHTML = "";

  percentiles.forEach((p) => {
    const base = percentile(rates, p);
    const aged = base * (1 + agingPct / 100);
    const agedWithPremium = aged * (1 + premiumPct / 100);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>P${p}</td>
      <td>${formatCurrency(base)}</td>
      <td>${formatCurrency(aged)}</td>
      <td>${formatCurrency(agedWithPremium)}</td>
    `;
    summaryBody.appendChild(row);
  });
}

function updatePremiumGuidance() {
  const currentClearance = clearanceSelect.value;
  const premiumBand = clearancePremiums[currentClearance];
  premiumGuidance.textContent = `Baseline premium for ${currentClearance}: ${formatPremiumRange(premiumBand.min, premiumBand.max)}.`;
}

function initializeControls() {
  Object.keys(laborCategoryRates).forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  Object.entries(clearancePremiums).forEach(([clearance, premium]) => {
    const option = document.createElement("option");
    option.value = clearance;
    option.textContent = `${clearance} (${formatPremiumRange(premium.min, premium.max)})`;
    clearanceSelect.appendChild(option);
  });

  categorySelect.value = Object.keys(laborCategoryRates)[0];
  clearanceSelect.value = "None";

  clearanceSelect.addEventListener("change", () => {
    premiumInput.value = clearancePremiums[clearanceSelect.value].default;
    updatePremiumGuidance();
    renderSummary();
  });

  [categorySelect, agingInput, premiumInput].forEach((el) => {
    el.addEventListener("input", renderSummary);
  });
}

initializeControls();
renderRawDataTable();
renderClearanceTable();
updatePremiumGuidance();
renderSummary();
