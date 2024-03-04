import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";

export const runtime = "edge";

// Modified TEMPLATE to extract specific fields from rental agreement
const TEMPLATE = `
Only use the functions you have been provided with.
Extract the following information from the rental agreement:
- Tenant's First Name
- Tenant's Last Name
- Landlord's First Name
- Landlord's Last Name
- Address
- Rent
- Deposit
- Whether or not there is a deposit guarantee in place, also known as a 'Mietkautionsbürgschaft' in German. This is a third-party guarantee serving as a substitute for a traditional security deposit."

Input:

{input}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const currentMessageContent = messages[messages.length - 1].content;

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      temperature: 0.1,
      modelName: "gpt-3.5-turbo-0125",
    });

    // Modified schema to include new fields
    const schema = z.object({
      tenant_first_name: z.string().optional(),
      tenant_last_name: z.string().optional(),
      landlord_first_name: z.string().optional(),
      landlord_last_name: z.string().optional(),
      address: z.string().optional(),
      rent: z.number().optional(),
      deposit: z.number().optional(),
      has_guarantee: z.boolean().optional(),
    });

    const functionCallingModel = model.bind({
      functions: [
        {
          name: "output_formatter",
          description: "Properly format the extracted output",
          parameters: zodToJsonSchema(schema),
        },
      ],
      function_call: { name: "output_formatter" },
    });

    const chain = prompt
      .pipe(functionCallingModel)
      .pipe(new JsonOutputFunctionsParser());

    const result = await chain.invoke({
      input: currentMessageContent,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
