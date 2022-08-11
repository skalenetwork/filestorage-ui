// potential to scale, bring in context when needed

import FormattedAddress from "./FormattedAddress";

const Connect = (
  { account, onConnectClick }: { account: string, onConnectClick: () => void }
) => {

  return (account) ?
    <p
      className="w-80 flex items-center justify-between px-4 py-2 rounded bg-base-200 overflow-hidden"
    >
      <span>Account</span><FormattedAddress address={account} pre={5} post={10} />
    </p>
    :
    <button
      className="btn rounded-full"
      onClick={(e) => onConnectClick()}
    > Connect </button>
}

export default Connect;