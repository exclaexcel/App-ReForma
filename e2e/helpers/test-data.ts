export const RUN_ID = process.env.PLAYWRIGHT_RUN_ID ?? Date.now().toString();

export const prefix = (label: string): string => `E2E-${RUN_ID}-${label}`;

export const testData = {
  expense: {
    descriptionSimple: prefix("Despesa Simples"),
    descriptionMaterial: prefix("Material Construção"),
    descriptionLabor: prefix("Mão de Obra"),
    amount: "1000",
    amountSmall: "50",
    amountMultiple: "600", // 6x de 100
  },
  event: {
    title: prefix("Evento Agenda"),
    notes: "Evento criado por teste E2E",
  },
  category: "Materiais",
};
