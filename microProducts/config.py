import os

class Config:
    MYSQL_HOST = 'products_db'
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = os.environ.get('MYSQL_ROOT_PASSWORD')
    MYSQL_DB = 'products_db'
    SQLALCHEMY_DATABASE_URI = f'mysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}'
