const statusEl = document.getElementById("status");
const dealershipList = document.getElementById("dealership-list");
const carList = document.getElementById("car-list");
const relationshipResult = document.getElementById("relationship-result");
const endpointResult = document.getElementById("endpoint-result");
const dealershipCountEl = document.getElementById("dealership-count");
const carCountEl = document.getElementById("car-count");
const relationshipCountEl = document.getElementById("relationship-count");
const importFileInput = document.getElementById("import-file");
const importButton = document.getElementById("import-button");
const exportButton = document.getElementById("export-button");
const getDealershipsButton = document.getElementById("get-dealerships-btn");
const getCarsButton = document.getElementById("get-cars-btn");
const getExportButton = document.getElementById("get-export-btn");
const getDealershipButton = document.getElementById("get-dealership-btn");
const getCarButton = document.getElementById("get-car-btn");
const getDealershipCarsButton = document.getElementById("get-dealership-cars-btn");
const getDealershipCarButton = document.getElementById("get-dealership-car-btn");

const dealershipForm = document.getElementById("dealership-form");
const carForm = document.getElementById("car-form");
const relationshipForm = document.getElementById("relationship-form");
const dealershipSubmitButton = dealershipForm.querySelector('button[type="submit"]');
const carSubmitButton = carForm.querySelector('button[type="submit"]');

const dealershipIdInput = document.getElementById("dealership-id");
const dealershipNameInput = document.getElementById("dealership-name");
const dealershipCityInput = document.getElementById("dealership-city");
const dealershipStateInput = document.getElementById("dealership-state");

const carIdInput = document.getElementById("car-id");
const carMakeInput = document.getElementById("car-make");
const carModelInput = document.getElementById("car-model");
const carYearInput = document.getElementById("car-year");
const carPriceInput = document.getElementById("car-price");
const carVinInput = document.getElementById("car-vin");
const carDealershipIdInput = document.getElementById("car-dealership-id");

const relationshipDealershipIdInput = document.getElementById("relationship-dealership-id");
const getDealershipIdInput = document.getElementById("get-dealership-id");
const getCarIdInput = document.getElementById("get-car-id");
const getRelationshipCarIdInput = document.getElementById("get-relationship-car-id");

