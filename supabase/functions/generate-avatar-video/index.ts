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
    const veo2ApiKey = Deno.env.get('VEO2_API_KEY')

    if (!avatar || !audioUrl) {
      throw new Error('Avatar data and audio are required')
    }

    if (!veo2ApiKey) {
      throw new Error('VEO2_API_KEY is not configured')
    }

    console.log('Generating avatar video with veo2:', {
      gender: avatar.gender,
      duration,
      emotions: emotions?.length || 0,
      movements: movements?.length || 0,
      hasImage: !!avatar.image
    })

    // Prepare veo2 request payload
    const veo2Payload = {
      model: "veo-2",
      prompt: `Create a realistic avatar video of a ${avatar.gender} person speaking. The person should have natural facial expressions, lip sync with the audio, and professional appearance. Duration: ${duration} seconds. Include subtle movements like blinking, head nods, and natural gestures.`,
      audio_url: audioUrl,
      image_url: avatar.image,
      duration: duration,
      aspect_ratio: "16:9",
      quality: "high"
    }

    // Call veo2 API
    const veo2Response = await fetch('https://api.veo2.ai/v1/videos/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${veo2ApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(veo2Payload)
    })

    if (!veo2Response.ok) {
      const errorText = await veo2Response.text()
      console.error('Veo2 API error:', errorText)
      throw new Error(`Veo2 API error: ${veo2Response.status} - ${errorText}`)
    }

    const veo2Result = await veo2Response.json()
    console.log('Veo2 video generation result:', veo2Result)

    // Return the generated video URL
    return new Response(
      JSON.stringify({ 
        videoUrl: veo2Result.video_url || veo2Result.url,
        duration: duration,
        emotions: emotions,
        movements: movements,
        status: 'completed',
        veo2_id: veo2Result.id
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