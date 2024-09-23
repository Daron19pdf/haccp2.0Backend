var express = require('express');
const SaveData = require('../models/saveData');
const User = require('../models/users');
var router = express.Router();
const { checkBody } = require("../modules/checkBody");


router.post('/', (req, res) => {
    const { token, label, tempFridge, tempProd, cellule, delivry, controle, tempService, cleaning, oilTest } = req.body;

    // Vérifiez que le token est fourni
    if (!token) {
        return res.json({ result: false, error: "Le token doit être fourni." });
    }


    // Trouver l'utilisateur par son token
    User.findOne({ token }).then(user => {
        if (!user) {
            return res.json({ result: false, error: "Utilisateur non trouvé." });
        }

        // Créer un nouvel enregistrement dans SaveData
        const newSaveData = new SaveData({
            label,
            tempFridge,
            tempProd,
            cellule,
            delivry,
            controle,
            tempService,
            cleaning,
            oilTest,
            user: user._id, // Lier les données à l'utilisateur
            createdAt: new Date() // Utiliser la date actuelle
        });

        // Sauvegarder dans la base de données
        newSaveData.save()
            .then(savedData => {
                res.json({ result: true, data: savedData });
            })
            .catch(err => {
                console.error(err);
                res.json({ result: false, error: "Erreur lors de l'enregistrement des données." });
            });
    }).catch(err => {
        console.error(err);
        res.json({ result: false, error: "Erreur lors de la recherche de l'utilisateur." });
    });
});

router.get('/saveData', (req, res) => {
    const { token, date } = req.query;

    if (!token || !date) {
        return res.json({ result: false, error: "Le token et la date doivent être fournis." });
    }

    User.findOne({ token }).then(user => {
        if (!user) {
            return res.json({ result: false, error: "Utilisateur non trouvé." });
        }

        // Créez des objets Date pour la recherche, en prenant en compte le fuseau horaire
        const startDate = new Date(date + 'T00:00:00Z');
        const endDate = new Date(date + 'T23:59:59Z');

        console.log("Recherche pour l'utilisateur:", user._id);
        console.log("Date de début:", startDate);
        console.log("Date de fin:", endDate);

        SaveData.find({
            user: user._id, // Assurez-vous que la clé user correspond à celle utilisée dans SaveData
            createdAt: { $gte: startDate, $lte: endDate }
        }).then(data => {
            if (data.length === 0) {
                return res.json({ result: false, message: "Aucune donnée trouvée pour cette date." });
            }

            res.json({ result: true, data: data });
        }).catch(err => {
            console.error(err);
            res.json({ result: false, error: "Erreur lors de la récupération des données." });
        });
    }).catch(err => {
        console.error(err);
        res.json({ result: false, error: "Erreur lors de la recherche de l'utilisateur." });
    });
});






  

  

module.exports = router;
