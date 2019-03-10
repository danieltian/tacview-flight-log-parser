import xmlParser from 'fast-xml-parser'

const FlightLogParser = {
  parse(fileContents) {
    let options = {
      attributeNamePrefix: '',
      ignoreAttributes: false,
      parseAttributeValue: true
    }

    let data = xmlParser.parse(fileContents, options)
    return data.TacviewDebriefing.Events.Event || []
  }
}

export default FlightLogParser