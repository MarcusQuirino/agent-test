export async function currentTime() {
	const date = new Date();
	return date.toLocaleString('pt-BR', {
		timeZone: 'America/Sao_Paulo',
		dateStyle: 'short',
		timeStyle: 'medium',
	});
}
