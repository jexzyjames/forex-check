import React,{useEffect,useState} from 'react'
import logo from '../images/logo.svg'
import star from '../images/icon-star.svg'
import down from '../images/icon-chevron-down.svg'
const Navbar = () => {
    // const [data, setData] = React.useState(null);
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
    <>
    <div className='md:flex md:justify-between grid grid-cols-2  items-center p-4 bg-[#171719] text-white'>
      <img className='w-30' src={logo} alt="Logo" />
      <div className='md:text-xl text-sm flex gap-2'>
        <div className=' text-[10px] md:text-xl text-[#9D9D9D] tracking-[2px]  font-mono  md:mx-2 cursor-pointer'>55 CURRENCIES</div>
        <div className=' text-[10px] md:text-xl text-[#9D9D9D] tracking-[2px]  font-mono  md:mx-2 cursor-pointer'>EDD</div>
        <div className=' text-[10px] md:text-xl text-[#9D9D9D] tracking-[2px] font-mono   md:mx-2 cursor-pointer'>ECB DATA</div>
      </div>
         
    </div>
    <div className='lg:flex hidden gap-1 items-center p-0 m-0 bg-[#2E2E2E]  '>
            <div className="bg-[#CEF759] w-40 flex p-2 font-bold gap-2 text-slate-950 font-mono  rounded-[3px] "> <img className="" src={star} alt="" /> 
            LIVE MARKETS</div>
            <div className='text-red-400 font-mono tracking-[2px]'>-0.14%</div>
            <div className='flex tracking-[2px] items-center justify-center text-white gap-3 border-r-3 px-2  bg-gray=300  '>
              <h1 className='text-white opacity-60 font-mono '>{currencyList[0]}/{currencyList[2]}</h1>
              <p className='text-center font-bold flex justify-center items-center font-mono  '>157.91</p>
              <span className='text-lime-500 flex gap-2 items-center justify-center'>
                <img className='bg-lime-500' src={down}  alt="" /> +0.04%
              </span>
            </div>

              <div className='flex tracking-[2px] items-center justify-center text-white gap-3 border-r-3 px-2  bg-gray=300  '>
              <h1 className='text-white opacity-60 font-mono '>{currencyList[0]}/{currencyList[2]}</h1>
              <p className='text-center font-bold flex justify-center items-center font-mono  '>157.91</p>
              <span className='text-lime-500 flex gap-2 items-center justify-center'>
                <img className='bg-lime-500' src={down}  alt="" /> +0.04%
              </span>
            </div>

              <div className='flex tracking-[2px] items-center justify-center text-white gap-3 border-r-3 px-2  bg-gray=300  '>
              <h1 className='text-white opacity-60 font-mono '>{currencyList[3]}/{currencyList[5]}</h1>
              <p className='text-center font-bold flex justify-center items-center font-mono  '>157.91</p>
              <span className='text-lime-500 flex gap-2 items-center justify-center'>
                <img className='bg-lime-500' src={down}  alt="" /> +0.04%
              </span>
            </div>

              <div className='flex tracking-[2px] items-center justify-center text-white gap-3 border-r-3 px-2  bg-gray=300  '>
              <h1 className='text-white opacity-60 font-mono '>{currencyList[2]}/{currencyList[4]}</h1>
              <p className='text-center font-bold flex justify-center items-center font-mono  '>157.91</p>
              <span className='text-lime-500 flex gap-2 items-center justify-center'>
                <img className='bg-lime-500' src={down}  alt="" /> +0.04%
              </span>
            </div>

              <div className='flex tracking-[2px] items-center justify-center text-white gap-3 px-2  bg-gray=300  '>
              <h1 className='text-white opacity-60 font-mono '>{currencyList[1]}/{currencyList[3]}</h1>
              <p className='text-center font-bold flex justify-center items-center font-mono  '>157.91</p>
              <span className='text-lime-500 flex gap-2 items-center justify-center'>
                <img className='bg-lime-500' src={down}  alt="" /> +0.04%
              </span>
            </div>

            
        </div>
    </>
  )
}

export default Navbar