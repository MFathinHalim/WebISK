const { WebhookClient } = require("discord.js");
const express = require("express");
const { rateLimit } = require("express-rate-limit");

const app = express.Router();

const webhookSaran = process.env.WEBHOOK_SARAN_WEBSITE ? new WebhookClient({ url: process.env.WEBHOOK_SARAN_WEBSITE }) : null

function homeCtrl(req, res) {
  res.render("saran", {
    title: "Saran",
    webhookSaran,
    success: req.success || false,
    err: req.err || "",
  });
}

function postCtrl(req, res, next) {
  webhookSaran
    .send({ username: req.name, content: req.saran })
    .then(() => {
      req.success = true;
      next();
    })
    .catch((e) => {
      console.error("Cannot send suggest to discord", e);
      req.err = "cannot send";
      next();
    });
}

const sendSuggestLimiter = rateLimit({
  windowMs: 60 * 10 * 1000, // 10 menit
  max: 10, // Limit each IP to 10 suggest per `window` (here, per 10 minutes)
  handler(req, res) {
    req.err = "limit";
    return homeCtrl(req, res);
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator(req, res) {
    return req.clientIp
  }
});

app.get("/", homeCtrl);

app.post("/", (req, res, next) => {
  req.name = req.body.nama.trim() || "Seseorang"
  req.saran = req.body.saran.trim()

  if (!req.saran) {
    req.err = "saran kosong";
    return homeCtrl(req, res);
  }

  next()
}, sendSuggestLimiter, postCtrl, homeCtrl);

module.exports = app;