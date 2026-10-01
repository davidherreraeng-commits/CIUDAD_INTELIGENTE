const SuccessResponse = require("../../utils/success");

const { extractRequestInfo } = require("../helpers/extract-request-info.helper");
const handleControllerError = require("../helpers/handle-controller-error.helper");

const { getAllService } = require("../services/roles.service");

const getAllController = async (req, res) => {
  try {
    const { userId, path, ip } = extractRequestInfo(req);

    const roles = await getAllService(path, ip, userId);

    return new SuccessResponse('Obtención de roles exitosa', { roles }, 200).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
}

module.exports = {
  getAllController
}
