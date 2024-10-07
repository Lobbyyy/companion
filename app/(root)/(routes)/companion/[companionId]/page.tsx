import prisma from "@/lib/prismadb";
import CompanionForm from "./components/companion-form";
import { auth } from "@clerk/nextjs/server";


interface CompanionIdPageProps {
    params: {
        companionId: string;
    };
};


const CompanionIdPage = async ({
    params
}: CompanionIdPageProps) => {
    // TODO: Check Subscription

    const { userId } = auth();
    const { companionId } = params;

    if (!userId) {
        return auth().redirectToSignIn();
    }

    // Check if companionId is 'new'
    if (companionId === 'new') {
        // Handle the case for creating a new companion
        const categories = await prisma.category.findMany();
        return ( 
            <div>
                <CompanionForm
                    initialData={null} // No initial data for a new companion
                    categories={categories}
                />
            </div>
        );
    }

    // Fetching the existing companion for the URL
    const companion = await prisma.companion.findUnique({
        where: {
            id: params.companionId,
            userId
        }
    });

    const categories = await prisma.category.findMany();

    return ( 
        <div>
            <CompanionForm
                 initialData={companion}
                 categories={categories}
            />
        </div>
     );
}
 
export default CompanionIdPage;



