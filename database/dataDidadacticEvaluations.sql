-- Data clasification
INSERT INTO evaluaciones_didacticas.clasificacion (clasificacion) VALUES ("QUESTIONANSWER");
INSERT INTO evaluaciones_didacticas.clasificacion (clasificacion) VALUES ("LISTOFITEMS");
INSERT INTO evaluaciones_didacticas.clasificacion (clasificacion) VALUES ("ORDER");

-- Data user roll
INSERT INTO evaluaciones_didacticas.roles_de_usuarios (rol_de_usuario) VALUES ("USER");
INSERT INTO evaluaciones_didacticas.roles_de_usuarios (rol_de_usuario) VALUES ("ADMIN");

-- Data table dinamics
INSERT INTO evaluaciones_didacticas.dinamicas (dinamica, id_clasificacion, descripcion) VALUES ('ordena la pregunta', '3', 'El profesor ingresa una pregunta o enunciado y cuando los alumnos respondan la evaluación verán en desorden todas las palabras, ellos deberán poner en orden el enunciado');
INSERT INTO evaluaciones_didacticas.dinamicas (dinamica, id_clasificacion, descripcion) VALUES ('Ordena el enunciado', 3, 'El profesor ingresa una pregunta o enunciado y cuando los alumnos respondan la evaluación verán en desorden todas las palabras, ellos deberán poner en orden el enunciado'),
('Ordena los items', 3, 'El profesor ingresa una serie de elementos y cuando los alumnos responden la evaluación verán los elementos en desorden, ellos deberán poner en orden a todos los elementos de la actividad')      