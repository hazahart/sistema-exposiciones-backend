INSERT INTO materias (clave_materia, nombre_materia)
VALUES
    -- 1er semestre
    ('AEC-1058', 'Química'),
    ('AED-1285', 'Fundamentos de Programación'),
    ('AEF-1041', 'Matemáticas Discretas'),
    ('ACC-0906', 'Fundamentos de Investigación'),
    ('ACF-2301', 'Cálculo Diferencial'),
    -- 2do semestre
    ('AEC-1008', 'Contabilidad Financiera'),
    ('AED-1286', 'Programación Orientada a Objetos'),
    ('ACH-2307', 'Taller de Ética'),
    ('ACD-0908', 'Desarrollo Sustentable'),
    ('ACF-0902', 'Cálculo Integral'),
    ('AEF-1052', 'Probabilidad y Estadística'),
    -- 3er semestre
    ('SCH-1024', 'Taller de Administración'),
    ('AED-1026', 'Estructura de Datos'),
    ('SCC-1005', 'Cultura Empresarial'),
    ('ACF-0903', 'Álgebra Lineal'),
    ('ACF-0904', 'Cálculo Vectorial'),
    ('SCF-1006', 'Física General'),
    ('SCC-1013', 'Investigación de Operaciones'),
    -- 4to semestre
    ('SCD-1027', 'Tópicos Avanzados de Programación'),
    ('AEF-1031', 'Fundamentos de Base de Datos'),
    ('AEC-1061', 'Sistemas Operativos'),
    ('SCC-1017', 'Métodos Numéricos'),
    ('ACF-0905', 'Ecuaciones Diferenciales'),
    ('SCD-1018', 'Principios Eléctricos y Aplicaciones Digitales'),
    ('SCD-1022', 'Simulación'),
    -- 5to semestre
    ('SCC-1007', 'Fundamentos de Ingeniería de Software'),
    ('SCA-1025', 'Taller de Base de Datos'),
    ('SCA-1026', 'Taller de Sistemas Operativos'),
    ('SCC-1010', 'Graficación'),
    ('SCC-1012', 'Inteligencia Artificial'),
    ('AEC-1034', 'Fundamentos de Telecomunicaciones'),
    ('SCD-1003', 'Arquitectura de Computadoras'),
    -- 6to semestre
    ('SCD-1011', 'Ingeniería de Software'),
    ('SCB-1001', 'Administración de Base de Datos'),
    ('AEB-1055', 'Programación Web'),
    ('SCC-1019', 'Programación Lógica y Funcional'),
    ('SCD-1015', 'Lenguajes y Autómatas I'),
    ('SCD-1021', 'Redes de Computadoras'),
    ('SCC-1014', 'Lenguajes de Interfaz'),
    -- 7mo semestre
    ('SCG-1009', 'Gestión de Proyectos de Software'),
    ('ACA-0909', 'Taller de Investigación I'),
    ('IDD-2501', 'Big Data'),
    ('IDF-2505', 'Inteligencia de Datos'),
    ('SCD-1016', 'Lenguajes y Autómatas II'),
    ('SCD-1004', 'Conmutación y Enrutamiento en Redes de Datos'),
    ('SCD-1023', 'Sistemas Programables'),
    -- 8vo semestre
    ('ACA-0910', 'Taller de Investigación II'),
    ('IDD-2504', 'Tópicos Avanzados de Desarrollo Web'),
    ('IDD-2503', 'Desarrollos Móviles y Servicios en la Nube'),
    ('IDD-2502', 'Ciberseguridad'),
    ('SCA-1002', 'Administración de Redes'),
    -- 9no semestre
    ('RS-0000', 'Residencia Profesional');

INSERT INTO alumnos (matricula, nombre, correo, password, rol)
VALUES ('21030017', 'Gustavo Ramírez Mireles', '21030017@itcelaya.edu.mx',
        '$2b$10$dK4lZQmUzYMeq6zrrU3TlOHDcTWbK0h3TuKf4rmV5EJkvWYBZNJpG', 'alumno'),
       ('21030196', 'Victoria Maldonado Patiño', '21030196@itcelaya.edu.mx',
        '$2b$10$/aCL1eH8IUgqQ2K6Y2fTK.qTaSTbtpD13jQDIELuT480kBkyRMDOa', 'admin'),
       ('21031024', 'Vanessa Fernanda Arreola García', '21031024@itcelaya.edu.mx',
        '$2b$10$cj/xntzOlR/i5akB9C7K9ORkBqjzT2yTxHmpbOLSN08bo.AM/fBKW', 'alumno'),
       ('20031609', 'Luis Ángel Cruz Guerrero', '20031609@itcelaya.edu.mx',
        '$2b$10$cj/xntzOlR/i5akB9C7K9ORkBqjzT2yTxHmpbOLSN08bo.AM/fBKW', 'alumno');

INSERT INTO grupos (nombre_grupo, id_materia)
VALUES ('Grupo A', (SELECT id_materia FROM materias WHERE clave_materia = 'IDD-2504'));

INSERT INTO grupo_alumnos (id_grupo, id_alumno)
VALUES (1, 1),
       (1, 3),
       (1, 4);

INSERT INTO equipos (nombre_equipo, id_grupo)
VALUES ('Equipo Dev', 1);

INSERT INTO equipo_alumnos (id_equipo, id_alumno)
VALUES (1, 1),
       (1, 3),
       (1, 4);

INSERT INTO exposiciones (tema, fecha_programada, id_equipo)
VALUES ('Sistema de Exposiciones con OpenAPI', '2025-06-15 10:00:00+00', 1);

INSERT INTO criterios (descripcion, peso_porcentaje)
VALUES ('Dominio del tema', 40.00),
       ('Material de apoyo', 30.00),
       ('Presentación oral', 30.00);