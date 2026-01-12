import Link from 'next/link';

export default function BlogPage() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>VersaCode Blog</h1>
      
      <article className="mb-12">
        <h2 className="mb-2">The Vision for VersaCode: An AI-Native IDE</h2>
        <p className="text-sm text-muted-foreground"><em>Posted on: 2024-07-26</em></p>
        <p>
          In a world where development is increasingly collaborative and cloud-based, the need for a powerful, accessible, and AI-native web IDE has never been greater. VersaCode was born from this vision: to create an open-source tool that combines the best of desktop editors like VS Code with the flexibility of the web and the power of generative AI.
        </p>
        <p>
          Our journey is just beginning. We are committed to building a platform that is not only a great tool but also a thriving open-source community. We invite you to join us in building the future of code editing.
        </p>
        <Link href="#" className="text-primary hover:underline">Read more...</Link>
      </article>
      
      <article>
        <h2 className="mb-2">Under the Hood: Building a Web IDE with Next.js and Monaco</h2>
        <p className="text-sm text-muted-foreground"><em>Posted on: 2024-07-20</em></p>
        <p>
          Ever wondered what it takes to build a web-based IDE? In this post, we'll dive into the technical architecture of VersaCode, exploring how we leverage the Next.js App Router, server components, and the powerful Monaco Editor to create a responsive and performant user experience.
        </p>
        <Link href="#" className="text-primary hover:underline">Read more...</Link>
      </article>

    </div>
  );
}
