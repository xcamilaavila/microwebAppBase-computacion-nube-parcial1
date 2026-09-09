from flask import Blueprint, request, jsonify, session
from orders.models.order_model import Order, OrderItem
from db.db import db
import requests
import os

order_controller = Blueprint('order_controller', __name__)

CONSUL_URL = os.environ.get('CONSUL_URL', 'http://consul:8500')


def discover_products_service():
    """Consulta a Consul para descubrir dinámicamente la dirección del servicio de productos."""
    response = requests.get(f"{CONSUL_URL}/v1/health/service/microproducts?passing", timeout=3)
    response.raise_for_status()
    instances = response.json()

    if not instances:
        raise Exception("No hay instancias saludables de microproducts disponibles en Consul")

    service = instances[0]['Service']
    address = service['Address']
    port = service['Port']
    url = f"http://{address}:{port}"
    print(f"[Consul] Descubrimiento dinámico: microproducts resuelto en {url}")
    return url


@order_controller.route('/api/orders', methods=['GET'])
def get_all_orders():
    user_name = session.get('username')
    if not user_name:
        return jsonify({'message': 'Información de usuario inválida'}), 401

    orders = Order.query.filter_by(user_name=user_name).all()
    result = [{
        'id': o.id,
        'user_name': o.user_name,
        'user_email': o.user_email,
        'total': o.total,
        'status': o.status,
        'created_at': o.created_at.isoformat()
    } for o in orders]
    return jsonify(result)


@order_controller.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    user_name = session.get('username')
    if not user_name:
        return jsonify({'message': 'Información de usuario inválida'}), 401

    order = Order.query.get_or_404(order_id)
    if order.user_name != user_name:
        return jsonify({'message': 'Orden no encontrada'}), 404

    items = [{
        'id': item.id,
        'product_id': item.product_id,
        'quantity': item.quantity,
        'unit_price': item.unit_price,
        'subtotal': item.subtotal
    } for item in order.items]

    return jsonify({
        'id': order.id,
        'user_name': order.user_name,
        'user_email': order.user_email,
        'total': order.total,
        'status': order.status,
        'created_at': order.created_at.isoformat(),
        'items': items
    })


@order_controller.route('/api/orders', methods=['POST'])
def create_order():
    data = request.get_json()

    user_name = session.get('username')
    user_email = session.get('email')
    if not user_name or not user_email:
        return jsonify({'message': 'Información de usuario inválida'}), 401

    products = data.get('products')
    if not products or not isinstance(products, list):
        return jsonify({'message': 'Información de productos inválida'}), 400

    for p in products:
        if 'product_id' not in p or 'quantity' not in p or p['quantity'] <= 0:
            return jsonify({'message': 'Información de productos inválida'}), 400

    try:
        products_service_url = discover_products_service()
    except Exception:
        return jsonify({'message': 'Servicio de productos no disponible'}), 500

    order_lines = []
    for p in products:
        try:
            resp = requests.get(f"{products_service_url}/api/productos/{p['product_id']}") # Consulta a microProducts el precio y stock del producto
        except requests.exceptions.RequestException:
            return jsonify({'message': 'Servicio de productos no disponible'}), 500
        if resp.status_code == 404:
            return jsonify({'message': f"Producto {p['product_id']} no existe"}), 404
        if resp.status_code != 200:
            return jsonify({'message': 'Error al consultar el servicio de productos'}), 500

        product = resp.json()

        if product['stock'] < p['quantity']:
            return jsonify({'message': f"Inventario insuficiente para el producto {p['product_id']}"}), 409

        order_lines.append({
            'product_id': p['product_id'],
            'quantity': p['quantity'],
            'unit_price': product['precio'],
            'subtotal': product['precio'] * p['quantity'],
            'current_stock': product['stock'],
            'nombre': product['nombre'],
            'descripcion': product['descripcion']
        })

    total = sum(line['subtotal'] for line in order_lines)

    for line in order_lines:
        new_stock = line['current_stock'] - line['quantity']
        update_resp = requests.put(
            f"{products_service_url}/api/productos/{line['product_id']}",
            json={
                'nombre': line['nombre'],
                'descripcion': line['descripcion'],
                'precio': line['unit_price'],
                'stock': new_stock
            }
        )
        if update_resp.status_code != 200:
            return jsonify({'message': 'Error al actualizar el inventario'}), 500

    new_order = Order(user_name=user_name, user_email=user_email, total=total, status='confirmed')
    db.session.add(new_order)
    db.session.flush()

    for line in order_lines:
        item = OrderItem(
            order_id=new_order.id,
            product_id=line['product_id'],
            quantity=line['quantity'],
            unit_price=line['unit_price'],
            subtotal=line['subtotal']
        )
        db.session.add(item)

    db.session.commit()

    return jsonify({'message': 'Orden creada exitosamente', 'order_id': new_order.id}), 201
