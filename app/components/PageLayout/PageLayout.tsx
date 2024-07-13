export function PageLayout(props: React.PropsWithChildren) {
  return (
    <div
      style={{
        maxWidth: 800,
        marginInline: "auto",
      }}
    >
      {props.children}
    </div>
  );
}
