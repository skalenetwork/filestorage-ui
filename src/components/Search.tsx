import { DeDirectory, DeFile } from "@/services/filesystem";
import XIcon from "@heroicons/react/outline/XIcon";
import SearchIcon from "@heroicons/react/solid/SearchIcon";
import { useRef, useState } from "react";
import { useDebounce } from "react-use";
import { useFileManagerContext } from "../context";
import { Input, SpinnerIcon } from "./common";
import FormattedName from "./FormattedName";

type SearchProps = {
  className: string,
  isSearching: boolean,
  onInput: (value: string) => void
}

const SearchList = () => {
  const { searchListing, fm, changeDirectory } = useFileManagerContext();
  return (fm && searchListing && searchListing.length) ? (
    <div className="absolute top-[100%] bg-slate-100 rounded mt-2 py-2 z-[1001] w-full">
      <ul>
        {
          searchListing.map((item) => (
            <li
              className="px-4 py-2 mx-2 rounded cursor-default hover:bg-white"
              onClick={
                (e) => (item.kind === "directory")
                  ? changeDirectory(item as DeDirectory)
                  : fm?.downloadFile(item as DeFile)
              }
            >
              <FormattedName item={item} />
            </li>
          ))
        }
      </ul>
    </div>
  ) : <></>
}

const Search = (
  { className, isSearching, onInput }: SearchProps
) => {

  const searchField = useRef<HTMLInputElement>();
  const [searchTerm, setSearchTerm] = useState<string>("");

  useDebounce(() => {
    console.log("debounce:search", searchTerm);
    onInput(searchTerm);
  }, 500, [searchTerm]);

  return (
    <div className={className}>
      <div className="mr-4 pointer-events-none absolute top-1/2 transform -translate-y-1/2 left-4">
        {
          isSearching
            ? <SpinnerIcon className="h-6 w-6" />
            : <SearchIcon className="h-6 w-6" />
        }
      </div>
      <Input
        className="w-full border border-gray-500 font-medium"
        style={{ paddingLeft: "3.5rem" }}
        ref={searchField}
        type="text"
        placeholder="Search files..."
        onChange={
          (e) => setSearchTerm((searchField.current as HTMLInputElement).value)
        }
        onBlur={
          e => {
            setSearchTerm("");
            (searchField.current as HTMLInputElement).value = "";
          }
        }
      />
      <div className="pointer-events-none absolute top-1/2 transform -translate-y-1/2 right-4">
        {
          isSearching
            ? <XIcon className="h-6 w-6" />
            : <></>
        }
      </div>
      <SearchList />
    </div>
  )
}

export default Search;