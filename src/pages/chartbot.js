import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Common/Header";
import SelectDays from "../components/CoinPage/SelectDays";
import ToggleComponents from "../components/CoinPage/ToggleComponent";
import LineChart from "../components/CoinPage/LineChart";
import Loader from "../components/Common/Loader";
import Button from "../components/Common/Button";
import Chatbot from "../components/chatbot/Cryptochartbot";
import { get100Coins } from "../functions/get100Coins";
import { getPrices } from "../functions/getPrices";
import { settingChartData } from "../functions/settingChartData";
import "./chartbot.css";

const priceTypeCopy = {
  prices: "price",
  market_caps: "market cap",
  total_volumes: "volume",
};

const ChartBot = () => {
  const [coins, setCoins] = useState([]);
  const [primaryCoin, setPrimaryCoin] = useState("bitcoin");
  const [secondaryCoin, setSecondaryCoin] = useState("ethereum");
  const [enableCompare, setEnableCompare] = useState(false);
  const [days, setDays] = useState(30);
  const [priceType, setPriceType] = useState("prices");
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [coinsLoading, setCoinsLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCoins = async () => {
      setCoinsLoading(true);
      const list = await get100Coins();
      if (list && list.length) {
        setCoins(list);
      }
      setCoinsLoading(false);
    };
    fetchCoins();
  }, []);

  useEffect(() => {
    if (!coins.length || !primaryCoin) return;
    const fetchChart = async () => {
      setChartLoading(true);
      setError(false);
      const prices1 = await getPrices(primaryCoin, days, priceType, setError);
      let prices2 = null;
      if (enableCompare && secondaryCoin) {
        prices2 = await getPrices(secondaryCoin, days, priceType, setError);
      }
      if (prices1) {
        settingChartData(setChartData, prices1, prices2);
      }
      setChartLoading(false);
    };
    fetchChart();
  }, [coins, primaryCoin, secondaryCoin, enableCompare, days, priceType]);

  const primaryCoinMeta = useMemo(
    () => coins.find((coin) => coin.id === primaryCoin),
    [coins, primaryCoin]
  );

  const secondaryCoinMeta = useMemo(
    () => coins.find((coin) => coin.id === secondaryCoin),
    [coins, secondaryCoin]
  );

  const chatContext = useMemo(() => {
    const primaryName = primaryCoinMeta?.name ?? primaryCoin;
    const secondaryName =
      enableCompare && secondaryCoinMeta ? secondaryCoinMeta.name : null;
    const metric = priceTypeCopy[priceType] ?? priceType;
    return `Primary: ${primaryName} (${primaryCoin}), Days: ${days}, Metric: ${metric}${
      secondaryName ? ` | Secondary: ${secondaryName} (${secondaryCoin})` : ""
    }`;
  }, [
    primaryCoin,
    primaryCoinMeta,
    secondaryCoin,
    secondaryCoinMeta,
    enableCompare,
    days,
    priceType,
  ]);

  const formatPercent = (value) => {
    if (value === undefined || value === null) return "--";
    const fixed = Number(value).toFixed(2);
    return `${value > 0 ? "+" : ""}${fixed}%`;
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "--";
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
    return `$${Number(value).toFixed(2)}`;
  };

  const renderCoinSelect = (label, value, setter, disabledCoin) => (
    <div className="chartbot-control">
      <p>{label}</p>
      <select
        value={value}
        onChange={(e) => setter(e.target.value)}
        className="chartbot-select"
        disabled={!coins.length}
      >
        {coins
          .filter((coin) => coin.id !== disabledCoin)
          .map((coin) => (
            <option key={coin.id} value={coin.id}>
              {coin.name}
            </option>
          ))}
      </select>
    </div>
  );

  const handleDaysChange = (e) => setDays(e.target.value);
  const handlePriceTypeChange = (e) => setPriceType(e.target.value);

  const chartBusy = coinsLoading || chartLoading;

  return (
    <>
      <Header />
      <main className="chartbot-page">
        <section className="chartbot-hero">
          <div className="chartbot-hero__copy">
            <p className="chartbot-badge">NEW • AI ENABLED</p>
            <h1>Chart Bot</h1>
            <p>
              Overlay deep-dive price charts with an AI analyst that understands your
              selected assets, timeframes, and metrics. Detect momentum, compare coins,
              and ask natural questions in one seamless workspace.
            </p>
            <div className="chartbot-hero__actions">
              <a href="/dashboard">
                <Button text="View Dashboard" />
              </a>
              <a href="/compare">
                <Button text="Compare Coins" outlined />
              </a>
            </div>
          </div>
          <div className="chartbot-stats">
            <div className="stat-card">
              <p>Primary asset</p>
              <h3>{primaryCoinMeta?.name ?? "Loading..."}</h3>
              <span
                className={
                  Number(primaryCoinMeta?.price_change_percentage_24h) >= 0
                    ? "rise"
                    : "fall"
                }
              >
                {formatPercent(primaryCoinMeta?.price_change_percentage_24h)}
              </span>
            </div>
            <div className="stat-card">
              <p>Market cap</p>
              <h3>{formatCurrency(primaryCoinMeta?.market_cap)}</h3>
              <span>Realtime feed</span>
            </div>
            {enableCompare && (
              <div className="stat-card secondary">
                <p>Secondary asset</p>
                <h3>{secondaryCoinMeta?.name ?? "Select asset"}</h3>
                <span
                  className={
                    Number(secondaryCoinMeta?.price_change_percentage_24h) >= 0
                      ? "rise"
                      : "fall"
                  }
                >
                  {formatPercent(secondaryCoinMeta?.price_change_percentage_24h)}
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="chartbot-grid">
          <div className="chartbot-panel">
            <div className="chartbot-panel__header">
              <div>
                <h2>Interactive chart</h2>
                <p>Adjust assets, timeframe, and metric. The AI bot will use this view.</p>
              </div>
            </div>
            <div className="chartbot-controls__row">
              {renderCoinSelect(
                "Primary coin",
                primaryCoin,
                setPrimaryCoin,
                enableCompare ? secondaryCoin : null
              )}
              <label className="chartbot-toggle">
                <input
                  type="checkbox"
                  checked={enableCompare}
                  onChange={(e) => setEnableCompare(e.target.checked)}
                />
                <span>Compare</span>
              </label>
              {enableCompare &&
                renderCoinSelect("Secondary coin", secondaryCoin, setSecondaryCoin, primaryCoin)}
            </div>
            <div className="chartbot-controls__row compact">
              <SelectDays days={days} handleDaysChange={handleDaysChange} noPTag />
              <ToggleComponents
                priceType={priceType}
                handlePriceTypeChange={handlePriceTypeChange}
              />
            </div>
            <div className="chartbot-chart">
              {chartBusy ? (
                <Loader />
              ) : error ? (
                <p className="chartbot-error">
                  Unable to load prices right now. Please try again later.
                </p>
              ) : (
                <LineChart chartData={chartData} multiAxis={enableCompare} />
              )}
            </div>
          </div>

          <div className="chartbot-panel chatbot-panel">
            <div className="chartbot-panel__header">
              <div>
                <h2>AI Crypto Copilot</h2>
                <p>Receives your current chart context to ground answers in data.</p>
              </div>
            </div>
            <Chatbot variant="embedded" context={chatContext} />
          </div>
        </section>
      </main>
    </>
  );
};

export default ChartBot;
