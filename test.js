import "dotenv/config";
import ollama from "ollama";
import OpenAI from "openai";

const [platform, model, limitString, input] = process.argv.slice(2);

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

const content =
  input ??
  `Convert the following string into a human readable search query in the format of "What is the best ____?". Do not output any additional text or formatting such as json or quotation marks. "tea kettle retro electric"`;

const limit = limitString ? parseInt(limitString) : 10;

const addMeasure = (func) => async () => {
  const startMark = performance.mark(`${model}:start`);
  const result = await func();
  const endMark = performance.mark(`${model}:end`);
  console.log(`${model}: ${result}`);
  console.log(
    `Time Elapsed: ${
      performance.measure(model, startMark.name, endMark.name).duration
    }ms`
  );
};

const testOllama = async () => {
  const response = await ollama.chat({
    model,
    messages: [
      {
        role: "user",
        content,
      },
    ],
  });
  return response.message.content;
};

const testOpenai = async () => {
  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content }],
    model,
  });
  return response.choices[0].message.content;
};

const test = (() => {
  switch (platform) {
    case "ollama":
      return addMeasure(testOllama);
    case "openai":
      return addMeasure(testOpenai);
    default:
      return null;
  }
})();

if (test === null) {
  console.log("Invalid platform");
  process.exit(1);
}

for (let i = 0; i < limit; i++) {
  test();
}
