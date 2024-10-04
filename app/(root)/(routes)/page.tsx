import { SearchInput } from '@/components/search-input';

import prisma from '@/lib/prismadb';
import { Categories } from '@/components/categories';
import Companions from '@/components/companions';

interface RootPageProps {
    searchParams: {
        categoryId: string;
        name: string;
    }
}

// this is server component and we're going to be using the library file prismadb.ts to use it here
const RootPage = async ({
    searchParams
}: RootPageProps) => {
    const data = await prisma.companion.findMany({
        where: {
            categoryId: searchParams.categoryId,
            name: {
                search: searchParams.name
            }
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            _count: {
                select: {
                    messages: true
                }
            }
        }
    });

    const categories = await prisma.category.findMany();

    return ( 
        <div className= "h-full p-4 space-y-2">
            <SearchInput />
            <Categories data={categories} />
            <Companions data={data} />
        </div>
     );
}
 
export default RootPage;
