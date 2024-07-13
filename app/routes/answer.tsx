import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useLoaderData } from "@remix-run/react";
import { Spacer, VStack } from "structure-kit";
import invariant from "tiny-invariant";
import { createAnswer, getQuestionById } from "~/apis/ask-nft-api";
import {
  useAppkitModal,
  useModalState,
} from "~/components/ConnectButton/ConnectButton";
import { Navbar } from "~/components/Navbar";
import { PageLayout } from "~/components/PageLayout";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const questionId = url.searchParams.get("question");
  invariant(questionId, "question get-param is required");
  const question = await getQuestionById({ id: questionId });
  if (!question) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }
  return json(question);
}

export async function action({ request }: ActionFunctionArgs) {
  const fd = await request.formData();
  const answer = fd.get("answer");
  const questionId = fd.get("questionId");
  invariant(typeof questionId === "string", "questionId is not provided");
  if (typeof answer !== "string" || !answer.length) {
    throw new Error("Invalid answer param value");
  }
  const question = await createAnswer({
    answer,
    id: questionId,
    signature: "todo",
  });
  return redirect(`/for-me?address=${question.receiver}`);
}

export default function Answer() {
  const question = useLoaderData<typeof loader>();
  const { data: modal } = useAppkitModal();
  const { address } = useModalState(modal);
  const addressMismatch = Boolean(
    address && question.receiver.toLowerCase() !== address.toLowerCase()
  );
  return (
    <PageLayout>
      <Navbar />
      <h1>Answer</h1>
      <Spacer height={64} />
      <form method="post">
        <input type="hidden" name="questionId" value={question.id} />
        <VStack gap={24}>
          <div>
            Question:
            <br />
            {question.question}
          </div>
          <VStack gap={8}>
            <label htmlFor="answer">Your answer:</label>
            <textarea
              id="answer"
              name="answer"
              placeholder="Answer will become public"
              required={true}
            />
          </VStack>
          <div>
            <button disabled={addressMismatch}>Submit</button>
            {addressMismatch ? (
              <div style={{ color: "var(--red-4)" }}>
                Connected address is not who the question is for
              </div>
            ) : null}
          </div>
        </VStack>
      </form>
    </PageLayout>
  );
}
