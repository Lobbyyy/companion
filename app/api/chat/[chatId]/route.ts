
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prisma from "@prisma/client";
import { LangChainAdapter } from "ai";
import { CallbackManager } from "@langchain/core/callbacks/manager";

import { Replicate } from "@langchain/community/llms/replicate";

export async function POST(
    request: Request,
    { params }: { params : { chatId: string}}
) {
    try {
        // need to extract data from our request
        const {prompt} = await request.json();
        const user = await currentUser();

        if (!user || !user.firstName || !user.id) {
            return new NextResponse("unauthorised", {status:401});
        }

        // identifying the user making too making requests
        const identifier = request.url + "-" + user.id;
        const {success} = await rateLimit(identifier);

        if (!success) {
            return new NextResponse("Rate limit exceeded", {status: 429});
        }

        const companion = await prisma.companion.update({
            where:{
                id: params.chatId,
                userId: user.id
            },
            data: {
                messages: {
                    create: {
                        content: prompt,
                        role:"user",
                        userId: user.id,
                    }
                }
            }
        });

        if (!companion){
            return new NextResponse("Companion not found", { status: 404});
        }

        const name = companion.id;
        const companion_file_name = name+ ".txt";

        const companionKey = {
            companionName: name,
            userId: user.id,
            modelName: "llama2-13b",
        };

        const memoryManager = await MemoryManager.getInstance();

        const records = await memoryManager.readLatestHistory(companionKey);

        if (records.length === 0) {
            await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey )
        }

        
    } catch (error) {
        console.log("[CHAT_POST]", error);
        return new NextResponse("Internal Error", { status:500})
    }
}