-- Insertar Usuario 1
INSERT INTO user (name, lastname, username, email, password, role, active)
VALUES ('Maria José', 'Unno', 'Mariajo', 'lic.mariajoseunno@gmail.com', '$2a$10$CJkZ5eqwUHcDiNL35PW4Z.YsDBnAsrxHBU99t/ew90MK3syVa7t1q', 'ADMIN', 1);
-- Asociarlo a la tabla admins (LAST_INSERT_ID() toma el ID generado arriba)
INSERT INTO admins (user_id) VALUES (LAST_INSERT_ID());

-- Insertar Usuario 2
INSERT INTO user (name, lastname, username, email, password, role, active)
VALUES ('Claudia', 'Benestante', 'Claudia', 'claubenestante@hotmail.com', '$2a$10$RolMu5Tn/mhl.5eUGb75m.MsuINX2d.ZRU.wMYDI/.KTo0a12yKLC', 'ADMIN', 1);
INSERT INTO admins (user_id) VALUES (LAST_INSERT_ID());

-- Insertar Usuario 3
INSERT INTO user (name, lastname, username, email, password, role, active)
VALUES ('Valeria', 'Bachanini', 'Valeria', 'valebachanini@yahoo.com.ar', '$2a$10$EE9zCl2EZ7op6MoeMbbwvOvfdaA91agH5TOTbjKKvig9wBAtq0XLG', 'ADMIN', 1);
INSERT INTO admins (user_id) VALUES (LAST_INSERT_ID());