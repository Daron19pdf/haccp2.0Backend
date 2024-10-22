const mongoose = require('mongoose');

// sous document Etiquette produit
const labelSchema = mongoose.Schema({
    url: [String],
    date: String,
    user:String,
});

// sous document Relevé de température

const tempFridgeSchema = mongoose.Schema({
    dataTemp: [{
        fridge: { type: String, required: true },  
        period: { type: String, required: true },  
        temperature: { type: String, required: true },  
        observation: { type: String } ,
        date: { type: String},
      }],
    user:String,
});

// sous document contrôle température 

const tempProdSchema = mongoose.Schema({
    name: { type: String, required: true },
    temperature: { type: String, required: true },
    observation: { type: String },
    date: { type: String },
    time: { type: String },
    user: String,
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
    user:String,
});

// sous document livraison 

const delivrySchema = mongoose.Schema({
    dataDelivry:[{
        status: { type: String},
        site: { type: String },
        conforme: { type: String },
        critere: { type: String},
        name: { type: String},
        temperature: { type: String },
        observation: { type: String },
        date: { type: String},
        time: { type: String },
        user: { type: String},
}],
});

// sous document controle

const controleSchema = mongoose.Schema({
    fournisseur: String,
    label: String,
    etatCamion: String,
    tempCamion: String,
    aspect: String,
    numeroLot: String,
    temperature: String,
    dlc: String,
    date: String,
    user:String,
});

// sous document contrôle température de service

const tempServiceSchema = mongoose.Schema({
    lieu: String,
    date: String,
    nameCold: String,
    selectedPeriodCold: String,
    tempCold: String,   
    timeCold: String,
    nameHot: String,
    selectedPeriodHot: String,
    tempHot: String,
    timeHot: String,
    observation: { type: String, required: false },
    user:String,
    
});

// sous document plan de netoyage

const cleaningSchema = mongoose.Schema({
    lieu: String,
    item: String,
    date: String,
    user:String,
});

// sous document test huile

const oilTestSchema = mongoose.Schema({
    name: String,
    test: String,
    conforme: Boolean,
    action: String,
    date: String,
    user:String,
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