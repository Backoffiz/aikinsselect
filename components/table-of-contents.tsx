import Link from "next/link"

interface TableOfContentsItem {
  id: string
  label: string
}

interface TableOfContentsProps {
  items: TableOfContentsItem[]
}

export function TableOfContents({ items }: TableOfContentsProps) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <h3 className="mb-4 font-semibold">Table of Contents</h3>
      <nav>
        <ol className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`#${item.id}`} className="text-muted-foreground hover:text-foreground hover:underline">
                {item.label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}

