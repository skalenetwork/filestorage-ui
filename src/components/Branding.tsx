import { ReactNode } from 'react';

const Branding = (
  { logoUrl, children }: { logoUrl: string, children: ReactNode }
) => (
  <div className="flex flex-row items-center gap-2">
    <img src={logoUrl} className="h-10" alt="" />
    { children ? children : null}
  </div>
);

export default Branding;