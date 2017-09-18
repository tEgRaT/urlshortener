import { UrlEntry } from './urlEntry'

export function isDuplicate(url) {
    return UrlEntry
        .findOne({ original: url })
        .then(doc => {
            return doc ? doc.shortCode : false
        })
}

export function getShortCode() {
    return UrlEntry
        .find() // We search without criteria
        .sort({ shortCode: -1 }) // We sort by shortCode DESCENDING
        .limit(1) // We only return the FIRST
        .select({ _id: 0, shortCode: 1 }) // We only return the shortCode field
        .then(docs => {
            // If a docuemnt is found, we return it's shortCode plus one,
            // otherwise, we return 0, as it means there are no documents,
            // and this is the first
            return docs.length === 1 ? docs[0].shortCode + 1 : 0
        })
}

export function insertNew(url) {
    // We get a new code from getShortCode first
    // It returns a promise as it's an asynchronous action
    return getShortCode().then(newCode => {
        // We create a new UrlEntry using the mongoose model
        let newUrl = new UrlEntry({
            original: url,
            shortCode: newCode
        })
        return newUrl.save()
    })
}
