import blogData from '../data/i4l_blog.json';
import ReactMarkdown from 'react-markdown';
import '../styles/blog.css';

export default function Blog() {
  return (
    <main className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen space-y-10">
      {blogData.map((post, index) => (
        <article key={index} className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <img
              src={post.main_image}
              alt={post.headline}
              className="w-full h-auto rounded-md mb-4"
            />
            <p className="text-sm text-gray-500 mb-2">
              {new Date(post.publish_date + 'T00:00:00').toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC'
              })}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              {post.headline}
            </h1>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6">
              {post.subheader}
            </h2>
            <div className="prose prose-lg max-w-none prose-gray">
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => <p className="text-gray-800" {...props} />,
                  strong: ({ node, ...props }) => <strong className="text-gray-800" {...props} />,
                  a: ({ node, ...props }) => <a className="text-indigo-600 hover:text-indigo-800" {...props} />
                }}
              >
                {post.blog_text}
              </ReactMarkdown>
            </div>
          </div>
        </article>
      ))}
    </main>
  );
} 