const axios = require("axios");
const https = require("https");
const config = require("../../../config/config");

const { Notification } = require("../../infrastructure/models/notification.model");

class SendEmailService {
  async sendServiceMail(message, subject, to) {
    const payload = {
      user: config.mailConfig.user,
      pass: config.mailConfig.password,
      client_id: config.mailConfig.clientId,
      client_secret: config.mailConfig.clientSecret,
      host: config.mailConfig.host,
      port: config.mailConfig.port,
      from: config.mailConfig.from,
      to,
      subject,
      html: message,
    };

    const headers = {
      Authorization: `Bearer ${config.mailConfig.token}`,
      "Content-Type": "application/json",
    };

    try {
      const response = await axios.post(config.mailConfig.url, payload, {
        headers,
        httpsAgent: new https.Agent({ family: 4 }),
        timeout: 15000,
      });

      await Notification.create({
        to,
        subject,
        type: "EMAIL",
        statusCode: response.code,
        response: JSON.stringify(response.data),
        errorMessage: null,
      });

      return {
        sendEmail: true,
        message: "Se envió la notificación.",
      };
    } catch (error) {
      await Notification.create({
        to,
        subject,
        type: "EMAIL",
        statusCode: error.response?.status || null,
        response: null,
        errorMessage: error.message || "Error desconocido",
      });
      throw new Error(error);
    }
  }
}

module.exports = { SendEmailService };