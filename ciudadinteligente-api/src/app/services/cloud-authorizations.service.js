const { sequelize } = require('../../infrastructure/database/database');
const { CloudAuthorization } = require('../../infrastructure/models/projects/cloud-authorizations.model');
const { CloudServices } = require('../../infrastructure/models/projects/cloud-services.model');
const { CloudAttachments } = require('../../infrastructure/models/projects/cloud-attachments.model');
const { User } = require('../../infrastructure/models/user/user.model');
const { uploadFileToAzure, deleteFileFromAzure } = require('./storage.service');
const { logUserAction } = require('../helpers/log-user-actions.helper');
const { UserProfile } = require('../../infrastructure/models/user/user-profile.model');

const getAllAuthorizationsService = async (path, ip, userId) => {
    return sequelize.transaction(async (t) => {
        const authorizations = await CloudAuthorization.findAll({
            where: { isDelete: false },
            include: [
                { model: CloudServices, as: 'Services', where: { isDelete: false }, required: false },
                { model: CloudAttachments, as: 'Attachments', required: false },
                {
                    model: User, as: 'Approver', attributes: ['username'], include: [{
                        model: UserProfile,
                        as: 'UserProfile',
                        attributes: ['name', 'lastName']
                    }]
                }
            ],
            transaction: t
        });

        return { authorizations };
    });
};

const createOrUpdateAuthorizationService = async (bodyData, files, path, ip, userId) => {
    return sequelize.transaction(async (t) => {
        let authorization;

        // 1. EVALUAMOS: ¿ES CREACIÓN O EDICIÓN?
        if (bodyData.authId) {
            // --- MODO EDICIÓN ---
            authorization = await CloudAuthorization.findOne({ 
                where: { authId: bodyData.authId }, 
                transaction: t 
            });
            
            if (!authorization) throw new Error("La autorización no existe");
            if (authorization.isApproved) throw new Error("No se puede editar una solicitud que ya fue aprobada");

            // Actualizamos la información principal
            await authorization.update({
                systemName: bodyData.systemName,
                description: bodyData.description,
                observations: bodyData.observations, //nuevo campo
                secretaria: bodyData.secretaria
            }, { transaction: t });

            // Truco limpio: Borramos los servicios anteriores para insertar la nueva lista actualizada
            await CloudServices.destroy({ 
                where: { authId: bodyData.authId }, 
                transaction: t 
            });

        } else {
            // --- MODO CREACIÓN ---
            authorization = await CloudAuthorization.create({
                systemName: bodyData.systemName,
                description: bodyData.description,
                observations: bodyData.observations,//nuevo campo
                secretaria: bodyData.secretaria,
                clave: `CLOUD-${Math.floor(1000 + Math.random() * 9000)}`,
                isApproved: false
            }, { transaction: t });
        }

        // 2. Agregar los servicios financieros (Aplica tanto para CREAR como para EDITAR)
        if (bodyData.services && bodyData.services.length > 0) {
            const servicesToCreate = bodyData.services.map(svc => ({
                authId: authorization.authId,
                serviceName: svc.serviceName,
                monthlyCost: svc.monthlyCost
            }));
            await CloudServices.bulkCreate(servicesToCreate, { transaction: t });
        }

        // 3. Subir y registrar adjuntos NUEVOS
        if (files && files.length > 0) {
            for (const file of files) {
                const azureInfo = await uploadFileToAzure(file);
                await CloudAttachments.create({
                    authId: authorization.authId,
                    fileName: azureInfo.fileName,
                    url: azureInfo.url,
                    blobName: azureInfo.blobName,
                    mimeType: azureInfo.mimetype
                }, { transaction: t });
            }
        }

        return { authId: authorization.authId };
    });
};

const deleteAuthorizationAttachmentService = async (attachmentId) => {
    return sequelize.transaction(async (t) => {
        const attachment = await CloudAttachments.findOne({
            where: { attachmentId },
            transaction: t
        });

        if (!attachment) throw new Error("El archivo adjunto no existe");

        await deleteFileFromAzure(attachment.blobName); //Ruta Azure
        await attachment.destroy({ transaction: t });

        return { success: true, attachmentId: attachment.attachmentId };
    });
};

const updateAuthorizationObservationsService = async (authId, observations) => {
    return sequelize.transaction(async (t) => {
        const authorization = await CloudAuthorization.findOne({
            where: { authId, isDelete: false },
            transaction: t
        });

        if (!authorization) throw new Error("La autorización no existe");

        const normalizedObservations = observations?.trim() || null;
        if (normalizedObservations && normalizedObservations.length > 250) {
            throw new Error("Las observaciones no pueden superar los 250 caracteres");
        }

        await authorization.update({ observations: normalizedObservations }, { transaction: t });

        return { authId: authorization.authId, observations: authorization.observations };
    });
};

const approveAuthorizationService = async (authId, path, ip, userId) => {
    return sequelize.transaction(async (t) => {
        const authorization = await CloudAuthorization.findOne({ where: { authId }, transaction: t });
        if (!authorization) throw new Error("La autorización no existe");

        // Firmar: Marcamos true, registramos fecha y el ID del usuario que hizo la petición
        const numericUserId = Number(userId);
        const reviewerOneIds = [3, 12];
        const reviewerTwoIds = [37, 7, 36];
        const approverId = 8;

        if (authorization.isApproved) {
            throw new Error("La autorización ya fue aprobada");
        }

        if (reviewerOneIds.includes(numericUserId)) {
            if (authorization.isApproved2) {
                throw new Error("La revisión de un profesional administrativo ya fue realizada");
            }

            await authorization.update({
                isApproved2: true
            }, { transaction: t });

            return { authorization, message: "Revisión registrada correctamente" };
        }

        if (reviewerTwoIds.includes(numericUserId)) {
            if (authorization.isApproved3) {
                throw new Error("La revisión del arquitecto ya fue realizada");
            }

            await authorization.update({
                isApproved3: true
            }, { transaction: t });

            return { authorization, message: "Revisión registrada correctamente" };
        }

        if (numericUserId === approverId) {
            if (!authorization.isApproved2 || !authorization.isApproved3) {
                throw new Error("No se puede aprobar la solicitud porque aún faltan revisiones pendientes");
            }

            await authorization.update({
                isApproved: true,
                approvalDate: new Date(),
                approvedBy: numericUserId
            }, { transaction: t });

            return { authorization, message: "Autorización aprobada correctamente" };
        }

        throw new Error("El usuario no tiene permisos para revisar o aprobar esta solicitud");

        return { authorization };
    });
};

module.exports = {
    getAllAuthorizationsService,
    createOrUpdateAuthorizationService,
    deleteAuthorizationAttachmentService,
    updateAuthorizationObservationsService,
    approveAuthorizationService
};
