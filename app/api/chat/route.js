import { BeanieBot } from '../bot/beanie';
import { getCurrentUser } from '../../../lib/auth';

// Streams the bot's reply as NDJSON — one JSON object per line: { text } chunks
// as the model generates, plus { prefill } / { action } events from tool calls.
export async function POST(request) {
  const { message, history } = await request.json();

  if (!message || typeof message !== 'string') {
    return Response.json({ error: 'Message is required' }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let sentText = false;
      try {
        const user = await getCurrentUser();
        for await (const event of BeanieBot(message, user, Array.isArray(history) ? history : [])) {
          if (event.text) sentText = true;
          controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
        }
      } catch (err) {
        console.error('chat error:', err);
        // Only apologize if nothing readable went out yet — otherwise the partial
        // reply already on screen reads better than swapping in an error.
        if (!sentText) {
          const reply = { text: "Sorry, I couldn't reach Mr. Beanie right now. Please try again." };
          controller.enqueue(encoder.encode(JSON.stringify(reply) + '\n'));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8' },
  });
}
