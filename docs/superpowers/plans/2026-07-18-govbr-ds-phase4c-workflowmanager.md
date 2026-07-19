# DS-gov Migration — Phase 4c: WorkflowManager Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `src/components/WorkflowManager.tsx` onto DS-gov markup/primitives, fixing three
already-flagged issues: raw-Tailwind status badges, a hand-rolled zero-ARIA rejection modal, and
an unguarded `animate-pulse`/broken `animate-in` pair — without touching role-filtering or
status-transition business logic.

**Architecture:** Four sequential changes to the same file: status-badge color/label extraction
(mirroring `getEstadoInfo`'s shape but kept local, since this enum has no other consumer),
buttons, three info banners onto `Message`, and the rejection modal onto `Modal` (removing its
broken entrance-animation classes as a side effect, since `Modal` never used that pattern).

**Tech Stack:** React 19, Vite 6, Tailwind CSS 4, `@govbr-ds/core@3.7.0`, `lucide-react`, the
existing primitives (`Button`, `Message`, `Modal`, `Textarea`).

## Global Constraints

- No test runner. Verification is `npm run lint` (`tsc --noEmit`), `npm run build`, real
  interaction checks via `npm run dev` — established pattern since Phase 1.
- Role-filtering (`filteredRequisitions`), status-transition handlers (`onUpdateStatus`,
  `handleOpenRejectionModal`, `submitRejection`), and the simulated PDF-download `alert()`
  (`handleSimulatedDownloadTerm`) are unchanged. [spec: Out of Scope]
- `getStatusInfo` lives in `WorkflowManager.tsx` itself, not `src/data.ts` — unlike conservation
  state, `StatusRequisicao` has no other page consumer, so a shared-module extraction would be
  premature (YAGNI). [spec: Changes item 1]
- This plan only touches `src/components/WorkflowManager.tsx`.
- `bg-info` is a verified DS-gov utility class (confirmed present in `@govbr-ds/core@3.7.0`'s
  compiled `core.min.css`, alongside the already-used `bg-danger`/`bg-success`/`bg-warning`).

---

### Task 1: `getStatusInfo` (status badge colors/labels) + `br-card` wrapper

**Files:**
- Modify: `src/components/WorkflowManager.tsx` (the `getStatusBadge` function and its two usage
  sites; the requisition list card's outer `<div>`)

**Interfaces:**
- Produces: `getStatusInfo(status: StatusRequisicao): { tone: string; label: string }`, a local
  function (not exported, not shared) consumed by this file's own two badge render sites.

- [ ] **Step 1: Replace `getStatusBadge` with `getStatusInfo`**

Find the current function (lines 25-40):

```tsx
  const getStatusBadge = (status: StatusRequisicao) => {
    switch (status) {
      case 'SUBMETIDA':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 text-xs px-2.5 py-1 rounded-full font-bold">Submetida</span>;
      case 'EM_ANALISE':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs px-2.5 py-1 rounded-full font-bold">Em Análise (Estoque Reservado)</span>;
      case 'APROVADA':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-bold">Aprovada</span>;
      case 'TRANSFERIDA':
        return <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs px-2.5 py-1 rounded-full font-bold">Transferida (Concluída)</span>;
      case 'REJEITADA':
        return <span className="bg-red-100 text-red-800 border border-red-200 text-xs px-2.5 py-1 rounded-full font-bold">Rejeitada</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 border border-gray-200 text-xs px-2.5 py-1 rounded-full font-bold">{status}</span>;
    }
  };
```

Replace with:

```tsx
  const getStatusInfo = (status: StatusRequisicao): { tone: string; label: string } => {
    switch (status) {
      case 'SUBMETIDA':
        return { tone: 'bg-info text-white', label: 'Submetida' };
      case 'EM_ANALISE':
        return { tone: 'bg-warning text-black font-semibold', label: 'Em Análise (Estoque Reservado)' };
      case 'APROVADA':
        return { tone: 'bg-success text-white', label: 'Aprovada' };
      case 'TRANSFERIDA':
        return { tone: 'bg-success text-white', label: 'Transferida (Concluída)' };
      case 'REJEITADA':
        return { tone: 'bg-danger text-white', label: 'Rejeitada' };
      default:
        return { tone: 'bg-gray-40 text-white', label: status };
    }
  };
```

- [ ] **Step 2: Update both usage sites**

Find (in the requisition list card):

```tsx
                      {getStatusBadge(req.status)}
```

Replace with:

```tsx
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${getStatusInfo(req.status).tone}`}>
                        {getStatusInfo(req.status).label}
                      </span>
```

Find (in the detail panel's header):

```tsx
                {getStatusBadge(activeRequisition.status)}
```

Replace with:

```tsx
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${getStatusInfo(activeRequisition.status).tone}`}>
                  {getStatusInfo(activeRequisition.status).label}
                </span>
```

- [ ] **Step 3: Add `br-card` to the requisition list card**

Find:

```tsx
                  <div
                    key={req.id}
                    onClick={() => setActiveRequisition(req)}
                    id={`requisicao-card-${req.id}`}
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
```

Replace with:

```tsx
                  <div
                    key={req.id}
                    onClick={() => setActiveRequisition(req)}
                    id={`requisicao-card-${req.id}`}
                    className={`br-card hover border rounded-xl p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
```

- [ ] **Step 4: Type-check, build, visual check**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev`. Check `src/data.ts`'s mock requisições for status coverage (the seed data may
only cover `SUBMETIDA`/`APROVADA` — note which states you can/can't visually verify, same honest
approach as Phase 4a's SUCATA gap, rather than skipping the check silently). Confirm whichever
states are visible show the correct DS-gov color (info/warning/success/danger) in both the list
card and detail header badge.

- [ ] **Step 5: Commit**

```bash
git add src/components/WorkflowManager.tsx
git commit -m "style: map WorkflowManager's status badges to DS-gov utility classes, add br-card"
```

---

### Task 2: Migrate all buttons to the `Button` primitive

**Files:**
- Modify: `src/components/WorkflowManager.tsx` (imports; role-toggle buttons; "Recusar
  Pedido"/"Homologar & Aprovar"; "Confirmar Entrega"; "Termo de Cessão PDF"; requisitante's "Baixar
  Termo Digital"; the rejection modal's "Cancelar"/"Registrar Rejeição Oficial")

**Interfaces:**
- Consumes: `Button` (`src/components/Button.tsx`, already built).

- [ ] **Step 1: Add import**

Add below the existing imports:

```tsx
import Button from './Button';
```

- [ ] **Step 2: Role-mode toggle buttons**

Find:

```tsx
          <button
            onClick={() => {
              setRoleMode('cedente');
              setActiveRequisition(null);
            }}
            className={`flex-1 md:flex-initial text-xs font-semibold px-4 py-2 rounded-md transition-all ${
              roleMode === 'cedente' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Aprovação (Dona Cedente)
          </button>
          <button
            onClick={() => {
              setRoleMode('requisitante');
              setActiveRequisition(null);
            }}
            className={`flex-1 md:flex-initial text-xs font-semibold px-4 py-2 rounded-md transition-all ${
              roleMode === 'requisitante' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Acompanhamento (Requisitante)
          </button>
```

Replace with:

```tsx
          <Button
            variant={roleMode === 'cedente' ? 'primary' : 'tertiary'}
            className="flex-1 md:flex-initial"
            onClick={() => {
              setRoleMode('cedente');
              setActiveRequisition(null);
            }}
          >
            Aprovação (Dona Cedente)
          </Button>
          <Button
            variant={roleMode === 'requisitante' ? 'primary' : 'tertiary'}
            className="flex-1 md:flex-initial"
            onClick={() => {
              setRoleMode('requisitante');
              setActiveRequisition(null);
            }}
          >
            Acompanhamento (Requisitante)
          </Button>
```

- [ ] **Step 3: "Recusar Pedido" and "Homologar & Aprovar" buttons**

Find:

```tsx
                        <button
                          onClick={(e) => handleOpenRejectionModal(e, activeRequisition.id)}
                          className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                        >
                          Recusar Pedido
                        </button>
                        
                        <button
                          onClick={() => onUpdateStatus(activeRequisition.id, 'APROVADA')}
                          className="px-4 py-2 text-xs font-bold bg-secondary hover:bg-secondary/90 text-white rounded-lg shadow-sm transition-colors"
                        >
                          Homologar & Aprovar
                        </button>
```

Replace with:

```tsx
                        <Button
                          variant="tertiary"
                          className="text-danger border border-danger"
                          onClick={(e) => handleOpenRejectionModal(e, activeRequisition.id)}
                        >
                          Recusar Pedido
                        </Button>

                        <Button
                          variant="primary"
                          onClick={() => onUpdateStatus(activeRequisition.id, 'APROVADA')}
                        >
                          Homologar & Aprovar
                        </Button>
```

(The reject button keeps a visible danger affordance via `text-danger border border-danger`,
DS-gov's real tokens, matching the pattern already established for Carrinho's remove-item button
in Phase 4b — not a plain unstyled tertiary button for a destructive action.)

- [ ] **Step 4: "Confirmar Entrega" and "Termo de Cessão PDF" buttons**

Find:

```tsx
                    {activeRequisition.status === 'APROVADA' && (
                      <button
                        onClick={() => onUpdateStatus(activeRequisition.id, 'TRANSFERIDA')}
                        className="px-4 py-2 text-xs font-bold bg-primary hover:bg-primary-dark text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <Check className="h-4 w-4 text-emerald-400" />
                        Confirmar Entrega Física / Transferência
                      </button>
                    )}

                    {(activeRequisition.status === 'APROVADA' || activeRequisition.status === 'TRANSFERIDA') && (
                      <button
                        onClick={() => handleSimulatedDownloadTerm(activeRequisition)}
                        className="px-3 py-2 text-xs font-bold text-primary border border-gray-200 bg-white hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Download className="h-4 w-4" />
                        Termo de Cessão PDF
                      </button>
                    )}
```

Replace with:

```tsx
                    {activeRequisition.status === 'APROVADA' && (
                      <Button
                        variant="primary"
                        onClick={() => onUpdateStatus(activeRequisition.id, 'TRANSFERIDA')}
                        icon={<Check className="h-4 w-4" aria-hidden="true" />}
                      >
                        Confirmar Entrega Física / Transferência
                      </Button>
                    )}

                    {(activeRequisition.status === 'APROVADA' || activeRequisition.status === 'TRANSFERIDA') && (
                      <Button
                        variant="secondary"
                        onClick={() => handleSimulatedDownloadTerm(activeRequisition)}
                        icon={<Download className="h-4 w-4" aria-hidden="true" />}
                      >
                        Termo de Cessão PDF
                      </Button>
                    )}
```

- [ ] **Step 5: Requisitante's "Baixar Termo Digital" button**

Find:

```tsx
                  <button
                    onClick={() => handleSimulatedDownloadTerm(activeRequisition)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
                  >
                    <Download className="h-4 w-4" />
                    Baixar Termo Digital
                  </button>
```

Replace with:

```tsx
                  <Button
                    variant="primary"
                    onClick={() => handleSimulatedDownloadTerm(activeRequisition)}
                    icon={<Download className="h-4 w-4" aria-hidden="true" />}
                  >
                    Baixar Termo Digital
                  </Button>
```

- [ ] **Step 6: Rejection modal's "Cancelar" and "Registrar Rejeição Oficial" buttons**

Find:

```tsx
                <button
                  onClick={() => setRejectingReqId(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={submitRejection}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors"
                >
                  Registrar Rejeição Oficial
                </button>
```

Replace with:

```tsx
                <Button variant="tertiary" onClick={() => setRejectingReqId(null)}>
                  Cancelar
                </Button>
                <Button variant="primary" className="bg-danger" onClick={submitRejection}>
                  Registrar Rejeição Oficial
                </Button>
```

(This final pair is fully replaced by Task 4, which rebuilds the whole modal on the `Modal`
primitive — this step gets the buttons themselves right first, since Task 4's diff is easier to
read against already-migrated buttons than against raw ones.)

- [ ] **Step 7: Type-check, build, real interaction check**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev`. Confirm: role-mode toggle still switches views and shows the active state
correctly; selecting a `SUBMETIDA` requisition and clicking "Recusar Pedido" still opens the
rejection modal; "Homologar & Aprovar" still transitions status to `APROVADA`; once approved,
"Confirmar Entrega" still transitions to `TRANSFERIDA`; "Termo de Cessão PDF"/"Baixar Termo
Digital" still trigger the simulated download alert; the modal's "Cancelar" still closes it,
"Registrar Rejeição Oficial" still submits the rejection.

- [ ] **Step 8: Commit**

```bash
git add src/components/WorkflowManager.tsx
git commit -m "feat: migrate WorkflowManager's buttons to the Button primitive"
```

---

### Task 3: Migrate the three info banners to `Message`

**Files:**
- Modify: `src/components/WorkflowManager.tsx` (imports; "Reserva Otimista Ativa"; "Motivo da
  Recusa"; requisitante success banner)

**Interfaces:**
- Consumes: `Message` (`src/components/Message.tsx`, already built, Phase 3 — second production
  consumer, after Carrinho's validation warning in Phase 4b).

- [ ] **Step 1: Add import**

Add below the existing imports:

```tsx
import Message from './Message';
```

- [ ] **Step 2: "Reserva Otimista Ativa" banner**

Find:

```tsx
              {activeRequisition.status === 'SUBMETIDA' && (
                <div className="bg-amber-50 border border-amber-100 text-amber-900 p-3 rounded-lg text-xs flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <p className="font-bold">Reserva Otimista Ativa</p>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                      Este processo possui reserva física temporária garantida no banco de dados para evitar requisições duplicadas simultâneas.
                    </p>
                  </div>
                </div>
              )}
```

Replace with:

```tsx
              {activeRequisition.status === 'SUBMETIDA' && (
                <Message
                  variant="warning"
                  title="Reserva Otimista Ativa."
                  body="Este processo possui reserva física temporária garantida no banco de dados para evitar requisições duplicadas simultâneas."
                />
              )}
```

(Drops the unguarded `animate-pulse` on the icon entirely — an audit-flagged anti-pattern with no
`prefers-reduced-motion` fallback. A status banner communicates its state through its presence and
color, not through continuous motion; removing the animation is the fix, not replacing it with a
guarded one.)

- [ ] **Step 3: "Motivo da Recusa" banner**

Find:

```tsx
              {activeRequisition.status === 'REJEITADA' && activeRequisition.motivoRejeicao && (
                <div className="bg-red-50 border border-red-100 text-red-900 p-4 rounded-lg text-xs">
                  <p className="font-bold text-red-900 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4" /> Motivo da Recusa / Rejeição
                  </p>
                  <p className="text-red-800 mt-1.5 leading-relaxed font-sans font-medium">
                    {activeRequisition.motivoRejeicao}
                  </p>
                </div>
              )}
```

Replace with:

```tsx
              {activeRequisition.status === 'REJEITADA' && activeRequisition.motivoRejeicao && (
                <Message
                  variant="danger"
                  title="Motivo da Recusa / Rejeição."
                  body={activeRequisition.motivoRejeicao}
                />
              )}
```

- [ ] **Step 4: Requisitante success banner**

Find:

```tsx
              {roleMode === 'requisitante' && (activeRequisition.status === 'APROVADA' || activeRequisition.status === 'TRANSFERIDA') && (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
                  <span className="text-xs font-bold text-emerald-800">
                    Sua requisição foi homologada com sucesso! Entrega agendada.
                  </span>
                  <Button
                    variant="primary"
                    onClick={() => handleSimulatedDownloadTerm(activeRequisition)}
                    icon={<Download className="h-4 w-4" aria-hidden="true" />}
                  >
                    Baixar Termo Digital
                  </Button>
                </div>
              )}
```

Replace with:

```tsx
              {roleMode === 'requisitante' && (activeRequisition.status === 'APROVADA' || activeRequisition.status === 'TRANSFERIDA') && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-grow">
                    <Message
                      variant="success"
                      title="Sucesso."
                      body="Sua requisição foi homologada com sucesso! Entrega agendada."
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => handleSimulatedDownloadTerm(activeRequisition)}
                    icon={<Download className="h-4 w-4" aria-hidden="true" />}
                  >
                    Baixar Termo Digital
                  </Button>
                </div>
              )}
```

(`Message`'s layout is title+body+optional-dismiss — it has no slot for an embedded action button,
so the "Baixar Termo Digital" button stays a sibling element in a flex row, composed alongside
`Message` rather than squeezed into a prop it wasn't designed for. This is the same button already
migrated to `Button` in Task 2 Step 5 — Task 2 touched its markup, this step only changes its
surrounding layout wrapper.)

- [ ] **Step 5: Type-check, build, real interaction check**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev`. Select a `SUBMETIDA` requisition, confirm the "Reserva Otimista" message
renders with no pulsing icon. Reject a requisition and confirm the "Motivo da Recusa" message
shows the composed rejection reason. Switch to the requisitante role view on an `APROVADA`/
`TRANSFERIDA` requisition, confirm the success message and download button both render correctly
side by side.

- [ ] **Step 6: Commit**

```bash
git add src/components/WorkflowManager.tsx
git commit -m "feat: migrate WorkflowManager's info banners to the Message primitive"
```

---

### Task 4: Migrate the rejection modal to the `Modal` primitive

**Files:**
- Modify: `src/components/WorkflowManager.tsx` (imports; the entire rejection-modal block)

**Interfaces:**
- Consumes: `Modal` (`src/components/Modal.tsx`, Phase 3, already proven in production by
  Vitrine's Phase 4a detail-modal migration) and `Textarea` (`src/components/Textarea.tsx`, Phase
  4b, already has the `state`/`textareaClassName` contract from its own final-review hardening).

- [ ] **Step 1: Add imports**

Add below the existing imports:

```tsx
import Modal from './Modal';
import Textarea from './Textarea';
```

- [ ] **Step 2: Replace the entire hand-rolled modal block**

Find the full block (from `{/* MODAL DE REJEIÇÃO ESTRUTURADA IMPEDITIVA */}` through its closing
`)}`, currently the last ~60 lines of the file before the final closing `</div>`):

```tsx
      {/* MODAL DE REJEIÇÃO ESTRUTURADA IMPEDITIVA */}
      {rejectingReqId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="bg-red-600 text-white p-4">
              <h3 className="font-bold text-base font-display">Recusar Requisição</h3>
              <p className="text-xs text-red-100 mt-1">
                Toda recusa de remanejamento deve exigir a seleção de um motivo regulamentar para auditoria.
              </p>
            </div>

            <div className="p-5 flex flex-col gap-4">
              
              {/* Motivo Estruturado dropdown */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="motivo-rejeicao" className="text-xs font-bold text-gray-700">Selecione o Motivo Regulamentar <span className="text-red-500">*</span></label>
                <select
                  id="motivo-rejeicao"
                  value={selectedMotivoEstruturado}
                  onChange={(e) => setSelectedMotivoEstruturado(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                >
                  {MOTIVOS_REJEICAO.map((motivo) => (
                    <option key={motivo} value={motivo}>{motivo}</option>
                  ))}
                </select>
              </div>

              {/* Detalhes complementares */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="rejeicao-detalhes" className="text-xs font-bold text-gray-700">Detalhes Complementares</label>
                <textarea
                  id="rejeicao-detalhes"
                  placeholder="Escreva detalhes adicionais sobre o impedimento técnico ou operacional constatado."
                  value={detalhesRejeicao}
                  onChange={(e) => setDetalhesRejeicao(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 resize-none h-20"
                />
              </div>

              {/* Botões do Modal */}
              <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
                <Button variant="tertiary" onClick={() => setRejectingReqId(null)}>
                  Cancelar
                </Button>
                <Button variant="primary" className="bg-danger" onClick={submitRejection}>
                  Registrar Rejeição Oficial
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}
```

Replace with:

```tsx
      {/* MODAL DE REJEIÇÃO ESTRUTURADA IMPEDITIVA */}
      <Modal
        open={!!rejectingReqId}
        onClose={() => setRejectingReqId(null)}
        title="Recusar Requisição"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setRejectingReqId(null)}>
              Cancelar
            </Button>
            <Button variant="primary" className="bg-danger" onClick={submitRejection}>
              Registrar Rejeição Oficial
            </Button>
          </>
        }
      >
        <p className="text-xs text-gray-600 mb-4">
          Toda recusa de remanejamento deve exigir a seleção de um motivo regulamentar para auditoria.
        </p>

        <div className="flex flex-col gap-4">
          {/* Motivo Estruturado dropdown */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="motivo-rejeicao" className="text-xs font-bold text-gray-700">Selecione o Motivo Regulamentar <span className="text-red-500">*</span></label>
            <select
              id="motivo-rejeicao"
              value={selectedMotivoEstruturado}
              onChange={(e) => setSelectedMotivoEstruturado(e.target.value)}
              className="w-full text-xs p-3 border border-gray-200 rounded-lg bg-background focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
              required
            >
              {MOTIVOS_REJEICAO.map((motivo) => (
                <option key={motivo} value={motivo}>{motivo}</option>
              ))}
            </select>
          </div>

          {/* Detalhes complementares */}
          <Textarea
            label="Detalhes Complementares"
            id="rejeicao-detalhes"
            placeholder="Escreva detalhes adicionais sobre o impedimento técnico ou operacional constatado."
            value={detalhesRejeicao}
            onChange={(e) => setDetalhesRejeicao(e.target.value)}
            textareaClassName="resize-none h-20"
          />
        </div>
      </Modal>
```

Notes on this replacement:
- `Modal`'s own header (title + close button, real `role="dialog"`/`aria-modal`/`aria-labelledby`)
  replaces the custom red header band entirely — the destructive framing now comes from the
  "Registrar Rejeição Oficial" button's `bg-danger` styling and the body copy, not from recoloring
  the whole header chrome.
- The `animate-in fade-in zoom-in duration-200` classes are gone because they're not part of
  `Modal`'s own markup — this incidentally fixes the same broken-Tailwind-class bug (these classes
  compile to nothing without the `tailwindcss-animate`/`tw-animate-css` plugin, confirmed in Phase
  4a) that Vitrine's toast had, without this task needing to do anything extra about it.
- `Textarea` uses `textareaClassName` (not `className`) for its sizing classes, per the contract
  established in Phase 4b's final-review hardening (`className` → wrapper div, `textareaClassName`
  → the actual `<textarea>` element). No `state` prop — this field has no validation error state.
