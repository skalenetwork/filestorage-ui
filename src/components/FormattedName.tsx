import { DeDirectory, DeFile } from '@/packages/filemanager';
import FolderIcon from '@heroicons/react/solid/FolderIcon';
import { mimeData } from '../utils';

const FormattedName = ({ item, maxLength }: { item: DeFile | DeDirectory, maxLength?: number }) => {

  if (!item) {
    return <></>
  }

  const {
    Icon: ItemIcon,
    color
  } = (item.kind === "file")
      ? mimeData((item as DeFile).type)
      : { Icon: FolderIcon, color: 'blue' };

  return (
    <span className="gap-x-2 flex flex-row items-center cursor-default">
      <ItemIcon className={`h-5 w-5 text-${color || 'gray'}-500`} />
      {(maxLength && (item.name.length > maxLength)) ?
        (
          <>
            { item.name.substr(0, maxLength / 2)}<span className="text-gray-500">...</span>{item.name.substr(item.name.length - Math.ceil(maxLength / 2))}
          </>
        )
        : item.name}
    </span>
  )
};

export default FormattedName;