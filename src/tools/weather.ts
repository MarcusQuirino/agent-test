export async function getCurrentWeather(location: string) {
	return {
		value: Math.floor(Math.random() * 100),
		unit: 'fahrenheit',
	};
}
