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

export type ExpenseType = "mao_obra" | "material" | "loja" | "servico" | "outro";

export const EXPENSE_TYPES: ExpenseType[] = [
  "mao_obra",
  "material",
  "loja",
  "servico",
  "outro",
];

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  mao_obra: "Mão de Obra",
  material: "Material",
  loja: "Loja / Acabamento",
  servico: "Serviço",
  outro: "Outro",
};

export type DocStatus = "completo" | "pendente" | "sem_comprovante" | "divergencia" | "sem_regra";

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
  payment_method: PaymentMethod;
  is_paid: boolean;
  receipt_url: string | null;
  invoice_url: string | null;
  invoice_number: string | null;
  invoice_value: number | null;
  paid_at: string | null;
  supplier_id: string | null;
  status: "ativo" | "cancelado";
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

export type TaskStatus = "pendente" | "em_andamento" | "concluido";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
};

export type Task = {
  id: string;
  project_id: string;
  room_id: string | null;
  title: string;
  notes: string | null;
  status: TaskStatus;
  sequence_order: number | null;
  created_at: string;
  updated_at: string | null;
  rooms?: { id: string; name: string } | null;
};

export type EventType =
  | "entrega_material"
  | "servico_mao_obra"
  | "pagamento"
  | "visita_tecnica";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  entrega_material: "Entrega de Material",
  servico_mao_obra: "Serviço / Mão de Obra",
  pagamento: "Pagamento",
  visita_tecnica: "Visita Técnica",
};

export type ScheduleEvent = {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  event_type: EventType;
  event_date: string;
  notes: string | null;
  created_at: string;
};
