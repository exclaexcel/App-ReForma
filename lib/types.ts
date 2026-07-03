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

export type PaymentMethod = "pix" | "cartao_credito" | "cartao_debito" | "dinheiro" | "boleto";

export type InstallmentStatus = "pending" | "paid" | "overdue";

export type ExpenseType = "mao_obra" | "material" | "loja" | "servico" | "outro";

export const EXPENSE_TYPES: ExpenseType[] = ["mao_obra", "material", "loja", "servico", "outro"];

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  mao_obra: "Mão de Obra",
  material: "Material",
  loja: "Loja / Acabamento",
  servico: "Serviço",
  outro: "Outro",
};

export type DocStatus = "completo" | "pendente" | "sem_comprovante" | "divergencia" | "sem_regra";

export type Installment = {
  id: string;
  expense_id: string;
  installment_number: number;
  total_installments: number;
  amount: number;
  due_date: string;
  status: InstallmentStatus;
  payment_method: PaymentMethod;
  paid_at: string | null;
  invoice_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ExpensePaymentStatus = "paid" | "partial" | "pending";

export const DOC_STATUS_LABELS: Record<DocStatus, string> = {
  completo: "Documentado",
  pendente: "Doc. incompleta",
  sem_comprovante: "Sem comprovante",
  divergencia: "Divergência",
  sem_regra: "—",
};

export type Expense = {
  id: string;
  project_id: string;
  category_id: string | null;
  room_id: string | null;
  expense_type: ExpenseType;
  description: string;
  amount: number;
  expense_date: string;
  /** @deprecated use installments/derived payment status; kept for compat during migration */
  payment_method: PaymentMethod;
  /** @deprecated use derived expense_payment_status */
  is_paid: boolean;
  receipt_url: string | null;
  invoice_url: string | null;
  invoice_number: string | null;
  invoice_value: number | null;
  /** @deprecated */
  paid_at: string | null;
  supplier_id: string | null;
  status: "ativo" | "cancelado";
  created_at: string;
  categories?: Category | null;
  rooms?: Room | null;
  suppliers?: { id: string; name: string } | null;
};

export type ExpenseInstallmentRow = {
  installment_id: string;
  expense_id: string;
  installment_number: number;
  total_installments: number;
  amount: number;
  due_date: string;
  installment_status: InstallmentStatus;
  payment_method: PaymentMethod;
  paid_at: string | null;
  installment_invoice_url: string | null;
  is_overdue: boolean;
  project_id: string;
  category_id: string | null;
  room_id: string | null;
  supplier_id: string | null;
  expense_type: ExpenseType;
  description: string;
  expense_total_amount: number;
  expense_date: string;
  receipt_url: string | null;
  expense_invoice_url: string | null;
  invoice_number: string | null;
  invoice_value: number | null;
  expense_status: "ativo" | "cancelado";
  created_at: string;
  categories?: Category | null;
  rooms?: Room | null;
  suppliers?: { id: string; name: string } | null;
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: "PIX",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  dinheiro: "Dinheiro",
  boleto: "Boleto",
};

export const INSTALLMENT_STATUS_LABELS: Record<InstallmentStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Atrasado",
};

export function deriveExpensePaymentStatus(
  installments: { status: InstallmentStatus }[]
): ExpensePaymentStatus {
  if (installments.length === 0) return "pending";
  const paidCount = installments.filter((i) => i.status === "paid").length;
  if (paidCount === installments.length) return "paid";
  if (paidCount === 0) return "pending";
  return "partial";
}

export const DEFAULT_CATEGORIES = [
  { name: "Mão de Obra", color_hex: "#C84B31" },
  { name: "Materiais Brutos", color_hex: "#5C3A21" },
  { name: "Acabamentos", color_hex: "#D97757" },
  { name: "Móveis e Decoração", color_hex: "#92400e" },
];

export type SupplierSpecialty =
  | "Elétrica"
  | "Hidráulica"
  | "Pintura"
  | "Marcenaria"
  | "Gesso"
  | "Piso"
  | "Outros";

export const SUPPLIER_SPECIALTIES: SupplierSpecialty[] = [
  "Elétrica",
  "Hidráulica",
  "Pintura",
  "Marcenaria",
  "Gesso",
  "Piso",
  "Outros",
];

export type Supplier = {
  id: string;
  project_id: string;
  name: string;
  specialty: SupplierSpecialty | null;
  whatsapp: string | null;
  budget_url: string | null;
  rating: number | null;
  notes: string | null;
  created_at: string;
};

export type EventType = "entrega_material" | "servico_mao_obra" | "pagamento" | "visita_tecnica";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  entrega_material: "Entrega de Material",
  servico_mao_obra: "Serviço / Mão de Obra",
  pagamento: "Pagamento",
  visita_tecnica: "Visita Técnica",
};

export type EventStatus = "pendente" | "confirmado" | "concluído";

export type ScheduleEvent = {
  id: string;
  project_id: string | null;
  title: string;
  event_type: string | null;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at: string | null;
  expense_id: string | null;
  supplier_id: string | null;
  room_id: string | null;
  status: EventStatus | null;
  photo_url: string | null;
  expenses?: { amount: number; description: string } | null;
  suppliers?: { name: string } | null;
  rooms?: { name: string } | null;
};
