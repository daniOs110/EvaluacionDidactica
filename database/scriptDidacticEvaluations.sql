CREATE SCHEMA IF NOT EXISTS `evaluaciones_didacticas` DEFAULT CHARACTER SET utf8mb4;

USE `evaluaciones_didacticas`;

CREATE TABLE IF NOT EXISTS `roles_de_usuarios` (
  `id_roles_de_usuario` INT NOT NULL AUTO_INCREMENT,
  `rol_de_usuario` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_roles_de_usuario`)
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS `credenciales_usuarios` (
  `id_credenciales_usuario` INT NOT NULL AUTO_INCREMENT,
  `hash_password` VARCHAR(255) NOT NULL,
  `salt` VARCHAR(45) NOT NULL,
  `id_roles_de_usuario` INT NOT NULL,
  PRIMARY KEY (`id_credenciales_usuario`),
  INDEX `id_roles_de_usuario_idx` (`id_roles_de_usuario` ASC),
  CONSTRAINT `fk_credenciales_usuario_roles_de_usuario`
    FOREIGN KEY (`id_roles_de_usuario`)
    REFERENCES `roles_de_usuarios` (`id_roles_de_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;




CREATE TABLE IF NOT EXISTS `clasificacion` (
  `id_clasificacion` INT NOT NULL AUTO_INCREMENT,
  `clasificacion` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_clasificacion`)
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS `dinamicas` (
  `id_dinamicas` INT NOT NULL AUTO_INCREMENT,
  `dinamica` VARCHAR(45) NOT NULL,
  `id_clasificacion` INT NOT NULL,
  `descripcion` VARCHAR(255) NULL,
  PRIMARY KEY (`id_dinamicas`),
  INDEX `id_clasificacion_idx` (`id_clasificacion` ASC),
  CONSTRAINT `fk_dinamicas_clasificacion`
    FOREIGN KEY (`id_clasificacion`)
    REFERENCES `clasificacion` (`id_clasificacion`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS `info_usuarios` (
  `id_info_usuario` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `apellido_paterno` VARCHAR(45) NOT NULL,
  `apellido_materno` VARCHAR(45) NULL,
  `correo` VARCHAR(45) NOT NULL,
  `id_usuario` INT NOT NULL,
  `verificado` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id_info_usuario`),
  UNIQUE INDEX `id_usuario_UNIQUE` (`id_usuario` ASC),
  UNIQUE INDEX `correo_UNIQUE` (`correo` ASC),
  CONSTRAINT `fk_info_usuarios_credenciales_usuario`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `credenciales_usuarios` (`id_credenciales_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS `evaluaciones` (
  `id_evaluaciones` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `retroalimentacion_activa` TINYINT NOT NULL,
  `fecha_activacion` DATE NOT NULL,
  `hora_activacion` TIME NOT NULL,
  `id_usuario` INT NOT NULL,
  `id_dinamica` INT NOT NULL,  
  `fecha_creacion` DATE NOT NULL,
  `active` TINYINT NOT NULL,
  `subtitulo` VARCHAR(200) NULL,
  `descripcion` VARCHAR(500) NULL,
  `fecha_desactivacion` DATE NULL,
  `hora_desactivacion` TIME NULL,
  `customizar_puntuacion` BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (`id_evaluaciones`),
  UNIQUE INDEX `id_evaluaciones_UNIQUE` (`id_evaluaciones` ASC),
  INDEX `id_usuario_idx` (`id_usuario` ASC),
  INDEX `id_dinamica_idx` (`id_dinamica` ASC),
  CONSTRAINT `fk_evaluaciones_info_usuario`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `info_usuarios` (`id_info_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_evaluaciones_dinamicas`
    FOREIGN KEY (`id_dinamica`)
    REFERENCES `dinamicas` (`id_dinamicas`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS `preguntas` (
  `id_pregunta` INT NOT NULL AUTO_INCREMENT,
  `id_evaluacion` INT NOT NULL,
  `pregunta` VARCHAR(100) NOT NULL,
  `numero_respuestas` INT NOT NULL,
  PRIMARY KEY (`id_pregunta`),
  INDEX `id_evaluacion_idx` (`id_evaluacion` ASC),
  CONSTRAINT `fk_preguntas_evaluaciones`
    FOREIGN KEY (`id_evaluacion`)
    REFERENCES `evaluaciones` (`id_evaluaciones`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS `tipo_respuestas` (
  `id_tipo_respuesta` INT NOT NULL AUTO_INCREMENT,
  `tipo_respuesta` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_tipo_respuesta`)
) ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS `respuestas` (
  `id_respuesta` INT NOT NULL AUTO_INCREMENT,
  `id_pregunta` INT NOT NULL,
  `opcion_respuesta_texto` VARCHAR(150) NULL COMMENT 'texto de respuestas',
  `status_respuesta` TINYINT NOT NULL,
  `id_tipo_respuesta` INT NOT NULL,
  `opcion_respuesta_imagen` BLOB NULL,
  PRIMARY KEY (`id_respuesta`),
  INDEX `id_pregunta_idx` (`id_pregunta` ASC),
  INDEX `id_tipo_respuesta_idx` (`id_tipo_respuesta` ASC),
  CONSTRAINT `fk_respuestas_preguntas`
    FOREIGN KEY (`id_pregunta`)
    REFERENCES `preguntas` (`id_pregunta`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_respuestas_tipo_respuesta`
    FOREIGN KEY (`id_tipo_respuesta`)
    REFERENCES `tipo_respuestas` (`id_tipo_respuesta`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `usuarios_invitados` (
  `id_usuarios_invitados` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `id_roles_de_usuario_invitado` INT NOT NULL,
  PRIMARY KEY (`id_usuarios_invitados`),
  INDEX `id_roles_de_usuario_idx` (`id_roles_de_usuario_invitado` ASC),
  CONSTRAINT `fk_usuarios_invitados_roles_de_usuario`
    FOREIGN KEY (`id_roles_de_usuario_invitado`)
    REFERENCES `roles_de_usuarios` (`id_roles_de_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `ordenamiento` (
  `id_ordenamiento` INT NOT NULL AUTO_INCREMENT,
  `oracion` VARCHAR(255) NOT NULL,
  `id_evaluacion` INT NOT NULL,
  `num_pregunta` INT NOT NULL,
  `orden` INT NULL,
  `instruccion` VARCHAR(255) NULL
  PRIMARY KEY (`id_ordenamiento`),
  UNIQUE INDEX `id_ordenamiento_UNIQUE` (`id_ordenamiento` ASC),
  INDEX `id_evaluacion_idx` (`id_evaluacion` ASC),
  CONSTRAINT `id_evaluacion`
    FOREIGN KEY (`id_evaluacion`)
    REFERENCES `evaluaciones` (`id_evaluaciones`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `evaluaciones_didacticas`.`instrucciones`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `instrucciones` (
  `id_instrucciones` INT NOT NULL AUTO_INCREMENT,
  `num_pregunta` INT NOT NULL,
  `instruccion` VARCHAR(150) NULL,
  PRIMARY KEY (`id_instrucciones`),
  UNIQUE INDEX `id_instrucciones_UNIQUE` (`id_instrucciones` ASC),
  INDEX `num_pregunta_idx` (`num_pregunta` ASC),
  CONSTRAINT `fk_num_pregunta`
    FOREIGN KEY (`num_pregunta`)
    REFERENCES `ordenamiento` (`id_ordenamiento`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

  CREATE TABLE IF NOT EXISTS `resultados_evaluaciones` (
  `id_resultado_evaluaciones` INT NOT NULL AUTO_INCREMENT,
  `id_usuario_invitado` INT NULL,
  `id_pregunta` INT NULL,
  `id_respuesta_seleccionada` INT NULL,
  `fecha` DATE NOT NULL,
  `hora` TIME NOT NULL,
  `id_evaluacion` INT NOT NULL,
  `id_usuario_registrado` INT NULL,
  `id_pregunta_ordenamiento` INT NULL,
  `status` TINYINT NOT NULL,
  `opcion_ordenamiento` VARCHAR(45) NULL,
  `oracion_usuario` VARCHAR(255) NULL,
  PRIMARY KEY (`id_resultado_evaluaciones`),
  INDEX `id_pregunta_idx` (`id_pregunta` ASC),
  INDEX `id_respuesta_idx` (`id_respuesta_seleccionada` ASC),
  INDEX `id_usuario_idx` (`id_usuario_invitado` ASC),
  INDEX `id_evaluacion_idx` (`id_evaluacion` ASC),
  INDEX `id_usuario_registrado_idx` (`id_usuario_registrado` ASC),
  INDEX `id_pregunta_ordenamiento_idx` (`id_pregunta_ordenamiento` ASC),
  CONSTRAINT `fk_resultados_evaluaciones_preguntas`
    FOREIGN KEY (`id_pregunta`)
    REFERENCES `preguntas` (`id_pregunta`),
  CONSTRAINT `fk_resultados_evaluaciones_respuestas`
    FOREIGN KEY (`id_respuesta_seleccionada`)
    REFERENCES `respuestas` (`id_respuesta`),
  CONSTRAINT `fk_resultados_evaluaciones_usuarios_invitados`
    FOREIGN KEY (`id_usuario_invitado`)
    REFERENCES `usuarios_invitados` (`id_usuarios_invitados`),
  CONSTRAINT `fk_resultados_evaluaciones_evaluaciones`
    FOREIGN KEY (`id_evaluacion`)
    REFERENCES `evaluaciones` (`id_evaluaciones`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_resultados_evaluaciones_usuarios_registrados`
    FOREIGN KEY (`id_usuario_registrado`)
    REFERENCES `info_usuarios` (`id_info_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_resultados_evaluaciones_preguntas_ordenamiento`
    FOREIGN KEY (`id_pregunta_ordenamiento`)
    REFERENCES `ordenamiento` (`id_ordenamiento`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB



-- -----------------------------------------------------
-- Table `evaluaciones_didacticas`.`valor`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `valor` (
  `id_valor` INT NOT NULL AUTO_INCREMENT,
  `id_pregunta` INT NULL,
  `id_ordenamiento` INT NULL,
  `porcentaje` INT NOT NULL,
  PRIMARY KEY (`id_valor`),
  INDEX `id_pregunta_idx` (`id_pregunta` ASC) VISIBLE,
  INDEX `id_ordenamiento_idx` (`id_ordenamiento` ASC) VISIBLE,
  CONSTRAINT `id_pregunta`
    FOREIGN KEY (`id_pregunta`)
    REFERENCES `evaluaciones_didacticas`.`preguntas` (`id_pregunta`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `id_ordenamiento`
    FOREIGN KEY (`id_ordenamiento`)
    REFERENCES `ordenamiento` (`id_ordenamiento`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `evaluaciones_didacticas`.`tablero`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tablero` (
  `id_tablero` INT NOT NULL AUTO_INCREMENT,
  `id_evaluacion` INT NOT NULL,
  `columna` INT NOT NULL,
  `fila` INT NOT NULL,
  PRIMARY KEY (`id_tablero`),
  INDEX `id_evaluacion_idx` (`id_evaluacion` ASC) VISIBLE,
  CONSTRAINT `fk_tablero_evaluacion`
    FOREIGN KEY (`id_evaluacion`)
    REFERENCES `evaluaciones` (`id_evaluaciones`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `evaluaciones_didacticas`.`posicion_crucigrama`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `posicion_crucigrama` (
  `id_posicion_crucigrama` INT NOT NULL AUTO_INCREMENT,
  `id_pregunta` INT NOT NULL,
  `respuesta_texto` VARCHAR(45) NOT NULL,
  `orientacion` VARCHAR(45) NOT NULL,
  `inicio_x` INT NOT NULL,
  `inicio_y` INT NOT NULL,
  PRIMARY KEY (`id_posicion_crucigrama`),
  INDEX `id_pregunta_idx` (`id_pregunta` ASC) VISIBLE,
  CONSTRAINT `fk_posicion_crucigrama`
    FOREIGN KEY (`id_pregunta`)
    REFERENCES `preguntas` (`id_pregunta`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `evaluaciones_didacticas`.`calificacion_usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `calificacion_usuarios` (
  `id_calificacion` INT NOT NULL AUTO_INCREMENT,
  `id_usuario_invitado` INT NULL,
  `id_usuario_registrado` INT NULL,
  `id_evaluacion` INT NOT NULL,
  `correcta` INT NOT NULL,
  `total_pregunta` INT NULL,
  PRIMARY KEY (`id_calificacion`),
  UNIQUE INDEX `id_calificacion_UNIQUE` (`id_calificacion` ASC) VISIBLE,
  INDEX `id_usuario_invitado_idx` (`id_usuario_invitado` ASC) VISIBLE,
  INDEX `id_usuario_registrado_idx` (`id_usuario_registrado` ASC) VISIBLE,
  CONSTRAINT `id_usuario_invitado`
    FOREIGN KEY (`id_usuario_invitado`)
    REFERENCES `usuarios_invitados` (`id_usuarios_invitados`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `id_usuario_registrado`
    FOREIGN KEY (`id_usuario_registrado`)
    REFERENCES `info_usuarios` (`id_info_usuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB; 
    

DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;