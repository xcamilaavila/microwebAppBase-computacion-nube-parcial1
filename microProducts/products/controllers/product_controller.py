from flask import Blueprint, request, jsonify
from products.models.product_model import Products
from db.db import db

product_controller = Blueprint('product_controller', __name__)


@product_controller.route('/api/productos', methods=['GET'])
def get_products():
    print("listado de productos")
    products = Products.query.all()
    result = [
        {
            'id': p.id,
            'nombre': p.nombre,
            'descripcion': p.descripcion,
            'precio': p.precio,
            'stock': p.stock
        } for p in products
    ]
    return jsonify(result)


@product_controller.route('/api/productos/<int:product_id>', methods=['GET'])
def get_product(product_id):
    print("obteniendo producto")
    p = Products.query.get_or_404(product_id)
    return jsonify({
        'id': p.id,
        'nombre': p.nombre,
        'descripcion': p.descripcion,
        'precio': p.precio,
        'stock': p.stock
    })


@product_controller.route('/api/productos', methods=['POST'])
def create_product():
    print("creando producto")
    data = request.json

    if not data.get('nombre') or data.get('precio') is None:
        return jsonify({'message': 'Nombre y precio son obligatorios'}), 400

    new_product = Products(
        nombre=data['nombre'],
        descripcion=data.get('descripcion', ''),
        precio=data['precio'],
        stock=data.get('stock', 0)
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify({'message': 'Producto creado correctamente'}), 201

@product_controller.route('/api/productos/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    print("actualizando producto")
    p = Products.query.get_or_404(product_id)
    data = request.json
    p.nombre = data['nombre']
    p.descripcion = data.get('descripcion', p.descripcion)
    p.precio = data['precio']
    p.stock = data.get('stock', p.stock)
    db.session.commit()
    return jsonify({'message': 'Producto actualizado correctamente'})


@product_controller.route('/api/productos/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    p = Products.query.get_or_404(product_id)
    db.session.delete(p)
    db.session.commit()
    return jsonify({'message': 'Producto eliminado correctamente'})
