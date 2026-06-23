# Armazenamento de Documentos — app ReForma

**Última atualização:** 2026-06-23  
**Responsável:** Arquitetura de Documentação

---

## 📍 Onde os Arquivos são Armazenados

### Storage Principal
**Serviço:** Supabase Storage (Amazon S3 por baixo)  
**Bucket:** `receipts`  
**Acesso:** Seguro (RLS policies) — cada usuário vê apenas seus arquivos

### Estrutura de Pastas
```
receipts/
└── {user_id}/
    ├── 1718884440000-invoice.pdf
    ├── 1718884441000-receipt.jpg
    └── 1718884442000-nf-nota-fiscal.pdf
```

**Padrão de naming:** `{timestamp}-{original-filename}`

---

## 🔐 Segurança

### RLS Policy (Row Level Security)
```sql
-- Apenas o proprietário (user_id) pode acessar seus arquivos
-- Prefixo do path é a chave: user_id/{arquivo}
```

### Signed URLs
- **TTL:** 1 hora
- **Tipo:** Temporal (expiram automaticamente)
- **Segurança:** Não são URLs públicas permanentes
- **Geração:** Automática ao fazer download/visualizar

### Quem pode acessar?
| Ator | Acesso |
|---|---|
| Proprietário do arquivo | ✅ Sim (via signed URL) |
| Outro usuário | ❌ Não (RLS bloqueia) |
| API externa | ❌ Não (requer autenticação) |

---

## 📂 Integração com Banco de Dados

### Tabela: `expenses`
Coluna que armazena a URL:
- `receipt_url` — URL assinada do comprovante de pagamento
- `invoice_url` — URL assinada da nota fiscal
- `invoice_number` — texto (número da NF, ex: "2024-123456")
- `invoice_value` — numeric (valor da NF, ex: 1500.50)

### Fluxo de Salvamento
```
1. Usuário seleciona arquivo no formulário
2. App faz upload → Supabase Storage
3. Storage gera URL assinada
4. URL é salva no banco (expenses.receipt_url ou invoice_url)
5. Banco armazena a URL por 1 hora
6. Usuário pode visualizar via signed URL
```

---

## 🗂️ Tipos de Documentos

| Tipo | Campo | Obrigatório | Exemplo |
|---|---|---|---|
| **Comprovante** | `receipt_url` | Depende do tipo de despesa | Recibo de pagamento |
| **Nota Fiscal** | `invoice_url` | Para material/loja/serviço | NF-e XML ou PDF |
| **Número NF** | `invoice_number` | Quando tem NF | "2024.123.456/0001-98" |
| **Valor NF** | `invoice_value` | Quando tem NF | 1500.50 |

### Requisitos por Tipo de Despesa

| Tipo | Comprovante | NF | NF obrigatória? |
|---|---|---|---|
| **Mão de obra** | ✅ Obrigatório | ❌ N/A | Não |
| **Material** | ✅ Obrigatório | ✅ Obrigatório | Sim |
| **Loja** | ✅ Obrigatório | ✅ Obrigatório | Sim |
| **Serviço** | ✅ Obrigatório | ⚠️ Se PJ | Não |
| **Outro** | ⚠️ Opcional | ⚠️ Opcional | Não |

---

## 🔄 Ciclo de Vida de um Documento

```
┌─────────────────────────────────────────────────────────┐
│ 1. UPLOAD                                               │
│    • Usuário seleciona arquivo em expense-form.tsx      │
│    • App verifica session (guard de autenticação)       │
│    • Upload → Supabase Storage (/receipts/{user_id}/)   │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 2. SIGNED URL GERADO                                    │
│    • Storage cria URL temporal (TTL = 1h)               │
│    • URL retorna ao cliente                             │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 3. SALVO NO BANCO                                       │
│    • expenses.receipt_url = signed_url                  │
│    • expenses.invoice_url = signed_url                  │
│    • expense_date, invoice_number, invoice_value etc    │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 4. VALIDATION (getDocStatus)                            │
│    • Checa se comprovante/NF estão presentes            │
│    • Detecta divergências (invoice_value ≠ amount)      │
│    • Retorna: completo|pendente|divergencia|sem_regra   │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 5. VISUALIZAÇÃO                                         │
│    • expense-list-item.tsx mostra badge de status       │
│    • Usuário pode clicar para editar e reatualizar      │
│    • Dashboard mostra alertas se pendente/divergência   │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│ 6. EXPIRAÇÃO (após 1h)                                  │
│    • Signed URL expira                                  │
│    • App regenera URL automaticamente ao acessar        │
│    • Arquivo original permanece no Storage              │
└─────────────────────────────────────────────────────────┘
```

---

