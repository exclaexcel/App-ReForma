import { describe, expect, it } from "vitest";
import {
  cardInstallmentDueDate,
  computeInstallmentDueDate,
  getDocStatus,
  getStoragePath,
  nextCardDueDate,
  sanitizeFileName,
  splitAmountCentavos,
} from "./utils";
import type { Expense } from "./types";

function expense(partial: Partial<Expense>): Expense {
  return {
    id: "e1",
    project_id: "p1",
    category_id: null,
    room_id: null,
    expense_type: "outro",
    description: "teste",
    amount: 100,
    expense_date: "2026-08-11",
    payment_method: "pix",
    is_paid: false,
    receipt_url: null,
    invoice_url: null,
    invoice_number: null,
    invoice_value: null,
    paid_at: null,
    supplier_id: null,
    card_id: null,
    status: "ativo",
    created_at: "2026-08-11T00:00:00Z",
    ...partial,
  };
}

describe("splitAmountCentavos", () => {
  it("distribui centavos sem perder o total", () => {
    const parts = splitAmountCentavos(10, 3);
    expect(parts).toHaveLength(3);
    const sum = parts.reduce((acc, n) => acc + Math.round(n * 100), 0);
    expect(sum).toBe(1000);
    expect(parts.reduce((a, b) => a + b, 0)).toBeCloseTo(10, 10);
  });

  it("rejeita n < 1", () => {
    expect(() => splitAmountCentavos(10, 0)).toThrow();
  });
});

describe("card due dates", () => {
  it("1ª fatura é no mês seguinte", () => {
    expect(nextCardDueDate("2026-08-15", 25)).toBe("2026-09-25");
  });

  it("mês curto limita o dia", () => {
    expect(nextCardDueDate("2026-01-31", 28)).toBe("2026-02-28");
  });

  it("parcela N repete o dia da fatura", () => {
    expect(cardInstallmentDueDate("2026-08-15", 25, 0)).toBe("2026-09-25");
    expect(cardInstallmentDueDate("2026-08-15", 25, 1)).toBe("2026-10-25");
  });

  it("crédito usa dia do cartão; pix usa addMonths", () => {
    expect(computeInstallmentDueDate("2026-08-15", 0, "cartao_credito", 25)).toBe("2026-09-25");
    expect(computeInstallmentDueDate("2026-08-15", 1, "pix", 25)).toBe("2026-09-15");
  });

  it("fechamento 12 / due 25: no dia do corte entra na fatura deste ciclo", () => {
    expect(nextCardDueDate("2026-05-16", 25, 12)).toBe("2026-06-25");
    expect(nextCardDueDate("2026-05-12", 25, 12)).toBe("2026-05-25");
    expect(nextCardDueDate("2026-05-13", 25, 12)).toBe("2026-06-25");
  });

  it("fechamento 20 / due 25: compra antes e depois do corte", () => {
    expect(nextCardDueDate("2026-08-15", 25, 20)).toBe("2026-08-25");
    expect(nextCardDueDate("2026-08-21", 25, 20)).toBe("2026-09-25");
  });

  it("parcela N com closing parte da 1ª fatura correta", () => {
    expect(cardInstallmentDueDate("2026-05-16", 25, 0, 12)).toBe("2026-06-25");
    expect(cardInstallmentDueDate("2026-05-16", 25, 1, 12)).toBe("2026-07-25");
  });

  it("computeInstallmentDueDate passa closing", () => {
    expect(computeInstallmentDueDate("2026-05-16", 0, "cartao_credito", 25, 12)).toBe("2026-06-25");
  });
});

describe("getDocStatus", () => {
  it("material pago sem comprovante", () => {
    expect(
      getDocStatus(
        expense({
          expense_type: "material",
          is_paid: true,
          invoice_url: "nf.pdf",
          receipt_url: null,
        })
      )
    ).toBe("sem_comprovante");
  });

  it("divergência nota × valor", () => {
    expect(
      getDocStatus(
        expense({
          expense_type: "loja",
          amount: 100,
          invoice_url: "nf.pdf",
          invoice_value: 80,
        })
      )
    ).toBe("divergencia");
  });
});

describe("storage helpers", () => {
  it("sanitizeFileName remove acentos e caracteres inválidos", () => {
    expect(sanitizeFileName("Cupom São Paulo #1.pdf")).toBe("Cupom_Sao_Paulo_1.pdf");
  });

  it("getStoragePath lê signed URL e path relativo", () => {
    expect(
      getStoragePath("https://x.supabase.co/storage/v1/object/sign/receipts/uid/a.jpg?token=t")
    ).toBe("uid/a.jpg");
    expect(getStoragePath("uid/a.jpg")).toBe("uid/a.jpg");
  });
});
