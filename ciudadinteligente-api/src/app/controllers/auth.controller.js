const SuccessResponse = require('../../utils/success');

const { extractRequestInfo } = require('../helpers/extract-request-info.helper');
const handleControllerError = require('../helpers/handle-controller-error.helper');
const validateRequired = require('../helpers/validate-required.helper');

const { loginService, logoutService, resetPasswordService } = require('../services/auth.service');

const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;
    const { path, ip } = extractRequestInfo(req);

    validateRequired({ username, password });

    const token = await loginService(username, password, ip, path);

    return new SuccessResponse('Inicio de sesión exitoso', { token }, 200).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
};

const logoutController = async (req, res) => {
  try {
    const { userId } = req.body;
    const { path, ip } = extractRequestInfo(req);

    validateRequired({ userId });

    await logoutService(userId, ip, path);

    return new SuccessResponse('Sesión cerrada exitosamente', null, 200).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
}

const resetPasswordController = async (req, res) => {
  try {
    const { username } = req.body;
    const { path, ip } = extractRequestInfo(req);

    validateRequired({ username });

    await resetPasswordService(username, ip, path);

    return new SuccessResponse('Solicitud de recuperación enviada', null, 200).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
};

module.exports = {
  loginController,
  logoutController,
  resetPasswordController
}
