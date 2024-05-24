const UserInfo = require('../model/schema/user.info.schema');
const UserCredentials = require('../model/schema/user.crendentials.schema');
const RolDeUsuario = require('../model/schema/user.roll.schema');

const LOG = require('../app/logger')

async function adminCheck(req, res, next) {
  try {
    const user = await UserInfo.findByPk(req.user.id_info_usuario, {
      include: [{
        model: UserCredentials,
        as: 'usuario',
        include: [{
          model: RolDeUsuario,
          as: 'role'
        }]
      }]
    });

    const userRole = user.usuario.role.rol_de_usuario;
    LOG.info(`El usuario tiene el ROL: ${userRole}`)

    if (userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Acceso denegado: No tienes permisos de administrador' });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

module.exports = adminCheck;