let lastRelationshipCount = 0;
let currentDealerships = [];
let currentCars = [];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sampleItems(items, limit = 5) {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function showEndpointResult(title, data) {
  endpointResult.classList.remove("muted");
  endpointResult.innerHTML = `<strong>${escapeHtml(title)}</strong><pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }
  return data;
}

function resetDealershipForm() {
  dealershipIdInput.value = "";
  dealershipNameInput.value = "";
  dealershipCityInput.value = "";
  dealershipStateInput.value = "";
  dealershipSubmitButton.textContent = "Save Dealership";
}

function resetCarForm() {
  carIdInput.value = "";
  carMakeInput.value = "";
  carModelInput.value = "";
  carYearInput.value = "";
  carPriceInput.value = "";
  carVinInput.value = "";
  carDealershipIdInput.value = "";
  carSubmitButton.textContent = "Save Car";
}

function enterDealershipEditMode(id) {
  dealershipSubmitButton.textContent = `Update Dealership #${id}`;
  dealershipForm.scrollIntoView({ behavior: "smooth", block: "start" });
  dealershipNameInput.focus();
}

function enterCarEditMode(id) {
  carSubmitButton.textContent = `Update Car #${id}`;
  carForm.scrollIntoView({ behavior: "smooth", block: "start" });
  carMakeInput.focus();
}

function updateSummary(dealerships, cars) {
  dealershipCountEl.textContent = String(dealerships.length);
  carCountEl.textContent = String(cars.length);
  relationshipCountEl.textContent = String(lastRelationshipCount);
}

function updateCatalogState(dealerships, cars) {
  currentDealerships = dealerships;
  currentCars = cars;
  renderDealerships(dealerships, cars);
  renderCars(cars);
  updateSummary(dealerships, cars);
}

function makeItemActions(viewHref, editHandler, deleteHandler) {
  const actions = document.createElement("div");
  actions.className = "item-actions";

  const viewLink = document.createElement("a");
  viewLink.className = "button secondary";
  viewLink.href = viewHref;
  viewLink.textContent = "View";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", editHandler);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.className = "danger";
  deleteButton.addEventListener("click", deleteHandler);

  actions.append(viewLink, editButton, deleteButton);
  return actions;
}

function renderDealerships(items, cars) {
  dealershipList.innerHTML = "";
  if (!items.length) {
    dealershipList.innerHTML = '<div class="item"><div><strong>No dealerships yet.</strong><div class="item-meta">Create one above or import a JSON catalog.</div></div></div>';
    return;
  }

  const counts = new Map();
  cars.forEach((car) => {
    counts.set(car.dealership_id, (counts.get(car.dealership_id) || 0) + 1);
  });

  const visibleItems = sampleItems(items, 5);

  visibleItems.forEach((item) => {
    const el = document.createElement("article");
    el.className = "item";
    el.innerHTML = `
      <div>
        <strong>#${escapeHtml(item.id)} ${escapeHtml(item.name || "Untitled")}</strong>
        <div class="item-meta">${escapeHtml(item.city || "-")}, ${escapeHtml(item.state || "-")}</div>
        <div class="chip-row">
          <span class="chip">${counts.get(item.id) || 0} cars</span>
          <span class="chip">ID ${escapeHtml(item.id)}</span>
        </div>
      </div>
    `;

    const editHandler = () => {
      dealershipIdInput.value = item.id;
      dealershipNameInput.value = item.name || "";
      dealershipCityInput.value = item.city || "";
      dealershipStateInput.value = item.state || "";
      enterDealershipEditMode(item.id);
      setStatus(`Loaded dealership ${item.id} for editing`);
    };

    const deleteHandler = async () => {
      try {
        await api(`/dealerships/${item.id}`, { method: "DELETE" });
        setStatus(`Deleted dealership ${item.id}`);
        if (dealershipIdInput.value === String(item.id)) {
          resetDealershipForm();
        }
        await refreshLists();
      } catch (error) {
        setStatus(error.message, true);
      }
    };

    el.appendChild(makeItemActions(`/dealerships/${item.id}/view`, editHandler, deleteHandler));
    dealershipList.appendChild(el);
  });
}

function renderCars(items) {
  carList.innerHTML = "";
  if (!items.length) {
    carList.innerHTML = '<div class="item"><div><strong>No cars yet.</strong><div class="item-meta">Add a detail record or import a catalog.</div></div></div>';
    return;
  }

  const visibleItems = sampleItems(items, 5);

  visibleItems.forEach((item) => {
    const el = document.createElement("article");
    el.className = "item";
    el.innerHTML = `
      <div>
        <strong>#${escapeHtml(item.id)} ${escapeHtml(item.make || "")} ${escapeHtml(item.model || "")}</strong>
        <div class="item-meta">Year: ${escapeHtml(item.year || "-")} | Price: ${escapeHtml(item.price || "-")} | Dealer: ${escapeHtml(item.dealership_name || item.dealership_id)}</div>
        <div class="chip-row">
          <span class="chip">VIN ${escapeHtml(item.vin || "N/A")}</span>
          <span class="chip">ID ${escapeHtml(item.id)}</span>
        </div>
      </div>
    `;

    const editHandler = () => {
      carIdInput.value = item.id;
      carMakeInput.value = item.make || "";
      carModelInput.value = item.model || "";
      carYearInput.value = item.year || "";
      carPriceInput.value = item.price || "";
      carVinInput.value = item.vin || "";
      carDealershipIdInput.value = item.dealership_id || "";
      enterCarEditMode(item.id);
      setStatus(`Loaded car ${item.id} for editing`);
    };

    const deleteHandler = async () => {
      try {
        await api(`/cars/${item.id}`, { method: "DELETE" });
        setStatus(`Deleted car ${item.id}`);
        if (carIdInput.value === String(item.id)) {
          resetCarForm();
        }
        await refreshLists();
      } catch (error) {
        setStatus(error.message, true);
      }
    };

    el.appendChild(makeItemActions(`/cars/${item.id}/view`, editHandler, deleteHandler));
    carList.appendChild(el);
  });
}

function renderRelationship(data) {
  const dealership = data.dealership || {};
  const cars = Array.isArray(data.cars) ? data.cars : [];
  lastRelationshipCount = cars.length;
  relationshipCountEl.textContent = String(lastRelationshipCount);

  const carCards = cars.length
    ? cars
        .map(
          (car) => `
            <article class="item">
              <div>
                <strong>#${escapeHtml(car.id)} ${escapeHtml(car.make || "")} ${escapeHtml(car.model || "")}</strong>
                <div class="item-meta">Year: ${escapeHtml(car.year || "-")} | Price: ${escapeHtml(car.price || "-")}</div>
                <div class="chip-row">
                  <span class="chip">VIN ${escapeHtml(car.vin || "N/A")}</span>
                  <span class="chip">${escapeHtml(car.dealership_name || dealership.name || "Assigned dealer")}</span>
                </div>
              </div>
            </article>
          `,
        )
        .join("")
    : '<div class="item"><div><strong>No cars found.</strong><div class="item-meta">This dealership currently has no related cars.</div></div></div>';

  relationshipResult.innerHTML = `
    <article class="relationship-summary">
      <div class="chip-row">
        <span class="chip">Dealership #${escapeHtml(dealership.id || relationshipDealershipIdInput.value || "?")}</span>
        <span class="chip">${escapeHtml(dealership.name || "Unknown dealership")}</span>
        <span class="chip">${cars.length} cars</span>
      </div>
      <p class="lede" style="margin-top:0.65rem;">${escapeHtml(dealership.city || "-")}, ${escapeHtml(dealership.state || "-")}</p>
    </article>
    <div class="relationship-cars">${carCards}</div>
  `;
}

async function refreshLists() {
  const [dealerships, cars] = await Promise.all([api("/dealerships"), api("/cars")]);
  updateCatalogState(dealerships, cars);
}

async function loadDealerships() {
  const [dealerships, cars] = await Promise.all([api("/dealerships"), api("/cars")]);
  updateCatalogState(dealerships, cars);
  const data = dealerships;
  showEndpointResult("GET /dealerships", data);
  setStatus("Loaded dealerships");
}

async function loadCars() {
  const [dealerships, cars] = await Promise.all([api("/dealerships"), api("/cars")]);
  updateCatalogState(dealerships, cars);
  const data = cars;
  showEndpointResult("GET /cars", data);
  setStatus("Loaded cars");
}

async function loadExportJson() {
  const data = await api("/export/json");
  showEndpointResult("GET /export/json", data);
  setStatus("Loaded export JSON");
}

async function loadDealershipById() {
  const dealershipId = Number(getDealershipIdInput.value);
  const data = await api(`/dealerships/${dealershipId}`);
  showEndpointResult(`GET /dealerships/${dealershipId}`, data);
  setStatus(`Loaded dealership ${dealershipId}`);
}

async function loadCarById() {
  const carId = Number(getCarIdInput.value);
  const data = await api(`/cars/${carId}`);
  showEndpointResult(`GET /cars/${carId}`, data);
  setStatus(`Loaded car ${carId}`);
}

async function loadDealershipCars() {
  const dealershipId = Number(getDealershipIdInput.value);
  const data = await api(`/dealerships/${dealershipId}/cars`);
  renderRelationship(data);
  showEndpointResult(`GET /dealerships/${dealershipId}/cars`, data);
  setStatus(`Loaded cars for dealership ${dealershipId}`);
}

async function loadDealershipCar() {
  const dealershipId = Number(getDealershipIdInput.value);
  const carId = Number(getRelationshipCarIdInput.value);
  const data = await api(`/dealerships/${dealershipId}/cars/${carId}`);
  showEndpointResult(`GET /dealerships/${dealershipId}/cars/${carId}`, data);
  setStatus(`Loaded car ${carId} for dealership ${dealershipId}`);
}

dealershipForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    name: dealershipNameInput.value.trim(),
    city: dealershipCityInput.value.trim() || null,
    state: dealershipStateInput.value.trim() || null,
  };

  const id = dealershipIdInput.value.trim();
  const method = id ? "PUT" : "POST";
  const url = id ? `/dealerships/${id}` : "/dealerships";

  try {
    await api(url, { method, body: JSON.stringify(payload) });
    setStatus(`Dealership ${id ? "updated" : "created"}`);
    resetDealershipForm();
    await refreshLists();
  } catch (error) {
    setStatus(error.message, true);
  }
});

carForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    make: carMakeInput.value.trim(),
    model: carModelInput.value.trim(),
    year: carYearInput.value ? Number(carYearInput.value) : null,
    price: carPriceInput.value ? Number(carPriceInput.value) : null,
    vin: carVinInput.value.trim() || null,
    dealership_id: Number(carDealershipIdInput.value),
  };

  const id = carIdInput.value.trim();
  const method = id ? "PUT" : "POST";
  const url = id ? `/cars/${id}` : "/cars";

  try {
    await api(url, { method, body: JSON.stringify(payload) });
    setStatus(`Car ${id ? "updated" : "created"}`);
    resetCarForm();
    await refreshLists();
  } catch (error) {
    setStatus(error.message, true);
  }
});

relationshipForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const dealershipId = Number(relationshipDealershipIdInput.value);

  try {
    const data = await api(`/dealerships/${dealershipId}/cars`);
    renderRelationship(data);
    setStatus(`Loaded relationship data for dealership ${dealershipId}`);
    showEndpointResult(`GET /dealerships/${dealershipId}/cars`, data);
  } catch (error) {
    relationshipResult.innerHTML = "";
    setStatus(error.message, true);
  }
});

getDealershipsButton.addEventListener("click", () => {
  loadDealerships().catch((error) => setStatus(error.message, true));
});

