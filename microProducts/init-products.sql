USE products_db;

CREATE TABLE productos (
    id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre varchar(150) NOT NULL,
    descripcion varchar(255),
    precio float NOT NULL,
    stock int NOT NULL DEFAULT 0
);

INSERT INTO productos (nombre, descripcion, precio, stock) VALUES
    ("Laptop", "Laptop de 15 pulgadas", 1500.00, 10),
    ("Mouse", "Mouse inalámbrico", 25.50, 50);
