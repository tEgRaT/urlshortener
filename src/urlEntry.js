import mongoose from 'mongoose'

// Set up the urlEntry schema
var urlSchema = mongoose.Schema({
    original: String,
    shortCode: {
        type: Number,
        index: true
    }
})

// Create an index here so it's faster to search by shortCode
urlEntrySchema.index({ shortCode: 1 })
urlEntrySchema.set('autoIndex', false)

// Now create the model
export var UrlEntry = mongoose.model('UrlEntry', urlEntrySchema)
