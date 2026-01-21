import Link from 'next/link';
import Image from 'next/image';
import { Brain, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { getArticles, formatArticleDate } from '@/lib/wordpress/client';
import { ArticleListItem } from '@/lib/wordpress/types';

/**
 * Server component that fetches and displays the latest 3 articles
 * Used on the home page to promote the articles section
 */
export default async function LatestArticles() {
  let articles: ArticleListItem[] = [];

  try {
    const result = await getArticles(3);
    articles = result.articles;
  } catch (error) {
    console.error('Failed to fetch latest articles:', error);
    return null; // Fail silently - don't break the home page
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-slate-200">
            <BookOpen size={14} />
            Latest Insights
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            From the Cortex Blog
          </h2>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            Strategies, frameworks, and deep dives into making better financial decisions.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group"
            >
              <article className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:border-indigo-300 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                {/* Featured Image */}
                {article.featuredImage ? (
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <Image
                      src={article.featuredImage.url}
                      alt={article.featuredImage.alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <Brain size={48} className="text-indigo-300" />
                  </div>
                )}

                <div className="p-6 flex flex-col flex-grow">
                  {/* Categories */}
                  {article.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {article.categories.slice(0, 1).map((category) => (
                        <span
                          key={category.slug}
                          className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-lg font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow font-medium leading-relaxed">
                    {article.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
                    <span className="font-semibold">{formatArticleDate(article.date)}</span>
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock size={12} />
                      {article.readingTime} min read
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* CTA to Articles Page */}
        <div className="text-center">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-lg group"
          >
            Read All Articles
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
