
// FarmDiary Data Storage

const keys = {
    activities: "farmActivities",
    crops: "farmCrops",
    animals: "farmAnimals",
    finance: "farmFinance",
    notes: "farmNotes"
};

function getData(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function addRecord(key, record) {
    const data = getData(key);
    data.unshift({ id: Date.now() + Math.random(), ...record });
    saveData(key, data);
    renderAll();
}

function deleteRecord(key, id) {
    const data = getData(key).filter(item => item.id !== id);
    saveData(key, data);
    renderAll();
}

// Safe HTML display

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function formatMoney(amount) {
    return "KES " + Number(amount).toLocaleString("en-KE", {
        maximumFractionDigits: 2
    });
}

function recordCard(title, details, date, key, id) {
    return `
        <div class="record">
            <h3>${escapeHTML(title)}</h3>
            ${details.map(item => `<p>${escapeHTML(item)}</p>`).join("")}
            <small>${escapeHTML(date || "")}</small>
            <br>
            <button class="delete-btn"
                onclick="deleteRecord('${key}', ${JSON.stringify(id)})">
                Delete
            </button>
        </div>
    `;
}

// Activities

document.getElementById("activityForm")
.addEventListener("submit", function(e) {
    e.preventDefault();

    addRecord(keys.activities, {
        date: activityDate.value,
        type: activityType.value,
        title: activityTitle.value.trim(),
        description: activityDescription.value.trim()
    });

    this.reset();
    setDefaultDates();
});

// Crops

document.getElementById("cropForm")
.addEventListener("submit", function(e) {
    e.preventDefault();

    addRecord(keys.crops, {
        name: cropName.value.trim(),
        area: cropArea.value.trim(),
        planted: plantDate.value,
        harvest: harvestDate.value
    });

    this.reset();
});

// Livestock

document.getElementById("animalForm")
.addEventListener("submit", function(e) {
    e.preventDefault();

    addRecord(keys.animals, {
        type: animalType.value,
        quantity: Number(animalQuantity.value),
        notes: animalNotes.value.trim()
    });

    this.reset();
});

// Finance

document.getElementById("financeForm")
.addEventListener("submit", function(e) {
    e.preventDefault();

    addRecord(keys.finance, {
        type: transactionType.value,
        amount: Number(transactionAmount.value),
        description: transactionDescription.value.trim(),
        date: transactionDate.value
    });

    this.reset();
    setDefaultDates();
});

// Notes

document.getElementById("noteForm")
.addEventListener("submit", function(e) {
    e.preventDefault();

    addRecord(keys.notes, {
        title: noteTitle.value.trim(),
        content: noteContent.value.trim(),
        date: new Date().toLocaleDateString()
    });

    this.reset();
});

// Render activities

function renderActivities() {
    const data = getData(keys.activities);

    document.getElementById("activityList").innerHTML =
        data.map(item => recordCard(
            item.title,
            ["Activity: " + item.type, item.description],
            item.date,
            keys.activities,
            item.id
        )).join("") || '<div class="empty">No activities recorded yet.</div>';

    document.getElementById("activityCount").textContent = data.length;
}

// Render crops

function renderCrops() {
    const data = getData(keys.crops);

    document.getElementById("cropList").innerHTML =
        data.map(item => recordCard(
            item.name,
            [
                "Farm size: " + item.area,
                "Planting date: " + item.planted,
                "Expected harvest: " + (item.harvest || "Not set")
            ],
            "Crop record",
            keys.crops,
            item.id
        )).join("") || '<div class="empty">No crops added yet.</div>';

    document.getElementById("cropCount").textContent = data.length;
}

// Render livestock

function renderAnimals() {
    const data = getData(keys.animals);

    document.getElementById("animalList").innerHTML =
        data.map(item => recordCard(
            item.type,
            [
                "Quantity: " + item.quantity,
                "Notes: " + (item.notes || "None")
            ],
            "Livestock record",
            keys.animals,
            item.id
        )).join("") || '<div class="empty">No livestock recorded yet.</div>';

    document.getElementById("animalCount").textContent =
        data.reduce((sum, item) => sum + item.quantity, 0);
}

// Render finance

function renderFinance() {
    const data = getData(keys.finance);

    const income = data
        .filter(item => item.type === "Income")
        .reduce((sum, item) => sum + item.amount, 0);

    const expenses = data
        .filter(item => item.type === "Expense")
        .reduce((sum, item) => sum + item.amount, 0);

    document.getElementById("incomeTotal").textContent =
        formatMoney(income);

    document.getElementById("financeExpense").textContent =
        formatMoney(expenses);

    document.getElementById("expenseTotal").textContent =
        formatMoney(expenses);

    document.getElementById("profitTotal").textContent =
        formatMoney(income - expenses);

    document.getElementById("financeList").innerHTML =
        data.map(item => recordCard(
            item.description,
            [
                "Type: " + item.type,
                "Amount: " + formatMoney(item.amount)
            ],
            item.date,
            keys.finance,
            item.id
        )).join("") || '<div class="empty">No transactions recorded yet.</div>';
}

// Render notes

function renderNotes() {
    const data = getData(keys.notes);

    document.getElementById("noteList").innerHTML =
        data.map(item => recordCard(
            item.title,
            [item.content],
            item.date,
            keys.notes,
            item.id
        )).join("") || '<div class="empty">No notes written yet.</div>';
}

// Dashboard

function renderAll() {
    renderActivities();
    renderCrops();
    renderAnimals();
    renderFinance();
    renderNotes();
}

// Set today's date

function setDefaultDates() {
    const today = new Date();
    const localDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    document.getElementById("today").textContent =
        today.toLocaleDateString("en-KE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

    ["activityDate", "transactionDate"].forEach(id => {
        document.getElementById(id).value = localDate;
    });
}

// Navigation active state

document.querySelectorAll(".sidebar nav a").forEach(link => {
    link.addEventListener("click", function() {
        document.querySelectorAll(".sidebar nav a")
            .forEach(item => item.classList.remove("active"));

        this.classList.add("active");
    });
});

// Start application

setDefaultDates();
renderAll();
