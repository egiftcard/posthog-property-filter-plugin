async function setupPlugin({ config, global }) {
    global.propertiesToFilter = config.properties.split(',')
}

function recursiveFilterObject(properties, propertyToFilter) {
    const propertyToFilterCopy = [...propertyToFilter]
    const currentPropertyToFilter = propertyToFilterCopy.shift()
    let parsedProperties = {}

    if (propertyToFilterCopy.length && properties[currentPropertyToFilter]) {
        parsedProperties = recursiveFilterObject(properties[currentPropertyToFilter], propertyToFilterCopy)
    } else if (currentPropertyToFilter in properties) {
        parsedProperties = { ...properties }
        delete parsedProperties[currentPropertyToFilter]
    }

    return propertyToFilterCopy.length ? { [currentPropertyToFilter]: parsedProperties } : parsedProperties
}

async function processEvent(event, { global, storage }) {
    let propertiesCopy = event.properties ? { ...event.properties } : {}

    global.propertiesToFilter.forEach(async function (propertyToFilter) {
        if (propertyToFilter === '$ip') {
            delete event.ip
        }

        if (propertyToFilter.includes('.')) {
            propertiesCopy = {
                ...propertiesCopy,
                ...recursiveFilterObject(propertiesCopy, propertyToFilter.split('.')),
            }
        } else if (propertyToFilter in propertiesCopy) {
            delete propertiesCopy[propertyToFilter]
        }
    })

    return { ...event, properties: propertiesCopy }
}

module.exports = {
    setupPlugin,
    processEvent,
}
