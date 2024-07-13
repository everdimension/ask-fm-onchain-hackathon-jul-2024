import invariant from "tiny-invariant";
import { z } from "zod";

export const SubmitQuestionSchema = z.object({
  receiver: z.string(),
  question: z.string(),
  signature: z.string(),
  address: z.string(),
  answer: z.nullable(z.string()),
});

type Question = z.infer<typeof SubmitQuestionSchema>;
type DBQuestion = Question & { id: string };

const db = new Map<string, DBQuestion>();

export async function createQuestion(data: Question) {
  const id = crypto.randomUUID();
  db.set(id, { ...SubmitQuestionSchema.parse(data), id });
  return id;
}

export async function getQuestions({
  address,
}: {
  address: string;
  signature: string;
}) {
  const results: DBQuestion[] = [];
  for (const value of db.values()) {
    if (value.address === address) {
      results.push(value);
    }
  }
  return results;
}

export async function getQuestionsForMe({
  address,
}: {
  address: string;
  signature: string;
}) {
  const results: DBQuestion[] = [];
  for (const value of db.values()) {
    if (value.receiver === address) {
      results.push(value);
    }
  }
  return results;
}

export async function getQuestionById({ id }: { id: string }) {
  for (const value of db.values()) {
    if (value.id === id) {
      return value;
    }
  }
  return null;
}

export async function createAnswer({
  id,
  answer,
}: {
  id: string;
  answer: string;
  signature: string;
}) {
  const question = await getQuestionById({ id });
  invariant(question, "question not found");
  const newValue = { ...question, answer };
  db.set(question.id, newValue);
  return newValue;
}
