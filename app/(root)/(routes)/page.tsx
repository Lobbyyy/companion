'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Change import to next/navigation
import { useAuth } from '@clerk/nextjs';
import { SearchInput } from '@/components/search-input';


const RootPage = () => {
    const { isSignedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isSignedIn) {
            router.push(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in');
        }
    }, [isSignedIn, router]);

    return ( 
        <div className= "h-full p-4 space-y-2">
            <SearchInput />
        </div>
     );
}
 
export default RootPage;
