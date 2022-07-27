
import prettyBytes from 'pretty-bytes';
import { DeFile, DeDirectory } from '@/services/filesystem';

type ItemProps = { item: DeFile | DeDirectory, value?: never };
type ValueProps = { value: number, item?: never };

const FormattedSize = (
  { item, value }: ItemProps | ValueProps
) => (value !== undefined) ?
    (
      <>{prettyBytes(value || 0)}</>
    )
    :
    (
      <>
        {
          ((item as ItemProps['item']).kind === "file")
            ? prettyBytes((item as DeFile).size || 0)
            : "--"
        }
      </>
    )
  ;

export default FormattedSize;