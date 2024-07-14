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
import { getNftUrl } from "~/shared/getNftUrl";
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

export default function QuestionsForMe() {
  const [params] = useSearchParams();
  const address = params.get("address");
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
      <Spacer height={24} />
      <h1>Questions for me</h1>
      <Spacer height={64} />

      {!address ? (
        <ConnectButton />
      ) : data.length ? (
        <div className="gallery-columns" style={{ display: "grid", gap: 20 }}>
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
                  backgroundImage: entry.answer
                    ? `url("https://expression-statement.fly.dev/ask-nft?text=${encodeURIComponent(
                        entry.question
                      )}")`
                    : 'url("https://magenta-imperial-booby-654.mypinata.cloud/ipfs/QmNSJtpv8W85T3ZSPtmaZvSS3bK8jp7Pus36qT8beEE42e")',
                  backgroundSize: entry.answer ? "contain" : "cover",
                  backgroundPosition: "center",
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
                  {entry.tokenId ? (
                    <a
                      href={getNftUrl(entry.tokenId)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      NFT
                    </a>
                  ) : null}
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
