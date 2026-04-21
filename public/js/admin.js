async function loadAdminSlots(dateParam) {
  const date = dateParam || document.getElementById("datePicker").value;
  if (!date) return;
  try {
    const res = await fetch(`/api/admin/slots/${date}`);
    const slots = await res.json();
    renderAdmin(slots, date);
  } catch (err) {
    console.error("Failed to load slots:", err);
  }
}

function renderAdmin(slots, date) {
  const grid = document.getElementById("slotsGrid");
  grid.innerHTML = "";

  slots.forEach(slot => {
    const card = document.createElement("div");
    const isAvailable = slot.remainingSubSlots > 0 && !slot.blocked;

    card.className = "slot-card " + (slot.blocked ? "blocked" : (isAvailable ? "green" : "red"));

    card.innerHTML = `
      <h4>${formatHour(slot.hour)} - ${formatHour(slot.hour + 1)}</h4>
      <p>Remaining: ${slot.remainingSubSlots}/${slot.totalSubSlots}</p>
      <p>Status: ${slot.blocked ? "BLOCKED" : (isAvailable ? "Available" : "Full")}</p>
      <button
        class="${slot.blocked ? 'btn-unblock' : 'btn-block'}"
        onclick="${slot.blocked ? 'unblockSlot' : 'blockSlot'}('${slot.id}', '${date}')"
      >
        ${slot.blocked ? 'Unblock' : 'Block'}
      </button>
    `;

    grid.appendChild(card);
  });
}

function formatHour(hour) {
  let h = hour % 12 || 12;
  let ampm = hour < 12 ? "AM" : "PM";
  return `${h}:00 ${ampm}`;
}

async function blockSlot(slotId, date) {
  const res = await fetch("/api/admin/block", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ date, slotId })
  });
  const data = await res.json();
  if (data.success) {
    loadAdminSlots(date);
  } else {
    alert(data.error);
  }
}

async function unblockSlot(slotId, date) {
  const res = await fetch("/api/admin/unblock", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ date, slotId })
  });
  const data = await res.json();
  if (data.success) {
    loadAdminSlots(date);
  } else {
    alert(data.error);
  }
}

window.onload = () => {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("datePicker").value = today;

  document.getElementById("datePicker").addEventListener("change", (e) => {
    loadAdminSlots(e.target.value);
  });

  loadAdminSlots(today);
};
