const SuccessResponse = require("../../utils/success");

const { extractRequestInfo } = require("../helpers/extract-request-info.helper");
const handleControllerError = require("../helpers/handle-controller-error.helper");
const validateRequired = require("../helpers/validate-required.helper");

const { getAllService, createService, updateService, deleteService, updatePasswordService } = require('../services/user.service');

const getAllController = async (req, res) => {
  try {
    const { page, limit, ...filters } = req.query;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ page, limit });

    const users = await getAllService(page, limit, filters, path, ip, userId);

    return new SuccessResponse('Obtención de usuarios exitosa', users, 200).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
}

const createController = async (req, res) => {
  try {
    const { email, lastName, name, roleId, username } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ email, lastName, name, roleId, username });

    await createService(email, lastName, name, roleId, username, userId, path, ip);

    return new SuccessResponse('Usuario creado con éxito', null, 202).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
}

const updateController = async (req, res) => {
  try {
    const { userId: id, email, lastName, name, roleId, username } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ id, email, lastName, name, roleId, username });

    const updatedUser = await updateService(id, email, lastName, name, roleId, username, userId, path, ip);

    return new SuccessResponse('Usuario actualizado con éxito', updatedUser, 200).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
}

const deleteController = async (req, res) => {
  try {
    const { userId: id } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ id });

    await deleteService(id, userId, path, ip);

    return new SuccessResponse('Usuario eliminado con éxito', null, 200).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
}

const updatePasswordController = async (req, res) => {
  try {
    const { password } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ password });

    await updatePasswordService(password, userId, path, ip);

    return new SuccessResponse('Contraseña actualizada con éxito', null, 200).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
}

module.exports = {
  getAllController,
  createController,
  updateController,
  deleteController,
  updatePasswordController
}