## 💻 Implementação no Código

### Upload (expense-form.tsx)
```tsx
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: "receipt" | "invoice") => {
  const file = e.target.files?.[0];
  if (!file || !user) {
    setError("Sessão expirada. Faça login novamente.");
    return;
  }

  const fileName = `${user.id}/${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from("receipts")
    .upload(fileName, file, { upsert: true });

  if (error) {
    setError("Erro ao fazer upload: " + error.message);
    return;
  }

  // Gera signed URL (1 hora de validade)
  const { data: url } = await supabase.storage
    .from("receipts")
    .createSignedUrl(data.path, 3600); // 3600 = 1 hora

  if (field === "receipt") {
    setReceiptPreview(url?.signedUrl);
    setReceipt(url?.signedUrl);
  } else {
    setInvoicePreview(url?.signedUrl);
    setInvoice(url?.signedUrl);
  }
};
```

### Validação (lib/utils.ts)
```tsx
export function getDocStatus(expense: Expense): DocStatus {
  const { expense_type, is_paid, receipt_url, invoice_url, invoice_value, amount } = expense;

  // Mão de obra: apenas comprovante
  if (expense_type === "mao_obra") {
    return is_paid && !receipt_url ? "pendente" : "completo";
  }

  // Material/Loja: NF + comprovante
  if (expense_type === "material" || expense_type === "loja") {
    if (!invoice_url) return "pendente";
    if (is_paid && !receipt_url) return "pendente";
    if (invoice_value && Math.abs(invoice_value - amount) > 0.01) return "divergencia";
    return "completo";
  }

  // Serviço: comprovante (NF opcional)
  if (expense_type === "servico") {
    if (is_paid && !receipt_url) return "pendente";
    return "completo";
  }

  return "sem_regra";
}
```

### Exibição de Status (expense-list-item.tsx)
```tsx
const docStatus = getDocStatus(expense);

<div className="flex items-center gap-2">
  {docStatus === "completo" && (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-700">
      Documentado
    </span>
  )}
  {docStatus === "pendente" && (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-700">
      <AlertCircle className="h-3 w-3" />
      Doc. incompleta
    </span>
  )}
  {docStatus === "divergencia" && (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-700">
      <AlertCircle className="h-3 w-3" />
      Divergência
    </span>
  )}
</div>
```

---

## ⚙️ Configuração do Projeto

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://bhsvvpvfbszrcitjwxxl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### RLS Policies (SQL)
```sql
-- Criar bucket (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false);

-- Policy: usuário vê apenas seus arquivos
CREATE POLICY "Users can access their own files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: usuário pode fazer upload em sua pasta
CREATE POLICY "Users can upload their own files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 🚨 Limitações & Considerações

### Signed URLs Expiram
- **Problema:** URL expira após 1 hora
- **Solução:** App regenera automaticamente ao acessar
- **Impacto:** Sem impacto para usuário (transparente)

### Tamanho de Arquivo
- **Limite:** 50 MB (padrão Supabase)
- **Recomendado:** Comprovantes/NFs geralmente < 10 MB
- **Se ultrapassar:** Adicionar validação no cliente

### Tipos de Arquivo
- **Aceitos:** PDF, JPG, PNG, GIF, WEBP
- **Recomendado:** PDF para NF, JPG/PNG para comprovantes
- **Validação:** Feita no componente `expense-form.tsx`

### Backup & Retenção
- **Tempo:** Indefinido (enquanto despesa existir no banco)
- **Backup:** Supabase faz backup automático
- **Deleção:** Quando despesa é deletada (soft delete pode ser implementado)

---

## 📊 Monitoramento

### Ver Uso de Storage
```bash
# Via Supabase Dashboard
Settings → Storage → Metrics

# Via CLI
supabase storage list receipts
```

### Ver Signed URLs Ativos
```bash
# Logs de acesso
supabase logs storage
```

---

## 🔧 Troubleshooting

### "Erro ao fazer upload"
- ✅ Verificar se usuário está autenticado
- ✅ Verificar permissões RLS
- ✅ Verificar tamanho do arquivo
- ✅ Verificar internet connection

### "URL expirada"
- ✅ App regenera automaticamente — problema resolvido
- ✅ Se persistir: limpar cache do browser

### "Arquivo não aparece na listagem"
- ✅ Verificar se `receipt_url` ou `invoice_url` foi salvo no banco
- ✅ Verificar se o arquivo realmente foi uploadado
- ✅ Verificar RLS policies

---

## 📚 Referências

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Signed URLs](https://supabase.com/docs/guides/storage/serve/signed-urls)

---

**Documento mantido pela equipe de desenvolvimento.**  
Última atualização: 2026-06-23
