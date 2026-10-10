-- ========================================================
-- Script de Creación y Poblado de Datos para Oracle Database
-- Temática: CARS de Pixar - Garaje de Radiator Springs & Copa Pistón
-- Base de Datos: FREEPDB1 | Usuario: usuario
-- ========================================================

-- 1. Crear Tabla de Productos / Bólidos si no existe
BEGIN
  EXECUTE IMMEDIATE '
    CREATE TABLE PRODUCTOS (
      ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      NOMBRE VARCHAR2(150) NOT NULL,
      DESCRIPCION VARCHAR2(500),
      CATEGORIA VARCHAR2(100) NOT NULL,
      PRECIO NUMBER(10,2) NOT NULL,
      STOCK NUMBER(6) NOT NULL,
      CREADO_EN TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -955 THEN
      RAISE;
    END IF;
END;
/

-- 2. Insertar Bólidos y Personajes de Cars
INSERT INTO PRODUCTOS (NOMBRE, DESCRIPCION, CATEGORIA, PRECIO, STOCK)
VALUES ('Rayo McQueen #95', '"¡Ka-Chow! La velocidad soy yo. Un ganador, 42 perdedores. Yo desayuno perdedores." Motor V8 de 750 HP.', 'Copa Pistón', 322, 1);

INSERT INTO PRODUCTOS (NOMBRE, DESCRIPCION, CATEGORIA, PRECIO, STOCK)
VALUES ('Mate (Tow Mater)', '"¡Soy el mejor conductor marcha atrás del mundo!" Grúa Chevrolet 1951 con corazón de oro de Radiator Springs.', 'Radiator Springs', 145, 2);

INSERT INTO PRODUCTOS (NOMBRE, DESCRIPCION, CATEGORIA, PRECIO, STOCK)
VALUES ('Doc Hudson #51 (Hudson Hornet)', '"Gira a la derecha para ir a la izquierda." Leyenda tricampeona de la Copa Pistón (1951, 1952, 1953) con motor Twin H-Power.', 'Leyendas de Carreras', 280, 1);

INSERT INTO PRODUCTOS (NOMBRE, DESCRIPCION, CATEGORIA, PRECIO, STOCK)
VALUES ('Sally Carrera', '"Baja la velocidad y disfruta la vista." Porsche 911 Carrera 2002, abogada del pueblo y dueña del Motel Rueda Rueda.', 'Radiator Springs', 285, 1);

INSERT INTO PRODUCTOS (NOMBRE, DESCRIPCION, CATEGORIA, PRECIO, STOCK)
VALUES ('El Rey #43 (Strip Weathers)', '"Esto es sólo una copa vacía, muchacho." Plymouth Superbird 1970 con el icónico azul Dinoco y 7 títulos.', 'Copa Pistón', 315, 1);

INSERT INTO PRODUCTOS (NOMBRE, DESCRIPCION, CATEGORIA, PRECIO, STOCK)
VALUES ('Chick Hicks #86', '"¡Kachikka, kachikka!" Bólido Buick Regal obsesionado con vencer a McQueen.', 'Copa Pistón', 300, 2);

COMMIT;

-- 3. Consulta de Verificación
SELECT ID, NOMBRE, CATEGORIA, PRECIO, STOCK, CREADO_EN FROM PRODUCTOS ORDER BY ID DESC;
