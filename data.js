console.log("data.js berhasil terhubung");

const menu = [
    { id: 1, name: "Espresso", priceHot: 15000, priceCold: 18000 },
    { id: 2, name: "Cappuccino", priceHot: 18000, priceCold: 21000 },
    { id: 3, name: "Americano", priceHot: 17000, priceCold: 20000 },
    { id: 4, name: "Nasi Goreng", priceHot: 25000 }, // makanan
];

let orders = [];

function addToOrder(menuId, type) {
    const item = menu.find(m => m.id === menuId);
    if (!item) return;

    let price = 0;
    let typeName = '';

    if (type === 'hot') {
        price = item.priceHot;
        typeName = ' Panas';
    } else if (type === 'cold') {
        price = item.priceCold;
        typeName = ' Dingin';
    } else {
        price = item.priceHot;
        typeName = '';
    }

    const existing = orders.find(o => o.id === menuId && o.type === type);
    if (existing) {
        existing.quantity += 1;
    } else {
        orders.push({
            id: menuId,
            name: `${item.name}${typeName}`,
            type: type,
            price: price,
            quantity: 1
        });
    }

    renderOrder();
}

function removeFromOrder(menuId, type) {
    const index = orders.findIndex(o => o.id === menuId && o.type === type);
    if (index !== -1) {
        orders[index].quantity -= 1;
        if (orders[index].quantity <= 0) {
            orders.splice(index, 1);
        }
    }
    renderOrder();
}

function renderOrder() {
    const orderList = document.getElementById('order-list');
    const orderTotal = document.getElementById('order-total');
    orderList.innerHTML = '';

    let total = 0;
    orders.forEach(order => {
        total += order.price * order.quantity;
        const div = document.createElement('div');
        div.classList.add('order-item');
        div.innerHTML = `
            <span>${order.name} x ${order.quantity} - Rp${(order.price * order.quantity).toLocaleString()}</span>
            <div>
                <button onclick="addToOrder(${order.id}, '${order.type}')">+</button>
                <button onclick="removeFromOrder(${order.id}, '${order.type}')">-</button>
            </div>
        `;
        orderList.appendChild(div);
    });

    orderTotal.textContent = `Total: Rp${total.toLocaleString()}`;
}

function payCash() {
    console.log("payCash terpanggil");

    const tableNumber = document.getElementById('table-number').value.trim();
    if (!tableNumber) {
        alert('Mohon masukkan nomor meja sebelum memesan.');
        return;
    }

    if (orders.length === 0) {
        alert('Tidak ada pesanan untuk dibayar.');
        return;
    }

    const orderSummary = orders.map(item => `${item.name} x ${item.quantity}`).join(', ');
    const total = orders.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Ganti URL ini dengan URL Web App kamu
    const webAppURL = "https://script.google.com/macros/s/AKfycbwPgJoDvgI2gphvAXvkhKXnpbH6aDME6RyAmGKlW9H1-SavsLnnPbYsAUmDxAbnA0Jq/exec";

    const data = {
        meja: tableNumber,
        pesanan: orderSummary,
        total: total
    };

    fetch(webAppURL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.text())
    .then(result => {
        console.log('Success:', result);
        alert(`Pesanan telah dikirim ke dapur.\nTotal: Rp${total.toLocaleString()}\nMeja: ${tableNumber}`);
        resetOrder();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat mengirim pesanan.');
    });
}

function resetOrder() {
    orders = [];
    renderOrder();
    document.getElementById('table-number').value = '';
}
