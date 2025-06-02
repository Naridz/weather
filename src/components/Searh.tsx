"use client"

import React, { useState } from 'react'
import { fetchweatherdata } from '../../utils/fetchweatherdata'
import { WeatherData } from '../../types/weather'
import Image from 'next/image'

const Searh = () => {

    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [error, setError] = useState<string>("")
    const [celSius, setCelSius] = useState(true)
    const [weatherKey, setWeatherKey] = useState(0);
    const [errorKey, setErrorKey] = useState(0)

    const handleSearch = async (formData: FormData)=> {
        const city = formData.get("city") as string
        const {data} = await fetchweatherdata(city);

        if (data){
          setError("")
          setWeather(data);
          setWeatherKey(Date.now());
        }else{
          setWeather(null)
          setError("City not found")
          setErrorKey(Date.now())
        }
  }
  return (
        <div className="w-full max-w-md space-y-4">
        <form action={handleSearch} className="flex">
          <input 
            name="city"
            placeholder="Enter city name..."
            className="w-full rounded-md border px-3 py-2 text-black shadow-lg"/>
            <button type='submit' className="items-center border mx-2 px-4 py-2 hover:bg-zinc-700 hover:text-zinc-100 rounded-md shadow-md">Search</button>
        </form>

        {error && (
          <div key={errorKey} className='text-center text-zinc-300 rounded-md p-3 bg-red-900/50 animate-shakeOnly'>
            {error}
          </div>
        )}

        {weather && weather?.weather?.[0]?.icon && (<>
          <div key={weatherKey} className='bg-zinc-500 rounded-md p-7 text-center animate-fadeIn'>
            <p className='text-2xl inline text-shadow-lg text-white font-bold'>{weather.name}</p>
            <div className='flex mt-2 gap-2 items-center justify-center'>
              <Image 
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
              alt='weather icon'
              width={64}
              height={64}/>
              {celSius == true ? (
                <div className='text-4xl text-shadow-lg font-bold'>{Math.round(weather.main.temp)}°C</div>
              ) : (
                <div className='text-4xl text-shadow-lg font-bold'>{Math.round(weather.main.temp) * 9 / 5 + 32}°H</div>
              )}
            </div>
            <div className='capitalize text-shadow-lg text-gray-300 text-xl'>{weather.weather[0].description}</div>
            <div className='grid grid-cols-3 gap-4 mt-5'>
              <div>
                {celSius == true ? (
                  <p className='font-bold text-2xl text-shadow-lg'>{Math.round(weather.main.feels_like)} °C</p>
                ):(
                  <p className='font-bold text-2xl text-shadow-lg'>{Math.round(weather.main.feels_like) * 9 / 5 + 32} °H</p>
                )}
                <p className='text-xl text-shadow-lg text-gray-300'>Feels like</p>
              </div>
              <div>
                <p className='font-bold text-2xl text-shadow-lg'>{weather.main.humidity}%</p>
                <p className='text-xl text-shadow-lg text-gray-300'>Humidity</p>
              </div>
              <div>
                <p className='font-bold text-2xl text-shadow-lg'>{weather.wind.speed} m/s</p>
                <p className='text-xl text-shadow-lg text-gray-300'>Wind</p>
              </div>
            </div>
          </div>
          <div className='items-center justify-center flex p-1'>
            <button onClick={()=>{setCelSius(true)}} className={`transition-colors duration-300 items-center border mx-2 px-4 py-2 rounded-md shadow-md ${
                celSius ? 'text-zinc-100 bg-zinc-600':'hover:text-zinc-100'}`}>Celsius</button>
            <button onClick={()=>{setCelSius(false)}} className={`items-center border mx-2 px-4 py-2 rounded-md shadow-md ${(celSius == false)?'text-zinc-100 bg-zinc-600':'hover:text-zinc-100'}`}>Fahrenheit</button>
          </div>
        </>
        )}
      </div>
  )
}

export default Searh