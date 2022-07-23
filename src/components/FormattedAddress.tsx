const FormattedAddress = ({ address, pre = 6, post = 4 }: { address: string; pre: number; post: number }) => {
  if (address.length < 40) return <></>
  return (
    <>{address.substring(0, pre) + "...." + address.substring(address.length - post)}</>
  );
}

export default FormattedAddress;