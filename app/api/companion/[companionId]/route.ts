import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prismadb";

export async function PATCH(
    req: Request,
    { params }: { params: { companionId: string}}

) {
    try {
        const body = await req.json();
        const user = await currentUser();
        const { src, name, description, instructions, seed, categoryId } = body;

        if (!params.companionId) {
            return new NextResponse("Companion ID is required", { status:402 });
        }

        if (!user || !user.id || !user.firstName) {
            return new NextResponse("Unathorised user", { status: 400 })
        }

        if (!src || !name || !description || !instructions || !seed || !categoryId) {
            return new NextResponse("Missing required field", { status: 401 })
        }

        //TODO check if the user is subcribed

        const companion = await prisma.companion.update({
            where: {
                id: params.companionId,
                userId: user.id,
            },
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
        console.log("[COMPANION_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500});
    }
}


export async function DELETE(
    request: Request,
    { params }: { params: {companionId: string}}
) {
    try {
        const { userId } = auth();

        if(!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const companion = await prisma.companion.delete({
            where: {
                userId,
                id: params.companionId,
            }
        });

        return NextResponse.json(companion);

    } catch(error) {
        console.log("[COMPANION DELETE]", error);
        return new NextResponse("Internal Error", { status: 500});
    }
}