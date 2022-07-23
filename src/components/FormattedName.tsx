import { DeDirectory, DeFile } from '@/services/filesystem';
import FolderIcon from '@heroicons/react/solid/FolderIcon';
import DocumentTextIcon from '@heroicons/react/outline/DocumentTextIcon';
import PhotographIcon from '@heroicons/react/solid/PhotographIcon';
import VolumeUpIcon from '@heroicons/react/outline/VolumeUpIcon';
import FilmIcon from '@heroicons/react/outline/FilmIcon';

const FileIcon = ({ file, className = "" }: { file: DeFile, className: string }) => {
  const pre = file.type.split("/")[0];
  className += " text-blue-500";
  return (
    (pre === "application") ? <DocumentTextIcon className={className} />
      : (pre === "text") ? <DocumentTextIcon className={className} />
        : (pre === "image") ? <PhotographIcon className={className + " !text-red-500"} />
          : (pre === "audio") ? <VolumeUpIcon className={className} />
            : (pre === "video") ? <FilmIcon className={className + " !text-yellow-500"} />
              : <DocumentTextIcon className={className} />
  )
};

const FormattedName = ({ item }: { item: DeFile | DeDirectory }) => {
  return (
    <span className="gap-x-2 flex flex-row items-center cursor-default">
      {
        item.kind === "directory"
          ? <FolderIcon className="h-5 w-5 text-blue-500" />
          : <FileIcon file={item as DeFile} className="h-5 w-5" />
      }
      {item.name}
    </span>
  )
};

export default FormattedName;