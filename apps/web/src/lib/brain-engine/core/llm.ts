export async function llmChat(messages: any[]) {
  const api = process.env.DEEPSEEK_BASE_URL!;
  const key = process.env.DEEPSEEK_API_KEY!;
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
  if (!api || !key) throw new Error('DeepSeek env vars missing');

  const body: any = { model, messages, temperature: 0.3 };
  // Si el backend acepta OpenAI JSON mode:
  body.response_format = { type: 'json_object' };

  const r = await fetch(`${api}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`LLM HTTP ${r.status}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? '';
}
