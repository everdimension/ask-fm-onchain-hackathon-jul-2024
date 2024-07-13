import { useSearchParams } from "@remix-run/react";
import { Spacer } from "structure-kit";
import invariant from "tiny-invariant";
import { PageLayout } from "~/components/PageLayout";

export default function Questions() {
  const [params] = useSearchParams();
  const address = params.get("address");
  invariant(address, "address get-param is required");
  return (
    <PageLayout>
      <h1>Questions</h1>
      <Spacer height={64} />
      {address}
    </PageLayout>
  );
}
