import FolderIcon from '@heroicons/react/solid/FolderIcon';
import DocumentTextIcon from '@heroicons/react/outline/DocumentTextIcon';

const FormattedName = (props: any) => (
  <span className="gap-x-2 flex flex-row items-center cursor-default">
    {
      props.data.kind === "directory"
        ? <FolderIcon className="h-5 w-5 text-blue-500" />
        : <DocumentTextIcon className="h-5 w-5 text-blue-500" />
    }
    {props.data.name}
  </span>
);

export default FormattedName;