import type Anthropic from '@anthropic-ai/sdk';
import inquirer from 'inquirer';
import anthropic from './src/anthropic';
import { handleMessage } from './src/lib/message';
import { tools } from './src/tools';

async function main() {
	const { userInput } = await inquirer.prompt([
		{
			type: 'input',
			name: 'userInput',
			message: 'What would you like to ask Claude?',
		},
	]);

	const userMessage: Anthropic.MessageParam = {
		role: 'user',
		content: userInput,
	};

	const messages: Anthropic.Messages.MessageParam[] = [userMessage];

	const message = await anthropic.messages.create({
		model: 'claude-3-5-sonnet-latest',
		max_tokens: 1024,
		tools,
		messages,
	});

	await handleMessage({ message, messages });
}

main();
