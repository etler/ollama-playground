import "dotenv/config";
import fs from "fs/promises";
import ollama from "ollama";
import OpenAI from "openai";

const [platform, model, limitString, prompt] = process.argv.slice(2);

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

const content =
  prompt ??
  `Convert the following string into a human readable search query in the format of "What is the best ____?". Do not output any additional text or formatting such as json or quotation marks. "tea kettle retro electric"`;

const limit = limitString ? parseInt(limitString) : 10;

const addMeasure = (func) => async () => {
  const startTime = performance.mark("start");
  const { model, result } = await func();
  const endMark = performance.mark("end");
  console.log(`${model}: ${result}`);
  console.log(
    `Time Elapsed: ${
      performance.measure(model, startTime.name, endMark.name).duration
    }ms`
  );
};

const testOllama = (model) => async () => {
  const response = await ollama.chat({
    model,
    messages: [
      {
        role: "user",
        content,
      },
    ],
  });
  return { model, result: response.message.content };
};

const testOpenai = (model) => async () => {
  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content }],
    model,
  });
  return { model, result: response.choices[0].message.content };
};

const getTest = async (platform, model) => {
  switch (platform) {
    case "ollama":
      return addMeasure(testOllama(model));
    case "openai":
      return addMeasure(testOpenai(model));
    case "config":
      const config = await fs.readFile(model, { encoding: "utf8" });
      const configParams = config
        .split("\n")
        .filter((params) => params.trim() !== "");
      const tests = await Promise.all(
        configParams.map((params) => {
          const [platform, model] = params.trim().split(/\s+/);
          return getTest(platform, model);
        })
      );
      return async () => {
        for (const test of tests) {
          await test();
        }
      };
    default:
      return null;
  }
};

const test = await getTest(platform, model);

if (test === null) {
  console.log("Invalid platform");
  process.exit(1);
}

for (let i = 0; i < limit; i++) {
  await test();
}
