const { WebhookClient } = require("discord.js");
const express = require("express");
const { rateLimit } = require("express-rate-limit");

const app = express.Router();

const webhookSaran = {
  saranDiscord: process.env.WEBHOOK_SARAN_DISCORD ? new WebhookClient({ url: process.env.WEBHOOK_SARAN_DISCORD }) : null,
  saranYoutube: process.env.WEBHOOK_SARAN_YOUTUBE ? new WebhookClient({ url: process.env.WEBHOOK_SARAN_YOUTUBE }) : null,
  saranWebsite: process.env.WEBHOOK_SARAN_WEBSITE ? new WebhookClient({ url: process.env.WEBHOOK_SARAN_WEBSITE }) : null,
};
//apa yang mau dilakukan sepuh ini?
//kurang mengerti lahtch lama kali kalian. aku ga ngerti apa apa disini jadi gabut//OOH JANGAN JANGAN req.err nya lupa di reset ya reng? ga weit gw emak quest. lmao
//Manuk Akal, ywdh gw sholat bentar
//awokaowk sumatera
function homeCtrl(req, res) {
  res.render("saran", {
    title: "Saran",
    webhookSaran,
    success: req.success || false,
    err: req.err || "",
  });
  req.err = ""
  req.success = ""
  req.name = ""
  req.saran = ""
}

function postCtrl(req, res, next) {
  req.webhook
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

const sendDiscordSuggestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // Limit each IP to 1 suggest per `window` (here, per hour)
  handler(req, res) {
    req.err = "limit"
    return homeCtrl(req, res)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    return req.clientIp
  }
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
  keyGenerator: (req, res) => {
    return req.clientIp
  }

});

const sendWebsiteSuggestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // Limit each IP to 1 suggest per `window` (here, per hour)
  handler(req, res) {
    req.err = "limit";
    console.log(req.ip)
    return homeCtrl(req, res);
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    return req.clientIp
  }
});

app.get("/", homeCtrl);

app.post("/", (req, res, next) => {
  const jenis = req.body.jenis
  req.name = req.body.nama.trim() || "Seseorang"
  req.saran = req.body.saran.trim()

  if (!jenis) {
    req.err = "jenis kosong";
    return homeCtrl(req, res);
  }

  req.webhook =
    jenis == "discord"
      ? webhookSaran.saranDiscord
      : jenis == "youtube"
      ? webhookSaran.saranYoutube
      : jenis == "website"
      ? webhookSaran.saranWebsite
      : undefined;

  if (!req.webhook) {
    req.err = `no webhook ${jenis}`;
    return homeCtrl(req, res);
  }

  if (!req.saran) {
    req.err = "saran kosong";
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
