UPDATE evaluaciones_didacticas.roles_de_usuarios SET rol_de_usuario = 'ADMIN' WHERE (id_roles_de_usuario = '2');

ALTER TABLE evaluaciones_didacticas.evaluaciones
DROP COLUMN duracion;
ALTER TABLE evaluaciones_didacticas.evaluaciones
ADD COLUMN fecha_desactivacion DATE NULL;
ALTER TABLE evaluaciones_didacticas.evaluaciones
ADD COLUMN hora_desactivacion TIME NULL;