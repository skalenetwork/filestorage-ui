import { ReactNode } from 'react';
import config from '../config';

const { logoUrl } = config;

const Branding = (
  { children }: { children: ReactNode }
) => (
  <div className="flex flex-row items-center gap-2">
    <img src="/logo.png" className="h-10 rounded-[14px]" style={{ filter: "revert" }} alt="" />
    { children ? children : null}
  </div>
);

export default Branding;