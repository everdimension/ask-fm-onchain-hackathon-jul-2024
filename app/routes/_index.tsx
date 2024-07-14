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
import { createQuestion, SubmitQuestionSchema } from "~/apis/ask-nft-api";
import { getWalletsMeta } from "~/apis/zerion-api";
import { ConnectButton } from "~/components/ConnectButton";
import {
  useAppkitModal,
  useModalState,
} from "~/components/ConnectButton/ConnectButton";
import { Navbar } from "~/components/Navbar";
import { PageLayout } from "~/components/PageLayout";

export const meta: MetaFunction = () => {
  return [
    { title: "Ask NFT" },
    { name: "description", content: "Ask questions to crypto holders" },
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

async function resolveAddress(value: string) {
  const response = await getWalletsMeta({ identifiers: [value] });
  const address = response?.data?.[0]?.address;
  if (!address) {
    throw new Error(`Invalid identity: ${value}`);
  }
  return address;
}

export async function action({ request }: ActionFunctionArgs) {
  const fd = await request.formData();
  const receiver = fd.get("receiver");
  const question = fd.get("question");
  const signature = fd.get("signature");
  const sender = fd.get("sender");

  const data = SubmitQuestionSchema.parse({
    receiver,
    question,
    signature,
    sender,
    answer: null,
  });
  await resolveAddress(data.receiver);
  const resolvedAddress = await resolveAddress(data.sender);
  await createQuestion({
    ...data,
    sender: await resolveAddress(data.sender),
    receiver: await resolveAddress(data.receiver),
  });
  return redirect(`/my-questions?address=${resolvedAddress}`);
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
      className="field-stack-columns"
      style={{
        display: "grid",
        gap: 8,
        alignItems: "baseline",
      }}
    >
      <label htmlFor={id}>{label}</label>
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
      className="field-stack-columns"
      style={{
        display: "grid",
        gap: 8,
        alignItems: "baseline",
      }}
    >
      <label htmlFor={id}>{label}</label>
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
      <Navbar />
      <Spacer height={24} />
      <div>
        <h1>Feel Free to Ask</h1>
        <Spacer height={64} />
        <Form
          action="."
          method="post"
          style={{ display: "grid", gap: 20 }}
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const intent = new FormData(form).get("intent");
            if (intent === INTENT_SUBMIT) {
              form.submit();
            }
          }}
        >
          <FormField
            label="Who is this question for?"
            name="receiver"
            placeholder="someone.eth"
            required={true}
            pattern="(0x[a-fA-F0-9]{40})|((\w|\.)+\.(eth|lens))"
            onChange={() => {
              signQuestionMutation.reset();
            }}
          />
          <FormFieldTextArea
            label="Your Question"
            name="question"
            placeholder="when are you dumping?"
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
                <input type="hidden" name="sender" value={address} />
                <input type="hidden" name="intent" value={INTENT_SUBMIT} />
              </>
            )}
          </div>
        </Form>
      </div>
    </PageLayout>
  );
}
