const STORAGE_KEYS = {
    products: 'products',
    sales: 'sales'
};

const DEFAULT_PRODUCTS = [
    { id: 1, name: 'Simba Chips', price: 8.0, stock: 50 },
    { id: 2, name: 'Coca-Cola 500ml', price: 12.0, stock: 30 },
    { id: 3, name: 'Milk', price: 7.0, stock: 20 },
    { id: 4, name: 'Bread', price: 5.0, stock: 40 },
    { id: 5, name: 'Fanta Orange 500ml', price: 12.0, stock: 25 },
    { id: 6, name: 'Nik Naks', price: 6.0, stock: 35 },
    { id: 7, name: 'Chocolate Bar', price: 10.0, stock: 30 },
    { id: 8, name: 'Bottled Water 500ml', price: 10.0, stock: 40 },
    { id: 9, name: 'Airtime Voucher', price: 5.0, stock: 60 }
];

const PRODUCT_NAME_MIGRATIONS = {
    'Rose Milk': 'Milk',
    'Bread Roll': 'Bread'
};

let products = [];
let sales = [];
let cart = [];

function parseStoredJSON(key, fallbackValue) {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) {
        return fallbackValue;
    }

    try {
        return JSON.parse(rawValue);
    } catch {
        localStorage.removeItem(key);
        return fallbackValue;
    }
}

function syncCartWithProducts() {
    cart = cart.filter((item) => products.some((product) => product.id === item.productId));
}

function mergeDefaultProducts(storedProducts) {
    const normalizedProducts = storedProducts.map((product) => ({
        ...product,
        name: PRODUCT_NAME_MIGRATIONS[product.name] || product.name
    }));

    const existingNames = new Set(normalizedProducts.map((product) => product.name.toLowerCase()));
    const nextProducts = [...normalizedProducts];

    DEFAULT_PRODUCTS.forEach((defaultProduct) => {
        if (!existingNames.has(defaultProduct.name.toLowerCase())) {
            nextProducts.push({ ...defaultProduct });
        }
    });

    return nextProducts.sort((left, right) => left.id - right.id);
}

function migrateSalesItems(storedSales) {
    return storedSales.map((sale) => ({
        ...sale,
        items: sale.items.map((item) => ({
            ...item,
            name: PRODUCT_NAME_MIGRATIONS[item.name] || item.name
        }))
    }));
}

function loadData() {
    const storedProducts = parseStoredJSON(STORAGE_KEYS.products, DEFAULT_PRODUCTS.map((product) => ({ ...product })));
    const storedSales = parseStoredJSON(STORAGE_KEYS.sales, []);

    products = mergeDefaultProducts(storedProducts);
    sales = migrateSalesItems(storedSales);
    syncCartWithProducts();
    saveData();
}

function saveData() {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
    localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(sales));
}

function formatCurrency(amount) {
    return Number(amount).toFixed(2);
}

function getTodayDate() {
    return new Date().toISOString().slice(0, 10);
}

function getCurrentPage() {
    return document.body.dataset.page || '';
}

function getProductById(productId) {
    return products.find((product) => product.id === productId);
}

function getTodaySales() {
    const today = getTodayDate();
    return sales.filter((sale) => sale.date === today);
}

function getDashboardStats() {
    const todaySales = getTodaySales();

    return {
        productCount: products.length,
        lowStockCount: products.filter((product) => product.stock < 10).length,
        todaySalesTotal: todaySales.reduce((sum, sale) => sum + sale.total, 0),
        todayTransactionCount: todaySales.length
    };
}

function renderDashboardSummary() {
    const stats = getDashboardStats();
    const summaryProducts = document.getElementById('summaryProducts');
    const summaryLowStock = document.getElementById('summaryLowStock');
    const summarySales = document.getElementById('summarySales');
    const summaryTransactions = document.getElementById('summaryTransactions');

    if (summaryProducts) {
        summaryProducts.textContent = String(stats.productCount);
    }

    if (summaryLowStock) {
        summaryLowStock.textContent = String(stats.lowStockCount);
    }

    if (summarySales) {
        summarySales.textContent = formatCurrency(stats.todaySalesTotal);
    }

    if (summaryTransactions) {
        summaryTransactions.textContent = String(stats.todayTransactionCount);
    }
}

function getCartQuantityForProduct(productId) {
    return cart
        .filter((item) => item.productId === productId)
        .reduce((sum, item) => sum + item.quantity, 0);
}

