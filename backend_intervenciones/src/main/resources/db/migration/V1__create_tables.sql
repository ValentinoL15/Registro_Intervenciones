-- 1. Creación de Tablas
CREATE TABLE user (
    active BIT NOT NULL,
    user_id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255),
    lastname VARCHAR(255),
    name VARCHAR(255),
    password VARCHAR(255),
    username VARCHAR(255),
    role ENUM ('ADMIN','COCINERO','MANTENIMIENTO','NUTRICIONISTA','PROFESIONAL','TECNICO'),
    PRIMARY KEY (user_id),
    CONSTRAINT UKob8kqyqqgmefl0aco34akdtpe UNIQUE (email),
    CONSTRAINT UKsb8bbouer5wak8vyiiy4pf2bx UNIQUE (username)
) ENGINE=InnoDB;

CREATE TABLE admins (
    user_id BIGINT NOT NULL,
    PRIMARY KEY (user_id)
) ENGINE=InnoDB;

CREATE TABLE change_password (
    revoked BIT NOT NULL,
    expiry_date DATETIME(6) NOT NULL,
    id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT UKcbp0wtdni7xancn1kkjncrrpd UNIQUE (token)
) ENGINE=InnoDB;

CREATE TABLE menu_dia (
    fecha DATE,
    cocinero_id BIGINT,
    menu_id BIGINT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (menu_id)
) ENGINE=InnoDB;

