"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { fetchweatherdata, fetchweatherbycoords } from '../../utils/fetchweatherdata'
import { WeatherData } from '../../types/weather'
import Image from 'next/image'

const Search = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [error, setError] = useState<string>("")
    const [celSius, setCelSius] = useState(true)
    const [weatherKey, setWeatherKey] = useState(0);
    const [errorKey, setErrorKey] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const [showRecent, setShowRecent] = useState(false)
    const [isLocating, setIsLocating] = useState(false)

    // Load recent searches and default city on mount
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches')
        if (saved) {
            setRecentSearches(JSON.parse(saved))
        }
        // Load default city
        loadCity('Bangkok')
    }, [])

    // Save recent searches
    const saveRecentSearch = useCallback((city: string) => {
        if (!city.trim()) return
        setRecentSearches(prev => {
            const filtered = prev.filter(c => c.toLowerCase() !== city.toLowerCase())
            const newRecent = [city, ...filtered].slice(0, 3)
            localStorage.setItem('recentSearches', JSON.stringify(newRecent))
            return newRecent
        })
    }, [])

    const loadCity = async (city: string) => {
        setIsLoading(true)
        setError("")
        const { data } = await fetchweatherdata(city)
        setIsLoading(false)

        if (data) {
            setWeather(data)
            setWeatherKey(Date.now())
            saveRecentSearch(data.name)
        } else {
            setWeather(null)
            setError("City not found")
            setErrorKey(Date.now())
        }
    }

    const handleSearch = async (formData: FormData) => {
        const city = formData.get("city") as string
        if (!city.trim()) return
        
        setSearchValue(city)
        await loadCity(city)
        setShowRecent(false)
    }

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported")
            setErrorKey(Date.now())
            return
        }

        setIsLocating(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                setIsLoading(true)
                const { data } = await fetchweatherbycoords(latitude, longitude)
                setIsLoading(false)
                setIsLocating(false)

                if (data) {
                    setWeather(data)
                    setWeatherKey(Date.now())
                    setSearchValue(data.name)
                    saveRecentSearch(data.name)
                    setError("")
                } else {
                    setError("Could not get weather for your location")
                    setErrorKey(Date.now())
                }
            },
            () => {
                setIsLocating(false)
                setError("Could not access your location")
                setErrorKey(Date.now())
            }
        )
    }

    const clearSearch = () => {
        setSearchValue("")
        setShowRecent(false)
    }

    const selectRecent = (city: string) => {
        setSearchValue(city)
        loadCity(city)
        setShowRecent(false)
    }

    const getWeatherGradient = (weatherId?: number) => {
        if (!weatherId) return 'from-blue-500/20 via-purple-500/20 to-pink-500/20'
        if (weatherId >= 200 && weatherId < 300) return 'from-gray-600/30 via-purple-600/30 to-blue-600/30'
        if (weatherId >= 300 && weatherId < 500) return 'from-blue-400/30 via-cyan-400/30 to-teal-400/30'
        if (weatherId >= 500 && weatherId < 600) return 'from-blue-500/30 via-indigo-500/30 to-gray-500/30'
        if (weatherId >= 600 && weatherId < 700) return 'from-white/20 via-blue-100/20 to-cyan-200/20'
        if (weatherId >= 700 && weatherId < 800) return 'from-gray-400/30 via-orange-300/20 to-yellow-200/20'
        if (weatherId === 800) return 'from-blue-400/30 via-cyan-300/20 to-yellow-200/20'
        return 'from-blue-400/20 via-purple-400/20 to-pink-300/20'
    }

    const formatTime = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })
    }

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8 animate-slideUp">
                <h1 className="text-4xl font-bold gradient-text mb-2">Weather</h1>
                <p className="text-white/60 text-sm">Check the weather anywhere</p>
            </div>

            {/* Search Form */}
            <form action={handleSearch} className="flex gap-2 mb-2 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                <div className="relative flex-1">
                    <input 
                        name="city"
                        value={searchValue}
                        onChange={(e) => {
                            setSearchValue(e.target.value)
                            setShowRecent(e.target.value === '' && recentSearches.length > 0)
                        }}
                        onFocus={() => searchValue === '' && recentSearches.length > 0 && setShowRecent(true)}
                        placeholder="Enter city name..."
                        className="w-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-5 py-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 shadow-lg pr-12"
                        autoComplete="off"
                    />
                    {searchValue && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-white/60 hover:bg-white/30 hover:text-white transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    {!searchValue && (
                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>
                <button 
                    type='submit' 
                    disabled={isLoading}
                    className="px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-glow"
                >
                    {isLoading ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    )}
                </button>
            </form>

            {/* Location Button */}
            <div className="flex justify-center mb-4 animate-slideUp" style={{ animationDelay: '0.15s' }}>
                <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 text-sm"
                >
                    {isLocating ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Locating...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Use my location</span>
                        </>
                    )}
                </button>
            </div>

            {/* Recent Searches */}
            {showRecent && recentSearches.length > 0 && (
                <div className="mb-4 glass rounded-2xl p-2 animate-fadeIn">
                    <p className="text-white/40 text-xs uppercase tracking-wider px-3 py-2">Recent searches</p>
                    {recentSearches.map((city, index) => (
                        <button
                            key={city}
                            type="button"
                            onClick={() => selectRecent(city)}
                            className="w-full text-left px-3 py-2 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center gap-2"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {city}
                        </button>
                    ))}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div key={errorKey} className='mb-6 animate-shakeOnly'>
                    <div className='flex items-center gap-3 p-4 rounded-2xl bg-red-500/20 backdrop-blur-md border border-red-400/30 text-red-200'>
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Weather Card */}
            {weather && weather?.weather?.[0]?.icon && (
                <div key={weatherKey} className='animate-fadeIn'>
                    <div className={`glass-card rounded-3xl p-8 text-center bg-gradient-to-br ${getWeatherGradient(weather.weather[0].id)}`}>
                        {/* City Name */}
                        <div className='flex items-center justify-center gap-2 mb-2'>
                            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className='text-2xl text-white font-bold tracking-wide'>{weather.name}</p>
                            <span className="text-white/50 text-sm">{weather.sys?.country}</span>
                        </div>
                        
                        {/* Weather Icon & Temperature */}
                        <div className='flex flex-col items-center justify-center mb-6'>
                            <div className='relative w-28 h-28'>
                                <Image 
                                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} 
                                    alt='weather icon'
                                    fill
                                    className='object-contain drop-shadow-2xl'
                                />
                            </div>
                            <div className='text-6xl font-bold text-white tracking-tight drop-shadow-lg'>
                                {celSius ? Math.round(weather.main.temp) : Math.round(weather.main.temp * 9 / 5 + 32)}°
                            </div>
                            <div className='text-white/80 text-lg capitalize mt-2 font-medium'>
                                {weather.weather[0].description}
                            </div>
                        </div>

                        {/* Main Stats Grid */}
                        <div className='grid grid-cols-3 gap-3 mb-4'>
                            <div className='glass rounded-2xl p-3 hover-lift'>
                                <svg className="w-5 h-5 mx-auto mb-1 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <p className='font-bold text-lg text-white'>
                                    {celSius ? Math.round(weather.main.feels_like) : Math.round(weather.main.feels_like * 9 / 5 + 32)}°
                                </p>
                                <p className='text-xs text-white/60'>Feels like</p>
                            </div>
                            <div className='glass rounded-2xl p-3 hover-lift'>
                                <svg className="w-5 h-5 mx-auto mb-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                                <p className='font-bold text-lg text-white'>{weather.main.humidity}%</p>
                                <p className='text-xs text-white/60'>Humidity</p>
                            </div>
                            <div className='glass rounded-2xl p-3 hover-lift'>
                                <svg className="w-5 h-5 mx-auto mb-1 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className='font-bold text-lg text-white'>{weather.wind.speed}</p>
                                <p className='text-xs text-white/60'>m/s</p>
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="glass rounded-2xl p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-white/50">Pressure</p>
                                        <p className="text-sm font-semibold text-white">{weather.main.pressure} hPa</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-white/50">Visibility</p>
                                        <p className="text-sm font-semibold text-white">{(weather.visibility / 1000).toFixed(1)} km</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-white/50">Sunrise</p>
                                        <p className="text-sm font-semibold text-white">{weather.sys?.sunrise ? formatTime(weather.sys.sunrise) : '--:--'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-white/50">Sunset</p>
                                        <p className="text-sm font-semibold text-white">{weather.sys?.sunset ? formatTime(weather.sys.sunset) : '--:--'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Unit Toggle */}
                    <div className='flex items-center justify-center gap-3 mt-6'>
                        <button 
                            onClick={() => setCelSius(true)} 
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                celSius 
                                    ? 'bg-white text-purple-600 shadow-lg shadow-white/25' 
                                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                            }`}
                        >
                            °C
                        </button>
                        <button 
                            onClick={() => setCelSius(false)} 
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                !celSius 
                                    ? 'bg-white text-purple-600 shadow-lg shadow-white/25' 
                                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                            }`}
                        >
                            °F
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Search