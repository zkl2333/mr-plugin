import classNames from "classnames";

const Tabs = (props: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  className: string;
}) => {
  return (
    <div className={classNames("tabs p-2 tabs-boxed rounded-2xl", props.className)}>
      {props.options.map((option) => {
        return (
          <a
            key={option.value}
            className={classNames("tab !rounded-xl", {
              "tab-active": props.value === option.value,
            })}
            onClick={() => props.onChange(option.value)}
          >
            {option.label}
          </a>
        );
      })}
    </div>
  );
};
export default Tabs;
