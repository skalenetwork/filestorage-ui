import { DeDirectory, DeFile } from '@/packages/filemanager';
import FolderIcon from '@heroicons/react/solid/FolderIcon';
import FolderOpenIcon from '@heroicons/react/solid/FolderOpenIcon';
import { mimeData } from '../utils';

const FormattedName = ({ item, maxLength, active = false }: { item: DeFile | DeDirectory, maxLength?: number, active?: boolean }) => {

  if (!item) {
    return <></>
  }

  const {
    Icon: ItemIcon,
    color
  } = (item.kind === "file")
      ? mimeData((item as DeFile).type)
      : { Icon: (!active) ? FolderIcon : FolderOpenIcon, color: 'blue' };

  return (
    <span className="gap-x-2 flex flex-row items-center cursor-default">
      <ItemIcon className={`h-5 w-5 text-${color || 'gray'}-500`} />
      {(maxLength && (item.name.length > maxLength)) ?
        (
          <>
            { item.name.substr(0, maxLength / 2)}...{item.name.substr(item.name.length - Math.ceil(maxLength / 2))}
          </>
        )
        : item.name}
    </span >
  )
};

export default FormattedName;