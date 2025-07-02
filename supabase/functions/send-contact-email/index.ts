import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { freelancerEmail, freelancerName, contractorData } = await req.json();

    const emailResponse = await resend.emails.send({
      from: "FreelanceHub <onboarding@resend.dev>",
      to: [freelancerEmail],
      subject: "Nova solicitação de contato - FreelanceHub",
      html: `
        <h2>Olá ${freelancerName}!</h2>
        <p>Você recebeu uma nova solicitação de contato através do FreelanceHub:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Dados do Contratante:</h3>
          <p><strong>Nome:</strong> ${contractorData.contractorName}</p>
          <p><strong>Email:</strong> ${contractorData.email}</p>
          <p><strong>Telefone:</strong> ${contractorData.phone}</p>
          <p><strong>Endereço de trabalho:</strong> ${contractorData.workAddress}</p>
          <p><strong>Valor oferecido:</strong> R$ ${contractorData.dailyRate}/dia</p>
          ${contractorData.projectDescription ? `<p><strong>Descrição do projeto:</strong> ${contractorData.projectDescription}</p>` : ''}
        </div>
        
        <p>Entre em contato diretamente com o contratante para mais detalhes sobre o projeto.</p>
        
        <p><small>Este email foi enviado automaticamente pelo FreelanceHub. O FreelanceHub não se responsabiliza pelas informações prestadas pelos usuários.</small></p>
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});