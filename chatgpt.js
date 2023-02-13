const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function runCompletion() {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `rewrite this sentence "A Cat In Need Meows for Help an Attention Outside a Hotel, Gets Rescued and Blossoms Into a Handsome Lad"`,
    temperature: 0,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  
  console.log(completion.data.choices[0].text);
}

runCompletion();