- The motivo select's `bg-gray-50` → `bg-background`, matching the re-tokening pattern from
  Phase 4a/4b (the `focus:ring-red-500` stays as-is, since it's a deliberate red accent tied to
  this specific destructive-action modal, not a generic token swap).

- [ ] **Step 3: Type-check, build, real interaction check**

Run: `npm run lint` — expected: no errors.
Run: `npm run build` — expected: succeeds.
Run: `npm run dev`. Select a `SUBMETIDA` requisition, click "Recusar Pedido" to open the modal.
Confirm: the modal opens with real focus-trap/Escape/backdrop-click/focus-restore (inherited from
`Modal`, re-verify in this context rather than assuming Phase 4a's verification still applies);
the motivo dropdown populates from `MOTIVOS_REJEICAO` and selects correctly; the detalhes textarea
accepts input; "Cancelar" closes the modal without submitting; "Registrar Rejeição Oficial" submits
the rejection (calls `onUpdateStatus` with `'REJEITADA'` and the composed motivo string) and closes
the modal; the requisition's status updates to show the rejection reason via the `Message` banner
from Task 3.

- [ ] **Step 4: Commit**

```bash
git add src/components/WorkflowManager.tsx
git commit -m "feat: migrate WorkflowManager's rejection modal to the Modal primitive"
```
