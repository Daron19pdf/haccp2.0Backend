const mongoose = require('mongoose');

// sous document fridge
const fridgeSchema = mongoose.Schema({
    fridge: String,
});

// sous document livraison

const delivrySchema = mongoose.Schema({
    siteProd: String,
    siteReception: String,
});

// sous document control 

const controlSchema = mongoose.Schema({
    fournisseurs: String,
});

// sous document plan de netoyage

const cleaningPlanSchema = mongoose.Schema({
    cuisine: String,
    refectoire: String,
});

// sous document test huile 

const oilTestSchema = mongoose.Schema({
    friteuse: String,
});

const equipementSchema = mongoose.Schema({
    
    fridge: fridgeSchema,
    delivry: delivrySchema,
    control: controlSchema,
    cleaningPlan: cleaningPlanSchema,
    oilTest: oilTestSchema,
    
    });

const Equipement = mongoose.model('Equipement', equipementSchema);

module.exports = Equipement;