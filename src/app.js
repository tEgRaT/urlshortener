import express from 'express'
import path from 'path'
import mongoose from 'mongoose' // Import mongoose

import { UrlEntry } from './urlEntry'
import { createFullUrl, isValidUrl } from './url-utils'
import { getShortCode, isDuplicate, insertNew } from './mongo-utils'

export const app = express()

// view engine setup
app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, '../public')))

// Use NodeJS promises instead of built in ones
// We only do this because the promise library
// in mongoose is now deprecated.
mongoose.Promise = global.Promise

// Connect to your MongoDB instance and chosen collection
mongoose.connect('mongodb://localhost:27017/urlShortener')

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/new/*', (req, res) => {
    let url = req.params[0]
    if (isValidUrl(url)) {
        isDuplicate(url).then(shortCode => {
            if (shortCode) {
                res.status(200).json({
                    error: 'URL already exists in the database.',
                    url: 'http://www.example.com/${shortCode}'
                })
            } else {
                insertNew(url).then(insertedDocument => { // save() gives us the inserted document to use
                    if (!insertedDocument) {
                        res.status(500).json({
                            error: 'Unkown error' // Something failed for some reason.
                        })
                    } else {
                        //res.status(200).send(`URL successfully shortened: http://www.example.com/${insertedDocument.shortCode}`) // We return the shortened URL
                        let short_url = 'https://tegraturlshortener.herokuapp.com/' + insertedDocument.shortCode
                        res.status(200).json({
                            original_url: url,
                            short_url: short_url
                        })
                    }
                })
            }
        })
    } else {
        res.status(500).json({
            error: 'Invalid URL format. Input URL must comply to the following: http(s)://(www.)domain.ext(/)(path)'
        })
    }
})

app.get('/:shortCode', (req, res) => {
    let shortCode = parseInt(req.params.shortCode) // We parse the input code
    if (isNaN(shortCode)) { // It's not a number :(
        res.status(500).json({
            error: 'Invalid URL shortCode. It must be a number.'
        })
    } else {
        UrlEntry
            .findOne({ shortCode })
            .then(doc => {
                if (!doc) { // It does not exist as there is no result
                    res.status(404).json({
                        error: 'Page not found'
                    })
                } else { // It exists, we use redirect on the response with the original URL as argument
                    res.redirect(doc.original)
                }
            })
    }
})
