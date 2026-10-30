import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { ArticleData } from './modals/BlogModal.tsx';

interface BlogSectionProps {
  onSelectArticle: (article: ArticleData) => void;
}

export default function BlogSection({ onSelectArticle }: BlogSectionProps) {
  const articles: ArticleData[] = [
    {
      id: 'blog-1',
      title: 'Child Travel Consent & Minor Travel Authorization: Full Guide',
      date: 'Feb 17, 2026',
      readTime: '21 min read',
      category: 'Insights',
      imageUrl: '/assets/aistudio/image_703e7931.png',
      summary:
        'A comprehensive legal analysis of domestic and international minor travel authorizations, parental custody stipulations, and mandatory border control affidavits.',
      paragraphs: [
        'When a minor travels across international borders without both biological or legal parents, customs border enforcement agencies (such as US Customs and Border Protection - CBP) strongly enforce written verification of parental consent to mitigate international child abduction risks under the Hague Convention.',
        'A legally enforceable Child Travel Consent Letter must explicitly cite the non-accompanying parent’s full contact information, certified notarized signature, flight itinerary, designated adult guardian details, and temporary medical emergency treatment authorization.',
        'ClauseCite allows parents to draft, customize, and verify multi-jurisdiction travel affidavits in seconds, complete with Hague Apostille formatting guidelines.',
      ],
    },
    {
      id: 'blog-2',
      title: 'Online Divorce Guide: Forms, Filing Steps & Free Divorce Papers (2026)',
      date: 'Apr 22, 2026',
      readTime: '18 min read',
      category: 'Insights',
      imageUrl: '/assets/aistudio/image_233d95d2.png',
      summary:
        'Everything you need to know about navigating uncontested divorce, marital settlement agreements, equitable property division, and automated court filings.',
      paragraphs: [
        'Uncontested marital dissolution has been fundamentally modernized by AI legal assistance. When spouses mutually agree on asset division, spousal maintenance, and parental responsibility, retainers can be avoided while maintaining judicial compliance.',
        'Essential filings include the Summons, Verified Complaint for Dissolution, Preliminary Financial Disclosures, and the Marital Settlement Agreement (MSA). Each jurisdiction maintains unique mandatory waiting periods, ranging from 30 days to 6 months.',
        'With ClauseCite, couples can audit their financial schedules, eliminate contradictory covenants, and ensure both parties retain equitable distribution under state domestic relations codes.',
      ],
    },
    {
      id: 'blog-3',
      title: 'How Much Does a DUI Lawyer Cost in 2026? ($1,500–$10,000+ Fees)',
      date: 'Oct 14, 2026',
      readTime: '30 min read',
      category: 'Insights',
      imageUrl: '/assets/aistudio/image_296b9a10.png',
      summary:
        'An empirical breakdown of defense attorney retainers, plea negotiation costs, DMV administrative license hearings, and evidentiary chemical test challenges.',
      paragraphs: [
        'Defense representation costs vary significantly based on whether a charge is categorized as a first-offense misdemeanor or an aggravated felony involving property damage or bodily harm.',
        'Standard fee structures typically include a flat pre-trial retainer ($2,500–$5,000) covering arraignment, discovery motion practice (Brady motions, breathalyzer calibration logs), and DMV administrative hearings, with trial fees billed separately per diem.',
        'Understanding statutory mandatory minimums, ignition interlock requirements, and discovery synthesis enables defendants to negotiate informed plea resolutions and protect their driving privileges.',
      ],
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24" id="blog">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider mb-4">
          <i className="fa-solid fa-newspaper text-xs"></i> Blog
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          More about Legal AI market
        </h2>
        <p className="text-base sm:text-lg text-gray-600">
          Expert advice and news from our legal editorial desk to stay up-to-date on latest trends.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map((post) => (
          <motion.article
            key={post.id}
            onClick={() => onSelectArticle(post)}
            whileHover={{ y: -6, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
            className="bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-shadow group cursor-pointer flex flex-col justify-between"
            data-cursor="Read"
          >
            <div>
              <div className="h-48 overflow-hidden bg-gray-100 relative">
                <img
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={post.imageUrl}
                />
              </div>

              <div className="p-6">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-2">
                  <i className="fa-solid fa-bolt text-[10px]"></i> {post.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-3">
                  {post.title}
                </h3>
              </div>
            </div>

            <div className="px-6 pb-6 pt-0 flex items-center justify-between text-xs text-gray-400 border-t border-gray-100/60 pt-3">
              <span>{post.date}</span>
              <span className="text-gray-500 font-medium">{post.readTime}</span>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="text-center mt-12">
        <button
          onClick={() => onSelectArticle(articles[0])}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-blue-600 transition cursor-pointer"
        >
          <span>Explore blog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
