import { DeDirectory, DeFile } from '@/services/filesystem';
import FolderIcon from '@heroicons/react/solid/FolderIcon';
import DocumentTextIcon from '@heroicons/react/outline/DocumentTextIcon';

const FormattedName = ({ item }: { item: DeFile | DeDirectory }) => {
  //@todo file type to icon map
  return (
    <span className="gap-x-2 flex flex-row items-center cursor-default">
      {
        item.kind === "directory"
          ? <FolderIcon className="h-5 w-5 text-blue-500" />
          : <DocumentTextIcon className="h-5 w-5 text-blue-500" />
      }
      {item.name}
    </span>
  )
};

export default FormattedName;