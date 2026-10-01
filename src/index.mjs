// Objectif : implémenter la frontière de décision métier propre au dépôt.
import { readFile } from "node:fs/promises";
export const DECISIONS = Object.freeze({
  "material_safety_change": "changement_de_sécurité",
  "use_change": "changement_d’usage",
  "editorial_change": "changement_éditorial",
  "unchanged": "inchangé"
});
const CRITERIA = Object.freeze({
  "material_safety_change": "changement de sécurité",
  "use_change": "changement d’usage",
  "editorial_change": "changement éditorial",
  "unchanged": "inchangé"
});
export function medicineDocumentChange(input) {
  if (!input?.id || !input?.text || !input?.source?.url || !input?.source?.date) throw new TypeError("Le dossier exige id, text, source.url et source.date");
  const date = new Date(input.source.date);
  if (Number.isNaN(date.valueOf())) throw new TypeError("source.date doit être une date ISO valide");
  return { ...input, id: String(input.id), text: String(input.text).trim(), source: { url: String(input.source.url), date: date.toISOString() } };
}
export async function compareMedicineDocument(input, provider) {
  const record = medicineDocumentChange(input);
  if (record.beforeText !== undefined && record.beforeText === record.afterText) return { decision: "unchanged", label: DECISIONS["unchanged"], probability: 1, review: false, deterministic: true };
  const response = await provider.decide({
    state: record,
    questions: { decision: { type: "choice", instructions: "Analysez ce comparaison documentaire pharmaceutique à partir des seuls éléments sourcés. Choisissez la catégorie la plus prudente. N’inventez ni fait, ni droit applicable, ni garantie.", criteria: CRITERIA } },
  });
  const answer = response.answers.decision;
  return { decision: answer.choice, label: DECISIONS[answer.choice], probability: answer.probabilities[answer.choice], confidence: answer.confidence, review: answer.confidence < 0.8, deterministic: false, usage: response.usage };
}
export async function runCli(argv, io = console) {
  if (argv.length !== 1) throw new Error("Usage : jev-medicament-doc-shift <dossier.json>");
  const dossier = medicineDocumentChange(JSON.parse(await readFile(argv[0], "utf8")));
  io.log(JSON.stringify({ dossier, prochaineÉtape: "Transmettez ce dossier à compareMedicineDocument avec un fournisseur Jev configuré." }, null, 2));
}
