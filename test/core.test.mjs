// Objectif : vérifier la normalisation, la règle déterministe et les décisions sémantiques.
import test from "node:test";
import assert from "node:assert/strict";
import { medicineDocumentChange, compareMedicineDocument } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const casLimite = {
  "id": "limite-1",
  "text": "Cas synthétique traité par une règle déterministe avant toute analyse sémantique.",
  "source": {
    "url": "https://example.test/cas-limite",
    "date": "2026-09-27"
  },
  "beforeText": "Notice identique",
  "afterText": "Notice identique"
};
const casPrincipal = {
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
const casÀRevoir = {
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
test("exige une source", () => assert.throws(() => medicineDocumentChange({ id: "x", text: "y" }), /source/));
test("applique le cas limite sans appel Jev", async () => {
  const provider = createFakeProvider(() => { throw new Error("appel interdit"); });
  assert.equal((await compareMedicineDocument(casLimite, provider)).decision, "unchanged");
  assert.equal(provider.calls, 0);
});
test("classe un dossier sourcé avec une confiance suffisante", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "material_safety_change", probabilities: {
  "material_safety_change": 0.82,
  "use_change": 0.06,
  "editorial_change": 0.06,
  "unchanged": 0.06
}, confidence: 0.82 } }, usage: { input_tokens: 10, output_tokens: 0 } }));
  const résultat = await compareMedicineDocument(casPrincipal, provider);
  assert.equal(résultat.decision, "material_safety_change");
  assert.equal(résultat.review, false);
  assert.equal(provider.calls, 1);
});
test("marque une décision incertaine pour revue humaine", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "use_change", probabilities: {
  "material_safety_change": 0.16,
  "use_change": 0.52,
  "editorial_change": 0.16,
  "unchanged": 0.16
}, confidence: 0.62 } }, usage: { input_tokens: 10, output_tokens: 0 } }));
  const résultat = await compareMedicineDocument(casÀRevoir, provider);
  assert.equal(résultat.decision, "use_change");
  assert.equal(résultat.review, true);
  assert.equal(résultat.confidence, 0.62);
  assert.equal(provider.calls, 1);
});
