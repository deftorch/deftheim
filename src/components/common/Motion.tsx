import { Component, JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

// Mock Motion component that just renders the element
// supporting the motion props as pass-through or ignoring them
export const Motion = new Proxy(
  {},
  {
    get: (_, tag: string) => {
      return (props: any) => {
        const [local, others] = splitProps(props, [
          "initial",
          "animate",
          "exit",
          "transition",
          "whileHover",
          "whileTap",
        ]);
        return <Dynamic component={tag} {...others} />;
      };
    },
  }
) as any;

export const Presence: Component<{ children: JSX.Element }> = (props) => {
  return <>{props.children}</>;
};
