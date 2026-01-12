
export interface BlogPost {
    id: number;
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    content: string;
}

export const posts: BlogPost[] = [
    {
        id: 1,
        slug: 'the-vision-for-versacode',
        title: 'The Vision for VersaCode: An AI-Native IDE',
        date: '2024-07-26',
        excerpt: 'In a world where development is increasingly collaborative and cloud-based, the need for a powerful, accessible, and AI-native web IDE has never been greater. VersaCode was born from this vision...',
        content: `
            <p>In a world where development is increasingly collaborative and cloud-based, the need for a powerful, accessible, and AI-native web IDE has never been greater. VersaCode was born from this vision: to create an open-source tool that combines the best of desktop editors like VS Code with the flexibility of the web and the power of generative AI.</p>
            <h3>Our Core Philosophy</h3>
            <ul>
                <li><strong>Open & Extensible:</strong> We believe in the power of community. The IDE is built with a modular architecture that allows anyone to contribute new features and extensions.</li>
                <li><strong>AI at the Center:</strong> Generative AI isn't just an add-on; it's a core part of the development workflow, from code generation to intelligent suggestions and debugging.</li>
                <li><strong>Frictionless Experience:</strong> Get started in seconds, right from your browser. No complex local setup, no heavy downloads. Just a URL and your creativity.</li>
            </ul>
            <p>Our journey is just beginning. We are committed to building a platform that is not only a great tool but also a thriving open-source community. We invite you to join us in building the future of code editing.</p>
        `
    },
    {
        id: 2,
        slug: 'under-the-hood-nextjs-monaco',
        title: 'Under the Hood: Building a Web IDE with Next.js and Monaco',
        date: '2024-07-20',
        excerpt: 'Ever wondered what it takes to build a web-based IDE? In this post, we\'ll dive into the technical architecture of VersaCode, exploring how we leverage the Next.js App Router and the powerful Monaco Editor.',
        content: `
            <p>Ever wondered what it takes to build a web-based IDE? In this post, we'll dive into the technical architecture of VersaCode, exploring how we leverage modern web technologies to create a responsive and performant user experience.</p>
            <h3>The Tech Stack</h3>
            <p>The foundation of VersaCode is built on a few key technologies:</p>
            <ul>
                <li><strong>Next.js App Router:</strong> This allows us to create a hybrid application with both server-rendered pages (like this blog) and a highly interactive client-side application for the IDE itself.</li>
                <li><strong>Monaco Editor:</strong> This is the open-source editor that powers VS Code. It provides a rich, professional editing experience with syntax highlighting, IntelliSense, and much more, right in the browser.</li>
                <li><strong>Genkit:</strong> For our AI features, we use Genkit with the Google AI plugin. This allows us to easily create and manage server-side AI flows for code generation and suggestions.</li>
                <li><strong>Origin Private File System (OPFS):</strong> This is a modern browser API that gives us a high-performance, persistent file system directly in the browser, ensuring user's work is saved securely.</li>
            </ul>
            <p>By combining these technologies, we can build a complex, desktop-like application that runs entirely in the browser, offering a powerful and accessible development environment for everyone.</p>
        `
    }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
    return posts.find(post => post.slug === slug);
}
