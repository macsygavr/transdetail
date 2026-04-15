"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { useRouter } from "next/navigation";

export default function SearchTransmission() {
  const [searchText, setSearchText] = useState("");

  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/catalog/transmissions?keywords=${searchText}`);
  }

  return (
    <form className="relative overflow-hidden mb-3.5" onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="К примеру, тормозная лента"
        className="pr-7.5"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <button
        type="submit"
        className="
          absolute right-0.25 top-1/2 -translate-y-1/2
          flex justify-center items-center size-9.75
          rounded-r-md cursor-pointer group
          hover:bg-main-red focus:bg-main-red
        "
      >
        <VisuallyHidden>Поиск</VisuallyHidden>
        <Search
          size={18}
          className="text-main-red group-hover:text-white group-focus:text-white"
        />
      </button>
    </form>
  );
}
