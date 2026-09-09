import os

class Config:
    MYSQL_HOST = 'orders_db'
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = os.environ.get('MYSQL_ROOT_PASSWORD')
    MYSQL_DB = 'orders_db'
    SQLALCHEMY_DATABASE_URI = f'mysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}'
