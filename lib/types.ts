export type Project = {
  id: string;
  user_id: string;
  name: string;
  total_budget: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  project_id: string;
  name: string;
  color_hex: string;
};

export type Room = {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
};

export type PaymentMethod =
  | "pix"
  | "cartao_credito"
  | "cartao_debito"
  | "dinheiro"
  | "boleto";

export type ExpensePhase = "Estrutura" | "Mobiliário & Decor";

export type Expense = {
  id: string;
  project_id: string;
  category_id: string | null;
  room_id: string | null;
  phase: ExpensePhase | null;
  description: string;
  amount: number;
  expense_date: string;
  payment_method: PaymentMethod;
  is_paid: boolean;
  receipt_url: string | null;
  created_at: string;
  categories?: Category | null;
  rooms?: Room | null;
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: "PIX",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  dinheiro: "Dinheiro",
  boleto: "Boleto",
};

export const DEFAULT_CATEGORIES = [
  { name: "Mão de Obra", color_hex: "#C84B31" },
  { name: "Materiais Brutos", color_hex: "#5C3A21" },
  { name: "Acabamentos", color_hex: "#D97757" },
  { name: "Móveis e Decoração", color_hex: "#92400e" },
];
