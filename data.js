// data.js
console.log("data.js berhasil terhubung dengan Firebase");

// 1️⃣ Inisialisasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC0121W7vGJaMyXOXUusWgOwIU09yS9MK4",
    authDomain: "thekop-ko.firebaseapp.com",
    projectId: "thekop-ko",
    storageBucket: "thekop-ko.appspot.com",
    messagingSenderId: "258740974913",
    appId: "1:258740974913:web:c901e8b99f634bf7699dc0",
    measurementId: "G-Q87CHGRJP8",
    databaseURL: "https://thekop-ko-default-rtdb.firebaseio.com"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 2️⃣ Data menu lokal
const menu = [
    { id: 1, name: "Espresso", priceHot: 15000, priceCold: 18000 },
    { id: 2, name: "Cappuccino", priceHot: 18000, priceCold: 21000 },
    { id: 3, name: "Americano", priceHot: 17000, priceCold: 20000 },
    { id: 4, name: "Nasi Goreng", priceHot: 25000 }
];

let orders = [];

// 3️⃣ Tambah ke order dan simpan ke Firebase
function addToOrder(menuId, type) {
    const item = menu.find(m => m.id === menuId);
    if (!item) return;

    const tableNumber = document.getElementById('table-number').value.trim();
    if (!tableNumber) {
        alert('Mohon masukkan nomor meja terlebih dahulu.');
        return;
    }

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
    }

    const orderRef = database.ref('orders/' + tableNumber + '/' + menuId + '_' + type);
    orderRef.once('value').then(snapshot => {
        const existing = snapshot.val();
        if (existing) {
            orderRef.update({
                quantity: existing.quantity + 1
            });
        } else {
            orderRef.set({
                id: menuId,
                name: `${item.name}${typeName}`,
                type: type,
                price: price,
                quantity: 1
            });
        }
    });
}

// 4️⃣ Render order dari Firebase secara realtime
function renderOrder() {
    const tableNumber = document.getElementById('table-number').value.trim();
    if (!tableNumber) return;

    const orderList = document.getElementById('order-list');
    const orderTotal = document.getElementById('order-total');
    orderList.innerHTML = '';
    orderTotal.textContent = 'Total: Rp0';

    database.ref('orders/' + tableNumber).on('value', snapshot => {
        const data = snapshot.val();
        let total = 0;
        orderList.innerHTML = '';

        if (data) {
            Object.values(data).forEach(order => {
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
        }
        orderTotal.textContent = `Total: Rp${total.toLocaleString()}`;
    });
}

// 5️⃣ Hapus 1 qty dari Firebase
function removeFromOrder(menuId, type) {
    const tableNumber = document.getElementById('table-number').value.trim();
    if (!tableNumber) {
        alert('Masukkan nomor meja terlebih dahulu');
        return;
    }

    const orderRef = database.ref('orders/' + tableNumber + '/' + menuId + '_' + type);
    orderRef.once('value').then(snapshot => {
        const existing = snapshot.val();
        if (existing) {
            if (existing.quantity > 1) {
                orderRef.update({ quantity: existing.quantity - 1 });
            } else {
                orderRef.remove();
            }
        }
    });
}

// 6️⃣ Tombol pembayaran di kasir dan reset pesanan
function payCash() {
    const tableNumber = document.getElementById('table-number').value.trim();
    if (!tableNumber) {
        alert('Masukkan nomor meja terlebih dahulu');
        return;
    }

    database.ref('orders/' + tableNumber).once('value').then(snapshot => {
        if (snapshot.exists()) {
            alert(`Pesanan meja ${tableNumber} sudah tercatat. Silakan bayar ke kasir. Terima kasih!`);
            database.ref('orders/' + tableNumber).remove();
            document.getElementById('order-list').innerHTML = '';
            document.getElementById('order-total').textContent = 'Total: Rp0';
            document.getElementById('table-number').value = '';
        } else {
            alert('Tidak ada pesanan untuk meja ini.');
        }
    });
}

// 7️⃣ Auto render saat ketik nomor meja
document.getElementById('table-number').addEventListener('input', renderOrder);
