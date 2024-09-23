const mongoose = require('mongoose');

// sous document Etiquette produit
const labelSchema = mongoose.Schema({
    label: String,
    date: String,
});

// sous document Relevé de température

const tempFridgeSchema = mongoose.Schema({
    fridge: String,
    periode: String,
    temperature: String,
    observation: String,
    date: String,
});

// sous document contrôle température 

const tempProdSchema = mongoose.Schema({
    name: String,
    temperature: String,
    observation: String,
    date: String,
    time: String,
});

// sous document cellule de refroidissement

const celluleSchema = mongoose.Schema({
    nom: String,
    in: Boolean,
    out: Boolean,
    time: String,
    temperature: String,
    observation: String,
    date: String,
});

// sous document livraison 

const delivrySchema = mongoose.Schema({
    status: String,
    site: String,
    conforme: Boolean,
    critere: String,
    name: String,
    temperature: String,
    observation: String,
    date: String,
});

// sous document controle

const controleSchema = mongoose.Schema({
    fournisseur: String,
    etatCamion: String,
    tempCamion: Boolean,
    aspect: Boolean,
    numeroLot: Boolean,
    temperature: Boolean,
    dlc: String,
    date: String,

});

// sous document contrôle température de service

const tempServiceSchema = mongoose.Schema({
    lieu: String,
    coldName: String,
    coldTempBegin: String,
    coldHoursBegin: String,
    coldTempEnd: String,
    coldHoursEnd: String,
    hotName: String,
    hotTempBegin: String,
    hotHoursBegin: String,
    hotTempEnd: String,
    hotHoursEnd: String,
    observation: String,
    date: String,

});

// sous document plan de netoyage

const cleaningSchema = mongoose.Schema({
    lieu: String,
    item: String,
    date: String,
});

// sous document test huile

const oilTestSchema = mongoose.Schema({
    name: String,
    test: String,
    conforme: Boolean,
    action: String,
    date: String,
});

const saveDataSchema = mongoose.Schema({
    
    label: labelSchema,
    tempFridge: tempFridgeSchema,
    tempProd: tempProdSchema,
    cellule: celluleSchema,
    delivry: delivrySchema,
    controle: controleSchema,
    tempService: tempServiceSchema,
    cleaning: cleaningSchema,
    oilTest: oilTestSchema,
    createdAt: {
        type: Date,
        default: Date.now, 
      },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    });

const SaveData = mongoose.model('saveData', saveDataSchema);

module.exports = SaveData;