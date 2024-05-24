-- Se pone el id_info_usuario que se quiere cambiar
USE evaluaciones_didacticas;
UPDATE credenciales_usuarios
SET id_roles_de_usuario = (SELECT id_roles_de_usuario FROM roles_de_usuarios WHERE rol_de_usuario = 'ADMIN')
WHERE id_credenciales_usuario = (
  SELECT id_usuario
  FROM info_usuarios 
  WHERE id_info_usuario = 1
);