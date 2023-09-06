const fs = require("fs");

// todo gen metadata test
/**
 *
 * @param {string} target // alpha, beta, gamma
 * @param {number} numberOfToken
 */
function genMetadata(target, numberOfToken) {
  let all = [];
  const metadataExtension = ".json";

  for (let index = 0; index < numberOfToken; index++) {
    const target = `
    {
        "name": "Snowball #${index}",
        "description": "testing nft",
        "external_url": "",
        "image": "",
        "attributes": [
          {
            "trait_type": "Base",
            "value": "Starfish"
          },
          {
            "trait_type": "Color",
            "value": "blue"
          }
        ]
      }    
    `;
    fs.writeFileSync(`./asset/${index}${metadataExtension}`, target);
  }
}

genMetadata(10, "Zebra Drop", NUMBER_OF_TOKEN_BY_EDITION);