function getAvailableStock(productId) {
    const product = getProductById(productId);
    if (!product) {
        return 0;
    }

    return product.stock - getCartQuantityForProduct(productId);
}

function updatePosControlsState() {
    const select = document.getElementById('productSelect');
    const quantityInput = document.getElementById('quantity');
    const addToCartButton = document.getElementById('addToCartButton');
    const completeSaleButton = document.getElementById('completeSaleButton');
    const clearCartButton = document.getElementById('clearCartButton');
    if (!select || !quantityInput) {
        return;
    }

    const selectedProduct = getProductById(Number(select.value));
    const availableStock = selectedProduct ? getAvailableStock(selectedProduct.id) : 0;

    if (selectedProduct && availableStock > 0) {
        quantityInput.max = String(availableStock);
    } else {
        quantityInput.removeAttribute('max');
    }

    if (addToCartButton) {
        addToCartButton.disabled = !selectedProduct || availableStock <= 0;
    }

    if (completeSaleButton) {
        completeSaleButton.disabled = cart.length === 0;
    }

    if (clearCartButton) {
        clearCartButton.disabled = cart.length === 0;
    }
}

function updateSelectedProductInfo() {
    const select = document.getElementById('productSelect');
    const info = document.getElementById('selectedProductInfo');
    if (!select || !info) {
        return;
    }

    const product = getProductById(Number(select.value));
    if (!product) {
        info.textContent = 'No products available. Add products from the Products page.';
        updatePosControlsState();
        return;
    }

    const availableStock = getAvailableStock(product.id);
    info.textContent = availableStock <= 0
        ? `${product.name} costs R${formatCurrency(product.price)} and is currently out of stock.`
        : `${product.name} costs R${formatCurrency(product.price)} and has ${availableStock} unit(s) available.`;

    updatePosControlsState();
}

function populateProductSelect() {
    const select = document.getElementById('productSelect');
    const quantityInput = document.getElementById('quantity');
    if (!select || !quantityInput) {
        return;
    }

    const previousValue = select.value;
    select.innerHTML = '';

    if (products.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'No products available';
        option.value = '';
        select.appendChild(option);
        select.disabled = true;
        quantityInput.disabled = true;
        updateSelectedProductInfo();
        return;
    }

    select.disabled = false;
    quantityInput.disabled = false;

    products.forEach((product) => {
        const availableStock = getAvailableStock(product.id);
        const option = document.createElement('option');
        option.value = String(product.id);
        option.textContent = `${product.name} - R${formatCurrency(product.price)} - Stock: ${availableStock}`;
        option.disabled = availableStock <= 0;
        select.appendChild(option);
    });

    const hasPreviousValue = Array.from(select.options).some((option) => option.value === previousValue && !option.disabled);
    if (hasPreviousValue) {
        select.value = previousValue;
    } else {
        const firstAvailableOption = Array.from(select.options).find((option) => !option.disabled);
        select.value = firstAvailableOption ? firstAvailableOption.value : '';
    }

    quantityInput.disabled = !select.value;
    updateSelectedProductInfo();
}

function addToCart() {
    const select = document.getElementById('productSelect');
    const quantityInput = document.getElementById('quantity');
    if (!select || !quantityInput || !select.value) {
        alert('Please add a product first.');
        return;
    }

    const productId = Number(select.value);
    const quantity = Number(quantityInput.value);
    const product = getProductById(productId);
    if (!product) {
        alert('Selected product could not be found.');
        return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        alert('Quantity must be at least 1.');
        quantityInput.focus();
        return;
    }

    const availableStock = getAvailableStock(productId);
    if (quantity > availableStock) {
        alert(`Only ${availableStock} unit(s) of ${product.name} are available.`);
        return;
    }

    const existingItem = cart.find((item) => item.productId === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            productId,
            name: product.name,
            price: product.price,
            quantity
        });
    }

    quantityInput.value = '1';
    renderCurrentPage();
}

function removeCartItem(productId) {
    cart = cart.filter((item) => item.productId !== productId);
    renderCurrentPage();
}

function clearCart() {
    if (cart.length === 0) {
        return;
    }

    cart = [];
    renderCurrentPage();
}

