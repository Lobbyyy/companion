"use client";

import { useDebounce } from "@/app/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { ChangeEventHandler, useEffect, useState } from "react";

export const SearchInput = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // categoryid is not controlled or assigned here, it will be handled by the server component
    const categoryId = searchParams.get("categoryId");

    const name = searchParams.get("name");

    const [value, setValue] = useState(name || "");
    const debouncedValue = useDebounce<string>(value, 500);

    const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setValue(e.target.value);
    }

    useEffect(() => {
        const query = {
            name: debouncedValue,
            categoryId: categoryId,
        };

        const url = queryString.stringifyUrl({
            url: window.location.href,
            query: query
        }, { skipEmptyString: true, skipNull: true});

        router.push(url);
    }, [debouncedValue, router, categoryId]);

    return (
        <div className="relative">
            <Search className="absolute h-4 w-4 top-3 left-4 text-muted-foreground" />
            <Input 
                onChange={onChange}
                value={value}
                placeholder="Search..."
                className="pl-14 bg-primary/10"
            />
        </div>
    )
}