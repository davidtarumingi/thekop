function payCash() {
  const nomorMeja = document.getElementById("table-number").value.trim();
  if (!nomorMeja) return alert("Masukkan nomor meja terlebih dahulu.");
  if (order.length === 0) return alert("Pesanan masih kosong.");

  const pesanan = order.map(i => i.name).join(", ");
  const totalHarga = order.reduce((sum, i) => sum + i.price, 0);

  fetch("https://script.google.com/macros/s/AKfycbyY2yc_0fyEu4SF8mPH14kYXZDrOzN4OeOj9Qng8VDE2zaG-z1g5Gin9tJqREB4Lvyr/exec", {
       method: "POST",
       headers: { "Content-Type": "text/plain;charset=utf-8" },
       body: JSON.stringify({ nomorMeja, pesanan, totalHarga })
  })
  .then(res => res.text())
  .then(text => {
     alert(text);
     order = [];
     updateOrderSummary();
     document.getElementById("table-number").value = "";
  })
  .catch(err => {
     console.error(err);
     alert("Gagal mengirim pesanan. Pastikan koneksi internet stabil.");
  });
}
