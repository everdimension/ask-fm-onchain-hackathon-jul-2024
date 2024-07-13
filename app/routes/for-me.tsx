import { LoaderFunctionArgs } from "@remix-run/node";
import {
  json,
  Link,
  Navigate,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { Spacer, VStack } from "structure-kit";
import { getQuestionsForMe } from "~/apis/ask-nft-api";
import {
  ConnectButton,
  useAppkitModal,
  useModalState,
} from "~/components/ConnectButton/ConnectButton";
import { Navbar } from "~/components/Navbar";
import { PageLayout } from "~/components/PageLayout";
import { truncateAddress } from "~/shared/truncateAddress";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  if (!address) {
    return json([]);
  }
  const questions = await getQuestionsForMe({ address, signature: "todo" });
  return json(questions);
}

export default function Questions() {
  const [params] = useSearchParams();
  const address = params.get("address");
  // invariant(address, "address get-param is required");
  const { data: modal } = useAppkitModal();
  const { address: connectedAddress } = useModalState(modal);
  const data = useLoaderData<typeof loader>();
  if (!address && connectedAddress) {
    return (
      <Navigate to={`/for-me?address=${connectedAddress}`} replace={true} />
    );
  }

  return (
    <PageLayout>
      <Navbar />
      <h1>Questions</h1>
      <Spacer height={64} />

      {!address ? (
        <ConnectButton />
      ) : data.length ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 20,
          }}
        >
          {data.map((entry) => (
            <div
              key={entry.id}
              style={{
                boxShadow: "var(--shadow-3)",
                borderRadius: "var(--radius-drawn-2)",
                // border: "2px solid",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  aspectRatio: "1.5 / 1",
                  background: "var(--brand-bg-gradient)",
                }}
              ></div>
              <div style={{ padding: 12, paddingBottom: 16 }}>
                <VStack gap={4}>
                  <div style={{ color: "var(--gray-6)" }}>
                    To:{" "}
                    {entry.receiver.includes(".")
                      ? entry.receiver
                      : truncateAddress(entry.receiver)}
                  </div>
                  <div>{entry.question}</div>
                  {entry.answer ? (
                    <div>
                      <span style={{ color: "var(--green-4)" }}>Answer:</span>{" "}
                      {entry.answer}
                    </div>
                  ) : (
                    <Link to={`/answer?question=${entry.id}`}>Answer</Link>
                  )}
                </VStack>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>You do not have any questions</p>
      )}
    </PageLayout>
  );
}
