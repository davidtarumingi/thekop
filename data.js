const menuItems = {
  1: { name: "Espresso Panas", price: 15000 },
  2: { name: "Cappuccino Panas", price: 18000 },
  3: { name: "Americano Panas", price: 17000 },
  4: { name: "Nasi Goreng", price: 25000 },
  '1-cold': { name: "Espresso Dingin", price: 18000 },
  '2-cold': { name: "Cappuccino Dingin", price: 21000 },
  '3-cold': { name: "Americano Dingin", price: 20000 }
};

let order = [];

function addToOrder(id, type) {
  let key = id;
  if (type === 'cold') key = `${id}-cold`;

  const item = menuItems[key];
  if (item) {
    order.push(item);
    updateOrderSummary();
  }
}

function updateOrderSummary() {
  const orderList = document.getElementById("order-list");
  const orderTotal = document.getElementById("order-total");

  orderList.innerHTML = "";
  let total = 0;

  order.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.textContent = `${item.name} - Rp${item.price.toLocaleString()}`;
    orderList.appendChild(itemDiv);
    total += item.price;
  });

  orderTotal.textContent = `Total: Rp${total.toLocaleString()}`;
}

function logDebug(message) {
  const debugDiv = document.getElementById("debug-log");
  if (debugDiv) {
    const entry = document.createElement("div");
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    debugDiv.prepend(entry);
  }
}

function payCash() {
  const nomorMeja = document.getElementById("table-number").value;
  if (!nomorMeja) {
    alert("Masukkan nomor meja terlebih dahulu.");
    return;
  }

  if (order.length === 0) {
    alert("Pesanan masih kosong.");
    return;
  }

  const pesanan = order.map((item) => item.name).join(", ");
  const totalHarga = order.reduce((sum, item) => sum + item.price, 0);

  const data = {
    nomorMeja,
    pesanan,
    totalHarga
  };

  logDebug("Mengirim pesanan...");

  fetch("https://script.google.com/macros/s/AKfycbx2_ZpOPRPiYQ5UqZXqateCpEkhklNfgt6FHQg8RBQsTBu_jshN7GgXBsTeDYcMHJY/exec", {
    method: "POST",
    mode: "no-cors", // penting agar bisa dari HP/browser
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(() => {
      alert("Pesanan berhasil dikirim!");
      logDebug("Berhasil kirim ke Google Sheets (mode: no-cors).");
      order = [];
      updateOrderSummary();
      document.getElementById("table-number").value = "";
    })
    .catch((err) => {
      console.error("Gagal kirim:", err);
      logDebug("Gagal kirim: " + err.message);
      alert("Gagal mengirim pesanan. Coba lagi.");
    });
}
