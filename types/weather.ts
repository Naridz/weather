export interface WeatherData {
    name: string,
    sys: {
        country: string,
        sunrise: number,
        sunset: number,
    },
    main: {
        temp: number,
        humidity: number,
        feels_like: number,
        pressure: number,
    },
    weather: Array<{
        id: number,
        main: string,
        description: string,
        icon: string
    }>,
    wind: {
        speed: number,
    },
    visibility: number,
    coord: {
        lat: number,
        lon: number,
    }
}