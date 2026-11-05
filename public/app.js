const productsBody = document.querySelector('#products-body');
const searchInput = document.querySelector('#search-input');
const productDialog = document.querySelector('#product-dialog');
const productForm = document.querySelector('#product-form');
const dialogError = document.querySelector('#dialog-error');
const saveButton = document.querySelector('#save-button');

let products = [];

const currency = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
});

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast${isError ? ' error' : ''}`;
    toast.textContent = message;
    document.querySelector('#toast-region').append(toast);
    window.setTimeout(() => toast.remove(), 3600);
}

async function requestApi(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...options.headers
        }
    });
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
        ? await response.json()
        : null;

    if (!response.ok) {
        throw new Error(body?.error || `Error al comunicarse con el servidor (${response.status})`);
    }

    return body;
}

function updateSummary() {
    const totalStock = products.reduce((sum, product) => sum + Number(product.stock), 0);
    const totalValue = products.reduce((sum, product) => sum + Number(product.precio) * Number(product.stock), 0);

    document.querySelector('#total-products').textContent = products.length.toLocaleString('es-PE');
    document.querySelector('#total-stock').textContent = totalStock.toLocaleString('es-PE');
    document.querySelector('#inventory-value').textContent = currency.format(totalValue);
}

function updateConnectionStatus(isConnected) {
    const statusDot = document.querySelector('#database-status-dot');
    const syncDot = document.querySelector('#sync-status-dot');
    statusDot.classList.toggle('disconnected', !isConnected);
    syncDot.classList.toggle('disconnected', !isConnected);
    document.querySelector('#database-status-label').textContent = isConnected
        ? 'Base de datos conectada'
        : 'Base de datos desconectada';
    document.querySelector('#sync-status-label').textContent = isConnected
        ? 'Datos sincronizados con tu base de datos'
        : 'Sin conexión con la base de datos';
}

function filteredProducts() {
    const query = searchInput.value.trim().toLocaleLowerCase('es');
    return products.filter((product) => String(product.nombre).toLocaleLowerCase('es').includes(query));
}

function renderProducts() {
    const visibleProducts = filteredProducts();
    document.querySelector('#visible-count').textContent = visibleProducts.length;
    document.querySelector('#table-summary').textContent = visibleProducts.length === products.length
        ? `${products.length} ${products.length === 1 ? 'producto' : 'productos'} en total`
        : `${visibleProducts.length} de ${products.length} productos`;

    if (visibleProducts.length === 0) {
        const hasSearch = searchInput.value.trim().length > 0;
        productsBody.innerHTML = `<tr><td class="empty-cell" colspan="6"><div class="empty-state"><strong>${hasSearch ? 'No encontramos resultados' : 'Tu inventario está vacío'}</strong><span>${hasSearch ? 'Prueba con otro nombre.' : 'Agrega tu primer producto para comenzar.'}</span></div></td></tr>`;
        return;
    }

    productsBody.innerHTML = visibleProducts.map((product, index) => {
        const stock = Number(product.stock);
        const stockClass = stock === 0 ? 'out' : stock <= 5 ? 'low' : '';
        const stockLabel = stock === 0 ? 'Agotado' : stock <= 5 ? 'Stock bajo' : 'Disponible';
        const initial = escapeHtml(String(product.nombre).trim().charAt(0).toUpperCase());

        return `
            <tr>
                <td><div class="product-name-cell"><span class="product-thumb tone-${index % 4}">${initial}</span><span>${escapeHtml(product.nombre)}</span></div></td>
                <td class="product-id">#${escapeHtml(product.id)}</td>
                <td class="product-price">${currency.format(Number(product.precio))}</td>
                <td>${stock.toLocaleString('es-PE')} ${stock === 1 ? 'unidad' : 'unidades'}</td>
                <td><span class="stock-badge ${stockClass}">${stockLabel}</span></td>
                <td><div class="action-group">
                    <button class="icon-button edit" type="button" data-action="edit" data-id="${escapeHtml(product.id)}" aria-label="Editar ${escapeHtml(product.nombre)}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m14 5 5 5M4 20l4.3-.9L19 8.4a2.1 2.1 0 0 0-3-3L5.3 16.1 4 20Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                    <button class="icon-button delete" type="button" data-action="delete" data-id="${escapeHtml(product.id)}" aria-label="Eliminar ${escapeHtml(product.nombre)}"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                </div></td>
            </tr>`;
    }).join('');
}

async function loadProducts() {
    productsBody.innerHTML = '<tr><td class="loading-cell" colspan="6"><span class="loader"></span> Cargando inventario...</td></tr>';

    try {
        const response = await requestApi('/api/productos');
        products = Array.isArray(response.data) ? response.data : [];
        updateConnectionStatus(true);
        updateSummary();
        renderProducts();
    } catch (error) {
        products = [];
        updateConnectionStatus(false);
        updateSummary();
        productsBody.innerHTML = `<tr><td class="empty-cell" colspan="6"><div class="empty-state"><strong>No se pudo cargar el inventario</strong><span>${escapeHtml(error.message)}. Verifica la conexión con MySQL.</span></div></td></tr>`;
        document.querySelector('#visible-count').textContent = '0';
        document.querySelector('#table-summary').textContent = 'Error de conexión';
    }
}

function openCreateDialog() {
    productForm.reset();
    document.querySelector('#product-id').value = '';
    document.querySelector('#dialog-title').innerHTML = 'Nuevo producto<span class="heading-period">.</span>';
    document.querySelector('#dialog-description').textContent = 'Completa los datos para agregarlo al inventario.';
    saveButton.textContent = 'Guardar producto';
    dialogError.hidden = true;
    productDialog.showModal();
    document.querySelector('#product-name').focus();
}

function openEditDialog(product) {
    productForm.reset();
    document.querySelector('#product-id').value = product.id;
    document.querySelector('#product-name').value = product.nombre;
    document.querySelector('#product-price').value = product.precio;
    document.querySelector('#product-stock').value = product.stock;
    document.querySelector('#dialog-title').innerHTML = 'Editar producto<span class="heading-period">.</span>';
    document.querySelector('#dialog-description').textContent = 'Actualiza los datos de este producto.';
    saveButton.textContent = 'Guardar cambios';
    dialogError.hidden = true;
    productDialog.showModal();
    document.querySelector('#product-name').focus();
}

document.querySelector('#today-label').textContent = new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
}).format(new Date());

document.querySelector('#add-product-button').addEventListener('click', openCreateDialog);
document.querySelector('#close-dialog-button').addEventListener('click', () => productDialog.close());
document.querySelector('#cancel-button').addEventListener('click', () => productDialog.close());
document.querySelector('#refresh-button').addEventListener('click', loadProducts);
searchInput.addEventListener('input', renderProducts);

document.addEventListener('keydown', (event) => {
    if (event.key === '/' && !productDialog.open && document.activeElement.tagName !== 'INPUT') {
        event.preventDefault();
        searchInput.focus();
    }
});

productsBody.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const product = products.find((item) => String(item.id) === button.dataset.id);
    if (!product) return;

    if (button.dataset.action === 'edit') {
        openEditDialog(product);
        return;
    }

    if (!window.confirm(`¿Eliminar "${product.nombre}" del inventario?`)) return;

    try {
        await requestApi(`/api/productos/${encodeURIComponent(product.id)}`, { method: 'DELETE' });
        showToast('Producto eliminado correctamente.');
        await loadProducts();
    } catch (error) {
        showToast(error.message, true);
    }
});

productForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    dialogError.hidden = true;

    const id = document.querySelector('#product-id').value;
    const payload = {
        nombre: document.querySelector('#product-name').value.trim(),
        precio: Number(document.querySelector('#product-price').value),
        stock: Number(document.querySelector('#product-stock').value)
    };

    saveButton.disabled = true;
    saveButton.textContent = 'Guardando...';

    try {
        await requestApi(id ? `/api/productos/${encodeURIComponent(id)}` : '/api/productos', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(payload)
        });
        productDialog.close();
        showToast(id ? 'Cambios guardados correctamente.' : 'Producto agregado correctamente.');
        await loadProducts();
    } catch (error) {
        dialogError.textContent = error.message;
        dialogError.hidden = false;
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = id ? 'Guardar cambios' : 'Guardar producto';
    }
});

loadProducts();
