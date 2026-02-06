type Props = {
  type?: string;
  message?: string;
};

export default function FeedbackBanner({ type, message }: Props) {
  if (!message) return null;

  const isSuccess = type === "success";
  return (
    <p
      className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {message}
    </p>
  );
}
