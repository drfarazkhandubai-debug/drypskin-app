export type PrefillSymptom = {
  id: string;
  label: string;
  severity: number;
  color: string;
  icon: string;
};

let _prefill: { symptoms: PrefillSymptom[]; fromText: string } | null = null;

export function setSymptomPrefill(data: { symptoms: PrefillSymptom[]; fromText: string }) {
  _prefill = data;
}

export function consumeSymptomPrefill() {
  const d = _prefill;
  _prefill = null;
  return d;
}