function updateCartDisplay() {
    const cartList = document.getElementById('cartList');
    const totalAmount = document.getElementById('totalAmount');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cartCount = document.getElementById('cartCount');
    if (!cartList || !totalAmount || !emptyCartMessage || !cartCount) {
        return;
    }

    cartList.innerHTML = '';
    let total = 0;
    let itemCount = 0;

    cart.forEach((item) => {
        const lineTotal = item.price * item.quantity;
        total += lineTotal;
        itemCount += item.quantity;

        const listItem = document.createElement('li');
        listItem.className = 'cart-item';

        const details = document.createElement('div');
        details.innerHTML = `<strong>${item.name}</strong><p>Quantity: ${item.quantity}</p><p>Line Total: R${formatCurrency(lineTotal)}</p>`;

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'secondary-button';
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => removeCartItem(item.productId));

        listItem.appendChild(details);
        listItem.appendChild(removeButton);
        cartList.appendChild(listItem);
    });

    totalAmount.textContent = formatCurrency(total);
    cartCount.textContent = `${itemCount} item${itemCount === 1 ? '' : 's'}`;
    emptyCartMessage.hidden = cart.length !== 0;
    updatePosControlsState();
}

function completeSale() {
    if (cart.length === 0) {
        alert('Cart is empty. Add items before completing the sale.');
        return;
    }

    const hasInsufficientStock = cart.some((item) => item.quantity > (getProductById(item.productId)?.stock || 0));
    if (hasInsufficientStock) {
        alert('One or more items in the cart no longer have enough stock.');
        renderCurrentPage();
        return;
    }

    cart.forEach((item) => {
        const product = getProductById(item.productId);
        if (product) {
            product.stock -= item.quantity;
        }
    });

    const sale = {
        date: getTodayDate(),
        timestamp: new Date().toISOString(),
        items: cart.map((item) => ({ ...item })),
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };

    sales.push(sale);
    saveData();
    cart = [];
    renderCurrentPage();
    alert('Sale completed!');
}

function getFilteredStockProducts() {
    const searchValue = (document.getElementById('stockSearchInput')?.value || '').trim().toLowerCase();
    const lowStockOnly = document.getElementById('lowStockOnlyToggle')?.checked || false;

    return products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchValue);
        const matchesLowStock = !lowStockOnly || product.stock < 10;
        return matchesSearch && matchesLowStock;
    });
}

function displayStock() {
    const tableBody = document.querySelector('#stockTable tbody');
    const emptyMessage = document.getElementById('stockEmptyMessage');
    if (!tableBody || !emptyMessage) {
        return;
    }

    const filteredProducts = getFilteredStockProducts();
    tableBody.innerHTML = '';

    filteredProducts.forEach((product) => {
        const row = document.createElement('tr');
        const alertText = product.stock < 10 ? '⚠️ Low stock' : 'OK';
        const alertClass = product.stock < 10 ? 'alert-low' : 'alert-ok';

        row.innerHTML = `
            <td>${product.name}</td>
            <td>R${formatCurrency(product.price)}</td>
            <td>${product.stock}</td>
            <td class="${alertClass}">${alertText}</td>
        `;

        tableBody.appendChild(row);
    });

    emptyMessage.hidden = filteredProducts.length !== 0;
}

function displayReport() {
    const todayDate = document.getElementById('todayDate');
    const salesList = document.getElementById('salesList');
    const dailyTotal = document.getElementById('dailyTotal');
    const salesCount = document.getElementById('salesCount');
    const emptySalesMessage = document.getElementById('emptySalesMessage');
    if (!todayDate || !salesList || !dailyTotal || !salesCount || !emptySalesMessage) {
        return;
    }

    const todaySales = getTodaySales();
    let totalForDay = 0;

    todayDate.textContent = getTodayDate();
    salesList.innerHTML = '';

    todaySales.forEach((sale) => {
        totalForDay += sale.total;

        const saleCard = document.createElement('article');
        saleCard.className = 'sale-item';

        const itemLines = sale.items
            .map((item) => `${item.name} x ${item.quantity} = R${formatCurrency(item.price * item.quantity)}`)
            .join('<br>');

        saleCard.innerHTML = `
            <strong>${new Date(sale.timestamp || `${sale.date}T00:00:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
            <p>${itemLines}</p>
            <p><strong>Total: R${formatCurrency(sale.total)}</strong></p>
        `;

        salesList.appendChild(saleCard);
    });

    dailyTotal.textContent = formatCurrency(totalForDay);
    salesCount.textContent = `${todaySales.length} sale${todaySales.length === 1 ? '' : 's'}`;
    emptySalesMessage.hidden = todaySales.length !== 0;
}

function clearReport() {
    const today = getTodayDate();
    const hasTodaySales = sales.some((sale) => sale.date === today);

    if (!hasTodaySales) {
        alert('There are no sales for today to clear.');
        return;
    }

    if (!confirm('Clear today\'s report? This will remove all sales recorded for today.')) {
        return;
    }

    sales = sales.filter((sale) => sale.date !== today);
    saveData();
    renderCurrentPage();
}

function getFilteredProducts() {
    const searchValue = (document.getElementById('productSearchInput')?.value || '').trim().toLowerCase();
    return products.filter((product) => product.name.toLowerCase().includes(searchValue));
}

function displayProducts() {
    const tableBody = document.querySelector('#productTable tbody');
    const productCount = document.getElementById('productCount');
    const emptyMessage = document.getElementById('productEmptyMessage');
    if (!tableBody || !productCount || !emptyMessage) {
        return;
    }

    const filteredProducts = getFilteredProducts();
    tableBody.innerHTML = '';
    productCount.textContent = `${products.length} product${products.length === 1 ? '' : 's'}`;

    filteredProducts.forEach((product) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${product.name}</td>
            <td>R${formatCurrency(product.price)}</td>
            <td>${product.stock}</td>
            <td></td>
        `;

        const actionCell = row.lastElementChild;
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'secondary-button';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteProduct(product.id));

        actionCell.appendChild(deleteButton);
        row.className = product.stock < 10 ? 'danger-zone' : '';
        tableBody.appendChild(row);
    });

    emptyMessage.hidden = filteredProducts.length !== 0;
}

