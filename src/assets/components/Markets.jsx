import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "./Navbar";
import "./Markets.css";
import { getFlagEmoji, getFlagUrl } from "./currencyFlags";

const API_BASE = "https://api.frankfurter.dev/v2";
const POPULAR_CODES = [
  "USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "CNY", "NZD", "INR",
  "SGD", "HKD",
];
const MARKET_PAIRS = [
  ["EUR", "USD"],
  ["GBP", "USD"],
  ["USD", "JPY"],
  ["USD", "CHF"],
  ["AUD", "USD"],
];
const RANGES = ["1D", "1W", "1M", "3M", "1Y", "5Y"];
async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Exchange-rate service returned ${response.status}.`);
  }
  return response.json();
}

async function fetchPairStats(base, quote, signal) {
  const latest = await fetchJson(`${API_BASE}/rate/${base}/${quote}`, signal);
  if (!Number.isFinite(latest.rate)) {
    throw new Error(`No live rate is available for ${base}/${quote}.`);
  }
  const start = subtractRange(latest.date, "1W");
  const history = await fetchJson(
    `${API_BASE}/rates?base=${base}&quotes=${quote}&from=${start}&to=${latest.date}`,
    signal,
  );
  if (!Array.isArray(history)) throw new Error(`Rate history for ${base}/${quote} was not valid.`);
  const previous = history
    .filter((item) => item.date < latest.date && Number.isFinite(item.rate))
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  return {
    base,
    quote,
    rate: latest.rate,
    date: latest.date,
    change: getChange(latest.rate, previous?.rate),
  };
}

function subtractRange(date, range) {
  const start = new Date(date);
  if (range.endsWith("D")) start.setDate(start.getDate() - 2);
  if (range.endsWith("W")) start.setDate(start.getDate() - 7);
  if (range.endsWith("M")) start.setMonth(start.getMonth() - Number(range.slice(0, -1)));
  if (range.endsWith("Y")) start.setFullYear(start.getFullYear() - Number(range.slice(0, -1)));
  return start.toISOString().slice(0, 10);
}

function formatRate(value, maximumFractionDigits = 4) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
  }).format(value);
}

function formatAmount(value) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function getChange(rate, previousRate) {
  if (!Number.isFinite(rate) || !Number.isFinite(previousRate) || previousRate === 0) {
    return { absolute: 0, percent: 0 };
  }
  return {
    absolute: rate - previousRate,
    percent: ((rate - previousRate) / previousRate) * 100,
  };
}

function shortRelativeTime(timestamp) {
  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

function CurrencyFlag({ code }) {
  const flag = getFlagUrl(code);
  return flag
    ? <img className="currency-flag" src={flag} alt="" />
    : <span className="currency-flag currency-flag-fallback" aria-hidden="true">{getFlagEmoji(code)}</span>;
}

function CurrencyPicker({ side, selected, currencies, onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);
  const dialogRef = useRef(null);
  const normalizedQuery = query.trim().toLowerCase();
  const matches = currencies.filter(({ code, name }) =>
    code.toLowerCase().includes(normalizedQuery) ||
    name.toLowerCase().includes(normalizedQuery),
  );
  const popular = matches.filter(({ code }) => POPULAR_CODES.includes(code));
  const other = matches.filter(({ code }) => !POPULAR_CODES.includes(code));

  useEffect(() => {
    const previousFocus = document.activeElement;
    searchRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll(
          "button:not(:disabled), input:not(:disabled)",
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  const renderCurrency = (currency) => (
    <button
      className="currency-option"
      type="button"
      key={currency.code}
      onClick={() => onSelect(currency.code)}
      aria-pressed={currency.code === selected}
    >
      <CurrencyFlag code={currency.code} />
      <span className="currency-option-code">{currency.code}</span>
      <span className="currency-option-name">{currency.name}</span>
      {currency.code === selected && <span className="selected-check" aria-label="Selected">✓</span>}
    </button>
  );

  return (
    <div className="picker-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        className="currency-picker"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
      >
        <div className="picker-heading">
          <div>
            <p className="eyebrow">CHOOSE CURRENCY</p>
            <h2 id="picker-title">{side === "from" ? "You send" : "They receive"}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close currency picker">×</button>
        </div>
        <label className="picker-search">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <span className="sr-only">Search currencies by code or name</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search code or currency"
          />
          <kbd>ESC</kbd>
        </label>
        <div className="currency-list">
          {popular.length > 0 && (
            <section aria-label="Popular currencies">
              <h3 className="list-section-title">POPULAR</h3>
              {popular.map(renderCurrency)}
            </section>
          )}
          {other.length > 0 && (
            <section aria-label="Other currencies">
              <h3 className="list-section-title">OTHER CURRENCIES</h3>
              {other.map(renderCurrency)}
            </section>
          )}
          {matches.length === 0 && <p className="empty-state">No currencies match “{query}”.</p>}
        </div>
      </section>
    </div>
  );
}

function RateChart({ rates }) {
  if (rates.length === 0) return <div className="chart-empty">Rate history will appear here.</div>;
  const values = rates.map(({ rate }) => rate);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || max * 0.002 || 1;
  const points = rates.map(({ rate }, index) => {
    const x = rates.length === 1 ? 400 : (index / (rates.length - 1)) * 800;
    const y = 18 + ((max - rate) / spread) * 184;
    return [x, y];
  });
  const line = points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const area = `${line} L 800 228 L 0 228 Z`;
  const trendingUp = values[values.length - 1] >= values[0];

  return (
    <div className={`chart-wrap ${trendingUp ? "chart-up" : "chart-down"}`}>
      <svg className="rate-chart" viewBox="0 0 800 240" role="img" aria-label="Exchange rate history chart">
        <defs>
          <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity=".22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[58, 112, 166, 220].map((y) => <line key={y} x1="0" x2="800" y1={y} y2={y} className="chart-grid" />)}
        <path d={area} fill="url(#chart-fill)" />
        <path d={line} className="chart-line" />
        <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="4" className="chart-point" />
      </svg>
      <div className="chart-dates">
        <span>{rates[0].date}</span>
        <span>{rates[rates.length - 1].date}</span>
      </div>
    </div>
  );
}

function Markets() {
  const [currencies, setCurrencies] = useState([]);
  const [currencyError, setCurrencyError] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("1000");
  const [rateStats, setRateStats] = useState(null);
  const [rateError, setRateError] = useState("");
  const [isRateLoading, setIsRateLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("History");
  const [pickerSide, setPickerSide] = useState(null);
  const [range, setRange] = useState("1M");
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [marketRates, setMarketRates] = useState([]);
  const [marketError, setMarketError] = useState("");
  const [favoriteRates, setFavoriteRates] = useState([]);
  const [favoriteRateError, setFavoriteRateError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [log, setLog] = useState([]);
  const [compareRates, setCompareRates] = useState([]);
  const [compareBase, setCompareBase] = useState("");
  const [compareError, setCompareError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchJson(`${API_BASE}/currencies`, controller.signal)
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Currency list response was not valid.");
        const sorted = data
          .filter((currency) => currency?.code && currency?.name)
          .sort((a, b) => a.code.localeCompare(b.code));
        if (sorted.length === 0) throw new Error("No currencies are currently available.");
        setCurrencies(sorted);
        setCurrencyError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setCurrencyError(error.message);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadRate = async () => {
      setIsRateLoading(true);
      setRateError("");
      try {
        const data = await fetchJson(
          `${API_BASE}/rate/${fromCurrency}/${toCurrency}`,
          controller.signal,
        );
        if (!Number.isFinite(data.rate)) throw new Error("Exchange-rate response was not valid.");
        setRateStats({ base: fromCurrency, quote: toCurrency, rate: data.rate, date: data.date });
      } catch (error) {
        if (error.name !== "AbortError") setRateError(error.message);
      } finally {
        if (!controller.signal.aborted) setIsRateLoading(false);
      }
    };
    loadRate();
    return () => controller.abort();
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    const controller = new AbortController();
    const loadHistory = async () => {
      setIsHistoryLoading(true);
      setHistoryError("");
      try {
        const today = new Date().toISOString().slice(0, 10);
        const start = subtractRange(today, range);
        const data = await fetchJson(
          `${API_BASE}/rates?base=${fromCurrency}&quotes=${toCurrency}&from=${start}&to=${today}`,
          controller.signal,
        );
        if (!Array.isArray(data)) throw new Error("Rate history response was not valid.");
        const values = data
          .filter((item) => Number.isFinite(item.rate))
          .sort((a, b) => a.date.localeCompare(b.date));
        if (values.length === 0) throw new Error("No rate history is available for this range.");
        setHistory(values);
      } catch (error) {
        if (error.name !== "AbortError") {
          setHistory([]);
          setHistoryError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) setIsHistoryLoading(false);
      }
    };
    loadHistory();
    return () => controller.abort();
  }, [fromCurrency, toCurrency, range]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all(MARKET_PAIRS.map(([base, quote]) =>
      fetchPairStats(base, quote, controller.signal),
    ))
      .then((rates) => {
        setMarketRates(rates);
        setMarketError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setMarketError(error.message);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    if (favorites.length === 0) {
      return () => controller.abort();
    }
    Promise.all(favorites.map(({ base, quote }) =>
      fetchPairStats(base, quote, controller.signal),
    ))
      .then((rates) => {
        setFavoriteRates(rates);
        setFavoriteRateError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setFavoriteRateError(error.message);
      });
    return () => controller.abort();
  }, [favorites]);

  useEffect(() => {
    if (!fromCurrency) return undefined;
    const controller = new AbortController();
    fetchJson(`${API_BASE}/rates?base=${fromCurrency}`, controller.signal)
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Comparison rates response was not valid.");
        setCompareRates(data.filter((item) => Number.isFinite(item.rate)));
        setCompareBase(fromCurrency);
        setCompareError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setCompareError(error.message);
      });
    return () => controller.abort();
  }, [fromCurrency]);

  const currencyNames = useMemo(
    () => new Map(currencies.map(({ code, name }) => [code, name])),
    [currencies],
  );
  const activeRateStats = rateStats?.base === fromCurrency && rateStats?.quote === toCurrency
    ? rateStats
    : null;
  const receiveAmount = Number(amount) * (activeRateStats?.rate || 0);
  const selectedHistory = history.length > 0 ? history : [];
  const openingRate = selectedHistory[0]?.rate;
  const lastHistoryRate = selectedHistory[selectedHistory.length - 1]?.rate;
  const historyChange = getChange(lastHistoryRate, openingRate);
  const conversionRate = activeRateStats?.rate;
  const activeFavorite = favorites.some(
    (pair) => pair.base === fromCurrency && pair.quote === toCurrency,
  );
  const comparisonRows = (compareBase === fromCurrency ? compareRates : [])
    .filter(({ quote }) => quote !== toCurrency && quote !== fromCurrency)
    .sort((a, b) => {
      const aIndex = POPULAR_CODES.indexOf(a.quote);
      const bIndex = POPULAR_CODES.indexOf(b.quote);
      return (aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex) -
        (bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex);
    })
    .slice(0, 12);

  const toggleFavorite = (base, quote) => {
    setFavorites((current) => current.some((pair) => pair.base === base && pair.quote === quote)
      ? current.filter((pair) => pair.base !== base || pair.quote !== quote)
      : [...current, { base, quote }]);
  };

  const addConversionToLog = () => {
    if (!activeRateStats || !Number.isFinite(Number(amount)) || Number(amount) < 0) {
      setRateError("Enter a valid amount after the exchange rate has loaded.");
      return;
    }
    setLog((current) => [{
      id: `${Date.now()}-${Math.random()}`,
      base: fromCurrency,
      quote: toCurrency,
      amount: Number(amount),
      converted: receiveAmount,
      timestamp: Date.now(),
    }, ...current]);
    setActiveTab("Log");
  };

  const loadPair = (base, quote) => {
    setFromCurrency(base);
    setToCurrency(quote);
    setActiveTab("History");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCurrencySelect = (code) => {
    if (pickerSide === "from") {
      setFromCurrency(code);
      if (code === toCurrency) setToCurrency(fromCurrency);
    } else {
      setToCurrency(code);
      if (code === fromCurrency) setFromCurrency(toCurrency);
    }
    setPickerSide(null);
  };
  const closeCurrencyPicker = useCallback(() => setPickerSide(null), []);

  const tabs = [
    { name: "History", count: null },
    { name: "Compare", count: null },
    { name: "Favorites", count: favorites.length },
    { name: "Log", count: log.length },
  ];

  return (
    <main className="forex-app">
      <Navbar
        rates={marketRates}
        currencyNames={currencyNames}
        error={marketError}
        onSelectPair={loadPair}
      />
      <div className="main-content">
        <section className="converter-section" aria-labelledby="page-title">
          <div className="page-heading">
            <div>
              <p className="eyebrow">YOUR MONEY, IN ANOTHER CURRENCY</p>
              <h1 id="page-title">Currency converter</h1>
            </div>
            <p className="updated-note">
              <span className="live-dot" /> Rates updated daily
            </p>
          </div>

          <div className="converter-card">
            <div className="conversion-fields">
              <label className="conversion-field">
                <span className="field-label">YOU SEND</span>
                <span className="field-entry">
                  <input
                    aria-label="Amount to send"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                  <button
                    type="button"
                    className="currency-select"
                    onClick={() => setPickerSide("from")}
                    aria-label={`Select send currency, currently ${fromCurrency}`}
                  >
                    <CurrencyFlag code={fromCurrency} />
                    <span>{fromCurrency}</span>
                    <span className="select-chevron" aria-hidden="true">⌄</span>
                  </button>
                </span>
              </label>

              <button
                type="button"
                className="swap-button"
                aria-label="Swap send and receive currencies"
                onClick={() => {
                  setFromCurrency(toCurrency);
                  setToCurrency(fromCurrency);
                }}
              >
                <span aria-hidden="true">⇄</span>
              </button>

              <div className="conversion-field receive-field">
                <span className="field-label">THEY RECEIVE</span>
                <span className="field-entry">
                  <output className="receive-amount" aria-label="Converted amount">
                    {isRateLoading ? "…" : formatAmount(receiveAmount)}
                  </output>
                  <button
                    type="button"
                    className="currency-select"
                    onClick={() => setPickerSide("to")}
                    aria-label={`Select receive currency, currently ${toCurrency}`}
                  >
                    <CurrencyFlag code={toCurrency} />
                    <span>{toCurrency}</span>
                    <span className="select-chevron" aria-hidden="true">⌄</span>
                  </button>
                </span>
              </div>
            </div>

            <div className="converter-footer">
              <div className="rate-caption" aria-live="polite">
                {rateError ? (
                  <span className="error-text" role="alert">{rateError}</span>
                ) : (
                  <>
                    <span className="rate-equation">
                      1 {fromCurrency} <span aria-hidden="true">=</span>{" "}
                      {isRateLoading ? "…" : formatRate(conversionRate)} {toCurrency}
                    </span>
                    {rateStats?.date && <span className="rate-date">Rate on {rateStats.date}</span>}
                  </>
                )}
              </div>
              <div className="converter-actions">
                <button
                  type="button"
                  className={`secondary-button ${activeFavorite ? "is-favorite" : ""}`}
                  onClick={() => toggleFavorite(fromCurrency, toCurrency)}
                  aria-pressed={activeFavorite}
                >
                  <span aria-hidden="true">{activeFavorite ? "★" : "☆"}</span>
                  {activeFavorite ? "SAVED" : "ADD TO FAVORITES"}
                </button>
                <button type="button" className="primary-button" onClick={addConversionToLog}>
                  LOG CONVERSION <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
          </div>
          {currencyError && <p className="inline-error" role="alert">{currencyError}</p>}
        </section>

        <nav className="content-tabs" aria-label="Currency tools">
          {tabs.map(({ name, count }) => (
            <button
              type="button"
              key={name}
              className={`content-tab ${activeTab === name ? "active" : ""}`}
              onClick={() => setActiveTab(name)}
              aria-current={activeTab === name ? "page" : undefined}
            >
              {name}
              {count !== null && <span className="tab-count">{count}</span>}
            </button>
          ))}
        </nav>

        {activeTab === "History" && (
          <section className="data-panel" aria-label={`${fromCurrency} to ${toCurrency} rate history`}>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">RATE HISTORY</p>
                <h2>{fromCurrency} <span>/</span> {toCurrency}</h2>
              </div>
              <div className="range-control" aria-label="Chart range">
                {RANGES.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={range === item ? "selected" : ""}
                    onClick={() => setRange(item)}
                    aria-pressed={range === item}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="history-stats">
              <div><span>OPEN</span><strong>{isHistoryLoading ? "…" : formatRate(openingRate)}</strong></div>
              <div><span>LAST</span><strong>{isHistoryLoading ? "…" : formatRate(lastHistoryRate)}</strong></div>
              <div>
                <span>CHANGE</span>
                <strong className={historyChange.absolute >= 0 ? "positive" : "negative"}>
                  {isHistoryLoading ? "…" : `${historyChange.absolute >= 0 ? "+" : ""}${formatRate(historyChange.absolute)}`}
                </strong>
              </div>
              <div>
                <span>% CHANGE</span>
                <strong className={historyChange.percent >= 0 ? "positive" : "negative"}>
                  {isHistoryLoading ? "…" : `${historyChange.percent >= 0 ? "+" : ""}${historyChange.percent.toFixed(2)}%`}
                </strong>
              </div>
            </div>
            {isHistoryLoading
              ? <div className="chart-empty" aria-live="polite">Loading rate history…</div>
              : historyError
                ? <p className="inline-error" role="alert">{historyError}</p>
                : <RateChart rates={selectedHistory} />}
          </section>
        )}

        {activeTab === "Compare" && (
          <section className="data-panel" aria-labelledby="compare-title">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">ONE AMOUNT, MANY CURRENCIES</p>
                <h2 id="compare-title">Compare rates</h2>
              </div>
              <p className="panel-subtitle">{formatAmount(Number(amount))} {fromCurrency} converts to</p>
            </div>
            {compareError && <p className="inline-error" role="alert">{compareError}</p>}
            <div className="comparison-list">
              {comparisonRows.map(({ quote, rate }) => {
                const isPinned = favorites.some((pair) => pair.base === fromCurrency && pair.quote === quote);
                return (
                  <article className="comparison-row" key={quote}>
                    <div className="currency-identity">
                      <CurrencyFlag code={quote} />
                      <div><strong>{quote}</strong><span>{currencyNames.get(quote) || quote}</span></div>
                    </div>
                    <div className="comparison-value">
                      <strong>{formatAmount(Number(amount) * rate)} <span>{quote}</span></strong>
                      <span>1 {fromCurrency} = {formatRate(rate)} {quote}</span>
                    </div>
                    <button
                      type="button"
                      className={`icon-button pin-button ${isPinned ? "is-favorite" : ""}`}
                      onClick={() => toggleFavorite(fromCurrency, quote)}
                      aria-label={`${isPinned ? "Unpin" : "Pin"} ${fromCurrency}/${quote}`}
                      aria-pressed={isPinned}
                    >
                      {isPinned ? "★" : "☆"}
                    </button>
                  </article>
                );
              })}
              {!compareError && comparisonRows.length === 0 && (
                <p className="empty-state">Loading currencies to compare…</p>
              )}
            </div>
          </section>
        )}

        {activeTab === "Favorites" && (
          <section className="data-panel" aria-labelledby="favorites-title">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">YOUR WATCHLIST</p>
                <h2 id="favorites-title">Favorite pairs</h2>
              </div>
            </div>
            {favorites.length === 0 ? (
              <p className="empty-state">No favorites yet. Save a pair from the converter or pin one in Compare.</p>
            ) : (
              <div className="comparison-list">
                {favorites.map(({ base, quote }) => {
                  const ticker = marketRates.find((item) => item.base === base && item.quote === quote);
                  const favoriteRate = favoriteRates.find((item) => item.base === base && item.quote === quote);
                  const activeRate = base === fromCurrency && quote === toCurrency ? activeRateStats?.rate : null;
                  const liveRate = activeRate || favoriteRate?.rate || ticker?.rate;
                  const change = favoriteRate?.change || ticker?.change;
                  return (
                    <article className="comparison-row favorite-row" key={`${base}-${quote}`}>
                      <button type="button" className="favorite-pair" onClick={() => loadPair(base, quote)}>
                        <span className="pair-flags"><CurrencyFlag code={base} /><CurrencyFlag code={quote} /></span>
                        <span><strong>{base} / {quote}</strong><small>{currencyNames.get(base) || base} to {currencyNames.get(quote) || quote}</small></span>
                      </button>
                      <div className="comparison-value">
                        <strong>{liveRate ? formatRate(liveRate) : "—"} <span>{quote}</span></strong>
                        <span className={change?.percent >= 0 ? "positive" : "negative"}>
                          {change ? `${change.percent >= 0 ? "+" : ""}${change.percent.toFixed(2)}% · 24h` : "24h change unavailable"}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="icon-button remove-button"
                        onClick={() => toggleFavorite(base, quote)}
                        aria-label={`Unpin ${base}/${quote}`}
                      >
                        ×
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
            {favoriteRateError && <p className="inline-error" role="alert">{favoriteRateError}</p>}
          </section>
        )}

        {activeTab === "Log" && (
          <section className="data-panel" aria-labelledby="log-title">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">YOUR RECENT ACTIVITY</p>
                <h2 id="log-title">Conversion log</h2>
              </div>
              {log.length > 0 && (
                <button type="button" className="text-button" onClick={() => setLog([])}>
                  Clear log
                </button>
              )}
            </div>
            {log.length === 0 ? (
              <p className="empty-state">Your conversions will show up here when you log one.</p>
            ) : (
              <div className="comparison-list">
                {log.map((entry) => (
                  <article className="comparison-row log-row" key={entry.id}>
                    <span className="log-time">{shortRelativeTime(entry.timestamp)}</span>
                    <div className="currency-identity">
                      <span className="pair-code">{entry.base} / {entry.quote}</span>
                    </div>
                    <div className="comparison-value">
                      <strong>{formatAmount(entry.amount)} {entry.base} <span>→</span> {formatAmount(entry.converted)} {entry.quote}</strong>
                      <span>1 {entry.base} = {formatRate(entry.converted / (entry.amount || 1))} {entry.quote}</span>
                    </div>
                    <button
                      type="button"
                      className="icon-button remove-button"
                      onClick={() => setLog((current) => current.filter((item) => item.id !== entry.id))}
                      aria-label={`Delete ${entry.base} to ${entry.quote} conversion`}
                    >
                      ×
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <footer className="page-footer">
          <span>Exchange rates provided by Frankfurter</span>
          <span>Rates are for informational purposes</span>
        </footer>
      </div>
      {pickerSide && currencies.length > 0 && (
        <CurrencyPicker
          side={pickerSide}
          selected={pickerSide === "from" ? fromCurrency : toCurrency}
          currencies={currencies}
          onSelect={handleCurrencySelect}
          onClose={closeCurrencyPicker}
        />
      )}
    </main>
  );
}

export default Markets;
