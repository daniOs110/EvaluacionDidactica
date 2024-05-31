const adminRouter = require('express').Router()

const adminService = require('../service/admin.service')

const authMiddleware = require('../middleware/session')
const adminCheck = require('../middleware/adminCheck');
const LOG = require('../app/logger')

adminRouter.get('/admin/users', authMiddleware, adminCheck, async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    LOG.error('Error obteniendo la lista de usuarios: ', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

adminRouter.delete('/admin/users/:id', authMiddleware, adminCheck, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await adminService.deleteUser(id);
    return res.status(200).json(result);
  } catch (error) { 
    LOG.error('Error eliminando el usuario: ', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = adminRouter
