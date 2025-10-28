import apper from 'https://cdn.apper.io/actions/apper-actions.js';
import OpenAI from 'npm:openai';

apper.serve(async (req) => {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        success: false,
        message: 'Method not allowed. Please use POST.'
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body = await req.json();
    const { dealName, newStage, dealValue, contactName } = body;

    // Validate required fields
    if (!dealName || !newStage) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing required fields: dealName and newStage are required.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get OpenAI API key from secrets
    const apiKey = await apper.getSecret('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        message: 'OpenAI API key not configured. Please add OPENAI_API_KEY secret.'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // Create stage-specific context for email generation
    const stageContexts = {
      lead: 'initial outreach to introduce our company and explore potential interest',
      qualified: 'follow-up after qualifying the lead to discuss their specific needs',
      proposition: 'formal proposal presentation outlining our solution and value',
      negotiation: 'negotiation phase addressing terms, pricing, and implementation',
      won: 'celebration and onboarding next steps after closing the deal',
      lost: 'professional closure maintaining relationship for future opportunities'
    };

    const stageContext = stageContexts[newStage] || 'general communication regarding the deal';

    // Build prompt for OpenAI
    const prompt = `Generate a professional email template for a sales representative to send regarding a deal at the "${newStage}" stage.

Deal Details:
- Deal Name: ${dealName}
- Current Stage: ${newStage}
- Deal Value: ${dealValue ? `$${dealValue}` : 'Not specified'}
- Contact: ${contactName || 'Valued customer'}

Context: This email is for ${stageContext}.

Requirements:
1. Professional and personalized tone
2. Clear subject line
3. Appropriate for the deal stage
4. Action-oriented with clear next steps
5. Include placeholder for signature
6. Keep concise (200-300 words)

Format the response with:
Subject: [subject line]

[Email body]

Best regards,
[Your Name]`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional sales email writer. Generate clear, effective, and personalized sales emails based on deal stage and context.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    // Extract generated email
    const generatedEmail = completion.choices[0]?.message?.content;

    if (!generatedEmail) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Failed to generate email content from OpenAI.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return successful response
    return new Response(JSON.stringify({
      success: true,
      data: {
        email: generatedEmail,
        stage: newStage,
        dealName: dealName
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // Handle OpenAI API errors
    if (error.status === 401) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid OpenAI API key. Please verify your OPENAI_API_KEY secret.'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (error.status === 429) {
      return new Response(JSON.stringify({
        success: false,
        message: 'OpenAI API rate limit exceeded. Please try again later.'
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle all other errors
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'An unexpected error occurred while generating email.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});