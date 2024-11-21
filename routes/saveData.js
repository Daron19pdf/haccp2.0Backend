var express = require('express');
const SaveData = require('../models/saveData');
const User = require('../models/users');
var router = express.Router();
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post('/', (req, res) => {
    const { token, url, tempFridge, tempProd, cellule, delivry, controle, tempService, cleaning, oilTest } = req.body;

    if (!token) {
        return res.json({ result: false, error: "Le token doit être fourni." });
    }


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
            user: user._id, 
            createdAt: new Date() 
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

        const startDate = new Date(date + 'T00:00:00Z');
        const endDate = new Date(date + 'T23:59:59Z');

        console.log("Recherche pour l'utilisateur:", user._id);
        console.log("Date de début:", startDate);
        console.log("Date de fin:", endDate);

        SaveData.find({
            user: user._id, 
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





// Route pour upload des images st Ex elem (tracabilité) sur cloudinary 

router.post('/upload-images', async (req, res) => {

  console.log('Requête reçue:', req.files);
  
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Le token doit être fourni." });
    }

    // Recherche de l'utilisateur avec le token
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    // Vérification des fichiers
    console.log('Fichiers reçus:', req.files); // Ajout du log pour vérifier les fichiers reçus
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "Aucun fichier n'a été fourni." });
    }

    // Traitement des fichiers
    const uploadPromises = Object.values(req.files).map((file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'St Ex Elem/traça' },
          (error, result) => {
            if (error) {
              return reject(new Error(`Erreur lors de l'upload de ${file.name}: ${error.message}`));
            }
            resolve(result.secure_url); // Retourne l'URL sécurisé de l'image
          }
        );

        // Vérifie si le fichier a un buffer
        if (!file.data) {
          return reject(new Error(`Le fichier ${file.name} est indéfini.`));
        }

        streamifier.createReadStream(file.data).pipe(uploadStream);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    // Créer une nouvelle instance de SaveData avec les URLs des images et lier à l'utilisateur
    const newSaveData = new SaveData({
      label: { url: imageUrls, date: new Date() },
      user: user._id,
    });

     
    // Sauvegarder dans la base de données
    const savedData = await newSaveData.save();

    // Retourner la réponse avec les données sauvegardées
    return res.json({ result: true, data: savedData });

  } catch (error) {
    console.error('Erreur dans la route upload-images:', error);
    return res.status(500).json({ error: "Erreur lors de l'upload des images", details: error.message });
  }
});

module.exports = router;




