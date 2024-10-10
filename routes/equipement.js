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

router.put("/update", (req, res) => {
  if (!checkBody(req.body, ["token"])) {
    return res.status(400).json({ result: false, error: "Le token doit être fourni" });
  }

  // Trouver l'utilisateur avec le token
  User.findOne({ token: req.body.token })
    .then((user) => {
      if (user) {
        // Si l'utilisateur n'a pas encore d'équipement, on crée un nouveau document
        if (!user.equipement) {
          const newEquipement = new Equipement({
            fridge: req.body.fridge || [], // Garder un tableau vide si aucun frigo n'est envoyé
            delivry: req.body.delivry || {},
            control: req.body.control || {},
            cleaningPlan: req.body.cleaningPlan || {},
            oilTest: req.body.oilTest || {},
          });

          newEquipement
            .save()
            .then((savedEquipement) => {
              // Associer l'équipement à l'utilisateur
              user.equipement = savedEquipement._id;
              return user.save();
            })
            .then(() => {
              res.json({ result: true, equipement: newEquipement });
            })
            .catch((err) => {
              console.error(err);
              res.status(500).json({ result: false, error: "Erreur lors de la sauvegarde de l'équipement" });
            });
        } else {
          // Si l'équipement existe, on le met à jour sans effacer les champs non fournis
          Equipement.findById(user.equipement)
            .then((equipement) => {
              if (equipement) {
                // Mettre à jour seulement les champs qui sont présents dans la requête
                equipement.fridge = req.body.fridge !== undefined ? req.body.fridge : equipement.fridge;
                equipement.delivry = req.body.delivry !== undefined ? req.body.delivry : equipement.delivry;
                equipement.control = req.body.control !== undefined ? req.body.control : equipement.control;
                equipement.cleaningPlan = req.body.cleaningPlan !== undefined ? req.body.cleaningPlan : equipement.cleaningPlan;
                equipement.oilTest = req.body.oilTest !== undefined ? req.body.oilTest : equipement.oilTest;

                return equipement.save();
              } else {
                throw new Error("Équipement non trouvé");
              }
            })
            .then((updatedEquipement) => {
              res.json({ result: true, equipement: updatedEquipement });
            })
            .catch((err) => {
              console.error(err);
              res.status(500).json({ result: false, error: "Erreur lors de la mise à jour de l'équipement" });
            });
        }
      } else {
        res.status(404).json({ result: false, error: "Utilisateur non trouvé" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ result: false, error: "Erreur lors de la recherche de l'utilisateur" });
    });
});


router.get("/list", (req, res) => {
  
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  User.findOne({ token: token })
    .populate("equipement")
    .then((user) => {
      if (user) {
        res.json({ result: true, equipement: user.equipement });
      } else {
        res.status(404).json({ result: false, error: "Utilisateur non trouvé" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ result: false, error: "Erreur lors de la recherche de l'utilisateur" });
    });
});


module.exports = router;
