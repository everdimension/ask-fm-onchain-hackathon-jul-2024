import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { ConnectButton } from "~/components/ConnectButton";
import { PageLayout } from "~/components/PageLayout";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: "",
    },
  ];
};

export default function Index() {
  return (
    <PageLayout>
      <div>
        <h1>Welcome to Remix</h1>
        Some content
        <form>
          <div>
            <label>
              hi
              <input type="text" placeholder="hello" />
            </label>
          </div>
        </form>
        <ConnectButton />
      </div>
    </PageLayout>
  );
}
