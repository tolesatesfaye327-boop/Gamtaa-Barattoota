export default function Developers() {
  const developer = {
    name: "Tolesa Tesfaye",
    role: "Full-Stack Developer",
    bio: [
      "Tolesa Tesfaye is a passionate full-stack developer who designed and built this entire platform from the ground up — from concept and architecture to implementation and deployment.",
      "With a strong focus on clean, maintainable code and user-centered design, he crafts modern web applications that are fast, accessible, and reliable. This platform is a reflection of his commitment to using technology to serve and unite the community.",
    ],
    portfolio: "https://my-portfolio-lastport.vercel.app/",
    photo: "/profile/developer.jpg",
    skills: [
      "React & TypeScript",
      "Node.js & Express",
      "MongoDB",
      "UI/UX Design",
    ],
  };

  const evaluators = [
    {
      name: "Aster Ketahema",
      role: "Lead Evaluator",
      photo: "/profile/Picture31.png",
      bio: "Aster Ketahema is a meticulous evaluator who reviewed the platform's functionality, usability, and overall quality. Her attention to detail and constructive feedback were instrumental in refining the user experience.",
      skills: ["Quality Assurance", "Usability Testing", "Feedback & Review"],
    },
    {
      name: "Washun Tefari",
      role: "Technical Evaluator",
      photo: "/profile/Picture21.png",
      bio: "Washun Tefari assessed the technical architecture, performance, and reliability of the platform. His deep understanding of software systems helped ensure the application is robust, secure, and scalable.",
      skills: ["System Architecture", "Performance", "Security Review"],
    },
    {
      name: "Pinel Bacha",
      role: "Design Evaluator",
      photo: "/profile/Picture26.png",
      bio: "Pinel Bacha reviewed the visual design, accessibility, and overall aesthetic of the platform. His eye for design and user-centered thinking helped elevate the interface to be both beautiful and intuitive.",
      skills: ["UI/UX Review", "Accessibility", "Visual Design"],
    },
  ];

  const spellingCheckers = [
    {
      name: "Birhanuu Galata",
      role: "Lead Spelling Checker",
      photo: "/profile/Picture17.png",
      bio: "Birhanuu Galata meticulously reviewed all the content across the platform for spelling and grammatical accuracy. His careful attention to language helped ensure the text is clear, correct, and professional.",
      skills: ["Spell Checking", "Grammar Review", "Proofreading"],
    },
    {
      name: "Tolesa Kebbede",
      role: "Content Spelling Checker",
      photo: "/profile/Picture25.png",
      bio: "Tolesa Kebbede reviewed the platform's content for spelling errors and linguistic correctness. His thorough reading of every page ensured the information is presented accurately and professionally.",
      skills: ["Spell Checking", "Linguistic Review", "Accuracy"],
    },
    {
      name: "Naafyad Tammiru",
      role: "Language Spelling Checker",
      photo: "/profile/Picture20.png",
      bio: "Naafyad Tammiru verified the spelling and language quality of the platform's content. His careful review helped ensure that all text is clear, consistent, and free of errors.",
      skills: ["Spell Checking", "Language Review", "Consistency"],
    },
  ];

  const supporters = [
    {
      name: "Tesfaye Abebe",
      role: "Ideal Supporter",
      photo: "/profile/Picture12.png",
      bio: "Tesfaye Abebe has been a steadfast supporter of the platform, offering encouragement and guidance throughout its development. His belief in the mission and willingness to help have been invaluable to the team.",
      skills: ["Encouragement", "Guidance", "Community Support"],
    },
    {
      name: "Hacaluu Birhanuu",
      role: "Ideal Supporter",
      photo: "/profile/Picture7.png",
      bio: "Hacaluu Birhanuu provided unwavering support and thoughtful input during the building of this platform. His dedication to the community and constructive contributions helped shape the final result.",
      skills: ["Dedication", "Constructive Input", "Community Support"],
    },
    {
      name: "Abdii Chala",
      role: "Ideal Supporter",
      photo: "/profile/Picture22.png",
      bio: "Abdii Chala supported the project with enthusiasm and practical assistance. His positive energy and readiness to help made a meaningful difference in bringing this platform to life.",
      skills: ["Enthusiasm", "Practical Help", "Team Spirit"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Compact Header */}
      <div className="relative bg-gradient-to-br from-indigo-700 via-purple-800 to-violet-900 dark:from-indigo-900 dark:via-purple-950 dark:to-gray-900 py-14 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-16 -left-16 w-56 h-56 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs sm:text-sm font-medium tracking-wide">
            Developers & Collaborators
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            THE TEAM
          </h1>
          <p className="text-sm sm:text-base text-indigo-200 max-w-xl mx-auto leading-relaxed mt-3">
            The people behind this platform — those who built it, evaluated it,
            and ensured its quality.
          </p>
        </div>
      </div>

      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Developer Card — Compact Professional */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Compact Hero Image */}
              <div className="md:w-2/5 min-h-[200px] sm:min-h-[280px] md:min-h-[340px] relative">
                <img
                  src={developer.photo}
                  alt={developer.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:bg-gradient-to-r md:from-transparent md:to-white dark:md:to-gray-800"></div>
              </div>
              {/* Content */}
              <div className="md:w-3/5 flex items-center p-6 sm:p-8 md:p-10">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wide mb-3">
                    Full-Stack Developer
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {developer.name}
                  </h2>
                  <div className="space-y-3 mb-4">
                    {developer.bio.map((paragraph, i) => (
                      <p
                        key={i}
                        className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {developer.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <a
                    href={developer.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                      />
                    </svg>
                    View Portfolio
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Evaluators */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 overflow-hidden">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Evaluators
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base ml-11">
                The evaluators who reviewed and assessed the platform to ensure
                it meets the highest standards.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {evaluators.map((evaluator) => (
                  <div
                    key={evaluator.name}
                    className="group bg-emerald-50/70 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20 hover:-translate-y-0.5"
                  >
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-full ring-2 ring-emerald-200 dark:ring-emerald-800 overflow-hidden flex-shrink-0">
                        <img
                          src={evaluator.photo}
                          alt={evaluator.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                          {evaluator.name}
                        </h3>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                          {evaluator.role}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed text-xs sm:text-sm">
                      {evaluator.bio}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {evaluator.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spelling Checkers */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 overflow-hidden">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Spelling Checkers
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base ml-11">
                The spelling checkers who reviewed the content for accuracy and
                correctness.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {spellingCheckers.map((checker) => (
                  <div
                    key={checker.name}
                    className="group bg-amber-50/70 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/50 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-amber-100 dark:hover:shadow-amber-900/20 hover:-translate-y-0.5"
                  >
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-full ring-2 ring-amber-200 dark:ring-amber-800 overflow-hidden flex-shrink-0">
                        <img
                          src={checker.photo}
                          alt={checker.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                          {checker.name}
                        </h3>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[11px] font-semibold">
                          {checker.role}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed text-xs sm:text-sm">
                      {checker.bio}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {checker.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ideal Supporters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 overflow-hidden">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-sky-600 dark:text-sky-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Ideal Supporters
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base ml-11">
                The supporters who encouraged and stood behind the platform
                throughout its journey.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {supporters.map((supporter) => (
                  <div
                    key={supporter.name}
                    className="group bg-sky-50/70 dark:bg-sky-900/10 rounded-2xl border border-sky-100 dark:border-sky-900/50 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-sky-100 dark:hover:shadow-sky-900/20 hover:-translate-y-0.5"
                  >
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-full ring-2 ring-sky-200 dark:ring-sky-800 overflow-hidden flex-shrink-0">
                        <img
                          src={supporter.photo}
                          alt={supporter.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                          {supporter.name}
                        </h3>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-[11px] font-semibold">
                          {supporter.role}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed text-xs sm:text-sm">
                      {supporter.bio}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {supporter.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg italic">
              "Galata guddaa warra hojii kana keessatti qooda fudhataniif —
              tokkummaan humna."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
