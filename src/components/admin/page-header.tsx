type Props = {
  title: string;
  description?: string;
};

export default function PageHeader({ title, description }: Props) {
  return (
    <header className="mb-5">
      <h1 className="text-2xl font-black tracking-tight text-zinc-900">{title}</h1>
      {description ? <p className="mt-1 text-sm text-zinc-600">{description}</p> : null}
    </header>
  );
}
