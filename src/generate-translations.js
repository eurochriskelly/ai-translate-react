const fs = require('fs');
const axios = require('axios');
const yargs = require('yargs');

// Command line argument parsing
const argv = yargs
  .option('filename', {
    description: 'The name of the file to extract language strings from',
    type: 'string',
    demandOption: true
  })
  .option('model', {
    description: 'The GPT model to use',
    type: 'string',
    demandOption: true
  })
  .option('lang', {
    description: 'Target language',
    type: 'string',
    demandOption: true
  })
  .option('clobber', {
    description: 'Do not clobber',
    type: 'boolean',
    default: false
  })
  .help()
  .alias('help', 'h')
  .argv;



const { filename, model, clobber, lang } = argv;
console.log(`Translating using model [${model}]`)

const fnameDest = filename.replace('.json', `-${lang}.json`);
if (fs.existsSync(fnameDest) && !clobber) {
  console.log(`Skipping existing translation [${fnameDest}] due to --no-clobber option`);
  process.exit(0);
}

if (!filename) {
  console.error('Please provide a filename', error);
  process.exit(1);
}

const API_KEY = process.env['OPENAI_API_KEY'];

const translateFile = async (prompt) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages: [
          {
            role: 'system',
            content: [
              'Convert the provided JSON file from  the format provided which looks like:',
              `{
                 "unique_code": {
                    "preferredLabel": "some original english string",
                    "contextualInformation": "A description to help the translator"
                 },
                 etc.
              }`,
              '',
              '... to the desintation format which should like like: ',
              '',
              `{
                 "unique_code": "<TRANSLATED_STRING_IN_TARGET_LANGUAGE>"
                 etc.
              }`,
              '',
              'The user will provide the language and any additional instructions',
              'VERY IMPORTANT: ONLY OUTPUT JSON. IF ERROR PUT IT IN JSON!'
            ].join('\n')
          },
          {
            role: 'user',
            content: prompt
          },
        ],
        max_tokens: 300,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const {content} = response.data.choices[0].message;
    return content
  } catch (error) {
    console.error('Error summarizing the file:', error);
    process.exit(1);
  }
};

const addInstructions = (data, lang) => {
  return [
    `Below is a translation json file with entries for each phrase, expression, or even abbreviation to be translated`,
    'To help translate each item, the items have 2 properties, namely preferredLabel and contextualInformation described as follows:',
    ` - preferredLabel: is the original text in English that needs to be translated to the target language which is ${lang}`,
    ` - contextualInformation: is some information that tries to help understand what the preferredLabel is about. This could be very helpful for translating, for example, short labels such as abbreviations`,
    '',
    'Please translate the text from the input JSON format to the desired format which excludes the properties (i.e. just the translated text)',
    '',
    'Contents of JSON file to be translated:',
    '---------------------------------------',
    '',
    data.split('\n').map(line => `    ${line}`).join('\n')
  ].join('\n');
}

fs.readFile(filename, 'utf8', async (err, data) => {
  if (err) {
    console.error(`Error reading file ${filename}:`, err);
    process.exit(1);
  }
  const fullMessage = addInstructions(data, lang);
  const translation = await translateFile(fullMessage, lang);
  fs.writeFile(fnameDest, translation, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing summary to ${fnameDest}:`, err);
      process.exit(1);
    }
    console.log(`Summary written to ${fnameDest}`);
  });
});