// Route pour upload des images st Ex elem (Controle marchandise) sur cloudinary
router.post('/upload-images/control', async (req, res) => {

    console.log('Requête reçue:', req.body);
    
    try {
        const token = req.body.token;

        // Vérifiez la présence du token
        if (!token) {
            return res.status(400).json({ error: "Le token doit être fourni." });
        }

        // Recherche de l'utilisateur avec le token
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        // Vérifie si des fichiers ont été envoyés
        if (!req.files || !req.files.photos || req.files.photos.length === 0) {
            return res.status(400).json({ error: "Aucune photo n'a été fournie." });
        }

        const photos = Array.isArray(req.files.photos) ? req.files.photos : [req.files.photos];
        const savedDataArray = [];

        // Itération sur chaque photo pour traitement
        for (let i = 0; i < photos.length; i++) {
            const photo = photos[i];

            // Vérification des données associées
            const aspect = req.body[`aspect_${i}`];
            const lot = req.body[`lot_${i}`];
            const temperature = req.body[`temperature_${i}`];
            const date = req.body[`date_${i}`];

            if (!aspect || !lot || !temperature || !date) {
                return res.status(400).json({ error: "Les données associées sont manquantes." });
            }

            // Upload de l'image vers Cloudinary
            const photoUrl = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'St Ex Elem/traça' },
                    (error, result) => {
                        if (error) {
                            return reject(new Error(`Erreur lors de l'upload de ${photo.name}: ${error.message}`));
                        }
                        resolve(result.secure_url); // Retourne l'URL sécurisé de l'image
                    }
                );
                streamifier.createReadStream(photo.data).pipe(uploadStream); // Utilise le buffer de la photo
            });

            // Créer une nouvelle instance de SaveData
            const newSaveData = new SaveData({
                label: { url: photoUrl, date: new Date() },
                controle: {
                    fournisseur: req.body.fournisseur,
                    etatCamion: req.body.etatCamion,
                    tempCamion: req.body.tempCamion,
                    aspect,
                    numeroLot: lot,
                    temperature,
                    dlc: date,
                },
                user: user._id,
            });

            // Sauvegarder dans la base de données
            const savedData = await newSaveData.save();
            savedDataArray.push(savedData);
        }

        // Retourner la réponse avec toutes les données sauvegardées
        return res.json({ result: true, data: savedDataArray });

    } catch (error) {
        console.error('Erreur dans la route upload-images:', error);
        return res.status(500).json({ error: "Erreur lors de l'upload des images", details: error.message });
    }
});



 

  





  
  // Routes pour upload les données du relevé de température 

  router.post('/upload-temp', async (req, res) => {
    const { token, dataTemp } = req.body;
  
    // Vérification que le token et les données de température sont fournis
    if (!token) {
      return res.status(400).json({ result: false, error: "Le token doit être fourni." });
    }
  
    if (!dataTemp) {
      return res.status(400).json({ result: false, error: "Les données de température doivent être fournies." });
    }
  
    try {
      // Recherche de l'utilisateur avec le token
      const user = await User.findOne({ token });
      if (!user) {
        return res.status(404).json({ result: false, error: "Utilisateur non trouvé." });
      }
  
      // Créer un nouvel enregistrement dans SaveData
      const newSaveData = new SaveData({
        tempFridge: { dataTemp }, // On passe directement l'objet `dataTemp`
        user: user._id,
        createdAt: new Date(),
      });
  
      // Sauvegarder dans la base de données
      const savedData = await newSaveData.save();
  
      // Retourner la réponse avec les données sauvegardées
      return res.status(201).json({ result: true, data: savedData });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ result: false, error: "Erreur lors de l'enregistrement des données." });
    }
  });

  // Routes pour upload les données du controle de température
  
  router.post('/upload-controle', async (req, res) => {
    const { token, resultControl } = req.body;
  
    // Vérification que le token et les données de température sont fournis
    if (!token || !resultControl) {
      return res.status(400).json({ result: false, error: "Le token doit être fourni ou les données de température." });
    }
  
    try {
      // Recherche de l'utilisateur avec le token
      const user = await User.findOne({ token });
      if (!user) {
        return res.status(404).json({ result: false, error: "Utilisateur non trouvé." });
      }
  
      // Créer un nouvel enregistrement dans SaveData
      const newSaveData = new SaveData({
        tempProd:  {
        name: resultControl.name,
        temperature: resultControl.temperature,
        date : resultControl.date,
        time: resultControl.time,
        observation: resultControl.observation,
      }, 
        user: user._id,
        createdAt: new Date(),
      });
  
      // Sauvegarder dans la base de données
      const savedData = await newSaveData.save();
  
      // Retourner la réponse avec les données sauvegardées
      return res.status(201).json({ result: true, data: savedData });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ result: false, error: "Erreur lors de l'enregistrement des données." });
    }
  }
  );
  

  // Routes pour upload les données de Livraison 

  router.post('/upload-delivry', async (req, res) => {

    const { token, dataDelivry } = req.body;

    console.log(dataDelivry)

    if (!token || !dataDelivry) {
      return res.status(400).json({ result: false, error: "Le token doit être fourni ou les données de température." });
    }
  
    try {
      const user = await User.findOne({ token });
      if (!user) {
        return res.status(404).json({ result: false, error: "Utilisateur non trouvé." });
      }
  
      const newSaveData = new SaveData({
        delivry: {dataDelivry}, 
        user: user._id,
        createdAt: new Date(),
      });

      const savedData = await newSaveData.save();

      console.log(savedData)
  
      return res.status(201).json({ result: true, data: savedData });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ result: false, error: "Erreur lors de l'enregistrement des données." });
    }
  }
  );
  
  // Routes pour upload les données controle de temperature 

  router.post('/upload-service', async (req, res) => {
    console.log(req.body)
    const { token, resultControl } = req.body;
  
    if (!token || !resultControl) {
      return res.status(400).json({ result: false, error: "Le token ou les données de contrôle doivent être fournis." });
    }
  
    
    try {
      const user = await User.findOne({ token });
      if (!user) {
        return res.status(404).json({ result: false, error: "Utilisateur non trouvé." });
      }
  
      // Créer un nouvel enregistrement dans SaveData avec les données envoyées
      const newSaveData = new SaveData({
        tempService:  {
          lieu: resultControl.lieu,  // Utilisez resultControl pour accéder aux propriétés envoyées
          date: resultControl.date,
          nameCold: resultControl.nameCold,
          selectedPeriodCold: resultControl.selectedPeriodCold,
          tempCold: resultControl.tempCold,   
          timeCold: resultControl.timeCold,
          nameHot: resultControl.nameHot,
          selectedPeriodHot: resultControl.selectedPeriodHot,
          tempHot: resultControl.tempHot,
          timeHot: resultControl.timeHot,
          observation: resultControl.observation
        }, 
        user: user._id,
        createdAt: new Date(),
      });
  
      const savedData = await newSaveData.save();
  
      return res.status(201).json({ result: true, data: savedData });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ result: false, error: "Erreur lors de l'enregistrement des données." });
    }
});


// route pour upload les données de netoyage

router.post('/upload-cleaning', async (req, res) => {
    const { token, dataCleaning } = req.body;
    console.log(dataCleaning);
    
  
    if (!token || !dataCleaning) {
      return res.status(400).json({ result: false, error: "Le token ou les données de nettoyage doivent être fournis." });
    }
  
    try {
      const user = await User.findOne({ token });
      if (!user) {
        return res.status(404).json({ result: false, error: "Utilisateur non trouvé." });
      }
  
      const newSaveData = new SaveData({
        cleaning: dataCleaning, 
        user: user._id,
        createdAt: new Date(),
      });
  
      const savedData = await newSaveData.save();
  
      return res.status(201).json({ result: true, data: savedData });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ result: false, error: "Erreur lors de l'enregistrement des données." });
    }
  }
  );


  // Routes pour upload les données de test huile

  router.post('/upload-oil', async (req, res) => {
    const { token, name, result, conforme, action } = req.body;
  
    if (!token || !name || !result || !conforme || !action) {
      return res.status(400).json({ result: false, error: "Le token ou les données de test d'huile doivent être fournis." });
    }
  
    try {
      const user = await User.findOne({ token });
      if (!user) {
        return res.status(404).json({ result: false, error: "Utilisateur non trouvé." });
      }
  
      const newSaveData = new SaveData({
        oilTest: {
          name,
          result,
          conforme,
          action,
          date: new Date()
        },
        user: user._id,
        createdAt: new Date(),
      });
  
      const savedData = await newSaveData.save();
  
      return res.status(201).json({ result: true, data: savedData });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ result: false, error: "Erreur lors de l'enregistrement des données." });
    }
  }
  );
  

module.exports = router;
