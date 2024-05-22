import ollama from "ollama";

const content = `Convert the following string into a human readable search query in the format of "What is the best ____?". Do not output any additional text or formatting such as json or quotation marks. "tea kettle retro electric"`;

for (let i = 0; i < 10; i++) {
  const phiModelName = "phi3:mini";
  const phiStart = performance.mark(`${phiModelName}:start`);
  const phiResponse = await ollama.chat({
    model: "phi3:mini",
    messages: [
      {
        role: "user",
        content,
      },
    ],
  });
  const phiEnd = performance.mark(`${phiModelName}:end`);
  console.log(`Phi: ${phiResponse.message.content}`);
  console.log(
    `Time Elapsed: ${
      performance.measure(phiModelName, phiStart.name, phiEnd.name).duration
    }ms`
  );
}

for (let i = 0; i < 10; i++) {
  const gemmaModelName = "phi3:mini";
  const gemmaStart = performance.mark(`${gemmaModelName}:start`);
  const gemmaResponse = await ollama.chat({
    model: "gemma:2b",
    messages: [
      {
        role: "user",
        content,
      },
    ],
  });
  const gemmaEnd = performance.mark(`${gemmaModelName}:end`);
  console.log(`Gemma: ${gemmaResponse.message.content}`);
  console.log(
    `Time Elapsed: ${
      performance.measure(gemmaModelName, gemmaStart.name, gemmaEnd.name)
        .duration
    }ms`
  );
}
