import React from 'react';
import { motion } from 'motion/react';
import { USE_CASES_DATA } from './modals/ClauseGeneratorModal.tsx';

interface UseCasesSectionProps {
  onSelectUseCase: (caseKey: string) => void;
}

export default function UseCasesSection({ onSelectUseCase }: UseCasesSectionProps) {
  const cases = [
    {
      key: 'boilerplate',
      icon: 'fa-solid fa-file-contract text-blue-600',
      title: 'Create boilerplate clauses',
      desc: 'Draft standardized standard contract clauses and severability terms in seconds.',
    },
    {
      key: 'demand',
      icon: 'fa-solid fa-envelope-open-text text-indigo-600',
      title: 'Demand Letter',
      desc: 'Ask the bot to draft a letter formally requesting payment, cure, or dispute resolution.',
    },
    {
      key: 'compliance',
      icon: 'fa-solid fa-shield-halved text-emerald-600',
      title: 'Legal compliance',
      desc: 'Ensure compliance with regional jurisprudence, GDPR, and consumer privacy requirements.',
    },
    {
      key: 'termination',
      icon: 'fa-solid fa-file-signature text-rose-600',
      title: 'Termination Letter',
      desc: 'A formal written legal notice to end a contractual agreement with or without cause.',
    },
    {
      key: 'family',
      icon: 'fa-solid fa-people-roof text-amber-600',
      title: 'Prompts for family lawyers',
      desc: 'Stop manual searching for information with custom marital asset interrogatories.',
    },
    {
      key: 'caselaw',
      icon: 'fa-solid fa-scale-unbalanced text-purple-600',
      title: 'Case Law Finder',
      desc: 'Find binding case law and appellate precedents matching specific facts and defenses.',
    },
    {
      key: 'cease',
      icon: 'fa-solid fa-hand-dots text-red-600',
      title: 'Cease and Desist Letter',
      desc: 'Formal pre-litigation letter when somebody is infringing your intellectual property rights.',
    },
    {
      key: 'research',
      icon: 'fa-solid fa-magnifying-glass-chart text-teal-600',
      title: 'AI-boosted Research laws',
      desc: 'Survey laws in a particular state or international jurisdiction and receive a citation brief.',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider mb-4">
          <i className="fa-solid fa-diagram-project text-xs"></i> Use cases
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          Want more use cases?
        </h2>
        <p className="text-base sm:text-lg text-gray-600">
          See how ClauseCite expands its capabilities to meet all your professional and personal legal scenarios.
        </p>
      </div>

      {/* Use Case Grid with Outcrowd spring hover */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cases.map((item) => (
          <motion.div
            key={item.key}
            onClick={() => onSelectUseCase(item.key)}
            whileHover={{ y: -6, transition: { type: 'spring', stiffness: 350, damping: 25 } }}
            className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
            data-cursor="Draft"
          >
            <div>
              <i className={`${item.icon} text-xl mb-3.5 block group-hover:scale-110 transition-transform`}></i>
              <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-400 group-hover:text-blue-600 transition-colors">
              <span>Generate Template</span>
              <span>→</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
