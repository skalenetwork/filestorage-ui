import prettyBytes from "pretty-bytes";
import { Progress } from "./common";
import FormattedSize from "./FormattedSize";

const StorageStatus = (
  { occupiedSpace, reservedSpace }:
    { occupiedSpace: number, reservedSpace: number }
) => {
  return (
    <div>
      <p>
        <span className="font-semibold">
          <FormattedSize
            value={occupiedSpace}
          />
        </span> used
      </p>
      <p className="text-xs font-medium">
        {((occupiedSpace / reservedSpace) || 0).toFixed(6)}% used - {prettyBytes((reservedSpace - occupiedSpace) || 0)} free
      </p>
      <Progress
        className="w-full"
        value={occupiedSpace / reservedSpace}
        max={100}
      />
    </div>
  )
}

export default StorageStatus;