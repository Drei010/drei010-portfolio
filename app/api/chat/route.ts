import { handleChatRequest } from "@/lib/chat/server/handler";
import { buildPortfolioContext } from "@/lib/chat/server/context";
import { createChatProvider } from "@/lib/chat/server/provider-factory";
import { checkChatRateLimit } from "@/lib/chat/server/rate-limit";

export async function POST(request: Request): Promise<Response> {
  return handleChatRequest(request, {
    buildContext: buildPortfolioContext,
    checkRateLimit: checkChatRateLimit,
    createProvider: createChatProvider,
  });
}
