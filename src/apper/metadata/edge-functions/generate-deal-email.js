import apper from 'https://cdn.apper.io/actions/apper-actions.js';

apper.serve(async (req) => {
  try {
    // ✅ Only allow POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        success: false,
        message: 'Method not allowed. Please use POST.'
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ✅ Parse request body
    const body = await req.json();
    const { dealName, newStage, dealValue, contactName } = body;

    // ✅ Validate inputs
    if (!dealName || !newStage) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing required fields: dealName and newStage are required.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ✅ Get secret API key
const apiKey = await apper.getSecret('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Gemini API key not configured. Please add GEMINI_API_KEY secret.'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ✅ Stage-specific context
    const stageContexts = {
      lead: 'initial outreach to introduce our company and explore potential interest',
      qualified: 'follow-up after qualifying the lead to discuss their specific needs',
      proposition: 'formal proposal presentation outlining our solution and value',
      negotiation: 'negotiation phase addressing terms, pricing, and implementation',
      won: 'celebration and onboarding next steps after closing the deal',
      lost: 'professional closure maintaining relationship for future opportunities'
    };

    const stageContext = stageContexts[newStage] || 'general communication regarding the deal';

    // ✅ Build the prompt
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

// ✅ Call Gemini REST API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a professional sales email writer. Generate clear, effective, and personalized sales emails based on deal stage and context.\n\n${prompt}`
          }]
        }]
      })
    });

if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({
        success: false,
        message: `Gemini API error: ${errorText}`
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

const data = await response.json();
    const generatedEmail = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedEmail) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Failed to generate email content from Gemini.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ✅ Return success response
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
    // ✅ Handle known API issues
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'Unexpected error occurred while generating email.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});