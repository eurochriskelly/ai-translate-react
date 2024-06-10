const fs = require('fs');
const axios = require('axios');
const yargs = require('yargs');

// Command line argument parsing
const argv = yargs
  .option('filename', {
    alias: 'f',
    description: 'The name of the file to extract language strings from',
    type: 'string',
    demandOption: true
  })
  .option('model', {
    alias: 'm',
    description: 'The GPT model to use',
    type: 'string',
    demandOption: true
  })
  .option('no-clobber', {
    alias: 'n',
    description: 'Do not clobber',
    type: 'boolean',
  })
  .help()
  .alias('help', 'h')
  .argv;

const { filename, model, clobber } = argv;
console.log(`Using model [${model}]`)
const prefix = filename.split('/').slice(-2).shift()
const fname = `/tmp/translations/${prefix}.json`
if (fs.existsSync(fname) && !clobber) {
  console.log(`Skipping existing translation [${fname}] due to --no-clobber option`);
  process.exit(0);
}

if (!filename) {
  console.error('Please provide a filename', error);
  process.exit(1);
}

const API_KEY = process.env['OPENAI_API_KEY'];

const summarizeFile = async (prompt) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages: [
          {
            role: 'system',
            content: [
              'Respond with JSON matching the user request. Do not add any formatting to the JSON response',
              'VERY IMPORTANT: ONLY OUTPUT JSON. IF ERROR PUT IT IN JSON!',
            ].join('\n')
          },
          {
            role: 'user',
            content: prompt
          },
        ],
        max_tokens: 4000,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const {content} = response.data.choices[0].message;
    console.log(content)
    return content
  } catch (error) {
    console.error('Error summarizing the file:', error);
    process.exit(1);
  }
};

const addInstructions = data => {
  return [
    `Below is a react file with strings that need to be translated using i18n.`,
    `Each applicable language string will be replaced by: t('${prefix}_someCode')`,
    `Expect to find strings in some of the following places:`,
    '- In headings, divs and p elements',
    '- In values passed to React components',
    '',
    `Can you extract all potential strings and give the result as json in the following format:`,
    `
    {
      "${prefix}_matchOutcome": {
        "preferredLabel": "D"
        "contextualInformation": "Match outcome seems to allow for win, draw or lose"
      },
      "${prefix}_someMismatch": {
        "preferredLabe": "Mismatch in number of parameters",
        "contextualInformation": "An error message displayed to user when the wrong number of values are imported"
      }
    }
    `,
    'NOTE THE ABOVE IS ONLY AN EXAMPLE OF HOW THE OUTPUT SHOULD APPEAR!',
    '',
    'Contents of react file:',
    '-----------------------',
    '',
    data.split('\n').map(line => `    ${line}`).join('\n')
  ].join('\n');
}

fs.readFile(filename, 'utf8', async (err, data) => {
  if (err) {
    console.error(`Error reading file ${filename}:`, err);
    process.exit(1);
  }
  const fullMessage = addInstructions(data);
  const summary = await summarizeFile(fullMessage);
  const summaryFilename = `/tmp/translations/${prefix}.json`;
  fs.writeFile(summaryFilename, summary, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing summary to ${summaryFilename}:`, err);
      process.exit(1);
    }
    console.log(`Summary written to ${summaryFilename}`);
  });
});

