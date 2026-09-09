function getProducts() {
    fetch(`${PRODUCTS_API}/api/productos`)
        .then(response => response.json())
        .then(data => {
            var listBody = document.querySelector('#product-list tbody');
            listBody.innerHTML = '';
            data.forEach(p => {
                var row = document.createElement('tr');
                var nombreCell = document.createElement('td');
                nombreCell.textContent = p.nombre;
                row.appendChild(nombreCell);
                var descCell = document.createElement('td');
                descCell.textContent = p.descripcion;
                row.appendChild(descCell);
                var precioCell = document.createElement('td');
                precioCell.textContent = p.precio;
                row.appendChild(precioCell);
                var stockCell = document.createElement('td');
                stockCell.textContent = p.stock;
                row.appendChild(stockCell);
                var actionsCell = document.createElement('td');
                var editLink = document.createElement('a');
                editLink.href = `/editProduct/${p.id}`;
                editLink.textContent = 'Edit';
                editLink.className = 'btn btn-primary mr-2';
                actionsCell.appendChild(editLink);
                var deleteLink = document.createElement('a');
                deleteLink.href = '#';
                deleteLink.textContent = 'Delete';
                deleteLink.className = 'btn btn-danger mr-2';
                deleteLink.addEventListener('click', function() {
                    deleteProduct(p.id);
                });
                actionsCell.appendChild(deleteLink);
                var buyButton = document.createElement('button');
                buyButton.textContent = 'Comprar';
                buyButton.className = 'btn btn-success';
                buyButton.type = 'button';
                buyButton.addEventListener('click', function() {
                    buyProduct(p.id, p.nombre);
                });
                actionsCell.appendChild(buyButton);
                row.appendChild(actionsCell);
                listBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error:', error));
}

function searchProductById() {
    var productId = document.getElementById('search-product-id').value;
    var resultEl = document.getElementById('search-result');

    fetch(`${PRODUCTS_API}/api/productos/${productId}`)
        .then(response => {
            return response.json().then(body => ({ status: response.status, body }));
        })
        .then(({ status, body }) => {
            if (status === 200) {
                resultEl.style.color = 'black';
                resultEl.textContent =
                    `ID: ${body.id}\n` +
                    `Nombre: ${body.nombre}\n` +
                    `Descripción: ${body.descripcion}\n` +
                    `Precio: $${body.precio}\n` +
                    `Stock: ${body.stock}`;
            } else {
                resultEl.style.color = 'red';
                resultEl.textContent = `No se encontró el producto con ID ${productId}`;
            }
        })
        .catch(error => {
            resultEl.style.color = 'red';
            resultEl.textContent = 'Error de conexión';
            console.error('Error:', error);
        });
}

function buyProduct(productId, productName) {
    var quantity = prompt(`¿Cuántas unidades de "${productName}" quieres comprar?`, "1");
    if (quantity === null) return;

    quantity = parseInt(quantity);
    if (isNaN(quantity) || quantity <= 0) {
        alert('Cantidad inválida');
        return;
    }

    fetch(`${ORDERS_API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ products: [{ product_id: productId, quantity: quantity }] }),
    })
    .then(response => {
        return response.json().then(body => ({ status: response.status, body }));
    })
    .then(({ status, body }) => {
        if (status === 201) {
            alert(`¡Compra exitosa! Orden #${body.order_id}`);
            getProducts();
        } else {
            alert(`Error: ${body.message}`);
        }
    })
    .catch(error => console.error('Error:', error));
}

function addCartRow() {
    var tbody = document.querySelector('#cart-table tbody');
    var row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="number" class="form-control cart-product-id"></td>
        <td><input type="number" class="form-control cart-quantity" value="1"></td>
        <td><button type="button" class="btn btn-danger btn-sm" onclick="removeCartRow(this)">X</button></td>
    `;
    tbody.appendChild(row);
}

function removeCartRow(button) {
    var row = button.closest('tr');
    var tbody = document.querySelector('#cart-table tbody');
    if (tbody.rows.length > 1) {
        row.remove();
    }
}

function buyCart() {
    var messageEl = document.getElementById('buy-message');
    var rows = document.querySelectorAll('#cart-table tbody tr');
    var products = [];

    rows.forEach(row => {
        var productId = parseInt(row.querySelector('.cart-product-id').value);
        var quantity = parseInt(row.querySelector('.cart-quantity').value);
        if (!isNaN(productId) && !isNaN(quantity)) {
            products.push({ product_id: productId, quantity: quantity });
        }
    });

    if (products.length === 0) {
        messageEl.style.color = 'red';
        messageEl.textContent = 'Agrega al menos un producto';
        return;
    }

    fetch(`${ORDERS_API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ products: products }),
    })
    .then(response => {
        return response.json().then(body => ({ status: response.status, body }));
    })
    .then(({ status, body }) => {
        if (status === 201) {
            messageEl.style.color = 'green';
            messageEl.textContent = `Éxito (${status}): Orden #${body.order_id} creada correctamente con ${products.length} producto(s)`;
            getProducts();
        } else {
            messageEl.style.color = 'red';
            messageEl.textContent = `Error (${status}): ${body.message}`;
        }
    })
    .catch(error => {
        messageEl.style.color = 'red';
        messageEl.textContent = 'Error de conexión con el servicio de órdenes';
        console.error('Error:', error);
    });
}

function createProduct() {
    var data = {
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        precio: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value)
    };
    fetch(`${PRODUCTS_API}/api/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}

function updateProduct() {
    var productId = document.getElementById('product-id').value;
    var data = {
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        precio: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value)
    };
    fetch(`${PRODUCTS_API}/api/productos/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        fetch(`${PRODUCTS_API}/api/productos/${productId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            console.log('Product deleted:', data);
            getProducts();
        })
        .catch(error => console.error('Error:', error));
    }
}
