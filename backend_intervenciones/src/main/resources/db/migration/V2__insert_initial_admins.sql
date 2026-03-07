-- Insertar Usuario 1
INSERT INTO user (name, lastname, username, email, password, role, active)
VALUES ('Valentino', 'Longo', 'Valen', 'Pichilongo1@gmail.com', '$2a$10$6A45K7Kd3qmrdgS1A2iXte3TgfXQK/2GBpX2zapxYD4EqTR.JmbwO', 'ADMIN', 1);
-- Asociarlo a la tabla admins (LAST_INSERT_ID() toma el ID generado arriba)
INSERT INTO admins (user_id) VALUES (LAST_INSERT_ID());

-- Insertar Usuario 2
INSERT INTO user (name, lastname, username, email, password, role, active)
VALUES ('Claudia', 'Benestante', 'Claudia', 'admin2@escuela.com', '$2a$10$F8RZWO3aI/AD5yjAFI5TZe4Vfj..g4MKvRSzfmDXwOc82BP4Br5CC', 'ADMIN', 1);
INSERT INTO admins (user_id) VALUES (LAST_INSERT_ID());

-- Insertar Usuario 3
INSERT INTO user (name, lastname, username, email, password, role, active)
VALUES ('Valeria', 'Perez', 'Valeria', 'admin3@escuela.com', '$2a$10$YfAUCL5Xnkm.dnLpBQ8kkO7fFs4tpaDX7mOovtINWd1oWtMMWv20W', 'ADMIN', 1);
INSERT INTO admins (user_id) VALUES (LAST_INSERT_ID());