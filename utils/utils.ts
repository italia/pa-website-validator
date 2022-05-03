'use strict'
import crawlerTypes from "../types/crawler-types"
import orderType = crawlerTypes.orderResult

exports.checkOrder = async (mandatoryElements: string[], foundElements: string[]) : Promise<orderType> => {
    let newMandatoryElements = []
    let newFoundElements = []
    let numberOfElementsNotInSequence = 0
    let elementsNotInSequence = []

    for (let mandatoryElement of mandatoryElements) {
        if (foundElements.includes(mandatoryElement)) {
            newMandatoryElements.push(mandatoryElement)
        }
    }

    for (let foundElement of foundElements) {
        if (newMandatoryElements.includes(foundElement)) {
            newFoundElements.push(foundElement)
        }
    }

    for (let i = 1; i < newFoundElements.length; i++) {
        let indexInMandatory = newMandatoryElements.indexOf(newFoundElements[i])
        let isInSequence = true

        if (indexInMandatory !== (newMandatoryElements.length - 1)) {
            if (i === (newFoundElements.length - 1)) {
                isInSequence = false
            } else if (newFoundElements[i + 1] !== newMandatoryElements[indexInMandatory + 1]){
                isInSequence = false
            }
        }

        if (indexInMandatory !== 0) {
            if (i === 0) {
                isInSequence = false
            } else if (newFoundElements[i - 1] !== newMandatoryElements[indexInMandatory - 1]) {
                isInSequence = false
            }
        }

        if (!isInSequence) {
            numberOfElementsNotInSequence++
            elementsNotInSequence.push(newFoundElements[i])
        }
    }

    return {
        numberOfElementsNotInSequence: numberOfElementsNotInSequence,
        elementsNotInSequence: elementsNotInSequence
    }
}