getCarsButton.addEventListener("click", () => {
  loadCars().catch((error) => setStatus(error.message, true));
});

getExportButton.addEventListener("click", () => {
  loadExportJson().catch((error) => setStatus(error.message, true));
});

getDealershipButton.addEventListener("click", () => {
  loadDealershipById().catch((error) => setStatus(error.message, true));
});

getCarButton.addEventListener("click", () => {
  loadCarById().catch((error) => setStatus(error.message, true));
});

getDealershipCarsButton.addEventListener("click", () => {
  loadDealershipCars().catch((error) => setStatus(error.message, true));
});

getDealershipCarButton.addEventListener("click", () => {
  loadDealershipCar().catch((error) => setStatus(error.message, true));
});

importButton.addEventListener("click", async () => {
  const file = importFileInput.files && importFileInput.files[0];
  if (!file) {
    setStatus("Choose a JSON file to upload first.", true);
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file, file.name || "catalog.json");
    const response = await fetch("/import/file", { method: "POST", body: formData });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Upload failed: ${response.status}`);
    }
    setStatus(`Imported ${data.counts.dealerships} dealerships and ${data.counts.cars} cars`);
    importFileInput.value = "";
    await refreshLists();
  } catch (error) {
    setStatus(error.message, true);
  }
});

exportButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/export/json");
    const data = await response.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ones-to-manys-export.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("Downloaded current catalog JSON");
  } catch (error) {
    setStatus(error.message, true);
  }
});

document.getElementById("dealership-reset").addEventListener("click", resetDealershipForm);
document.getElementById("car-reset").addEventListener("click", resetCarForm);

refreshLists().catch((error) => setStatus(error.message, true));
