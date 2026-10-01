const crypto = require('crypto');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../../../config/config')
const { sequelize } = require('../../infrastructure/database/database');

const ErrorResponse = require('../../utils/error');
const { UserLogActions } = require('../../enums/user-log-actions.enum');
const { logUserAction } = require('../helpers/log-user-actions.helper');

const { User } = require('../../infrastructure/models/user/user.model');
const { UserProfile } = require('../../infrastructure/models/user/user-profile.model');
const { UserRole } = require('../../infrastructure/models/user/user-role.model');

const { SendEmailService } = require("./mail.service");
const sendEmailService = new SendEmailService();

const loginService = async (username, password, ip, path) => {
  return sequelize.transaction(async (t) => {
    const userResult = await User.findOne({
      where: { username, isActive: true },
      attributes: { include: ['password', 'token'] },
      include: [
        {
          model: UserProfile,
          as: 'UserProfile'
        },
        {
          model: UserRole,
          as: 'UserRole',
          attributes: ['name']
        }
      ],
      raw: false,
      transaction: t,
    });

    if (!userResult) {
      throw new ErrorResponse('Usuario no encontrado.', 401);
    }

    if (!bcryptjs.compareSync(password, userResult.password)) {
      throw new ErrorResponse('Usuario o contraseña inválido.', 401);
    }

    const token = jwt.sign(
      {
        userId: userResult.userId,
        roleId: userResult.roleId,
        roleName: userResult.UserRole?.name,
        userProfile: {
          email: userResult.UserProfile.email,
          name: userResult.UserProfile.name,
          lastName: userResult.UserProfile.lastName,
        }
      },
      config.JWTSecret,
      { expiresIn: config.ExpiresIn }
    );

    await logUserAction({
      userId: userResult.userId,
      ip,
      action: UserLogActions.LOGIN,
      url: path,
      transaction: t
    });

    userResult.token = token;
    await userResult.save({ transaction: t });

    return token;
  });
};

const logoutService = async (userId, ip, path) => {
  return sequelize.transaction(async (t) => {
    const userResult = await User.findOne({
      where: { userId, isActive: true },
      attributes: { include: ['token'] },
      raw: false,
      transaction: t,
    });

    await logUserAction({
      userId: userResult.userId,
      ip,
      action: UserLogActions.LOGOUT,
      url: path,
      transaction: t
    });
    
    userResult.token = null;
    await userResult.save({ transaction: t });
  });
}

const resetPasswordService = async (username, ip, path) => {
  return sequelize.transaction(async (t) => {
    const userResult = await User.findOne({
      where: { username, isActive: true },
      include: [
        {
          model: UserProfile,
          as: 'UserProfile'
        }
      ],
      raw: false,
      transaction: t,
    });

    if (!userResult) {
      throw new ErrorResponse('Usuario no encontrado.', 400);
    }

    if (!userResult.UserProfile || !userResult.UserProfile.email) {
      throw new ErrorResponse('El usuario no tiene un correo asociado.', 400);
    }

    const generatedPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

    userResult.password = hashedPassword;
    await userResult.save({ transaction: t });

    await sendEmailService.sendServiceMail(
      `<p>Se ha generado una nueva contraseña temporal para su cuenta.</p>
       <p><strong>Enlace:<strong> ${config.corsOrigin}</p>
       <p><strong>Usuario:</strong> ${username}</p>
       <p><strong>Nueva contraseña temporal:</strong> ${generatedPassword}</p>
       <p>Por favor, cambie su contraseña después de iniciar sesión.</p>`,
      "Restablecimiento de contraseña",
      userResult.UserProfile.email
    );

    await logUserAction({
      userId: userResult.userId,
      ip,
      action: UserLogActions.UPDATE_PASSWORD,
      url: path,
      transaction: t
    });

  });
};

module.exports = {
  loginService,
  logoutService,
  resetPasswordService
}
