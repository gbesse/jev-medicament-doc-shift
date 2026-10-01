// Objectif : montrer qu’une décision incertaine est explicitement envoyée en revue humaine.
import assert from "node:assert/strict";
import { compareMedicineDocument } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const dossier = {
  "id": "revue-1",
  "text": "Un paragraphe sur la prise pendant les repas est reformulé, sans permettre de déterminer si la recommandation change réellement.",
  "source": {
    "url": "https://example.test/dossier-ambigu",
    "date": "2026-09-26"
  },
  "details": {
    "origine": "donnée synthétique",
    "signal": "informations incomplètes"
  }
};
const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "use_change", probabilities: {
  "material_safety_change": 0.16,
  "use_change": 0.52,
  "editorial_change": 0.16,
  "unchanged": 0.16
}, confidence: 0.62 } }, usage: { input_tokens: 140, output_tokens: 0 } }));
const résultat = await compareMedicineDocument(dossier, provider);
assert.equal(résultat.decision, "use_change");
assert.equal(résultat.review, true);
assert.equal(provider.calls, 1);
console.log(`Décision : ${résultat.label} · revue humaine : ${résultat.review} · confiance : ${résultat.confidence}`);
