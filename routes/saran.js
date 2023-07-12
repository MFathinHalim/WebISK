const { WebhookClient } = require("discord.js");
const express = require("express");
const { rateLimit } = require("express-rate-limit");

const app = express.Router();

const webhookSaran = {
  saranDiscord: new WebhookClient({ url: process.env.WEBHOOK_SARAN_DISCORD }),
  saranYoutube: new WebhookClient({ url: process.env.WEBHOOK_SARAN_YOUTUBE }),
  saranWebsite: new WebhookClient({ url: process.env.WEBHOOK_SARAN_WEBSITE }),
};

function homeCtrl(req, res) {
  res.render("saran", {
    title: "Saran",
    webhookSaran,
    success: req.success || false,
    err: req.err || "",
  });
}

function postCtrl(req, res, next) {
  const jenis = req.body.jenis;
  const name = req.body.nama || "Seseorang";
  const saran = req.body.saran;

  if (!jenis) {
    req.err = "jenis kosong";
    return next();
  }

  const webhook =
    jenis == "discord"
      ? webhookSaran.saranDiscord
      : jenis == "youtube"
      ? webhookSaran.saranYoutube
      : jenis == "website"
      ? webhookSaran.saranWebsite
      : undefined;

  if (!webhook) {
    req.err = `no webhook ${jenis}`;
    return next();
  }

  if (!saran) {
    req.err = "saran kosong";
    return next();
  }

  webhook
    .send({ username: name, content: saran })
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

const sendDiscordSuggestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // Limit each IP to 1 suggest per `window` (here, per hour)
  handler(req, res) {
    req.err = "limit"
    return homeCtrl(req, res)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const sendYoutubeSuggestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // Limit each IP to 1 suggest per `window` (here, per hour)
  handler(req, res) {
    req.err = "limit";
    return homeCtrl(req, res);
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const sendWebsiteSuggestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // Limit each IP to 1 suggest per `window` (here, per hour)
  handler(req, res) {
    req.err = "limit";
    return homeCtrl(req, res);
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.get("/", homeCtrl);

app.post("/", (req, res, next) => {
  const jenis = req.body.jenis;

  if (!jenis) {
    req.err = "jenis kosong";
    return homeCtrl(req, res);
  }

  const limiter =
    jenis == "discord"
      ? sendDiscordSuggestLimiter
      : jenis == "youtube"
      ? sendYoutubeSuggestLimiter
      : jenis == "website"
      ? sendWebsiteSuggestLimiter
      : undefined;

  if (!limiter) {
    req.err = `no webhook ${jenis}`;
    return homeCtrl(req, res);
  }

  return limiter(req, res, next)
}, postCtrl, homeCtrl);

module.exports = app;
