import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { concept, links, scriptAvatarCount } = await req.json();

    console.log('Generating script with concept:', concept);

    if (!concept?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Koncept podcasta je obavezan' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API ključ nije konfigurisan' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const prompt = `Kreiraj profesionalni podcast script za ${scriptAvatarCount} avatar(a) na osnovu sljedećeg koncepta:

Koncept: ${concept}

${links && links.filter((link: string) => link.trim()).length > 0 ? `Dodatni resursi i linkovi:\n${links.filter((link: string) => link.trim()).map((link: string) => `- ${link}`).join('\n')}` : ''}

Zahtjevi:
- Script treba biti za ${scriptAvatarCount} avatar(a)
- ${scriptAvatarCount === "1" ? "Format monologa" : "Format dijaloga između avatara"}
- Jasno označi ko govori (Avatar 1, Avatar 2, itd.)
- Profesionalan, ali pristupačan ton
- Dužina: 5-10 minuta govora
- Uključi prirodne tranzicije i interakcije

Odgovori samo sa scriptom, bez dodatnih objašnjenja.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ti si profesionalni podcast script writer. Kreiraj engaging i prirodne scriptove za podcast avatare.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error('Greška pri komunikaciji sa OpenAI API');
    }

    const data = await response.json();
    const script = data.choices[0].message.content;

    console.log('Script generated successfully');

    return new Response(
      JSON.stringify({ script }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-script function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Greška pri generiranju scripta' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});