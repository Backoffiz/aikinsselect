interface ProductFeatureProps {
  title: string
  description: string
}

export function ProductFeature({ title, description }: ProductFeatureProps) {
  return (
    <div className="space-y-1">
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

