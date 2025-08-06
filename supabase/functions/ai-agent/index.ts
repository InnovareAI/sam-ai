import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: Message[];
  config: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, config } = await req.json() as RequestBody;
    const startTime = Date.now();
    
    // Get OpenAI API key from environment
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openAiKey) {
      throw new Error("OpenAI API key not configured");
    }
    
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model || "gpt-4-turbo-preview",
        messages: messages,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 2000,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      throw new Error("Failed to get AI response");
    }
    
    const data = await response.json();
    const processingTime = Date.now() - startTime;
    
    // Return the response
    return new Response(
      JSON.stringify({
        content: data.choices[0].message.content,
        metadata: {
          model: data.model,
          tokensUsed: data.usage?.total_tokens || 0,
          processingTime: processingTime,
        },
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    
    // Return fallback response
    return new Response(
      JSON.stringify({
        content: "I apologize, but I'm having trouble processing your request. Please try again in a moment.",
        metadata: {
          model: "fallback",
          tokensUsed: 0,
          processingTime: 0,
        },
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
        status: 200 // Return 200 to avoid client errors
      }
    );
  }
});