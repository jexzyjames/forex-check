import { createContext, useState,useEffect, useContext } from "react";
 const Context = createContext();
export const Config = () => useContext(Context);

const BASE_URL = 'https://api.frankfurter.dev/v2'

export const getData =  async(({children})=> {
    const latestRate = fetch(`${BASE_URL}/latest`)



    return(
        <Context.Provider>
         {children}
        </Context.Provider>
    )
})

