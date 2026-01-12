
import { getPostBySlug } from '@/lib/blog-posts';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="prose dark:prose-invert max-w-none animate-fade-in">
      <article className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <Link href="/blog" className="text-primary hover:underline no-underline mb-8 block">&larr; Back to Blog</Link>
        <h1 className="text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
        <p className="text-sm text-muted-foreground"><em>Posted on: {post.date}</em></p>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </div>
  );
}
