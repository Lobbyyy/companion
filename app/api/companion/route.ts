import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { src, name, description, instructions, seed, categoryId } = body;

        if (!user || !user.id || !user.firstName) {
            return new NextResponse("Unathorised user", { status: 400 })
        }

        if (!src || !name || !description || !instructions || !seed || !categoryId) {
            return new NextResponse("Missing required field", { status: 401 })
        }

        //TODO check if the user is subcribed

        const companion = await prisma.companion.create({
            data: {
                categoryId,
                userId: user.id,
                userName: user.firstName || 'defaultName',
                src,
                name,
                description,
                instructions,
                seed
            }
        });

        return NextResponse.json(companion);

    } catch (error) {
        console.log("[COMPANION_POST]", error);
        return new NextResponse("Internal Error", { status: 500});
    }
}

