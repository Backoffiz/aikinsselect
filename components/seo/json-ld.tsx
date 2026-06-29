/**
 * Renders a JSON-LD <script> tag. `<` is escaped to < so a product name or
 * description containing markup can't break out of the script element.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