CREATE TABLE cocina (
    id BIGINT NOT NULL AUTO_INCREMENT,
    menu_dia_id BIGINT,
    description TEXT,
    tipo_comida ENUM ('CELIACO','NOCELIACO'),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE cocineros (
    user_id BIGINT NOT NULL,
    hourly VARCHAR(255),
    PRIMARY KEY (user_id)
) ENGINE=InnoDB;

CREATE TABLE profesionales (
    user_id BIGINT NOT NULL,
    degree VARCHAR(255),
    hourly VARCHAR(255),
    PRIMARY KEY (user_id)
) ENGINE=InnoDB;

CREATE TABLE disponibilidad_profesional (
    user_id BIGINT NOT NULL,
    dia ENUM ('JUEVES','LUNES','MARTES','MIÉRCOLES','VIERNES'),
    turno ENUM ('MAÑANA','TARDE')
) ENGINE=InnoDB;

CREATE TABLE email_verification (
    revoked BIT NOT NULL,
    expiry_date DATETIME(6),
    id_verification BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT,
    token VARCHAR(255) NOT NULL,
    PRIMARY KEY (id_verification),
    CONSTRAINT UKbo9diaxcddcqe31jh5xpk6rr4 UNIQUE (token)
) ENGINE=InnoDB;

CREATE TABLE empleado (
    user_id BIGINT NOT NULL,
    hourly VARCHAR(255),
    PRIMARY KEY (user_id)
) ENGINE=InnoDB;

CREATE TABLE nutricionista (
    user_id BIGINT NOT NULL,
    hourly VARCHAR(255),
    PRIMARY KEY (user_id)
) ENGINE=InnoDB;

CREATE TABLE tecnico2 (
    user_id BIGINT NOT NULL,
    degree VARCHAR(255),
    hourly VARCHAR(255),
    PRIMARY KEY (user_id)
) ENGINE=InnoDB;

CREATE TABLE horarios_asistencia (
    fin TIME(0),
    inicio TIME(0),
    id BIGINT NOT NULL AUTO_INCREMENT,
    nutricionista_id BIGINT,
    tecnico_id BIGINT,
    dia ENUM ('JUEVES','LUNES','MARTES','MIÉRCOLES','VIERNES'),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE intervencion (
    intervencion TINYINT,
    tipo TINYINT,
    creador_id BIGINT,
    fecha DATETIME(6),
    intervencion_id BIGINT NOT NULL AUTO_INCREMENT,
    hora VARCHAR(255),
    motivo VARCHAR(255),
    nombre VARCHAR(255),
    observaciones VARCHAR(255),
    PRIMARY KEY (intervencion_id)
) ENGINE=InnoDB;

CREATE TABLE mantenimiento (
    fecha DATE,
    empleado_id BIGINT,
    mantenimiento_id BIGINT NOT NULL AUTO_INCREMENT,
    description VARCHAR(255),
    PRIMARY KEY (mantenimiento_id)
) ENGINE=InnoDB;

CREATE TABLE nutricion_semanal (
    fecha_final DATE,
    fecha_inicio DATE,
    id BIGINT NOT NULL AUTO_INCREMENT,
    nutricionista_id BIGINT,
    nombre_archivo VARCHAR(255),
    public_id VARCHAR(255),
    tipo_archivo VARCHAR(255),
    url_pdf VARCHAR(255),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE nutricionista_description (
    fecha DATE,
    id BIGINT NOT NULL AUTO_INCREMENT,
    nutricionista_id BIGINT,
    description TEXT,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE tecnico_description (
    fecha DATE,
    id BIGINT NOT NULL AUTO_INCREMENT,
    tecnico_id BIGINT,
    description TEXT,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- 2. Restricciones de Llaves Foráneas (Relaciones)
ALTER TABLE admins ADD CONSTRAINT FKcyne83ocugcn49nuaebxsxuow FOREIGN KEY (user_id) REFERENCES user (user_id);
ALTER TABLE cocina ADD CONSTRAINT FK253etkgxolqos6q8wc4i0jp9p FOREIGN KEY (menu_dia_id) REFERENCES menu_dia (menu_id);
ALTER TABLE cocineros ADD CONSTRAINT FKmqdxu4hfgv7f7x1b3kwcj2ypr FOREIGN KEY (user_id) REFERENCES user (user_id);
ALTER TABLE disponibilidad_profesional ADD CONSTRAINT FK4fdqbdkuj4qpxovnhjf4g5oag FOREIGN KEY (user_id) REFERENCES profesionales (user_id);
ALTER TABLE email_verification ADD CONSTRAINT FK9td49cgx6wir6kudhgso6eoiu FOREIGN KEY (user_id) REFERENCES user (user_id);
ALTER TABLE empleado ADD CONSTRAINT FKbdi5b66dy1l9ijwom7kbdpodg FOREIGN KEY (user_id) REFERENCES user (user_id);
ALTER TABLE horarios_asistencia ADD CONSTRAINT FKf98krd543ijyighquodlybjtp FOREIGN KEY (nutricionista_id) REFERENCES nutricionista (user_id);
ALTER TABLE horarios_asistencia ADD CONSTRAINT FK5bsrhkff2nvb23skql7bx141u FOREIGN KEY (tecnico_id) REFERENCES tecnico2 (user_id);
ALTER TABLE intervencion ADD CONSTRAINT FKe3l5v4xxqmnnfcibg8kemjcux FOREIGN KEY (creador_id) REFERENCES profesionales (user_id);
ALTER TABLE mantenimiento ADD CONSTRAINT FKlwssldrv56cac1fb7d3nt6f8i FOREIGN KEY (empleado_id) REFERENCES empleado (user_id);
ALTER TABLE menu_dia ADD CONSTRAINT FKm7m74jekn4ukrxl6lejydjhm7 FOREIGN KEY (cocinero_id) REFERENCES cocineros (user_id);
ALTER TABLE nutricion_semanal ADD CONSTRAINT FKo8kg5lfaygw57lgupk2xmjdwo FOREIGN KEY (nutricionista_id) REFERENCES nutricionista (user_id);
ALTER TABLE nutricionista ADD CONSTRAINT FK8feuh3l204ug57soekp33bo06 FOREIGN KEY (user_id) REFERENCES user (user_id);
ALTER TABLE nutricionista_description ADD CONSTRAINT FKhqw8vm1hb7sgimn1hsy3wc4i3 FOREIGN KEY (nutricionista_id) REFERENCES nutricionista (user_id);
ALTER TABLE profesionales ADD CONSTRAINT FKbn7ojp6tv7hc41ng9yekjwboe FOREIGN KEY (user_id) REFERENCES user (user_id);
ALTER TABLE tecnico2 ADD CONSTRAINT FK4mu78trfywcbqeo8m6edsauog FOREIGN KEY (user_id) REFERENCES user (user_id);
ALTER TABLE tecnico_description ADD CONSTRAINT FKm1rv4cmgihv421vk0w60heptg FOREIGN KEY (tecnico_id) REFERENCES tecnico2 (user_id);