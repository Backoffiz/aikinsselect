import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <Spinner className="size-8 text-brand" />
    </div>
  )
}
