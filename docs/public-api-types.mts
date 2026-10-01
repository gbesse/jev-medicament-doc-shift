// Objectif : vérifier que les types publics sont importables.
import { medicineDocumentChange, compareMedicineDocument } from "../src/index.mjs";
const dossier = medicineDocumentChange({
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
});
void compareMedicineDocument(dossier, { decide: async () => ({}) });
