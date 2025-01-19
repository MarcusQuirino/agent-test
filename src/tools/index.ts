import type Anthropic from '@anthropic-ai/sdk';
import { currentTime } from './time';
import { getCurrentWeather } from './weather';

export const toolsMap = new Map<string, (...args: any[]) => any>();
toolsMap.set('get_current_weather', getCurrentWeather);
toolsMap.set('get_current_time', currentTime);

export const tools: Anthropic.Tool[] = [
	{
		name: 'get_current_weather',
		description: 'Get the current weather in a given location',
		input_schema: {
			type: 'object',
			properties: {
				location: {
					type: 'string',
					description: 'The city and state, e.g. San Francisco, CA',
				},
			},
			required: ['location'],
		},
	},
	{
		name: 'get_current_time',
		description: 'Get the current time',
		input_schema: {
			type: 'object',
			properties: {},
			required: [],
		},
	},
];
