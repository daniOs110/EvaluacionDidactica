const UserCredentials = require('../model/schema/user.crendentials.schema')
const UserInfo = require('../model/schema/user.info.schema')
const RolDeUsuario = require('../model/schema/user.roll.schema')
const sequelize = require('../config/database')
const LOG = require('../app/logger')

class AdminService {

    async getAllUsers() {
        try {
        const users = await UserInfo.findAll({
            attributes: ['id_info_usuario', 'nombre', 'apellido_paterno', 'apellido_materno', 'correo', 'verificado'],
            include: [
                {
                    model: UserCredentials,
                    as: 'usuario',
                    attributes: ['id_credenciales_usuario'], // Excluye todos los atributos del modelo UserCredentials
                    include: [
                        {
                            model: RolDeUsuario,
                            as: 'role',
                            attributes: ['rol_de_usuario'], // Incluye solo el rol
                        }
                    ]
                }
            ]
        });

        const modifiedUsers = users.map(user => ({
            id_info_usuario: user.id_info_usuario,
            nombre: user.nombre,
            apellido_paterno: user.apellido_paterno,
            apellido_materno: user.apellido_materno,
            correo: user.correo,
            verificado: user.verificado,
            rol_de_usuario: user.usuario.role.rol_de_usuario
        }));

        return modifiedUsers;            
        } catch (error) {
        throw new Error('Error obteniendo la información de los usuarios: ' + error.message);
        }
    }  

    async deleteUser(id_info_usuario) {
        const transaction = await sequelize.transaction();
        try {
            // Verificar el rol del usuario a eliminar
            const userToDelete = await UserInfo.findOne({
                where: { id_info_usuario },
                include: [{
                    model: UserCredentials,
                    as: 'usuario',
                    include: [{ model: RolDeUsuario, as: 'role' }]
                }]
            });

            if (!userToDelete) {
                throw new Error('Usuario no encontrado');
            }

            if (userToDelete.usuario.role.rol_de_usuario === 'admin') {
                throw new Error('No se puede eliminar un usuario con rol de administrador');
            }

            // Eliminar el usuario
            await UserInfo.destroy({ where: { id_info_usuario }, transaction });
            await UserCredentials.destroy({ where: { id_credenciales_usuario: userToDelete.usuario.id_credenciales_usuario }, transaction });

            await transaction.commit();
            return { message: 'Usuario eliminado exitosamente' };
        } catch (error) {
            await transaction.rollback();
            throw new Error('Error eliminando el usuario: ' + error.message);
        }
    }    

}
module.exports = new AdminService()
