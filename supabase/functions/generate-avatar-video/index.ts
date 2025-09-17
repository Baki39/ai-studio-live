import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import RunwayML, { TaskFailedError } from 'npm:@runwayml/sdk'

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

    // Runway gen4_turbo only supports duration of 5 or 10 seconds
    const validDuration = duration > 7 ? 10 : 5

    console.log(`Adjusting duration from ${duration} to ${validDuration} for gen4_turbo compatibility`)

    // Initialize Runway client with API key
    const client = new RunwayML({
      apiKey: runwayApiKey,
    })

    // Create image-to-video task using SDK
    const task = await client.imageToVideo
      .create({
        model: 'gen4_turbo',
        promptImage: avatar.image,
        promptText: `Create a realistic avatar video of a ${avatar.gender} person speaking. The person should have natural facial expressions, lip sync with the audio, and professional appearance. Include subtle movements like blinking, head nods, and natural gestures.`,
        ratio: '1280:720',
        duration: validDuration,
      })
      .waitForTaskOutput()

    console.log('Runway video generation result:', task)

    // Return the generated video URL
    const videoUrl = Array.isArray(task.output) ? task.output[0] : task.output?.url || task.output;
    
    return new Response(
      JSON.stringify({ 
        videoUrl: videoUrl,
        duration: duration,
        emotions: emotions,
        movements: movements,
        status: 'completed',
        runway_id: task.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error generating avatar video:', error)
    
    if (error instanceof TaskFailedError) {
      console.error('The video failed to generate:', error.taskDetails)
      return new Response(
        JSON.stringify({ error: 'Video generation failed', details: error.taskDetails }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})