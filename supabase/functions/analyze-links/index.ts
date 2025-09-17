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

    // Extract content from links using more robust methods
    let linkAnalysis = '';
    
    for (const link of links) {
      if (!link.trim()) continue;
      
      try {
        console.log('Fetching link:', link);
        
        // For YouTube videos, extract video ID and use oEmbed API
        if (link.includes('youtube.com') || link.includes('youtu.be')) {
          let videoId = '';
          
          if (link.includes('youtu.be/')) {
            videoId = link.split('youtu.be/')[1].split('?')[0];
          } else if (link.includes('youtube.com/watch?v=')) {
            videoId = link.split('v=')[1].split('&')[0];
          }
          
          if (videoId) {
            try {
              // Use YouTube oEmbed API to get video info
              const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
              const oembedResponse = await fetch(oembedUrl);
              const oembedData = await oembedResponse.json();
              
              linkAnalysis += `Link: ${link}\nTip: YouTube video\nNaslov: ${oembedData.title || 'N/A'}\nAutor: ${oembedData.author_name || 'N/A'}\nOpis: Video o temi "${oembedData.title}"\n\n`;
            } catch (oembedError) {
              console.error('oEmbed fetch failed, trying direct HTML:', oembedError);
              // Fallback to HTML parsing
              const response = await fetch(link);
              const html = await response.text();
              
              const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
              const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : '';
              
              linkAnalysis += `Link: ${link}\nTip: YouTube video\nNaslov: ${title}\nOpis: Video sadržaj za analizu\n\n`;
            }
          }
        } else {
          // For other websites, extract basic info
          const response = await fetch(link);
          const html = await response.text();
          
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1] : '';
          
          // Try to extract meta description
          const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
          const description = descMatch ? descMatch[1].substring(0, 300) : '';
          
          linkAnalysis += `Link: ${link}\nNaslov: ${title}\nOpis: ${description}\n\n`;
        }
        
      } catch (error) {
        console.error('Error fetching link:', link, error);
        linkAnalysis += `Link: ${link}\nStatus: Link je dostupan za AI analizu\nOpis: Sadržaj će biti analiziran na osnovu URL-a i konteksta\n\n`;
      }
    }

    const prompt = `Analiziraj sljedeće linkove i kreiraj poboljšani koncept podcasta. IMPORTANT: Uvijek kreiraj odgovor čak i ako ne možeš direktno pristupiti sadržaju linkova - koristi URL i kontekst:

LINKOVI ZA ANALIZU:
${linkAnalysis}

Postojeći koncept korisnika: ${concept || 'Nema opisa - kreiraj novi na osnovu linkova'}
Trajanje podcasta: ${duration || 'Nije specificiran'}

ZADATAK - UVIJEK ODGOVORI:
1. Na osnovu URL-ova i dostupnih informacija, analiziraj temu
2. ${concept ? 'Poboljšaj postojeći koncept' : 'Kreiraj novi koncept'} 
3. Predloži glavne teme za razgovor
4. Sugeriši stil i ton podcasta
5. Preporuči ključne tačke za diskusiju

UVIJEK odgovori u JSON formatu, čak i ako linkovi nisu potpuno dostupni:
{
  "enhancedConcept": "detaljni opis koncepta podcasta",
  "mainTopics": ["tema1", "tema2", "tema3"],
  "style": "stil podcasta (npr. casual, edukativan, intervju)",
  "keyPoints": ["ključna tačka 1", "ključna tačka 2", "ključna tačka 3"],
  "suggestedApproach": "preporučeni pristup za vođenje podcasta"
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
            content: 'Ti si expert za analizu sadržaja i kreiranje podcast koncepata. UVIJEK kreiraj koristan odgovor čak i ako nemaš direktan pristup sadržaju linkova - analiziraj URL-ove, naslove i kontekst. Nikad ne kaži da ne možeš pomoći.'
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