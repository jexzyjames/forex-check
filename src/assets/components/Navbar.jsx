import logo from "../images/logo.svg";
import { getFlagUrl } from "./currencyFlags";

function Navbar({ rates, currencyNames, error, onSelectPair }) {
  return (
    <header className="site-header">
      <div className="header-top">
        <a className="brand" href="#" aria-label="Forex Check home">
          <img src={logo} alt="Forex Check" />
        </a>
        <div className="header-meta">
          <span><i className="live-dot" /> LIVE FX MARKETS</span>
          <span>REFERENCE RATES</span>
        </div>
      </div>
      <div className="market-ticker" aria-label="Live currency markets">
        <div className="ticker-title"><span className="ticker-bars" aria-hidden="true">▥</span> MARKET WATCH</div>
        {rates.length > 0 ? rates.map(({ base, quote, rate, change }) => (
          <button
            type="button"
            className="ticker-item"
            key={`${base}-${quote}`}
            onClick={() => onSelectPair(base, quote)}
            aria-label={`Load ${base} to ${quote}, ${rate}, ${change?.percent >= 0 ? "up" : "down"} ${Math.abs(change?.percent || 0).toFixed(2)} percent`}
          >
            <span className="ticker-pair">
              <img src={getFlagUrl(base)} alt="" />
              {base}/{quote}
            </span>
            <strong>{rate.toFixed(4)}</strong>
            <span className={`ticker-change ${(change?.percent || 0) >= 0 ? "positive" : "negative"}`}>
              {(change?.percent || 0) >= 0 ? "↗" : "↘"} {Math.abs(change?.percent || 0).toFixed(2)}%
            </span>
          </button>
        )) : (
          <p className="ticker-status" role={error ? "alert" : undefined}>
            {error || "Fetching market rates…"}
          </p>
        )}
        {rates.length > 0 && error && <span className="ticker-warning" role="status">{error}</span>}
      </div>
      <span className="sr-only">
        {rates.map(({ base, quote }) => `${base} ${currencyNames.get(base) || ""} to ${quote} ${currencyNames.get(quote) || ""}`).join("; ")}
      </span>
    </header>
  );
}

export default Navbar;
