const { EmbedBuilder } = require("discord.js");
const express = require("express");

class SaranRouter {
  #app;
  #embed;
  constructor(channelSaran) {
    this.#app = express.Router();

    let success = false;
    let err = "";

    this.#app.get("/", function (req, res) {
      res.render("saran", { title: "Saran", channelSaran, success ,err });
      success = false;
      err = "";
    });

    this.#embed = new EmbedBuilder().setColor("Aqua").setTimestamp();

    this.#app.post("/post", (req, res) => {
      const jenis = req.body.jenis;
      const name = req.body.nama || "Seseorang";
      const saran = req.body.saran;

      const channel =
        jenis == "discord"
          ? channelSaran.saranDiscord
          : jenis == "youtube"
          ? channelSaran.saranYoutube
          : jenis == "website"
          ? channelSaran.saranWebsite
          : undefined;

      if (!channel) {
        err = `no channel ${jenis}`;
        return res.redirect("/saran");
      }

      this.#embed.setAuthor({ name }).setDescription(saran);

      channel
        .send({ embeds: [this.#embed] })
        .then(() => {
          success = true;
          res.redirect("/saran");
        })
        .catch((e) => {
          console.error("Cannot send suggest to discord", e);
          err = "cannot send";
          res.redirect("/saran");
        });
    });
  }

  getRouter() {
    return this.#app;
  }
}

module.exports = SaranRouter;
