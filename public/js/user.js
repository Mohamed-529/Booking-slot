let selectedSlot = null;
let selectedCourt = "";
let currentSlots = [];
const BASE_URL = "https://booking-slot-qmd0.onrender.com";

async function loadSlots(dateParam) {
  const date = dateParam || document.getElementById("datePicker").value;
  if (!date) return;
  try {
    const res = await fetch(`${BASE_URL}/api/user/slots/${date}`);
    const slots = await res.json();
    currentSlots = slots;
    render(slots);
  } catch (err) {
    console.error("Failed to load slots:", err);
  }
}

window.onload = () => {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("datePicker").value = today;
  document.getElementById("datePicker").addEventListener("change", (e) => {
    loadSlots(e.target.value);
  });
  loadSlots(today);
};

function render(slots) {
  const timeline = document.getElementById("timeline");
  const labels = document.getElementById("labels");
  timeline.innerHTML = "";
  labels.innerHTML = "";

  slots.forEach((slot, index) => {
    const bar = document.createElement("div");
    bar.className = "slot " + (slot.available ? "green" : "red");
    bar.dataset.index = index;
    timeline.appendChild(bar);
    const label = document.createElement("div");
    label.innerText = formatHour(slot.hour);
    labels.appendChild(label);
  });

  const container = document.querySelector(".timeline-container");
  container.scrollLeft = (1400 - container.offsetWidth) / 2;
  updateSelection();
}

function updateSelection() {
  const container = document.querySelector(".timeline-container");
  const center = container.scrollLeft + container.offsetWidth / 2;
  const index = Math.floor(center / 60);
  const slot = currentSlots[index];

  if (!slot || !slot.available) {
    selectedSlot = null;
    document.getElementById("startTime").value = "";
    document.getElementById("endTime").value = "";
    return;
  }

  selectedSlot = slot;
  document.getElementById("startTime").value = formatHour(slot.hour);
  document.getElementById("endTime").value = formatHour(slot.hour + 1);
}

document.querySelector(".timeline-container").addEventListener("scroll", updateSelection);

function formatHour(hour) {
  let h = hour % 12 || 12;
  let ampm = hour < 12 ? "AM" : "PM";
  return `${h}:00 ${ampm}`;
}

function selectCourt(btn) {
  document.querySelectorAll(".courts button").forEach(b => b.classList.remove("selected"));
  btn.classList.add("selected");
  selectedCourt = btn.innerText;
}

async function submitBooking() {
  const date = document.getElementById("datePicker").value;
  if (!selectedSlot) return alert("Select a slot by scrolling to it");
  if (!selectedCourt) return alert("Select a court");

  const res = await fetch(`${BASE_URL}/api/user/book`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ date, slotId: selectedSlot.id })
  });

  const data = await res.json();
  if (!res.ok) return alert(data.error);

  alert(`Booked: ${date}, ${formatHour(selectedSlot.hour)}, ${selectedCourt}`);
  loadSlots(date);
}
