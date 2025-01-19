import type Anthropic from '@anthropic-ai/sdk';
import inquirer from 'inquirer';
import anthropic from '../anthropic';
import { tools, toolsMap } from '../tools';

export async function handleMessage({
	message,
	messages,
}: {
	message: Anthropic.Messages.Message & {
		_request_id?: string | null;
	};
	messages: Anthropic.MessageParam[];
}) {
	messages.push({
		role: message.role,
		content: message.content,
	});

	const stopReason = message.stop_reason;

	if (stopReason === 'end_turn') {
		console.log('End turn');
		await handleResponse(messages);
	}

	if (stopReason === 'max_tokens') {
		console.log('Max tokens');
		console.log(
			`token limit exceeded. input_tokens: ${message.usage.input_tokens} output_tokens: ${message.usage.output_tokens}`,
		);
		return;
	}

	if (stopReason === 'tool_use') {
		console.log('Tool use');
		const { content } = message;
		const toolBlock = content.find((block) => block.type === 'tool_use')!;

		handleToolUse(toolBlock, messages);
	}
}

async function handleResponse(messages: Anthropic.MessageParam[]) {
	console.log('Claude: ', messages[messages.length - 1].content[0].text);
	const { userInput } = await inquirer.prompt([
		{
			type: 'input',
			name: 'userInput',
			message: 'user:',
		},
	]);

	messages.push({
		role: 'user',
		content: userInput,
	});

	const msg = await anthropic.messages.create({
		model: 'claude-3-5-sonnet-latest',
		max_tokens: 1024,
		tools,
		messages,
	});

	await handleMessage({ message: msg, messages });
}

async function handleToolUse(
	toolBlock: Anthropic.Messages.ToolUseBlock,
	messages: Anthropic.MessageParam[],
) {
	const tool = toolBlock;
	if (!toolsMap.has(tool.name)) {
		console.error(`Tool ${tool.name} not found`);
		return;
	}

	console.log(`claude wants to use ${tool.name}`);
	const toolFunction = toolsMap.get(tool.name)!;

	try {
		const toolResult = await toolFunction(tool.input);
		console.log('toolResult', toolResult);
		messages.push({
			role: 'user',
			content: [
				{
					type: 'tool_result',
					tool_use_id: tool.id,
					content: JSON.stringify(toolResult),
				},
			],
		});

		const msg = await anthropic.messages.create({
			model: 'claude-3-5-sonnet-latest',
			max_tokens: 1024,
			tools,
			messages,
		});

		console.log('msg', msg);

		await handleMessage({ message: msg, messages });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error';
		console.error('Error calling tool', error);
		messages.push({
			role: 'user',
			content: [
				{
					type: 'tool_result',
					tool_use_id: tool.id,
					content: JSON.stringify(errorMessage),
				},
			],
		});
		const msg = await anthropic.messages.create({
			model: 'claude-3-5-sonnet-latest',
			max_tokens: 1024,
			tools,
			messages,
		});
		console.log('msg', msg);
	}
}
