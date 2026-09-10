import { pipeline, env } from "@huggingface/transformers";

env.allowLocalModels = false;

let classifier = null;

async function getClassifier() {
  if (!classifier) {
    classifier = await pipeline(
      "sentiment-analysis",
      "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
    );
  }
  return classifier;
}

self.onmessage = async (event) => {
  const { id, text } = event.data;

  try {
    const pipe = await getClassifier();
    const result = await pipe(text);

    const urgencyPatterns = [
      /immediately/i, /urgent/i, /asap/i, /right now/i, /hurry/i,
      /within \d+ (minute|hour|day)/i, /expires? (today|tomorrow)/i,
      /last (chance|warning)/i, /act now/i,
    ];

    const fearPatterns = [
      /suspended/i, /terminated/i, /arrested/i, /legal action/i,
      /fraud/i, /infected/i, /virus/i, /compromised/i,
    ];

    const authorityPatterns = [
      /irs/i, /fbi/i, /police/i, /government/i, /ceo/i,
      /security/i, /official/i, /department/i,
    ];

    let urgencyScore = 0;
    let fearScore = 0;
    let authorityScore = 0;

    urgencyPatterns.forEach((p) => {
      if (p.test(text)) urgencyScore++;
    });
    fearPatterns.forEach((p) => {
      if (p.test(text)) fearScore++;
    });
    authorityPatterns.forEach((p) => {
      if (p.test(text)) authorityScore++;
    });

    const triggers = [];
    if (urgencyScore >= 2) triggers.push("urgency");
    if (fearScore >= 2) triggers.push("fear");
    if (authorityScore >= 2) triggers.push("authority");

    const totalScore = urgencyScore + fearScore + authorityScore;
    const sentimentScore = result[0].score;
    const sentimentLabel = result[0].label;

    let threatLevel = "safe";
    if (totalScore >= 4) threatLevel = "danger";
    else if (totalScore >= 2) threatLevel = "caution";

    self.postMessage({
      id,
      result: {
        sentiment: { label: sentimentLabel, score: sentimentScore },
        triggers,
        urgencyScore,
        fearScore,
        authorityScore,
        totalScore,
        threatLevel,
      },
    });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};
