import { handleChatRequest } from "@/lib/chat/server/handler";
import { buildPortfolioContext } from "@/lib/chat/server/context";
import { createChatProvider } from "@/lib/chat/server/provider-factory";

export async function POST(request: Request): Promise<Response> {
  return handleChatRequest(request, {
    buildContext: buildPortfolioContext,
    createProvider: createChatProvider,
  });
}
