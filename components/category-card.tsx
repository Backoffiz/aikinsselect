import Link from "next/link"
import {
  Laptop,
  Home,
  Utensils,
  Dumbbell,
  Sparkles,
  Plane,
  PawPrintIcon as Paw,
  Briefcase,
  Gamepad,
  Mountain,
  Baby,
  Car,
} from "lucide-react"

interface CategoryCardProps {
  title: string
  icon: string
  count: number
}

export function CategoryCard({ title, icon, count }: CategoryCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "laptop":
        return <Laptop className="h-6 w-6" />
      case "home":
        return <Home className="h-6 w-6" />
      case "utensils":
        return <Utensils className="h-6 w-6" />
      case "dumbbell":
        return <Dumbbell className="h-6 w-6" />
      case "sparkles":
        return <Sparkles className="h-6 w-6" />
      case "plane":
        return <Plane className="h-6 w-6" />
      case "paw":
        return <Paw className="h-6 w-6" />
      case "briefcase":
        return <Briefcase className="h-6 w-6" />
      case "gamepad":
        return <Gamepad className="h-6 w-6" />
      case "mountain":
        return <Mountain className="h-6 w-6" />
      case "baby":
        return <Baby className="h-6 w-6" />
      case "car":
        return <Car className="h-6 w-6" />
      default:
        return <Laptop className="h-6 w-6" />
    }
  }

  return (
    <Link
      href={`/categories/${title.toLowerCase()}`}
      className="flex flex-col items-center justify-center rounded-lg border bg-white p-4 text-center transition-colors hover:bg-muted"
    >
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {getIcon()}
      </div>
      <h3 className="text-sm font-medium text-slate-dark">{title}</h3>
      <p className="text-xs text-muted-foreground">{count} reviews</p>
    </Link>
  )
}

