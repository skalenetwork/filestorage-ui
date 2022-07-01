
const Button = ({ children, ...rest }: { children: string }) => {
  return (
    <button className={"py-2 px-8 rounded bg-gray-700 text-white hover:bg-gray-600"} {...rest}>{children}</button>
  );
}

export default Button;