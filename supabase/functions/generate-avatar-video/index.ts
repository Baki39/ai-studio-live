import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { avatar, audioUrl, duration, emotions, movements } = await req.json()
    const runwayApiKey = Deno.env.get('RUNWAY_API_KEY')

    if (!avatar || !audioUrl) {
      throw new Error('Avatar data and audio are required')
    }

    if (!runwayApiKey) {
      throw new Error('RUNWAY_API_KEY is not configured')
    }

    console.log('Generating avatar video with Runway:', {
      gender: avatar.gender,
      duration,
      emotions: emotions?.length || 0,
      movements: movements?.length || 0,
      hasImage: !!avatar.image
    })

    // Prepare Runway request payload
    const runwayPayload = {
      model: "gen-3a-turbo",
      prompt: `Create a realistic avatar video of a ${avatar.gender} person speaking. The person should have natural facial expressions, lip sync with the audio, and professional appearance. Duration: ${duration} seconds. Include subtle movements like blinking, head nods, and natural gestures.`,
      image: avatar.image,
      audio: audioUrl,
      duration: duration,
      aspect_ratio: "16:9",
      watermark: false
    }

    // Call Runway API
    const runwayResponse = await fetch('https://api.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${runwayApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(runwayPayload)
    })

    if (!runwayResponse.ok) {
      const errorText = await runwayResponse.text()
      console.error('Runway API error:', errorText)
      throw new Error(`Runway API error: ${runwayResponse.status} - ${errorText}`)
    }

    const runwayResult = await runwayResponse.json()
    console.log('Runway video generation result:', runwayResult)

    // Return the generated video URL
    return new Response(
      JSON.stringify({ 
        videoUrl: runwayResult.video_url || runwayResult.url,
        duration: duration,
        emotions: emotions,
        movements: movements,
        status: 'completed',
        runway_id: runwayResult.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error generating avatar video:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})