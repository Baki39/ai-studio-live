import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()
    const runwayApiKey = Deno.env.get('RUNWAY_API_KEY')

    if (!runwayApiKey) {
      throw new Error('RUNWAY_API_KEY is not configured')
    }

    if (!prompt) {
      throw new Error('Prompt is required')
    }

    console.log('Generating image with Runway, prompt:', prompt)

    const response = await fetch('https://api.runwayml.com/v1/text_to_image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${runwayApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'runway-ml/runway-ml-img-gen',
        prompt: prompt,
        width: 1024,
        height: 1024,
        guidance_scale: 7,
        num_inference_steps: 25,
        seed: Math.floor(Math.random() * 1000000)
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Runway API error:', errorText)
      throw new Error(`Runway API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Runway image generation successful')

    return new Response(JSON.stringify({ 
      imageUrl: data.image_url || data.url,
      model: 'runway-ml',
      runway_id: data.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in generate-image function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})