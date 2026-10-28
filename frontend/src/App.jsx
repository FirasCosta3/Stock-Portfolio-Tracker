import {PieChart} from "./components/Pie.jsx";
import {useState, useEffect, useRef} from "react";
import "./App.css";
import {Currency_buttons} from "./components/currencies.jsx";
import {Currencies} from "./constants/currencies.js";
import {LineGraph} from "./components/line.jsx";
import {PeriodButtons} from "./components/periods.jsx";

function App() {
        const [portfolioData, setPortfolioData] = useState(null);
        const [showCurrencies, setCurrencies] = useState(false);
        const [menuActive, setMenuActive] = useState(false);
        const [tradeValue, setTradeValue] = useState("");
        const [timePeriod, setTimePeriod] = useState("1d");
        const [buyValue, setBuyValue] = useState("");
        const [example, setExample] = useState("Example");
        const [currentPrice, setCurrentPrice] = useState("");
        const [stockSearch, setStockSearch] = useState("");
        const [errorMessage, setErrorMessage] = useState(false);
        const [foundStocks, setFoundStocks] = useState(null);
        const [tradeType, setTradeType] = useState("");
        const [graphTitle, setGraphTitle] = useState("");
        const [stockIndex, setStockIndex] = useState("");
        const [desiredStock, setDesiredStock] = useState("");
        const [stockInfo, setStockInfo] = useState("");
        const [portfolioValue, setPortfolioValue] = useState("");
        const [stockPurchase, setStockPurchase] = useState("");
        const [stockCurrency, setStockCurrency] = useState("");
        const [graphData, setGraphData] = useState("");
        const [graphStockName, setGraphStockName] = useState("");
        const [stockFacts, setStockFacts] = useState("");
        const [tradeError, setTradeError] = useState("");
        const [bestWorst, setBestWorst] = useState("");
        const [percentageChange, setPercentageChange] = useState("");
        const [graphStockCurrency, setGraphStockCurrency] = useState("");
        const [reset, setReset] = useState(false)
        const [newGraphStockName, setNewGraphStockName] = useState("");
        const [newStocks, setNewStocks] = useState("");
        const visitedDivs = useRef([])
        const dropDownRef = useRef(null)
        const stockBuyRef = useRef(null)
        const checkPush = (pusher) => {
            const pusherString = pusher.toString()
            console.log(newStocks)
            console.log(pusherString)
            const isInList = visitedDivs.current.some(
                (pushee) => pushee.toString() === pusherString
            );
            if (!isInList){
                visitedDivs.current.push(pusher)
            }
        };

        useEffect(() => {
            const clickOutsideCur = (event) => {
                if (dropDownRef.current && !dropDownRef.current.contains(event.target)){
                    setCurrencies(showCurrencies)
                }
            };
            document.addEventListener("mousedown", clickOutsideCur);
            return () => {
                document.removeEventListener("mousedown", clickOutsideCur)
            };
        }, []);
        useEffect(() => {
            const clickOutsideSearch = (event) => {
                if (stockBuyRef.current && !stockBuyRef.current.contains(event.target)){
                    setMenuActive(menuActive)
                    closeAll();
                }
            };
            document.addEventListener("mousedown", clickOutsideSearch);
        return () => {
            document.removeEventListener("mousdown", clickOutsideSearch);
        }}, [])

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
                    currency: selectedCurrency,
                    stock: newGraphStockName
                })
            });                
            const data = await response.json();
            if (data.status === 200) {
                const fetchedPortfolioData = data.data
                const stockGraph = data.stock_graph
                if (stockGraph){
                    setGraphData(stockGraph[0])
                    setStockFacts(stockGraph[1])
                    setBestWorst(stockGraph[1][0])
                    setGraphStockName(stockGraph[2][0])
                    const stockCur = stockGraph[2][1]
                    setGraphStockCurrency(Currencies[stockCur])
                    setPercentageChange(stockGraph[1][1][0])
                }
                setPortfolioData(fetchedPortfolioData[0])
                setPortfolioValue(fetchedPortfolioData[1])
                setChartSymbol(localStorage.getItem("symbol") || "£" )
                setExample("Portfolio")
                localStorage.setItem("Portfolio",true) 
        };
        }
        useEffect(() => {
            localStorage.setItem("currency", currency)
            sendPortfolioData(currency);
        }, [currency])
    function saveCurrency(name, symbol){
        localStorage.setItem("currency", name)
        localStorage.setItem("symbol", symbol)
        if (example === "Example"){
            setChartSymbol(localStorage.getItem("symbol"))
        }
        currencySet(name)
        setCurrencies(false)
    }

    const findStock = async (e, message) => {
        e.preventDefault();
        setStockSearch(message);
        const response = await fetch("http://127.0.0.1:5000/stocks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                search: message
            })
        });
        const data = await response.json();
        if (data.status === 200){
            setFoundStocks(data.data)
            setNewStocks(data.data)
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
    useEffect(() => {
    if (portfolioData){
    const changePeriod = async () => {
        const graphName = newGraphStockName || graphStockName;
        const response = await fetch("http://127.0.0.1:5000/timePeriod", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                period: timePeriod,
                stock: graphName,
            })
        });
        const data = await response.json()
        if (data.status === 200){
            setGraphData(data.price_data)
            setPercentageChange(data.percentage)
        }
    }
    changePeriod();
}
    },[timePeriod, newGraphStockName])


    const resetPortfolio = async () => {
        const response = await fetch("http://127.0.0.1:5000/reset", {
            method: "POST"
        })
        const data = await response.json()
        if (data.status === 200){
            location.reload()
        }
    }
    useEffect(() => {
        if (graphStockName != newGraphStockName && newGraphStockName != ""){
        setGraphTitle("Active stock choice: ")
        }
    },[timePeriod, newGraphStockName])

    const sendTrade = async (e) => {
        e.preventDefault();
        if (buyValue > 0){
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
                if (data.error === "sold"){
                    setTradeError(`At ${stockCurrency}${buyValue} your holdings is ${stockCurrency}${data.total.toLocaleString("en-GB")}\n You couldn't have sold ${stockCurrency}${data.value.toLocaleString("en-GB")}`)
                }
            }
            else if (data.status === 200){
                setStockPurchase(data.purchases)
                location.reload()
            }
            
        }        
    }   
        else if(!buyValue || !tradeValue){
            setTradeError("Make sure no fields are blank")
        }
        else if(buyValue <= 0){
            setTradeError("Enter a number greater than 0")
            }
        setErrorMessage(true)
    }

    const closeAll = () => {
        visitedDivs.current.toReversed().forEach((active) => active?.())
        visitedDivs.current = [];
        resetTradeFields();
    }
    const currency_cur = localStorage.getItem("currency") || "GBP"
    const currency_symb = localStorage.getItem("symbol") || "£"
    const changeSearches = (index) => { 
        setFoundStocks(null);
        setDesiredStock(foundStocks[index])
        setStockIndex(index)
    }   
    const justGoBack = () => {
        console.log(visitedDivs)
        const lastDiv = visitedDivs.current.pop();
        lastDiv((active) => active?.());
        resetTradeFields();
    }
    const resetTradeFields = () =>{
        setBuyValue("");
        setTradeValue("");
        setTradeType("");
    }

    return (
        <>
    <nav id="top-nav">
        <div id="cur-div" ref ={dropDownRef}>
            <button className="main-font currency-button" id="current-currency" onClick={() => setCurrencies(!showCurrencies)}>{currency_cur} {currency_symb}</button>
            <Currency_buttons dropDownRef={dropDownRef} curClass={showCurrencies ? "currencies active" : "currencies"} currentPick={saveCurrency}/>
        </div>
    </nav>
    <div id="page-divider">
        <div id="stock-graph-div">
            <div id="graph-title">
                <div id="line-title">
                    <div id="best-worst-div" className={!graphTitle ? "" : "active"}>
                        <h1 className={"best-worst main-font"}>{bestWorst} performer today: {graphStockName}</h1>
                    </div>
                    <div id="best-worst-division" className={graphTitle ? "" : "active"}>
                        <h1 className={graphTitle ? "best-worst main-font" : "active"}>{graphTitle}{newGraphStockName}</h1>
                    </div>
                    <h1 className={percentageChange?.includes("-") ? "main-font active" : "main-font"} id="percentage-change">{percentageChange}</h1>
                </div>
                    <LineGraph symbol = {graphStockCurrency} graphData = {graphData}/>
            </div>
            <div id="periods-division">
                <PeriodButtons timePeriod = {timePeriod} setTimePeriod = {setTimePeriod} periodChange={(time) => {setTimePeriod(time)}}/>
                <div className={portfolioData?.length > 1 ? "" : "active"} id="stock-buttons-div">
                    {Object.keys(portfolioData || {}).map((stock) => {
                        return(
                        <button key={stock} className={graphStockName === stock ? "active" : ""} id="stock-button" onClick={() => {setNewGraphStockName(stock);}}>{stock}</button>
                        )
                    })}
                </div>
            </div>
        </div>

        <div className="pie-chart-div">
            <div id="pie-buttons">
                <button id="new-stock" className={"main-font"} onClick={() => {setMenuActive((menuActive) => !menuActive); checkPush(() => setMenuActive((menuActive) => !menuActive));}}>+ New stock</button>
                <h1 id="portfolio-value" className="main-font">{example} Value: {chartSymbol}{portfolioValue}</h1>
                <button id="reset-port" className={"main-font"} onClick={() => setReset(!reset)}>Reset Portfolio</button>
            </div>
            <div id="confirm-message" className={reset ? "active" : ""}>
                <button id="cancel-button-confirm" onClick={() => setReset(!reset)}>
                    <svg id="x-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50">
                        <path d="M8.5 8.5 L15.5 15.5 M15.5 8.5 L8.5 15.5" stroke="green" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    </svg>
                </button>
                <div id="confirm-div">
                    <h1 className="main-font" id="confirm-h">
                        <span>Resetting is permanent</span>
                        <span>Confirm to make changes</span>
                    </h1>
                    <button className="main-font" id="confirm-reset" onClick={resetPortfolio}>Confirm</button>
                </div>
            </div>
            <div id="chart-sizing">
                <PieChart symbol = {chartSymbol} portfolio={portfolioData} setPortfolioValue = {setPortfolioValue}/>
            </div>
        </div>
        <div ref={stockBuyRef} className={menuActive ? "stock-buy active" : "stock-buy"}>
            <div id = "search-buttons">
                <button id="go-back" onClick={() => justGoBack(menuActive)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                </button>
                <button id="cancel-button" onClick={closeAll}>
                <svg id="x-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50">
                    <path d="M8.5 8.5 L15.5 15.5 M15.5 8.5 L8.5 15.5" stroke="green" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
            </button>
            </div> 
            <div id="search-div">
                <form id="stock-search-form" onSubmit={(e) => {findStock(e, stockSearch); setDesiredStock(""); checkPush(() => findStock(e, ""))}}>
                    <input  autoComplete="off" value={stockSearch} onChange={(e) => setStockSearch(e.target.value)} id="stock-search" placeholder="Enter a stock or ticker" type="text"></input>
                </form>
                    {foundStocks?.map((stock, index) => {
                        return (
                            <div key={index} className="search-button-div">
                                <button type="button" className="search-buttons" onClick={() => {checkPush(() => {setDesiredStock(""); setFoundStocks(newStocks)}); changeSearches(index)}}>{stock}</button>
                            </div>
                        );
                    })}
                    <div id ="show-desired" className={desiredStock && currentPrice ? "active" : ""}>
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
                                    <input value={tradeValue} onChange={(e) => setTradeValue(e.target.value)} autoComplete="off" className="main-font" inputMode="decimal" type="number" id="trade-choice" placeholder="0"></input>
                                </form>
                            </div>  
                            <div id="price-div">
                                <label htmlFor="trade-p" className="main-font" id="trade-price">Price Average</label>
                                <form onSubmit={(e) => sendTrade(e)} className="main-font trade-value">
                                    <span className="pound">{stockCurrency}</span>
                                    <input value={buyValue} onChange={(e) => setBuyValue(e.target.value)} autoComplete="off" className="main-font" inputMode="decimal" type="number" id="trade-p" placeholder="0"></input>
                                </form>
                            </div>
                            <div id="error-div">
                                <p id="error-message" className={errorMessage ? "active main-font": ""}>{tradeError}</p>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    </div>
        </>
        );
    }
export default App;