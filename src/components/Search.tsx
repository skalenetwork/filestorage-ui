// @ts-nocheck

import { DeFile } from "@/packages/filemanager";
import XIcon from "@heroicons/react/outline/XIcon";
import SearchIcon from "@heroicons/react/solid/SearchIcon";
import { useFileManagerContext } from "../context";
import { Input, SpinnerIcon } from "./common";
import FormattedName from "./FormattedName";

import SelectSearch from "react-select-search";

type SearchProps = {
  className: string,
  onFileClick: (file: DeFile) => void
}

const Search = (
  { className, onFileClick }: SearchProps
) => {

  const classes = {
    container: className,
    input: "input w-full border border-gray-500 font-medium p-l-4",
    options: "absolute max-h-[500px] top-[100%] bg-base-200 rounded mt-2 z-[1001] w-full scrollbar overflow-y-auto"
  }

  const { changeDirectory, fm } = useFileManagerContext();

  const renderItem = (optionProps, optionData, optionSnapshot) => {

    const props = { ...optionProps };
    const onSelect = props.onMouseDown;
    let item;

    if (optionData.item) {
      // ew, but we need to clone to patch compatibility with lightest of library
      item = Object.assign(Object.create(Object.getPrototypeOf(optionData.item)), optionData.item);
    }

    return item && (
      <li
        className={`px-4 py-2 mx-2 rounded cursor-default hover:bg-white hover:text-slate-500 first-of-type:mt-2 last-of-type:mb-2 ${optionData.index == 0 ? 'mt-2' : ''}`}
        tabIndex={optionProps.tabIndex}
        // {...optionProps}
        onClick={(e) => {
          item.kind === "directory"
            ? changeDirectory(item)
            : onFileClick(item);
          onSelect(e);
        }}
      >
        <FormattedName item={optionData.item} />
      </li>
    );
  }

  return (<>
    <SelectSearch
      className={(key) => classes[key]}
      options={[]}
      getOptions={async (query) => (await fm.search(fm.rootDirectory(), query)).map(item => ({
        item: item
      }))}
      debounce={500}
      renderValue={(valueProps, snapshot, className) => {
        console.log(valueProps, snapshot, snapshot.searching);
        return (
          <div>
            <div className="mr-4 pointer-events-none absolute top-1/2 transform -translate-y-1/2 left-4">
              {
                snapshot.fetching
                  ? <SpinnerIcon className="h-6 w-6" />
                  : <SearchIcon className="h-6 w-6" />
              }
            </div>
            <Input
              className={className}
              style={{ paddingLeft: "3.5rem" }}
              {...valueProps}
            />
            <div className="pointer-events-none absolute top-1/2 transform -translate-y-1/2 right-4">
              {
                snapshot.search
                  ? <XIcon className="h-6 w-6" />
                  : <></>
              }
            </div>
          </div>
        )
      }}
      renderOption={renderItem}
      search
      placeholder="Search files..."
      onChange={(val, option) => {
        console.log(val, option);
      }}
    />
  </>
  )
}

export default Search;