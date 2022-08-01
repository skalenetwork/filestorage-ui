import prettyBytes from "pretty-bytes";
import { useEffect, useState } from "react";
import { Progress } from "./common";
import FormattedSize from "./FormattedSize";

const StorageStatus = (
  { className = "", occupiedSpace, reservedSpace }:
    { className: string, occupiedSpace: number, reservedSpace: number }
) => {

  const [usedSpace, setUsedSpace] = useState(0);

  useEffect(() => {
    setUsedSpace((occupiedSpace / reservedSpace) || 0);
  }, [occupiedSpace, reservedSpace]);

  return (
    <div className={className}>
      <p>
        <span className="font-semibold">
          <FormattedSize
            value={occupiedSpace}
          />
        </span> used
      </p>
      <p className="text-xs font-medium">
        {usedSpace.toFixed(4)}% used - {prettyBytes((reservedSpace - occupiedSpace) || 0)} free
      </p>
      <Progress
        className="w-full"
        value={usedSpace}
        max={100}
      />
    </div>
  )
}

export default StorageStatus;