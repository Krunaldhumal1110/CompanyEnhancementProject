CREATE TABLE machine (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    status VARCHAR(50),
    completed BOOLEAN,
    master_card_info VARCHAR(255),
    electric_drawing_path VARCHAR(255),
    machine_no VARCHAR(50),
    model VARCHAR(255),
    product_no VARCHAR(50),
    block_no INT
);
