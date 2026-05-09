DROP TABLE IF EXISTS evaluacion_detalles CASCADE;
DROP TABLE IF EXISTS evaluaciones CASCADE;
DROP TABLE IF EXISTS criterios CASCADE;
DROP TABLE IF EXISTS exposiciones CASCADE;
DROP TABLE IF EXISTS equipo_alumnos CASCADE;
DROP TABLE IF EXISTS equipos CASCADE;
DROP TABLE IF EXISTS grupo_alumnos CASCADE;
DROP TABLE IF EXISTS grupos CASCADE;
DROP TABLE IF EXISTS alumnos CASCADE;
DROP TABLE IF EXISTS materias CASCADE;

CREATE TABLE materias
(
    id_materia     SERIAL PRIMARY KEY,
    clave_materia  VARCHAR(20) UNIQUE NOT NULL,
    nombre_materia VARCHAR(100)       NOT NULL
);

CREATE TABLE alumnos
(
    id_alumno SERIAL PRIMARY KEY,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    nombre    VARCHAR(100)       NOT NULL,
    correo    VARCHAR(100) UNIQUE,
    password  VARCHAR(255)       NOT NULL,
    rol       VARCHAR(10)        NOT NULL DEFAULT 'alumno' CHECK (rol IN ('admin', 'alumno'))
);

CREATE TABLE grupos
(
    id_grupo     SERIAL PRIMARY KEY,
    nombre_grupo VARCHAR(50) NOT NULL,
    id_materia   INT         NOT NULL REFERENCES materias (id_materia) ON DELETE CASCADE
);

CREATE TABLE grupo_alumnos
(
    id_grupo  INT NOT NULL REFERENCES grupos (id_grupo) ON DELETE CASCADE,
    id_alumno INT NOT NULL REFERENCES alumnos (id_alumno) ON DELETE CASCADE,
    PRIMARY KEY (id_grupo, id_alumno)
);

CREATE TABLE equipos
(
    id_equipo     SERIAL PRIMARY KEY,
    nombre_equipo VARCHAR(50) NOT NULL,
    id_grupo      INT         NOT NULL REFERENCES grupos (id_grupo) ON DELETE CASCADE
);

CREATE TABLE equipo_alumnos
(
    id_equipo INT NOT NULL REFERENCES equipos (id_equipo) ON DELETE CASCADE,
    id_alumno INT NOT NULL REFERENCES alumnos (id_alumno) ON DELETE CASCADE,
    PRIMARY KEY (id_equipo, id_alumno)
);

CREATE TABLE exposiciones
(
    id_exposicion    SERIAL PRIMARY KEY,
    tema             VARCHAR(200) NOT NULL,
    fecha_programada TIMESTAMPTZ  NOT NULL,
    id_equipo        INT          NOT NULL REFERENCES equipos (id_equipo) ON DELETE CASCADE
);

CREATE TABLE criterios
(
    id_criterio     SERIAL PRIMARY KEY,
    descripcion     VARCHAR(255)  NOT NULL,
    peso_porcentaje DECIMAL(5, 2) NOT NULL CHECK (peso_porcentaje > 0 AND peso_porcentaje <= 100)
);

CREATE TABLE evaluaciones
(
    id_evaluacion       SERIAL PRIMARY KEY,
    id_exposicion       INT NOT NULL REFERENCES exposiciones (id_exposicion) ON DELETE CASCADE,
    id_alumno_evaluador INT NOT NULL REFERENCES alumnos (id_alumno) ON DELETE RESTRICT,
    fecha_registro      TIMESTAMPTZ DEFAULT NOW(),
    calificacion_final  DECIMAL(4, 2),
    UNIQUE (id_exposicion, id_alumno_evaluador)
);

CREATE TABLE evaluacion_detalles
(
    id_evaluacion INT           NOT NULL REFERENCES evaluaciones (id_evaluacion) ON DELETE CASCADE,
    id_criterio   INT           NOT NULL REFERENCES criterios (id_criterio) ON DELETE CASCADE,
    calificacion  DECIMAL(4, 2) NOT NULL CHECK (calificacion >= 0 AND calificacion <= 10),
    PRIMARY KEY (id_evaluacion, id_criterio)
);

CREATE INDEX idx_grupos_materia ON grupos (id_materia);
CREATE INDEX idx_equipos_grupo ON equipos (id_grupo);
CREATE INDEX idx_exposiciones_equipo ON exposiciones (id_equipo);
CREATE INDEX idx_evaluaciones_exposicion ON evaluaciones (id_exposicion);
CREATE INDEX idx_evaluaciones_evaluador ON evaluaciones (id_alumno_evaluador);

ALTER TABLE materias DISABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos DISABLE ROW LEVEL SECURITY;
ALTER TABLE grupos DISABLE ROW LEVEL SECURITY;
ALTER TABLE grupo_alumnos DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipos DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipo_alumnos DISABLE ROW LEVEL SECURITY;
ALTER TABLE exposiciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE criterios DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluacion_detalles DISABLE ROW LEVEL SECURITY;