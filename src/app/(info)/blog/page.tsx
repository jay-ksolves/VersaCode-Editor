
import Link from 'next/link';
import { posts } from '@/lib/blog-posts';

export default function BlogPage() {
  return (
    <div className="prose dark:prose-invert max-w-none animate-fade-in">
      <h1 className="text-4xl font-bold tracking-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>VersaCode Blog</h1>
      
      {posts.map((post, index) => (
         <article key={post.id} className="mb-12 animate-slide-up" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
            <h2 className="text-2xl font-semibold tracking-tight mb-2">
            <Link href={`/blog/${post.slug}`} className="text-inherit hover:text-primary no-underline">{post.title}</Link>
            </h2>
            <p className="text-sm text-muted-foreground"><em>Posted on: {post.date}</em></p>
            <p>{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className="text-primary hover:underline">Read more...</Link>
        </article>
      ))}

    </div>
  );
}
