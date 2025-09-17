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
    const { links, concept, duration } = await req.json();

    console.log('Analyzing links:', links);

    if (!links || links.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nema linkova za analizu' }),
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

    // Extract content from links
    let linkAnalysis = '';
    
    for (const link of links) {
      if (!link.trim()) continue;
      
      try {
        console.log('Fetching link:', link);
        const response = await fetch(link);
        const html = await response.text();
        
        // Extract title and basic content for analysis
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : '';
        
        // For YouTube videos, try to extract video description
        let description = '';
        if (link.includes('youtube.com') || link.includes('youtu.be')) {
          const descMatch = html.match(/"shortDescription":"([^"]+)"/);
          description = descMatch ? descMatch[1].replace(/\\n/g, ' ').substring(0, 500) : '';
        }
        
        linkAnalysis += `Link: ${link}\nNaslov: ${title}\nOpis: ${description}\n\n`;
        
      } catch (error) {
        console.error('Error fetching link:', link, error);
        linkAnalysis += `Link: ${link}\nGreška pri učitavanju sadržaja\n\n`;
      }
    }

    const prompt = `Analiziraj sljedeće linkove i kreiraj poboljšani koncept podcasta:

${linkAnalysis}

Postojeći koncept korisnika: ${concept || 'Nema opisa'}
Trajanje podcasta: ${duration || 'Nije specificiran'}

Zadatak:
1. Analiziraj sadržaj linkova
2. ${concept ? 'Poboljšaj postojeći koncept' : 'Kreiraj novi koncept'} na osnovu analize
3. Predloži glavne teme za razgovor
4. Sugeriši stil i ton podcasta
5. Preporuči ključne tačke za diskusiju

Odgovori u JSON formatu:
{
  "enhancedConcept": "poboljšani/novi koncept",
  "mainTopics": ["tema1", "tema2", "tema3"],
  "style": "stil podcasta",
  "keyPoints": ["ključna tačka 1", "ključna tačka 2"],
  "suggestedApproach": "preporučeni pristup"
}`;

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
            content: 'Ti si expert za analizu sadržaja i kreiranje podcast koncepata. Analiziraj linkove i kreiraj detaljne preporuke.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error('Greška pri komunikaciji sa OpenAI API');
    }

    const data = await response.json();
    const analysisResult = data.choices[0].message.content;

    console.log('Link analysis completed');

    // Try to parse JSON response
    let parsedResult;
    try {
      parsedResult = JSON.parse(analysisResult);
    } catch (error) {
      // If JSON parsing fails, return raw text
      parsedResult = {
        enhancedConcept: analysisResult,
        mainTopics: [],
        style: '',
        keyPoints: [],
        suggestedApproach: ''
      };
    }

    return new Response(
      JSON.stringify({ 
        analysis: parsedResult,
        originalLinks: links 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-links function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Greška pri analizi linkova' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});