import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/** Estilo dos documentos com as classes do tema (sem cores fora dele). */
const componentes: Components = {
  h1: (props) => <h1 className="mt-2 mb-4 text-titulo font-semibold" {...props} />,
  h2: (props) => <h2 className="mt-8 mb-3 border-b pb-1 text-subtitulo font-semibold" {...props} />,
  h3: (props) => <h3 className="mt-6 mb-2 font-semibold" {...props} />,
  h4: (props) => <h4 className="mt-4 mb-2 font-medium" {...props} />,
  p: (props) => <p className="my-3 leading-relaxed" {...props} />,
  ul: (props) => <ul className="my-3 ml-5 list-disc space-y-1 [&_ul]:my-1" {...props} />,
  ol: (props) => <ol className="my-3 ml-5 list-decimal space-y-1" {...props} />,
  li: ({ className, ...props }) => (
    <li className={className?.includes("task-list-item") ? "-ml-5 list-none" : undefined} {...props} />
  ),
  input: (props) => <input {...props} disabled className="mr-2 accent-preto" />,
  a: (props) => <a className="font-medium underline underline-offset-4" {...props} />,
  blockquote: (props) => (
    <blockquote className="my-3 border-l-3 border-cinza-300 pl-4 text-cinza-600" {...props} />
  ),
  code: (props) => (
    <code className="rounded-sm bg-cinza-100 px-1 py-0.5 font-mono text-[0.9em]" {...props} />
  ),
  pre: (props) => (
    <pre
      className="my-3 overflow-x-auto rounded-md bg-cinza-50 p-4 text-pequeno [&_code]:bg-transparent [&_code]:p-0"
      {...props}
    />
  ),
  table: (props) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-pequeno" {...props} />
    </div>
  ),
  th: (props) => <th className="border-b-2 px-3 py-2 text-left font-semibold" {...props} />,
  td: (props) => <td className="border-b px-3 py-2 align-top" {...props} />,
  hr: () => <hr className="my-6 border-cinza-200" />,
};

export function Markdown({ conteudo }: { conteudo: string }) {
  return (
    <div className="max-w-200 text-normal">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={componentes}>
        {conteudo}
      </ReactMarkdown>
    </div>
  );
}
