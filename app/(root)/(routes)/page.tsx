import { SearchInput } from '@/components/search-input';

import prisma from '@/lib/prismadb';
import { Categories } from '@/components/categories';

// this is server component and we're going to be using the library file prismadb.ts to use it here
const RootPage = async () => {
    const categories = await prisma.category.findMany();


    return ( 
        <div className= "h-full p-4 space-y-2">
            <SearchInput />
            <Categories data={categories} />
        </div>
     );
}
 
export default RootPage;
