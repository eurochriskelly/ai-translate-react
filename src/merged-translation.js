const fs = require("fs");
const path = require("path");
const yargs = require("yargs");

const argv = yargs
  .option("jsonpath", {
    description: "Where to find the translations",
    type: "string",
    demandOption: true,
  })
  .help()
  .alias("help", "h").argv;

function readJSONFiles(jsonpath) {
  const files = fs.readdirSync(jsonpath);
  const jsonFiles = files.filter((file) => path.extname(file) === ".json");

  let mergedObject = {};

  jsonFiles.forEach((file) => {
    const filePath = path.join(jsonpath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    try {
      const jsonObject = JSON.parse(fileContent);
      const compressed = Object.keys(jsonObject).reduce((p, n) => {
        if (jsonObject[n].preferredLabel) {
          p[n] = jsonObject[n].preferredLabel;
        } else {
          p[n] = jsonObject[n]
        }
        return p;
      }, {});
      mergedObject = { ...mergedObject, ...compressed };
    } catch (e) {
      return;
    }
  });

  return mergedObject;
}

// Merge JSON files and output the result
const mergedJSON = readJSONFiles(argv.jsonpath);
console.log(JSON.stringify(mergedJSON, null, 2));
