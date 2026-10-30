import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Scale, Shield, FileText } from 'lucide-react';
import { ArticleData } from './modals/BlogModal.tsx';

interface BlogSectionProps {
  onSelectArticle: (article: ArticleData) => void;
}

export default function BlogSection({ onSelectArticle }: BlogSectionProps) {
  const articles: ArticleData[] = [
    {
      id: 'blog-1',
      title: 'Tamil Nadu Stamp Act 2023 & E-Stamping Guide for Commercial Agreements',
      date: 'Oct 28, 2026',
      readTime: '12 min read',
      category: 'Statutory Compliance',
      imageUrl: '/assets/aistudio/image_703e7931.png',
      summary:
        'A comprehensive legal analysis of revised stamp duty schedules under the Tamil Nadu Stamp Act, mandatory registration under TNRRRLT Act 2017, and digital execution requirements.',
      paragraphs: [
        'Following recent legislative amendments to the Tamil Nadu Stamp Act, 1899 and the implementation of the Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act, 2017 (TNRRRLT Act), executing contracts on insufficient stamp paper risks impoundment under Section 33.',
        'Commercial leases, loan facilities, and general indemnity bonds now mandate graded ad-valorem duty calculations. Furthermore, documents executed electronically must comply with Section 10A of the Information Technology Act, 2000.',
        'ClauseCite automates stamp duty assessment across all 38 districts of Tamil Nadu, automatically inserting statutory attestation blocks and registration authority references.',
      ],
    },
    {
      id: 'blog-2',
      title: 'Post-Employment Non-Compete Enforceability under Section 27 (Indian Contract Act)',
      date: 'Oct 24, 2026',
      readTime: '15 min read',
      category: 'Judicial Precedents',
      imageUrl: '/assets/aistudio/image_233d95d2.png',
      summary:
        'Why Indian courts consistently declare post-termination non-compete covenants void ab initio, and how employers can legally safeguard trade secrets through confidentiality covenants.',
      paragraphs: [
        'Unlike common-law jurisdictions in the United Kingdom or New York that apply a "reasonableness" test, Section 27 of the Indian Contract Act, 1872 creates an unyielding statutory bar against any covenant restraining a person from exercising a lawful profession, trade, or business.',
        'In the landmark ruling of Percept D’Mark (India) (P) Ltd. v. Zaheer Khan (2006) 4 SCC 227, the Supreme Court unequivocally reiterated that the doctrine of restraint of trade applies to all post-employment restrictions without exception.',
        'ClauseCite’s Agreement Creator automatically flags invalid non-compete clauses and replaces them with enforceable confidentiality and non-solicitation provisions aligned with Section 72A of the IT Act.',
      ],
    },
    {
      id: 'blog-3',
      title: 'AI Contract Redlining: Catching Uncapped Liability & Asymmetric Covenants',
      date: 'Oct 19, 2026',
      readTime: '10 min read',
      category: 'Risk Engineering',
      imageUrl: '/assets/aistudio/image_296b9a10.png',
      summary:
        'An empirical breakdown of counterparty contract markups, unilateral indemnification risks, and how automated redlining protects enterprises from catastrophic dispute liabilities.',
      paragraphs: [
        'In corporate negotiations, counterparty legal counsel routinely attempts to introduce unilateral liability carve-outs, stripping away 12-month aggregate fee caps and expanding indemnity to include uncapped indirect losses.',
        'By utilizing ClauseCite’s dual-document redline engine, legal teams instantly detect altered indemnities, shifted arbitration seats, and truncated notice periods before signing.',
        'ClauseCite provides automated counsel recommendations, allowing teams to respond with balanced, market-standard compromise provisions within seconds.',
      ],
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24" id="blog">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider mb-4">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>Legal Intelligence Insights</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          Legal Insights & Jurisprudence
        </h2>
        <p className="text-base sm:text-lg text-gray-600">
          Statutory interpretations, regulatory alerts, and contract risk analysis from our legal research team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map((post) => (
          <motion.div
            key={post.id}
            onClick={() => onSelectArticle(post)}
            whileHover={{ y: -6, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
            className="bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-xl transition-shadow cursor-pointer group"
          >
            {/* Visual Header with Real Image & Overlay */}
            <div className="h-48 overflow-hidden relative bg-gray-900">
              <img
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                src={post.imageUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-blue-600 px-2.5 py-1 rounded-md shadow-sm">
                  {post.category}
                </span>
              </div>
            </div>

            {/* Post Information */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                  {post.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:underline">
                  Read Legal Analysis <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
