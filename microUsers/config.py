import os

class Config:
    MYSQL_HOST = 'users_db'
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = os.environ.get('MYSQL_ROOT_PASSWORD')
    MYSQL_DB = 'users_db'
    SQLALCHEMY_DATABASE_URI = f'mysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}'

