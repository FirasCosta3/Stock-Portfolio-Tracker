import {PieChart} from './components/Pie.jsx';
import {useState, useEffect} from 'react'
import './App.css';
import {Currency_buttons} from './components/currencies.jsx';
import {Currencies} from './constants/currencies.js'

function App() {
        const [portfolioData, setPortfolioData] = useState(null);
        const [showCurrencies, setCurrencies] = useState(false);
        const [menuActive, setMenuActive] = useState(false);
        const [tradeValue, setTradeValue] = useState("");
        const [buyValue, setBuyValue] = useState("");
        const [currentPrice, setCurrentPrice] = useState("");
        const [stockSearch, setStockSearch] = useState("");
        const [errorMessage, setErrorMessage] = useState(false);
        const [foundStocks, setFoundStocks] = useState([]);
        const [tradeType, setTradeType] = useState("");
        const [stockIndex, setStockIndex] = useState("");
        const [desiredStock, setDesiredStock] = useState("");
        const [stockInfo, setStockInfo] = useState("");
        const [stockPurchase, setStockPurchase] = useState("");
        const [stockCurrency, setStockCurrency] = useState("");
        const [tradeError, setTradeError] = useState("")
        const [currency, currencySet] = useState(() => {
            const saved = localStorage.getItem("currency")
            return saved ? saved : "GBP";
        });
        const [chartSymbol, setChartSymbol] = useState(() => {
            const saved = localStorage.getItem("symbol")
            return saved? saved : "£"
        })

        const sendPortfolioData = async (selectedCurrency) => {
            const response = await fetch("http://127.0.0.1:5000/portfolio", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currency: selectedCurrency
                })
            });
            const data = await response.json();
            if (data.status === 200) {
                setPortfolioData(data.data)
                setChartSymbol(localStorage.getItem("symbol") || "£" )
        };
        }
        useEffect(() => {
            localStorage.setItem("currency", currency)
            sendPortfolioData(currency);
        }, [currency])
    function saveCurrency(name, symbol){
        localStorage.setItem("currency", name)
        localStorage.setItem("symbol", symbol)
        currencySet(name)
        setCurrencies(false)
    }

    const findStock = async (e) => {
        e.preventDefault();
        const response = await fetch("http://127.0.0.1:5000/stocks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                search: stockSearch
            })
        });
        const data = await response.json();
        if (data.status === 200){
            setFoundStocks(data.data)
        }   
        else {
            setFoundStocks([])
        }
    }
    useEffect(() => {
        if (stockIndex === "") return;
        const tradeDetails = async () => {
            const response = await fetch("http://127.0.0.1:5000/tradeDetails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    index: stockIndex,
                    currency: chartSymbol
                })
            });
            const data = await response.json();
            if (data.status === 200){
                setCurrentPrice(data.info[6])
                setStockInfo(data.info)
                setStockCurrency(Currencies[(data.info)[5]])
            }
        }
        tradeDetails();
        }, [stockIndex])

    const resetPortfolio = async () => {
        const response = await fetch("http://127.0.0.1:5000/reset", {
            method: "POST"
        })
        const data = await response.json()
        if (data.status === 200){
            location.reload()
        }
    }

    const sendTrade = async (e) => {
        e.preventDefault();
        if (buyValue && tradeValue){
        const response = await fetch("http://127.0.0.1:5000/trade", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            type: tradeType,
            trade: tradeValue,
            info: stockInfo,
            currency: currency,
            price: buyValue
            })
        });
        const data = await response.json()
        if (data.status === 404){
            if (data.error === "high")
                setTradeError(`Max price was ${stockCurrency}${data.max_price} \n The price was never ${stockCurrency}${buyValue}`)
            setErrorMessage(true)
        }
        else if (data.status === 200){
            setStockPurchase(data.purchases)
            location.reload()
          }

    }
        else {
            setTradeError("Make sure no fields are blank")
            setErrorMessage(true)
        }
};

    const currency_cur = localStorage.getItem("currency") || "GBP"
    const currency_symb = localStorage.getItem("symbol") || "£"
    const changeSearches = (index) => { 
        setFoundStocks([]);
        setDesiredStock(foundStocks[index])
        setStockIndex(index)
    }

    return (
        <>
    <nav id="top-nav">
        <div id="cur-div">
            <button className="main-font currency-button" id="current-currency" onClick={() => setCurrencies(!showCurrencies)}>{currency_cur} {currency_symb}</button>
            <Currency_buttons curClass={showCurrencies ? "currencies active" : "currencies"} currentPick={saveCurrency}/>
        </div>
    </nav>
    <div className="pie-chart">
        <button id="new-stock" className={"main-font"} onClick={() => setMenuActive(!menuActive)}>+ New stock</button>
        <button id="reset-port" className={"main-font"} onClick={resetPortfolio}>Reset Portfolio</button>
        <PieChart symbol = {chartSymbol} portfolio={portfolioData}/>
    </div>
    <div className={menuActive ? "stock-buy active" : "stock-buy"}>
        <button id="cancel-button" onClick={() => setMenuActive(!menuActive)}>
            <svg id="x-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50">
                <path d="M8.5 8.5 L15.5 15.5 M15.5 8.5 L8.5 15.5" stroke="green" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
        </button>
        <div id="search-div">
            <form id="stock-search-form" onSubmit={(e) => {findStock(e); setDesiredStock("")}}>
                <input  autoComplete="off" onChange={(e) => setStockSearch(e.target.value)} id="stock-search" placeholder="Enter a stock or ticker" type="text"></input>
            </form>
                {foundStocks?.map((stock, index) => {
                    return (
                        <div key={index} className="search-button-div">
                            <button type="button" className="search-buttons" onClick={() => changeSearches(index)}>{stock}</button>
                        </div>
                    );
                })}
                <div id ="show-desired" className={desiredStock ? "active" : ""}>
                    <h1 id="desired-title" className="main-font">{desiredStock}</h1>
                    <h1 id="current-price" className="main-font">Live price: {stockCurrency}{currentPrice}</h1>
                    <div id="buy-sell-div">
                        <button onClick={() => setTradeType("buy")} className={tradeType === "buy" ? "buy-sell active" : "buy-sell"}>Buy</button>
                        <button onClick={() => setTradeType("sell")} className={tradeType === "sell" ? "buy-sell active" : "buy-sell"}>Sell</button>
                        <button onClick={() => setTradeType("overide")} className={tradeType === "overide" ? "buy-sell active" : "buy-sell"}>Overide Stock</button>
                    </div>  
                    <div id="stock-details" className={tradeType ? "active": ""}>
                        <div id="trade-div">
                            <label htmlFor="trade-choice" className="main-font" id="trade-label">Value</label>
                            <form onSubmit={(e) => sendTrade(e)} className="main-font trade-value">
                                <span className="pound">{chartSymbol}</span>
                                <input onChange={(e) => setTradeValue(e.target.value)} autoComplete="off" className="main-font" inputMode="decimal" type="number" id="trade-choice" placeholder="0"></input>
                            </form>
                        </div>  
                        <div id="price-div">
                            <label htmlFor="trade-p" className="main-font" id="trade-price">Price Average</label>
                            <form onSubmit={(e) => sendTrade(e)} className="main-font trade-value">
                                <span className="pound">{stockCurrency}</span>
                                <input onChange={(e) => setBuyValue(e.target.value)} autoComplete="off" className="main-font" inputMode="decimal" type="number" id="trade-p" placeholder="0"></input>
                            </form>
                        </div>
                        <p id="error-message" className={errorMessage ? "active main-font": ""}>{tradeError}</p>
                    </div>
                </div>
            </div>
    </div>
        </>
        );
}
export default App;