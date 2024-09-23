var express = require('express');
const Equipement = require('../models/equipement');
const SaveData = require('../models/saveData'); // Import du modèle SaveData
const User = require('../models/users');
var router = express.Router();
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const mongoose = require("mongoose");
const { checkBody } = require("../modules/checkBody");

/* POST new user */
router.post("/add", (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {
    return res.json({ result: false, error: "Tous les champs doivent être remplis" });
  }

  // Rechercher un utilisateur avec le pseudo envoyé dans req.body
  User.findOne({ username: req.body.username }).then((existingUser) => {
    if (existingUser === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      // Créer un nouvel équipement lié au nouvel utilisateur
      const newEquipement = new Equipement({});
      const newSaveData = new SaveData({}); // Créer une nouvelle instance de SaveData

      // Sauvegarder les équipements et SaveData
      newEquipement.save().then((savedEquipement) => {
        newSaveData.save().then((savedSaveData) => {
          // Créer un nouvel utilisateur et lier les équipements et saveData
          const newUser = new User({
            username: req.body.username,
            password: hash,
            token: uid2(32),
            equipement: savedEquipement._id,
            saveData: savedSaveData._id, // Lien vers le document SaveData
            editor: null,
          });

          // Sauvegarder l'utilisateur
          newUser.save().then((savedUser) => {
            console.log(savedUser);
            res.json({ result: true, token: savedUser.token });
          });
        });
      });
    } else {
      res.json({ result: false, error: "L'utilisateur existe déjà." });
    }
  });
});

/* POST login */

router.post("/login", (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Tous les champs doivent être remplis" });
    return;
  }

  User.findOne({ username: req.body.username }).then((data) => {
    console.log(data);
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        token: data.token,
      });
    } else {
      res.json({
        result: false,
        error: "Utilisateur inexistant ou mot de passe incorrect",
      });
    }
  });
});




module.exports = router;
