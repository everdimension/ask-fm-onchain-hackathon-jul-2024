export function PageLayout(props: React.PropsWithChildren) {
  return (
    <div
      style={{
        maxWidth: 800,
        paddingInline: 16,
        marginInline: "auto",
      }}
    >
      {props.children}
    </div>
  );
}
