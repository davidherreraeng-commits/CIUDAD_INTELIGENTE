const bcryptjs = require('bcryptjs');

const { UserLogActions } = require('../../enums/user-log-actions.enum');
const { sequelize } = require('../../infrastructure/database/database');

const { UserProfile } = require("../../infrastructure/models/user/user-profile.model");
const { User } = require("../../infrastructure/models/user/user.model");

const { decodeFilters } = require('../helpers/decode-filters.helper');
const { logUserAction } = require('../helpers/log-user-actions.helper');
const { buildUserFilters } = require('../helpers/build-user-filters.helper');
const { buildUserIncludes } = require('../helpers/build-user-includes.helper');
const { applyPagination } = require('../helpers/pagination.helper');

const config = require('../../../config/config');

const ErrorResponse = require('../../utils/error');

const { SendEmailService } = require("./mail.service");
const sendEmailService = new SendEmailService();

const getAllService = async (page, limit, filters, path, ip, userId) => {
  return sequelize.transaction(async (t) => {
    const decodedFilters = decodeFilters(filters);

    const { baseUserWhere, profileWhere, roleWhere } = buildUserFilters(decodedFilters);

    const userIncludes = buildUserIncludes(profileWhere, roleWhere);

    const { results: usersResult, total, totalPages } =
      await applyPagination({
        model: User,
        where: baseUserWhere,
        include: userIncludes,
        page,
        limit,
        order: [[{ model: UserProfile, as: 'UserProfile' }, 'name', 'ASC']],
        transaction: t
      });

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.GET_ALL_USERS,
      url: path,
      transaction: t
    });

    return {
      users: usersResult,
      total,
      totalPages
    };
  });
};

const createService = async (email, lastName, name, roleId, username, userId, path, ip) => {
  return sequelize.transaction(async (t) => {
    const existingUser = await User.findOne({
      where: { username, isActive: true },
      transaction: t
    });
    if (existingUser) {
      throw new ErrorResponse('El nombre de usuario ya existe.', 400);
    }

    const existingEmail = await UserProfile.findOne({
      where: { email, isActive: true },
      transaction: t
    });
    if (existingEmail) {
      throw new ErrorResponse('El correo electrónico ya está registrado.', 400);
    }
    const generatedPassword = Math.random().toString(36).slice(-10);

    const newUser = await User.create(
      {
        username,
        password: bcryptjs.hashSync(generatedPassword, 10),
        roleId,
        isActive: true
      },
      { transaction: t }
    );

    const newProfile = await UserProfile.create(
      {
        email,
        lastName,
        name,
        userId: newUser.userId
      },
      { transaction: t }
    );

    await sendEmailService.sendServiceMail(
      `<p>Su usuario ha sido creado.</p>
       <p><strong>Enlace:<strong> ${config.corsOrigin}</p>
       <p>Usuario: ${username}</p>
       <p>Contraseña temporal: ${generatedPassword}</p>`,
      "Creación de usuario",
      email
    );

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.CREATE_USER,
      url: path,
      transaction: t
    });

    return {
      user: newUser,
      profile: newProfile
    };
  });
};

const updateService = async (id, email, lastName, name, roleId, username, userId, path, ip) => {
  return sequelize.transaction(async (t) => {
    const user = await User.findOne({ where: { userId: id, isActive: true }, transaction: t });
    if (!user) {
      throw new ErrorResponse('Usuario no encontrado.', 400);
    }

    if (user.username !== username) {
      const existsUsername = await User.findOne({
        where: { username },
        transaction: t
      });
      if (existsUsername) {
        throw new ErrorResponse('El nombre de usuario ya existe.', 400);
      }
    }

    if (user.email !== email) {
      const existsEmail = await UserProfile.findOne({
        where: { email, isActive: true },
        transaction: t
      });
      if (!existsEmail) {
        throw new ErrorResponse('El correo electrónico ya está registrado.', 400);
      }
    }

    await user.update(
      {
        username,
        roleId,
      },
      { transaction: t }
    );

    const profile = await UserProfile.findOne({ where: { userId: id, isActive: true }, transaction: t });
    await profile.update(
      {
        email,
        lastName,
        name
      },
      { transaction: t }
    );

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.UPDATE_USER,
      url: path,
      transaction: t
    });

    return {
      user,
      profile
    };
  });
};

const deleteService = async (id, userId, path, ip) => {
  return sequelize.transaction(async (t) => {
    const user = await User.findOne({
      where: { userId: id, isActive: true },
      transaction: t
    });

    if (!user) {
      throw new ErrorResponse('Usuario no encontrado.', 400);
    }

    const profile = await UserProfile.findOne({
      where: { userId: id },
      transaction: t
    })

    const deletedAt = new Date().toISOString(); 
    await user.update(
      {
        username: `${deletedAt}-deleted-${user.username}`,
        isActive: false
      },
      { transaction: t }
    );
    await profile.update(
      {
        email: null,
        emailDelete: profile.email,
        isActive: false
      },
      { transaction: t }
    )

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.DELETE_USER,
      url: path,
      transaction: t
    });
  });
};

const updatePasswordService = async (password, userId, path, ip) => {
  return sequelize.transaction(async (t) => {
    const user = await User.findOne({
      where: { userId, isActive: true },
      transaction: t
    });

    if (!user) {
      throw new ErrorResponse('Usuario no encontrado.', 400);
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    await user.update(
      { password: hashedPassword },
      { transaction: t }
    );

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.UPDATE_PASSWORD,
      url: path,
      transaction: t
    });
  });
};

module.exports = {
  getAllService,
  createService,
  updateService,
  deleteService,
  updatePasswordService
}
