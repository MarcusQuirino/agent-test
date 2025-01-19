import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
	apiKey: Bun.env.ANTHROPIC_API_KEY,
});

export default anthropic;
