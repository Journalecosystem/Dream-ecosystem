// Shows the message a server action passed back through ?error=. Renders
// nothing when there is no message, so pages can always include it.
export function ErrorNotice({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="text-base text-danger my-4 border border-danger/30 rounded-sm px-3 py-2"
    >
      {message}
    </p>
  );
}
