function getOrders() {
    fetch(`${ORDERS_API}/api/orders`, { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            var listBody = document.querySelector('#order-list tbody');
            listBody.innerHTML = '';
            data.forEach(order => {
                var row = document.createElement('tr');

                var idCell = document.createElement('td');
                idCell.textContent = order.id;
                row.appendChild(idCell);

                var userCell = document.createElement('td');
                userCell.textContent = order.user_name;
                row.appendChild(userCell);

                var totalCell = document.createElement('td');
                totalCell.textContent = order.total;
                row.appendChild(totalCell);

                var statusCell = document.createElement('td');
                statusCell.textContent = order.status;
                row.appendChild(statusCell);

                var dateCell = document.createElement('td');
                dateCell.textContent = order.created_at;
                row.appendChild(dateCell);

                var detailCell = document.createElement('td');
                var detailLink = document.createElement('a');
                detailLink.href = '#';
                detailLink.textContent = 'Ver detalle';
                detailLink.addEventListener('click', function() {
                    showOrderDetail(order.id);
                });
                detailCell.appendChild(detailLink);
                row.appendChild(detailCell);

                listBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error:', error));
}

function showOrderDetail(orderId) {
    fetch(`${ORDERS_API}/api/orders/${orderId}`, { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            var items = data.items.map(item =>
                `Producto ${item.product_id} x${item.quantity} = $${item.subtotal}`
            ).join('\n');
            alert(`Orden #${data.id}\nUsuario: ${data.user_name}\nTotal: $${data.total}\n\nItems:\n${items}`);
        })
        .catch(error => console.error('Error:', error));
}

function showOrderDetailById() {
    var orderId = document.getElementById('order-detail-id').value;
    var resultEl = document.getElementById('order-detail-result');

    fetch(`${ORDERS_API}/api/orders/${orderId}`, { credentials: 'include' })
        .then(response => {
            return response.json().then(body => ({ status: response.status, body }));
        })
        .then(({ status, body }) => {
            if (status === 200) {
                var itemsText = body.items.map(item =>
                    `  - Producto ${item.product_id} x${item.quantity} = $${item.subtotal}`
                ).join('\n');
                resultEl.style.color = 'black';
                resultEl.textContent =
                    `Orden #${body.id}\n` +
                    `Usuario: ${body.user_name}\n` +
                    `Email: ${body.user_email}\n` +
                    `Total: $${body.total}\n` +
                    `Estado: ${body.status}\n` +
                    `Fecha: ${body.created_at}\n\n` +
                    `Items:\n${itemsText}`;
            } else {
                resultEl.style.color = 'red';
                resultEl.textContent = `Error (${status}): ${body.message}`;
            }
        })
        .catch(error => {
            resultEl.style.color = 'red';
            resultEl.textContent = 'Error de conexión con el servicio de órdenes';
            console.error('Error:', error);
        });
}
