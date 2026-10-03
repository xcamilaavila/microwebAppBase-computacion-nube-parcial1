from flask import Flask
from orders.controllers.order_controller import order_controller
from db.db import db
from flask_cors import CORS
import os
import requests
import atexit

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY')
app.config.from_object('config.Config')
db.init_app(app)

app.register_blueprint(order_controller)
CORS(app, supports_credentials=True)

SERVICE_NAME = 'microorders'
SERVICE_PORT = int(os.environ.get('PORT', 5004))
CONSUL_URL = os.environ.get('CONSUL_URL', 'http://consul:8500')


@app.route('/healthcheck')
def health_check():
    return '', 200


@app.route('/health')
def health():
    return '', 200


def register_service():
    try:
        requests.put(f"{CONSUL_URL}/v1/agent/service/register", json={
            "ID": SERVICE_NAME,
            "Name": SERVICE_NAME,
            "Address": SERVICE_NAME,
            "Port": SERVICE_PORT,
            "Check": {
                "HTTP": f"http://{SERVICE_NAME}:{SERVICE_PORT}/health",
                "Interval": "10s",
                "Timeout": "5s"
            }
        })
        print(f"Servicio {SERVICE_NAME} registrado en Consul")
    except requests.exceptions.RequestException as e:
        print(f"No se pudo registrar en Consul: {e}")


def deregister_service():
    try:
        requests.put(f"{CONSUL_URL}/v1/agent/service/deregister/{SERVICE_NAME}")
        print(f"Servicio {SERVICE_NAME} de-registrado de Consul")
    except requests.exceptions.RequestException:
        pass


register_service()
atexit.register(deregister_service)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=SERVICE_PORT)
