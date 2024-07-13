import type {
  ActionFunctionArgs,
  LinksFunction,
  MetaFunction,
} from "@remix-run/node";
import { Form, redirect } from "@remix-run/react";
import { useMutation } from "@tanstack/react-query";
import { BrowserProvider } from "ethers";
import { useId } from "react";
import { Spacer } from "structure-kit";
import invariant from "tiny-invariant";
import { z } from "zod";
import { ConnectButton } from "~/components/ConnectButton";
import {
  useAppkitModal,
  useModalState,
} from "~/components/ConnectButton/ConnectButton";
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

const SubmitQuestionSchema = z.object({
  receiver: z.string(),
  question: z.string(),
  signature: z.string(),
  address: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  console.log("action!");
  const data = await request.formData();
  const receiver = data.get("receiver");
  const question = data.get("question");
  const signature = data.get("signature");
  const address = data.get("address");

  const x = SubmitQuestionSchema.parse({
    receiver,
    question,
    signature,
    address,
  });
  console.log({ x });
  return redirect(`/questions?address=${address}`);
}

function FormField({
  label,
  ...inputProps
}: {
  label: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        alignItems: "baseline",
      }}
    >
      <label htmlFor={id} style={{ justifySelf: "end" }}>
        {label}
      </label>
      <input id={id} {...inputProps} />
    </div>
  );
}

function FormFieldTextArea({
  label,
  ...inputProps
}: {
  label: React.ReactNode;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        alignItems: "baseline",
      }}
    >
      <label htmlFor={id} style={{ justifySelf: "end" }}>
        {label}
      </label>
      <textarea id={id} {...inputProps} />
    </div>
  );
}

export default function Index() {
  const { data: modal } = useAppkitModal();
  const { address, provider } = useModalState(modal);

  const signQuestionMutation = useMutation({
    mutationFn: async ({
      question,
      receiver,
    }: {
      question: string;
      receiver: string;
    }) => {
      invariant(provider, "provider must be set before signing");
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const message = `To: ${receiver}\nQuestion: ${question}`;
      const signature = await signer.signMessage(message);
      return signature;
    },
  });

  const signature = signQuestionMutation.data;

  const INTENT_SUBMIT = "SUBMIT";
  return (
    <PageLayout>
      <div>
        <h1>Feel Free to Ask</h1>
        <Spacer height={64} />
        <Form
          action="."
          method="post"
          style={{ display: "grid", gap: 20 }}
          onSubmit={(event) => {
            event.preventDefault();
            console.log("form submission");
            const form = event.currentTarget;
            const intent = new FormData(form).get("intent");
            if (intent === INTENT_SUBMIT) {
              console.log("submitting to serever");
              form.submit();
            }
          }}
        >
          <FormField
            label="Who is this question for?"
            name="receiver"
            placeholder="someone.eth"
            required={true}
            onChange={() => {
              signQuestionMutation.reset();
            }}
          />
          <FormFieldTextArea
            label="Your Question"
            name="question"
            placeholder="when are you selling?"
            required={true}
            onChange={() => {
              signQuestionMutation.reset();
            }}
          />
          <div style={{ placeSelf: "center" }}>
            {address == null ? (
              <ConnectButton />
            ) : signature == null ? (
              <button
                onClick={(event) => {
                  const { form } = event.currentTarget;
                  invariant(form, "button must be inside a form");
                  if (!form?.checkValidity()) {
                    return;
                  }
                  const fd = new FormData(form);
                  const receiver = fd.get("receiver") as string;
                  const question = fd.get("question") as string;
                  signQuestionMutation.mutate({ receiver, question });
                }}
              >
                sign question
              </button>
            ) : (
              <>
                <button>submit</button>
                <input type="hidden" name="signature" value={signature} />
                <input type="hidden" name="address" value={address} />
                <input type="hidden" name="intent" value={INTENT_SUBMIT} />
              </>
            )}
          </div>
        </Form>
      </div>
    </PageLayout>
  );
}
