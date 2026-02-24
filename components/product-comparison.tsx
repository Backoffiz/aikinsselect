import Image from "next/image"
import { Star } from "lucide-react"

interface Product {
  name: string
  image: string
  price: string
  rating: number
  soundQuality: number
  noiseCancellation: number
  batteryLife: number
  comfort: number
  features: number
}

interface ProductComparisonProps {
  products: Product[]
}

export function ProductComparison({ products }: ProductComparisonProps) {
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="relative">
            <Star className={`h-4 w-4 ${i < rating ? "fill-primary text-primary" : "fill-muted text-muted"}`} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left font-medium">Product</th>
            <th className="p-2 text-left font-medium">Price</th>
            <th className="p-2 text-left font-medium">Rating</th>
            <th className="p-2 text-left font-medium">Sound Quality</th>
            <th className="p-2 text-left font-medium">Noise Cancellation</th>
            <th className="p-2 text-left font-medium">Battery Life</th>
            <th className="p-2 text-left font-medium">Comfort</th>
            <th className="p-2 text-left font-medium">Features</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index} className="border-b">
              <td className="p-2">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="font-medium">{product.name}</span>
                </div>
              </td>
              <td className="p-2">{product.price}</td>
              <td className="p-2">{product.rating}</td>
              <td className="p-2">{renderRating(product.soundQuality)}</td>
              <td className="p-2">{renderRating(product.noiseCancellation)}</td>
              <td className="p-2">{renderRating(product.batteryLife)}</td>
              <td className="p-2">{renderRating(product.comfort)}</td>
              <td className="p-2">{renderRating(product.features)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

