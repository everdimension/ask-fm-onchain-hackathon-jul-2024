import invariant from "tiny-invariant";
import { z } from "zod";

const apiUrl = process.env.API_URL;
invariant(apiUrl, "API_URL not set");

export const SubmitQuestionSchema = z.object({
  receiver: z.string(),
  question: z.string(),
  signature: z.string(),
  sender: z.string(),
  answer: z.nullable(z.string()),
  tokenId: z.optional(z.string()),
});

type Question = z.infer<typeof SubmitQuestionSchema>;
const DBQuestionSchema = SubmitQuestionSchema.extend({ id: z.string() });
type DBQuestion = z.infer<typeof DBQuestionSchema>;

const db = new Map<string, DBQuestion>();

export async function createQuestion(data: Question) {
  const id = crypto.randomUUID();
  const entry = { ...SubmitQuestionSchema.parse(data), id };
  db.set(id, entry);

  await fetch(new URL("api/submit-question", apiUrl), {
    method: "post",
    body: JSON.stringify(entry),
    headers: { "Content-Type": "application/json" },
  });
  return id;
}

export async function getQuestions({
  address,
  signature,
}: {
  address: string;
  signature: string;
}) {
  const url = new URL("/api/asked-questions", apiUrl);
  url.searchParams.set("sender", address);
  url.searchParams.set("signature", signature);
  const response = await fetch(url);
  const results: DBQuestion[] = await response.json();
  return results.filter((entry) => {
    // filter out broken item on backend
    return entry.tokenId !== "4";
  });
}

export async function getQuestionsForMe({
  address,
}: {
  address: string;
  signature: string;
}) {
  const url = new URL("/api/questions", apiUrl);
  url.searchParams.set("address", address);

  const response = await fetch(url);
  const results: DBQuestion[] = await response.json();
  return results.filter((entry) => {
    // filter out broken item on backend
    return entry.tokenId !== "4";
  });
}

export async function getQuestionById({ id }: { id: string }) {
  const url = new URL("/api/question", apiUrl);
  url.searchParams.set("id", id);
  const response = await fetch(url);
  const question: DBQuestion = await response.json();
  return question;
}

export async function createAnswer({
  id,
  answer,
  signature,
}: {
  id: string;
  answer: string;
  signature: string;
}) {
  const url = new URL("/api/answer-question", apiUrl);
  const response = await fetch(url, {
    method: "post",
    body: JSON.stringify({ answer, questionId: id, signature }),
    headers: { "Content-Type": "application/json" },
  });
  const newValue: DBQuestion = await response.json();
  return newValue;
}
