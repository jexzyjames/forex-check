import React, { useState, useEffect } from "react";
import btn from "../images/icon-exchange.svg";
import star from "../images/icon-star.svg"; 
import del from  "../images/icon-delete-filled.svg";
import starred from "../images/icon-star-filled.svg";
import down from "../images/icon-chevron-down.svg";
import { useCurrencyStore } from "../../config";
 const Markets = () => {
    const [active, setActive] = useState('History')

    const [selected, setSelected] = useState('History')
    const [amount, setAmount] = useState(1000)
    const [favorite,setFavorite] = useState(0)
    const [fromCurrency,setFromCurrency] = useState('USD')
    const [toCurrency,setToCurrency] = useState('EUR')
    const [open, setOPen] = useState(false) 
    const selectActive = ['History', 'Compare', 'Favorites', 'Log']

    const {latestRate, fetchLatestRate, isLoading} = useCurrencyStore()
    const[convertedRate, setConvertedRate] = useState(0)
    const[loading, setisLoading] = useState(isLoading)
useEffect(()=>{
  fetchLatestRate()
},[])
    // console.log(latestRate)
    function convert(base, quote, amount) {
  const api = "https://api.frankfurter.dev";
  return fetch(`${api}/v2/rate/${base}/${quote}`)
    .then((r) => r.json())
    .then((d) => (amount * d.rate).toFixed(2));
}


  useEffect(() => {
      convert(fromCurrency,toCurrency,amount).then((r) =>setConvertedRate(r))
  }, [fromCurrency,toCurrency,favorite,amount,convertedRate]);

  const currencyList = [
    "USD",
    "EUR",
    "GBP",
    "NGN",
    "JPY",
    "AUD",
    "CAD",
    "CHF",
    "CNY",
  ];
  return (
    <div className="  py-4 md:px-[8%] px-3 overflow-x-hidden text-white">
       
      <h1 className="font-mono text-md lg:text-2xl tracking-[2px]">
        CHECK THE RATE
      </h1>

      <div className=" rounded-xl mt-7 font-mono    tracking-[2px]  px-3 py-7  bg-[#202022] ">
      <div className="flex  justify-between items-center flex-col  lg:flex-row py-4   gap-4">
        <div className=" bg-[#2E2E2E] relative   border-0 outline-0  p-2 rounded-xl ">
          <p className="opacity-60">SEND</p>
          <div className="flex md:flex-row  relative px-3 py-4 w-full m-0 items-center gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e)=> setAmount(e.target.value)}
              className="text-white sm:w-100 w-full font-bold text-4xl"
              placeholder={amount}
            />

            <div className="flex gap-2 px-5 md:px-5 bg-stone-600 opacity-50 text-white rounded-xl relative">

            <select 
                  value={fromCurrency}
                  onChange={(e)=> setFromCurrency(e.target.value)}
             className="opacity-100 outline-0 relative  rounded-sm p-2 cursor-pointer text-white font-bold text-xl">
              {currencyList.map((currency) => (
                <option
                  className="bg-[#3D3D3D]! cursor-pointer! outline-none rounded-sm! text-white"
                  key={currency}
                

                >
                  {currency}
                </option>
              ))}
            </select>
              <img src={down} alt="icon-down" />
          </div>

            </div>
        </div>

        <div>
          <img
            src={btn}
            alt="exchange"
            onClick={()=> {
                setFromCurrency(toCurrency)
                setToCurrency(fromCurrency)
                // setReceive(send)
                // setSend(receive)
            }}
            className="bg-[#3D3D3D] p-2 rotate-90 hover:bg-gray-800 lg:rotate-none lg:w-10  rounded-md cursor-pointer"
          />
        </div>

        <div className=" bg-[#2E2E2E]  shadow-md  relative h-auto p-2 rounded-xl ">
          <p className="font-mono px-2 opacity-40 tracking-[2px] ">RECEIVE</p>
          <div className="flex relative   p-3 items-center gap-2">
            <input
              type="number"
              value={convertedRate}
              readOnly
              className="text-[#CEF739] sm:w-100 w-full    placeholder:font-extrabold text-xl;  b-0 outline-0  font-bold text-4xl"
              placeholder={convertedRate}
            />
            <div className="flex gap-2 px-5  bg-stone-600 opacity-50 text-white rounded-xl relativ">
           {convertedRate}
            <select 
               value={toCurrency}
                  onChange={(e)=> setToCurrency(e.target.value)}
            className=" outline-0   rounded-sm p-2 cursor-pointer text-white font-bold text-xl">
              {currencyList.map((currency) => (
                <option
                  className="bg-[#3D3D3D]! cursoor-pointer outline-none rounded-sm! text-white"
                  key={currency}
                
                >
                  {currency}
                </option>
              ))}
            </select>
              <img src={down} alt="icon-down" />

            </div>
          </div>
        </div>


      </div>

      <div className="grid md:grid-cols-2 w-full gap-4 px-4 md:gap-1  justiify-between ">

      <div className="flex items-center justify-center md:justify-start ">
        <h3 className="text-xl opacity-50 font-mono ">
          {" "}
          {amount} {fromCurrency} = {convertedRate} {toCurrency}
        </h3>
      </div>
      <div onClick={()=>  {
        if(amount === 0 && convertedRate === 0){
            // alert(send+receive)
            setFavorite(0)
        }
        else{
            setFavorite((prev)=> prev +1)
        }
        

      }
      } className="flex md:justify-end justify-between items-center mx-auto md:mx-0 md:items-end text-white gap-4 ">
        <button className="border flex gap-2  p-2 rounded-md cursor-pointer font-mono text-sm hover:bg-[#CEF739]  hover:text-slate-950 font-bold tracking-[1px] outline-0 border-[#CEF730]" >
            
         <img className=" bg-slate-800! p-0 m-0 border-0 outline-transparent!" src={star} alt="star-icon" />
            FAVORITED
        </button>
        <button className="border p-2 rounded-md cursor-pointer font-mono text-sm hover:bg-[#CEF739] hover:text-slate-950 font-bold tracking-[1px] outline-0 border-[#CEF730]" >LOG CONVERSION</button>
      </div>

      </div>
      </div>

      <div className="md:flex my-5 hidden md:gap-2">
        <div className="font-mono mx-3">
            <p onClick={()=>{
                setActive('History')
            }} className="mx-2 md:mx-3 cursor-pointer md:text-xl ">HISTORY</p>
            <span className={`${active === 'History' && 'bg-lime-400 w-21 md:w-25 h-0.5 rounded-xl block'}`}></span>
        </div>

    
       

        <div className="font-mono mx-3">
            <p  onClick={()=>{
                setActive('Compare')
            }}className="mx-2 md:mx-3 cursor-pointer md:text-xl ">COMPARE</p>
            <span  className={`${active === 'Compare' && 'bg-lime-400 w-21 md:w-25 h-0.5 rounded-xl block'}`}></span>
        </div>
        
        <div className="font-mono mx-3">
            <p onClick={()=>{
                setActive('Favorites')
            }} className="mx-2 cursor-pointer flex text-center items-center font-bold gap-2 md:mx-2 md:text-xl ">FAVORITES 
            <span className="rounded-full h-4 w-4 text-[12px] text-white  bg-lime-700">{favorite}</span> 
            
            </p>
            <span   className={`${active === 'Favorites' && 'bg-lime-400 w-21 md:w-27 h-0.5 rounded-xl block'}`}></span>
        </div>
       

        <div className="font-mono mx-3">
             <p onClick={()=>{
                setActive('Log')
            }} className="mx-2 cursor-pointer flex text-center items-center font-bold gap-2 md:mx-2 md:text-xl ">LOG 
            <span className="rounded-full h-4 w-4 text-[12px] text-white  bg-lime-700">0</span>
            
            </p>
            <span className={`${active === 'Log' && 'bg-lime-400 w-21 md:w-25 h-0.5 rounded-xl block'}`}></span>
        </div>
       

      </div>
        


        <div className="relative  md:hidden  ">
            <div  onClick={()=> {
                 setOPen(!open)
                 

            }  
           } className="border-0 shadow-md flex rounded-lg relative bg-[#2E2E2E] opacity-100 h-auto justify-between p-2 cursor-pointer outline-0">   
                {selected}
                <img className="w-5 md:w-7 cursor-pointer "  onClick={()=>  setOPen(!open)} src={down} alt="icon-down" />
            </div>

            {open && (
                <div className="absolute w-full z-122 rounded-lg  border-0 outline-0 bg-[#2E2E2E]">

                    {selectActive.map(activeTab => 
                        (
                            <div onClick={()=> {

                                setSelected(activeTab)
                                setActive(activeTab)
                                setOPen(!open)
                            } 
                            } key={activeTab} className="p-2 text-slate-50 w-full h-auto hover:bg-[#202022] cursor-pointer">
                                {activeTab}
                            </div>
                        )
                    )}
                </div>
             )}
        </div>


            { active === 'History' && (
                <div className=" lg:flex   justify-between mx-auto gap-40  items-center    ">

               
               <div className="lg:grid-cols-4 items-center justify-center grid lg:w-[70%] mx-auto sm:grid grid-cols-2 gap-4">

                <div className="rounded-xl p-2  bg-[#2E2E2E]  ">
                    <p  className="font-mono opacity-60 tracking-[1px]">OPEN</p>
                    <h1 className=" font-mono text-2xl">0.8420</h1>
                </div>

                  <div className="rounded-xl p-2 bg-[#2E2E2E] ">
                    <p  className="font-mono opacity-60 tracking-[1px]">LAST</p>
                    <h1 className=" font-mono text-2xl">0.835</h1>
                </div>

                  <div className="rounded-xl p-2 bg-[#2E2E2E] ">
                    <p  className="font-mono opacity-60 tracking-[1px]">CHANGE</p>
                    <h1 className=" text-lime-500 font-mono text-2xl">+0.0014</h1>
                </div>

                  <div className="rounded-xl p-2 bg-[#2E2E2E] ">
                    <p  className="font-mono opacity-60 tracking-[1px]">% CHANGE</p>
                    <h1 className=" text-lime-500 font-mono flex gap-2 items-center text-2xl"> <img className="rotate-180 w-6 " src={down} alt="" /> +0.16%</h1>
                </div>
               </div>

            <div className=" flex lg:w-[30%] my-6 lg:justify-end lg:items-center mx-0 font-mono opacity-50 ">
                <div className=" flex  lg:justify-between lg:w-full  px-7   gap-4 rounded-lg bg-[#2E2E2E] " >

                <div className="hover:bg-gray-400 cursor-pointer p-2 m-0 rounded-md">1D</div>
                <div className="hover:bg-gray-400 cursor-pointer p-2 m-0 rounded-md">1W</div>
                <div className="hover:bg-gray-400 cursor-pointer p-2 m-0 rounded-md">1M</div>
                <div className="hover:bg-gray-400 cursor-pointer p-2 m-0 rounded-md">3M</div>
                <div className="hover:bg-gray-400 cursor-pointer p-2 m-0 rounded-md">1Y</div>
                <div className="hover:bg-gray-400 cursor-pointer p-2 m-0 rounded-md">5Y</div>
                </div>

            </div>
                </div>
        )}

        {active === 'Favorites' && favorite > 0 && (
            <div>
                <div className="bg-[#2E2E2E] w-[150px] text-white font-mono rounded-lg p-2  flex items-center justfy-between ">

                    {Object.entries((fav)=>{
                                          <h1>{amount} {fromCurrency}</h1>
                    })}
                    <div>
                    <h1>{amount} {fromCurrency}</h1>
                    <h1 className="text-lime-500">{convertedRate} {toCurrency}</h1>
                    </div>
                    <img onClick={()=> setFavorite((prev) => prev - 1)} className="w-5 cursor-pointer mx-auto" src={del} alt="" />
                </div>
            </div>
        )}



      
    </div>
  );
};

export default Markets;
