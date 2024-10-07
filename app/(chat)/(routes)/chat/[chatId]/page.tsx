import { auth } from "@clerk/nextjs/server";


import prisma from "@/lib/prismadb";
import { redirect } from "next/navigation";
import ChatClient from "./components/client";

//we want to load the companion from the url. We're using params here because the id is a dynamic variable 
interface ChatIdPageProps {
    params: {
        chatId: string;
    }
}

const ChatIdPage = async ({
    params
}: ChatIdPageProps ) => {
    const { userId } = auth();

    if (!userId) {
        return auth().redirectToSignIn();
    }

    const companion = await prisma.companion.findUnique({
        where: {
            id: params.chatId
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: "asc",
                },
                where: {
                    userId,
                }
            },
            _count:{
                select: {
                    messages: true
                }
            }
        }
        
    });

    if (!companion) {
        return redirect("/");
    }

    return ( 
        <div className="h-full">
            <ChatClient companion = {companion} />
        </div>
     );
}
 
export default ChatIdPage;