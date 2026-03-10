const laborCategorySalaries = {
  "Software Engineer": [115000, 128000, 136000, 145000, 158000, 171000, 184000, 198000],
  "Data Scientist": [122000, 134000, 142000, 151000, 164000, 178000, 191000, 205000],
  "Cybersecurity Analyst": [105000, 116000, 124000, 133000, 145000, 157000, 170000, 184000],
  "Program Manager": [130000, 142000, 151000, 163000, 176000, 189000, 204000, 220000],
  "Cloud Architect": [142000, 155000, 164000, 176000, 191000, 205000, 221000, 238000],
};

const clearancePremiums = {
  "None": { min: 0, max: 0, default: 0 },
  "Secret": { min: 5, max: 5, default: 5 },
  "Top Secret": { min: 15, max: 15, default: 15 },
  "TS/SCI": { min: 25, max: 25, default: 25 },
  "TS/SCI w/Poly": { min: 30, max: 30, default: 30 },
};

const percentileDefinitions = [
  { value: 25, label: "25%" },
  { value: 50, label: "50%" },
  { value: 75, label: "75%" },
];

const categorySelect = document.getElementById("categorySelect");
const agingInput = document.getElementById("agingInput");
const clearanceSelect = document.getElementById("clearanceSelect");
const premiumInput = document.getElementById("premiumInput");
const premiumGuidance = document.getElementById("premiumGuidance");
const summaryBody = document.getElementById("summaryBody");
const rawDataBody = document.getElementById("rawDataBody");

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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(rate);
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

  Object.entries(laborCategorySalaries).forEach(([category, salaries]) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${category}</td><td>${salaries.map((s) => formatCurrency(s)).join(", ")}</td>`;
    rawDataBody.appendChild(row);
  });
}

function renderSummary() {
  const category = categorySelect.value;
  const salaries = laborCategorySalaries[category] ?? [];

  const agingPct = clampAgingRate(parseFloat(agingInput.value));
  agingInput.value = agingPct;
  const premiumPct = clampPremiumRate(parseFloat(premiumInput.value));
  premiumInput.value = premiumPct;

  summaryBody.innerHTML = "";

  percentileDefinitions.forEach(({ value, label }) => {
    const base = percentile(salaries, value);
    const agedSalary = base * (1 + agingPct / 100);
    const adjustedSalary = agedSalary * (1 + premiumPct / 100);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${label}</td>
      <td>${formatCurrency(adjustedSalary)}</td>
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
  Object.keys(laborCategorySalaries).forEach((category) => {
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

  categorySelect.value = Object.keys(laborCategorySalaries)[0];
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
updatePremiumGuidance();
renderSummary();
