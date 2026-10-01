// Objectif : montrer une décision sémantique avec des données entièrement synthétiques.
import assert from "node:assert/strict";
import { compareMedicineDocument } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const dossier = {
  "id": "exemple-1",
  "text": "La nouvelle notice ajoute une contre-indication pour une population qui n’était pas mentionnée dans la version précédente.",
  "source": {
    "url": "https://example.test/source-publique",
    "date": "2026-09-25"
  },
  "details": {
    "territoire": "Commune Exemple",
    "origine": "donnée synthétique"
  }
};
const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "material_safety_change", probabilities: {
  "material_safety_change": 0.82,
  "use_change": 0.06,
  "editorial_change": 0.06,
  "unchanged": 0.06
}, confidence: 0.82 } }, usage: { input_tokens: 120, output_tokens: 0 } }));
const résultat = await compareMedicineDocument(dossier, provider);
assert.equal(résultat.decision, "material_safety_change");
assert.equal(résultat.review, false);
assert.equal(provider.calls, 1);
console.log(`Décision : ${résultat.label} · probabilité : ${résultat.probability}`);
