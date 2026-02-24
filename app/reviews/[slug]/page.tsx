import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { getReviewBySlug, getPublishedReviews } from '@/lib/db'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Badge } from '@/components/ui/badge'
import { Clock, ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const review = await getReviewBySlug(slug)
  if (!review) return { title: 'Review Not Found' }

  return {
    title: `${review.title} | Aikins Select`,
    description: review.subtitle || review.excerpt,
    openGraph: {
      title: review.title,
      description: review.subtitle || review.excerpt,
      type: 'article',
      publishedTime: review.published_at,
      modifiedTime: review.updated_at,
      authors: [review.author],
    },
  }
}

export default async function ReviewPage({ params }: Props) {
  const { slug } = await params
  const review = await getReviewBySlug(slug)

  if (!review) notFound()

  // Simple markdown to HTML (basic)
  const contentHtml = review.content
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-8 mb-3 text-slate-900">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-4 text-slate-900">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-6 mb-4 text-slate-900">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-slate-500">$1</em>')
    .replace(/^- ✅ (.+)$/gm, '<li class="flex items-start gap-2 mb-2"><span class="text-green-600 mt-1">✅</span><span>$1</span></li>')
    .replace(/^- ⚠️ (.+)$/gm, '<li class="flex items-start gap-2 mb-2"><span class="text-amber-500 mt-1">⚠️</span><span>$1</span></li>')
    .replace(/^- (.+)$/gm, '<li class="mb-1">• $1</li>')
    .replace(/^\d+\. \*\*(.+?)\*\* — (.+)$/gm, '<li class="mb-2"><strong>$1</strong> — $2</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="mb-1">$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-violet-600 hover:underline font-medium" target="_blank" rel="noopener sponsored">$1</a>')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(Boolean).map(c => c.trim())
      if (cells.every(c => c.match(/^-+$/))) return ''
      const tag = cells[0]?.startsWith('**') ? 'th' : 'td'
      return `<tr>${cells.map(c => `<${tag} class="border px-3 py-2 text-sm">${c}</${tag}>`).join('')}</tr>`
    })
    .replace(/---/g, '<hr class="my-8 border-slate-200" />')
    .replace(/\n\n/g, '</p><p class="mb-4 text-slate-700 leading-relaxed">')
    .replace(/^(?!<[hluotra])(.+)$/gm, '<p class="mb-4 text-slate-700 leading-relaxed">$1</p>')

  const publishedDate = review.published_at
    ? new Date(review.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently'

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="container max-w-4xl px-4 py-8 md:py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-violet-600">Home</Link>
            <span>/</span>
            <Link href="/reviews" className="hover:text-violet-600">Reviews</Link>
            <span>/</span>
            {review.category_name && (
              <>
                <Link href={`/categories/${review.category_slug}`} className="hover:text-violet-600">
                  {review.category_name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-slate-700 truncate">{review.title}</span>
          </div>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {review.category_name && (
                <Badge className="bg-violet-100 text-violet-700">{review.category_name}</Badge>
              )}
              <Badge variant="outline" className="text-slate-500">
                <Clock className="mr-1 h-3 w-3" />
                {publishedDate}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {review.title}
            </h1>
            {review.subtitle && (
              <p className="text-lg text-slate-600 leading-relaxed">
                {review.subtitle}
              </p>
            )}
            <div className="mt-4 text-sm text-slate-500">
              By <span className="font-medium text-slate-700">{review.author}</span>
            </div>
          </header>

          {/* Content */}
          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {/* Back */}
          <div className="mt-12 pt-8 border-t">
            <Link href="/reviews" className="inline-flex items-center text-violet-600 hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to all reviews
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
