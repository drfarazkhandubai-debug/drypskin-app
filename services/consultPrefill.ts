export type ConsultPrefill = {
  typeId?: "nurse" | "gp" | "specialist";
  specialty?: string;
};

let _prefill: ConsultPrefill | null = null;

export function setConsultPrefill(data: ConsultPrefill) {
  _prefill = data;
}

export function consumeConsultPrefill(): ConsultPrefill | null {
  const d = _prefill;
  _prefill = null;
  return d;
}
