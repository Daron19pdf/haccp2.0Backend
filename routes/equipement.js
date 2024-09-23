var express = require('express');
const Equipement = require('../models/equipement');
const User = require('../models/users');
var router = express.Router();
const { checkBody } = require("../modules/checkBody");

/* POST equipement pour un utilisateur existant */
router.post("/", (req, res) => {
  if (!checkBody(req.body, ["token"])) {
    return res.json({ result: false, error: "Le token doit être fourni" });
  }

  // Trouver l'utilisateur avec le token
  User.findOne({ token: req.body.token }).then((user) => {
    if (user) {
      // Si l'utilisateur n'a pas encore d'équipement, on crée un nouveau document
      if (!user.equipement) {
        const newEquipement = new Equipement({
          fridge: req.body.fridge || {},
          delivry: req.body.delivry || {},
          control: req.body.control || {},
          cleaningPlan: req.body.cleaningPlan || {},
          oilTest: req.body.oilTest || {},
        });

        newEquipement.save().then((savedEquipement) => {
          // Associer equipement à l'utilisateur
          user.equipement = savedEquipement._id;
          user.save().then(() => {
            res.json({ result: true, equipement: savedEquipement });
          });
        });
      } else {
        // Si equipement existe, on le met à jour
        Equipement.findByIdAndUpdate(
          user.equipement,
          {
            fridge: req.body.fridge || {},
            delivry: req.body.delivry || {},
            control: req.body.control || {},
            cleaningPlan: req.body.cleaningPlan || {},
            oilTest: req.body.oilTest || {},
          },
          { new: true } // Pour retourner la nouvelle version mise à jour
        ).then((updatedEquipement) => {
          res.json({ result: true, equipement: updatedEquipement });
        });
      }
    } else {
      res.json({ result: false, error: "Utilisateur non trouvé" });
    }
  });
});

module.exports = router;
