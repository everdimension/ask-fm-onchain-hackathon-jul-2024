import { useAppkitModal, useModalState } from "../ConnectButton/ConnectButton";

export function Navbar() {
  const { data: modal } = useAppkitModal();
  const { address } = useModalState(modal);
  const postfix = address ? `?address=${address}` : "";
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <a href="/">Home</a>
      <a href={`/my-questions${postfix}`}>My Questions</a>
      <a href={`/for-me${postfix}`}>For me</a>
    </div>
  );
}
