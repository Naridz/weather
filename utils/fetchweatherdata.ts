"use server"

import { WeatherData } from "../types/weather";

export async function fetchweatherdata (city :string) : Promise<{data?:WeatherData}> {  
    try{
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`);
        const data = await res.json();

        if (!res.ok)
        {
            return {}
        }
        return {data}
    }catch(error){
        console.log(error)
        return {}
    }
}