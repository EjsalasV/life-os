import React, { useMemo, useState } from "react";
import {
  Wallet,
  Trash2,
  Plus,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Printer,
  TrendingUp,
  TrendingDown,
  Edit2,
  Pencil
} from "lucide-react";
import { exportToExcel } from "@/app/utils/exportHandler";
import PremiumLock from "../../ui/PremiumLock";
import TarjetasWidget from "./TarjetasWidget";
import { getTodayKey } from "@/app/utils/helpers";
import { AdventureIcon } from "@/app/components/ui/AdventureIcons";

function BalancedWalletContent({
  cuentas,
  selectedAccountId,
  setSelectedAccountId,
  totalCuentasBalance,
  ingresosPeriodo,
  gastosPeriodo,
  openFinanceModal,
  deleteItem,
  visibleMovimientos,
  filteredMovements,
  hasVisibleMovimientos,
  formatMoney,
  filterDate,
  setFilterDate,
  yearOptions,
  txFilter,
  setTxFilter,
  userPlan,
  showTools,
  setShowTools,
  tarjetas,
  setSelectedCard,
  deleteCard
}) {
  const accountLabel = `${cuentas.length} ${cuentas.length === 1 ? "cuenta" : "cuentas"}`;

  return (
    <div className="balanced-wallet-content">
      <section className="balanced-wallet-hero">
        <div className="balanced-wallet-hero-heading">
          <div>
            <p className="balanced-wallet-eyebrow">SALDO TOTAL</p>
            <strong>{formatMoney(totalCuentasBalance)}</strong>
          </div>
          <Wallet aria-hidden="true" />
        </div>
        <div className="balanced-wallet-account-count"><Wallet size={18} aria-hidden="true" /><span>{accountLabel}</span></div>
      </section>

      <div className="balanced-wallet-actions">
        <button type="button" className="balanced-wallet-action is-income" onClick={() => openFinanceModal("movimiento", { tipo: "INGRESO" })}>
          <TrendingUp aria-hidden="true" /><span><small>ENTRADA</small><b>Ingreso</b></span>
        </button>
        <button type="button" className="balanced-wallet-action is-expense" onClick={() => openFinanceModal("movimiento", { tipo: "GASTO" })}>
          <TrendingDown aria-hidden="true" /><span><small>SALIDA</small><b>Gasto</b></span>
        </button>
      </div>

      <div className="balanced-wallet-period-summary">
        <span>Este periodo</span>
        <span><b className="is-income-text">+{formatMoney(ingresosPeriodo)}</b><b className="is-expense-text">-{formatMoney(gastosPeriodo)}</b></span>
      </div>

      <section className="balanced-wallet-section">
        <div className="balanced-wallet-section-heading">
          <h2>Tus cuentas</h2>
          <button type="button" onClick={() => openFinanceModal("cuenta")}><Plus size={16} /> Nueva cuenta</button>
        </div>
        <div className="balanced-wallet-account-list">
          {cuentas.length === 0 ? (
            <div className="balanced-wallet-empty balanced-wallet-accounts-empty">
              <p>No tienes cuentas registradas.</p>
              <button type="button" onClick={() => openFinanceModal("cuenta")}>Nueva cuenta</button>
            </div>
          ) : (
            <>
              <button type="button" className={`balanced-wallet-account-card ${!selectedAccountId ? "is-selected" : ""}`} onClick={() => setSelectedAccountId(null)}>
                <span className="balanced-wallet-account-icon"><Wallet size={22} aria-hidden="true" /></span>
                <span className="balanced-wallet-account-copy"><b>Todas las cuentas</b><small>Saldo total</small></span>
                <strong>{formatMoney(totalCuentasBalance)}</strong>
              </button>
              {cuentas.map((account) => (
                <div key={account.id} className={`balanced-wallet-account-card ${selectedAccountId === account.id ? "is-selected" : ""}`}>
                  <button type="button" className="balanced-wallet-account-main" onClick={() => setSelectedAccountId(account.id)} aria-pressed={selectedAccountId === account.id}>
                    <span className="balanced-wallet-account-icon"><Wallet size={22} aria-hidden="true" /></span>
                    <span className="balanced-wallet-account-copy"><b>{account?.nombre || "Cuenta"}</b></span>
                    <strong>{formatMoney(account?.monto || 0)}</strong>
                  </button>
                  <div className="balanced-wallet-account-tools">
                    <button type="button" onClick={() => openFinanceModal("cuenta", { id: account.id, nombre: account.nombre || "", monto: String(account.monto ?? "") })} aria-label={`Editar cuenta ${account?.nombre || ""}`}><Pencil size={14} /></button>
                    <button type="button" onClick={() => deleteItem("cuentas", account)} aria-label={`Eliminar cuenta ${account?.nombre || ""}`}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      <TarjetasWidget tarjetas={tarjetas} formatMoney={formatMoney} openFinanceModal={openFinanceModal} setSelectedCard={setSelectedCard} deleteCard={deleteCard} personality="equilibrado" />

      <section className="balanced-wallet-section balanced-wallet-movements-section">
        <div className="balanced-wallet-section-heading balanced-wallet-movements-heading">
          <h2>Movimientos recientes</h2>
          <button type="button" onClick={() => openFinanceModal("transferencia")}><ArrowRightLeft size={15} /> Transferir</button>
        </div>
        <div className="balanced-wallet-filters">
          <div className="balanced-wallet-filter-row">
            {[{ id: "all", label: "Todas" }, { id: "in", label: "Ingresos" }, { id: "out", label: "Gastos" }].map((item) => (
              <button key={item.id} type="button" className={txFilter === item.id ? "is-active" : ""} onClick={() => setTxFilter(item.id)}>{item.label}</button>
            ))}
          </div>
          <div className="balanced-wallet-date-row">
            <select value={filterDate.month} onChange={(event) => setFilterDate({ ...filterDate, month: Number(event.target.value) })} aria-label="Mes de movimientos">
              {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((month, index) => <option key={month} value={index}>{month}</option>)}
            </select>
            <select value={filterDate.year} onChange={(event) => setFilterDate({ ...filterDate, year: Number(event.target.value) })} aria-label="Año de movimientos">
              {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>
        <div className="balanced-wallet-movement-list">
          {filteredMovements.map((movement) => (
            <div key={movement.id} className="balanced-wallet-movement">
              <span className={`balanced-wallet-movement-icon ${movement.tipo === "INGRESO" ? "is-income" : "is-expense"}`}>{movement.tipo === "INGRESO" ? <TrendingUp size={18} /> : <TrendingDown size={18} />}</span>
              <div className="balanced-wallet-movement-copy"><b>{movement?.nombre || "Movimiento"}</b><small>{movement?.cuentaNombre || movement?.categoria || "General"} · {movement?.displayDate || ""}</small></div>
              <strong className={movement.tipo === "INGRESO" ? "is-income-text" : "is-expense-text"}>{movement?.amountPrefix}{formatMoney(movement?.monto || 0)}</strong>
            </div>
          ))}
          {!hasVisibleMovimientos && <div className="balanced-wallet-empty"><p>No hay movimientos en este periodo.</p><button type="button" onClick={() => openFinanceModal("movimiento")}>Registrar movimiento</button></div>}
          {hasVisibleMovimientos && filteredMovements.length === 0 && <div className="balanced-wallet-empty"><p>No hay movimientos para este filtro.</p></div>}
        </div>
      </section>

      <section className="balanced-wallet-tools">
        <button type="button" onClick={() => setShowTools(!showTools)}><span><FileSpreadsheet size={16} /> Herramientas Excel</span>{showTools ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
        {showTools && <div><p>Exporta o imprime el periodo filtrado.</p><PremiumLock isPro={userPlan === "pro"} text="Solo PRO"><button type="button" onClick={() => exportToExcel(visibleMovimientos, `${filterDate.month + 1}-${filterDate.year}`)}>Descargar Excel</button></PremiumLock><button type="button" onClick={() => window.print()}><Printer size={14} /> Imprimir resumen</button></div>}
      </section>
    </div>
  );
}

export default function WalletTabContent({
  setModalOpen,
  openFinanceModal,
  setSelectedAccountId,
  cuentas,
  selectedAccountId,
  deleteItem,
  visibleMovimientos,
  totalCuentasBalance,
  hasVisibleMovimientos,
  formatMoney,
  filterDate,
  setFilterDate,
  userPlan,
  tarjetas = [],
  setSelectedCard,
  deleteCard,
  setFinanceForm,
  personality
}) {
  const isAdventure = personality === "aventura";
  const [showTools, setShowTools] = useState(false);
  const [txFilter, setTxFilter] = useState("all");

  const ingresosPeriodo = visibleMovimientos
    .filter((item) => item?.tipo === "INGRESO")
    .reduce((acc, item) => acc + (Number(item?.monto) || 0), 0);

  const gastosPeriodo = visibleMovimientos
    .filter((item) => item?.tipo === "GASTO")
    .reduce((acc, item) => acc + (Number(item?.monto) || 0), 0);

  const filteredMovements = useMemo(() => {
    if (txFilter === "in") return visibleMovimientos.filter((item) => item?.tipo === "INGRESO");
    if (txFilter === "out") return visibleMovimientos.filter((item) => item?.tipo === "GASTO");
    return visibleMovimientos;
  }, [txFilter, visibleMovimientos]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set([filterDate.year, currentYear]);
    for (let year = currentYear - 2; year <= currentYear + 3; year += 1) {
      years.add(year);
    }
    return [...years].sort((a, b) => a - b);
  }, [filterDate.year]);

  if (personality === "equilibrado") {
    return <BalancedWalletContent
      cuentas={cuentas}
      selectedAccountId={selectedAccountId}
      setSelectedAccountId={setSelectedAccountId}
      totalCuentasBalance={totalCuentasBalance}
      ingresosPeriodo={ingresosPeriodo}
      gastosPeriodo={gastosPeriodo}
      openFinanceModal={openFinanceModal}
      deleteItem={deleteItem}
      visibleMovimientos={visibleMovimientos}
      filteredMovements={filteredMovements}
      hasVisibleMovimientos={hasVisibleMovimientos}
      formatMoney={formatMoney}
      filterDate={filterDate}
      setFilterDate={setFilterDate}
      yearOptions={yearOptions}
      txFilter={txFilter}
      setTxFilter={setTxFilter}
      userPlan={userPlan}
      showTools={showTools}
      setShowTools={setShowTools}
      tarjetas={tarjetas}
      setSelectedCard={setSelectedCard}
      deleteCard={deleteCard}
    />;
  }

  return (
    <div className="wallet-tab-content space-y-4">
      <section className="adventure-wallet-hero rounded-[28px] border border-[var(--fin-border-soft)] bg-[var(--fin-surface)] p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="fin-label text-[10px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Balance total disponible</p>
            <p className="fin-mono mt-1 text-3xl font-black text-[var(--fin-lime)]">{formatMoney(totalCuentasBalance)}</p>
          </div>
          <button
            onClick={() => setSelectedAccountId(null)}
            className="rounded-xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-2 text-[var(--fin-text-muted)] transition hover:text-[var(--fin-text)]"
            title="Ver todo"
          >
            {isAdventure ? <AdventureIcon type="finance" size={19} color="#ffc837" /> : <Wallet size={16} />}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => openFinanceModal("movimiento")}
            className="adventure-wallet-action fin-label rounded-xl border border-[var(--fin-lime)]/35 bg-[var(--fin-lime)]/15 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-[var(--fin-lime)] transition hover:bg-[var(--fin-lime)]/25"
          >
            <Plus size={14} /> Registrar
          </button>
          <button
            onClick={() => openFinanceModal("transferencia")}
            className="adventure-wallet-action fin-label inline-flex items-center justify-center gap-1 rounded-xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] px-3 py-2 text-[11px] font-black uppercase tracking-wide text-[var(--fin-text-dim)] transition hover:border-[var(--fin-border)]"
          >
            {isAdventure ? <AdventureIcon type="income" size={16} color="currentColor" /> : <ArrowRightLeft size={14} />} Transferir
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="adventure-wallet-stat rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
            <p className="fin-label text-[9px] font-black uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">Ingresos</p>
            <p className="fin-mono mt-1 text-xs font-black text-emerald-700 dark:text-emerald-300">{formatMoney(ingresosPeriodo)}</p>
          </div>
          <div className="adventure-wallet-stat rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5">
            <p className="fin-label text-[9px] font-black uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">Gastos</p>
            <p className="fin-mono mt-1 text-xs font-black text-rose-700 dark:text-rose-300">{formatMoney(gastosPeriodo)}</p>
          </div>
        </div>
      </section>

      <TarjetasWidget
        tarjetas={tarjetas}
        formatMoney={formatMoney}
        openFinanceModal={openFinanceModal}
        setSelectedCard={setSelectedCard}
        deleteCard={deleteCard}
        personality={personality}
      />

      <section className="adventure-wallet-tools rounded-[24px] border border-[var(--fin-border-soft)] bg-[var(--fin-surface)] p-3">
        <button
          onClick={() => setShowTools(!showTools)}
          className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-1.5 text-[var(--fin-text-muted)]">
              <FileSpreadsheet size={14} />
            </div>
            <span className="fin-label text-[10px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Herramientas Excel</span>
          </div>
          {showTools ? <ChevronUp size={16} className="text-[var(--fin-text-muted)]" /> : <ChevronDown size={16} className="text-[var(--fin-text-muted)]" />}
        </button>

        {showTools && (
          <div className="mt-2 space-y-2">
            <p className="px-1 text-[10px] font-bold text-[var(--fin-text-muted)]">
              Exporta o imprime el periodo que tienes filtrado abajo.
            </p>
            <PremiumLock isPro={userPlan === "pro"} text="Solo PRO">
              <button
                onClick={() => exportToExcel(visibleMovimientos, `${filterDate.month + 1}-${filterDate.year}`)}
                className="fin-label flex w-full items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-300 transition hover:bg-emerald-500/20"
              >
                <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase">
                  <FileSpreadsheet size={16} />
                  Descargar Excel
                </span>
                <span className="text-[9px] text-emerald-200/80">
                  {visibleMovimientos.length} mov.
                </span>
              </button>
            </PremiumLock>
            <button
              onClick={() => window.print()}
              className="fin-label flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] p-3 text-[var(--fin-text-dim)] transition hover:border-[var(--fin-border)]"
            >
              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase">
                <Printer size={14} />
                Imprimir resumen
              </span>
              <span className="text-[9px] text-[var(--fin-text-muted)]">
                periodo actual
              </span>
            </button>
          </div>
        )}
      </section>

      <section className="adventure-wallet-accounts">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="fin-label adventure-wallet-section-title text-[10px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Cuentas & Tesorería</p>
          <button
            onClick={() => openFinanceModal("cuenta")}
            className="adventure-wallet-small-action fin-label inline-flex items-center gap-1 rounded-xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface-2)] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[var(--fin-text-dim)] transition hover:border-[var(--fin-border)]"
          >
            <Plus size={12} /> Nueva
          </button>
        </div>

        <div className="finance-account-list flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedAccountId(null)}
            className={`min-w-[130px] rounded-2xl border p-3 text-left transition ${
              !selectedAccountId
                ? "border-[var(--fin-lime)]/40 bg-[var(--fin-lime)]/15"
                : "border-[var(--fin-border-soft)] bg-[var(--fin-surface)]"
            }`}
          >
            <p className="fin-label text-[9px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">Todas</p>
            <p className="fin-mono mt-1 text-sm font-black text-[var(--fin-text)]">{formatMoney(totalCuentasBalance)}</p>
          </button>

          {cuentas.map((c) => (
            <div
              key={c.id}
              className={`group relative min-w-[130px] rounded-2xl border transition ${
                selectedAccountId === c.id
                  ? "border-[var(--fin-cyan)]/40 bg-[var(--fin-cyan)]/10"
                  : "border-[var(--fin-border-soft)] bg-[var(--fin-surface)]"
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem("cuentas", c);
                }}
                className="absolute right-2 top-2 z-10 opacity-60 transition sm:opacity-0 sm:group-hover:opacity-100 text-rose-300"
                aria-label={`Eliminar cuenta ${c?.nombre || ""}`}
              >
                <Trash2 size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openFinanceModal("cuenta", {
                    id: c.id,
                    nombre: c.nombre || "",
                    monto: String(c.monto ?? "")
                  });
                }}
                className="absolute right-8 top-2 z-10 opacity-60 transition sm:opacity-0 sm:group-hover:opacity-100 text-cyan-400"
                aria-label={`Editar cuenta ${c?.nombre || ""}`}
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => setSelectedAccountId(c.id)}
                className="w-full rounded-2xl p-3 pr-14 text-left transition"
                aria-pressed={selectedAccountId === c.id}
              >
                <span className="adventure-account-icon">{isAdventure && <AdventureIcon type="finance" size={18} color="#ffc837" />}</span>
                <p className="adventure-account-name fin-label truncate text-[9px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">{c?.nombre || "Cuenta"}</p>
                <p className="fin-mono mt-1 text-sm font-black text-[var(--fin-text)]">{formatMoney(c?.monto || 0)}</p>
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="adventure-wallet-movements">
        <div className="mb-2 mt-2 flex items-center justify-between px-1">
          <p className="fin-label text-[10px] font-black uppercase tracking-[0.14em] text-[var(--fin-text-muted)]">
            {selectedAccountId ? "Historial" : "Movimientos"}
          </p>

          <div className="adventure-wallet-date-filter flex items-center gap-1 rounded-xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface)] p-1">
            <select
              value={filterDate.month}
              onChange={(e) => setFilterDate({ ...filterDate, month: parseInt(e.target.value, 10) })}
              className="adventure-wallet-select fin-mono rounded-lg bg-transparent px-2 py-1 text-[10px] font-black text-[var(--fin-text-muted)] outline-none"
            >
              {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={filterDate.year}
              onChange={(e) => setFilterDate({ ...filterDate, year: parseInt(e.target.value, 10) })}
              className="adventure-wallet-select fin-mono rounded-lg bg-transparent px-2 py-1 text-[10px] font-black text-[var(--fin-text-muted)] outline-none"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-2 flex gap-1 px-1">
          {[
            { id: "all", label: "Todas" },
            { id: "in", label: "Ingresos" },
            { id: "out", label: "Gastos" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTxFilter(item.id)}
                className={`adventure-wallet-filter fin-chip rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide transition ${
                txFilter === item.id
                  ? "border-[var(--fin-lime)] bg-[var(--fin-lime)] text-[var(--fin-surface)]"
                  : "border-[var(--fin-border-soft)] bg-[var(--fin-surface)] text-[var(--fin-text-muted)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="space-y-2 pb-20">
          {filteredMovements.map((m) => (
            <div key={m.id} className="adventure-wallet-transaction group flex items-center justify-between rounded-2xl border border-[var(--fin-border-soft)] bg-[var(--fin-surface)] p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`adventure-transaction-icon flex h-9 w-9 items-center justify-center rounded-xl ${m.tipo === "INGRESO" ? "bg-emerald-500/15 text-emerald-500" : "bg-rose-500/15 text-rose-500"}`}>
                  {isAdventure ? <AdventureIcon type={m.tipo === "INGRESO" ? "income" : "expense"} size={18} color={m.tipo === "INGRESO" ? "#4cd964" : "#ff3b30"} /> : m.tipo === "INGRESO" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[var(--fin-text)]">{m?.nombre || "Movimiento"}</p>
                  <p className="fin-mono text-[10px] font-bold text-[var(--fin-text-muted)]">
                    {(m?.categoria || "General")} · {(m?.displayDate || "")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className={`fin-mono text-sm font-black ${m.tipo === "INGRESO" ? "text-emerald-500" : "text-[var(--fin-text)]"}`}>
                  {m?.amountPrefix}{formatMoney(m?.monto || 0)}
                </p>
                {!m.ventaRefId && (m.tipo === "INGRESO" || m.tipo === "GASTO") && (
                  <button aria-label={"Editar " + m.nombre}
                    onClick={() => {
                      openFinanceModal("movimiento", {
                        id: m.id,
                        nombre: m.nombre,
                        tipo: m.tipo,
                        monto: String(m.monto ?? ""),
                        cuentaId: m.cuentaId,
                        categoria: m.categoria,
                        fecha: m.fecha || (m.timestamp ? getTodayKey(m.timestamp?.toDate ? m.timestamp.toDate() : new Date(m.timestamp)) : getTodayKey())
                      });
                    }}
                    className="opacity-60 transition sm:opacity-0 sm:group-hover:opacity-100 text-blue-400 hover:text-blue-600"
                  >
                    <Edit2 size={13} />
                  </button>
                )}
                <button aria-label={"Eliminar " + m.nombre} onClick={() => deleteItem("movimientos", m)} className="opacity-60 transition sm:opacity-0 sm:group-hover:opacity-100 text-rose-400 hover:text-rose-600">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {!hasVisibleMovimientos && (
            <div className="adventure-wallet-empty rounded-2xl border border-dashed border-[var(--fin-border)] bg-[var(--fin-surface)] p-8 text-center">
              <p className="fin-label text-[11px] font-black uppercase tracking-wide text-[var(--fin-text-muted)]">
                No hay movimientos en este periodo.
              </p>
              <button
                onClick={() => openFinanceModal("movimiento")}
                className="adventure-wallet-action fin-label mt-3 rounded-xl border border-[var(--fin-lime)]/35 bg-[var(--fin-lime)]/15 px-4 py-2 text-[10px] font-black uppercase tracking-wide text-[var(--fin-lime)] transition hover:bg-[var(--fin-lime)]/25"
              >
                + Registrar tu primer movimiento
              </button>
            </div>
          )}

          {hasVisibleMovimientos && filteredMovements.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--fin-border)] bg-[var(--fin-surface)] p-6 text-center">
              <p className="fin-label text-[10px] font-black uppercase tracking-wide text-[var(--fin-text-muted)]">
                No hay movimientos para este filtro.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