function addProduct() {
    const nameInput = document.getElementById('newProductName');
    const priceInput = document.getElementById('newProductPrice');
    const stockInput = document.getElementById('newProductStock');
    if (!nameInput || !priceInput || !stockInput) {
        return;
    }

    const name = nameInput.value.trim();
    const price = Number(priceInput.value);
    const stock = Number(stockInput.value);

    if (!name || Number.isNaN(price) || Number.isNaN(stock)) {
        alert('Please complete all product fields.');
        return;
    }

    if (price <= 0 || stock < 0 || !Number.isInteger(stock)) {
        alert('Enter a valid price and whole number stock value.');
        return;
    }

    const duplicate = products.some((product) => product.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
        alert('A product with that name already exists.');
        return;
    }

    const newId = products.length > 0 ? Math.max(...products.map((product) => product.id)) + 1 : 1;
    products.push({ id: newId, name, price, stock });
    saveData();
    nameInput.value = '';
    priceInput.value = '';
    stockInput.value = '';
    renderCurrentPage();
}

function deleteProduct(productId) {
    const product = getProductById(productId);
    if (!product) {
        return;
    }

    if (!confirm(`Delete ${product.name}?`)) {
        return;
    }

    products = products.filter((item) => item.id !== productId);
    cart = cart.filter((item) => item.productId !== productId);
    saveData();
    renderCurrentPage();
}

function renderCurrentPage() {
    renderDashboardSummary();

    switch (getCurrentPage()) {
        case 'pos':
            populateProductSelect();
            updateCartDisplay();
            break;
        case 'stock':
            displayStock();
            break;
        case 'reports':
            displayReport();
            break;
        case 'products':
            displayProducts();
            break;
        default:
            break;
    }
}

function initializePosPage() {
    document.getElementById('addToCartButton')?.addEventListener('click', addToCart);
    document.getElementById('completeSaleButton')?.addEventListener('click', completeSale);
    document.getElementById('clearCartButton')?.addEventListener('click', clearCart);
    document.getElementById('productSelect')?.addEventListener('change', updateSelectedProductInfo);
}

function initializeStockPage() {
    document.getElementById('stockSearchInput')?.addEventListener('input', displayStock);
    document.getElementById('lowStockOnlyToggle')?.addEventListener('change', displayStock);
}

function initializeReportsPage() {
    document.getElementById('clearReportButton')?.addEventListener('click', clearReport);
}

function initializeProductsPage() {
    document.getElementById('productSearchInput')?.addEventListener('input', displayProducts);
    document.getElementById('productForm')?.addEventListener('submit', (event) => {
        event.preventDefault();
        addProduct();
    });
}

function initializePage() {
    loadData();

    switch (getCurrentPage()) {
        case 'pos':
            initializePosPage();
            break;
        case 'stock':
            initializeStockPage();
            break;
        case 'reports':
            initializeReportsPage();
            break;
        case 'products':
            initializeProductsPage();
            break;
        default:
            break;
    }

    renderCurrentPage();
}

window.addEventListener('storage', () => {
    loadData();
    renderCurrentPage();
});

document.addEventListener('DOMContentLoaded', initializePage);