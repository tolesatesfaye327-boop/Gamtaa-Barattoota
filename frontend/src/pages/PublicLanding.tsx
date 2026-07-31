import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const counterTargets = [
  { label: "Miseensota", value: 300 },
  { label: "Sagantaa", value: 42 },
  { label: "Walgahii", value: 18 },
  { label: "Koreewwan", value: 5 },
];

const upcomingEvents = [
  {
    title: "Walgahii Barattoota Haaraa",
    date: "Aug 12",
    location: "Haramaya Campus Hall",
    description:
      "Barattoota haaraa simachuun wal-barsiisuu fi qajeelfama kennuu.",
  },
  {
    title: "Leenjii Ogummaa Dijitaalaa",
    date: "Aug 20",
    location: "ICT Lab",
    description: "CV, LinkedIn fi portfolio ijaaruu irratti leenjii.",
  },
  {
    title: "Guyyaa Aadaa Oromoo",
    date: "Sep 03",
    location: "Main Auditorium",
    description: "Aadaa, afaan fi seenaa keenya waliin kabajuu.",
  },
];

const testimonials = [
  {
    name: "Bontu Tadesse",
    role: "Student, 3rd Year",
    quote:
      "Gamtaan kun naaf karaa banaa taeera. Hiriyoota gaarii argadhe, barnoota keessattis deeggarsa guddaa naaf godhe.",
  },
  {
    name: "Dawit Girma",
    role: "Alumni",
    quote:
      "Yeroon barataa turetti hojii gamtaa keessatti hirmaachuun ogummaa hoggansaa fi hojii garee naaf jabeesse.",
  },
  {
    name: "Hana Abdulahi",
    role: "Student, 2nd Year",
    quote:
      "Sagantaaleen ogummaa fi qajeelfamni gamtaa keenyaa barnoota koo keessatti akka ofitti amanamummaa qabaadhu na gargaare.",
  },
];

const features = [
  {
    title: "Walgargaarsa Barumsaa",
    desc: "Barattoota waliif gargaarsa barnootaa kennuu fi qabxii wal qooduun qormaata keessatti milkaauu dandeessu.",
  },
  {
    title: "Guddina Ogummaa",
    desc: "Leenjii fi oddubbii adda addaa qopheessinee barattootni ogummaa isaanii ittiin guddisuu dandaan.",
  },
  {
    title: "Aadaa fi Afaan Oromoo",
    desc: "Aadaa fi afaan keenya kabajuu fi tumsuun dhaloota itti aanuuf dhaamsa isaanii dabarsuu barbaanna.",
  },
  {
    title: "Tajaajila Hawaasaa",
    desc: "Ganda keenya keessatti tajaajila fi gargaarsa hawaasaa kennuun hawaasa irratti dhiibbaa gaarii uumuu barbaanna.",
  },
  {
    title: "Gorsa fi Qajeelfama",
    desc: "Barattoota sadarkaa olaanaatti geessan gorsa fi qajeelfama kennuun warra itti aanuuf karaa banuu barbaanna.",
  },
  {
    title: "Meeshaalee Barumsaa",
    desc: "Meeshaalee barnootaa, yaadanno fi qajeelfama barumsaa qopheessinee isiniif dhiheessina.",
  },
];

export default function PublicLanding() {
  const [counts, setCounts] = useState(counterTargets.map(() => 0));

  useEffect(() => {
    let currentStep = 0;
    const totalSteps = 40;

    const interval = setInterval(() => {
      currentStep += 1;
      setCounts(
        counterTargets.map(({ value }) =>
          Math.min(value, Math.round((value * currentStep) / totalSteps)),
        ),
      );

      if (currentStep >= totalSteps) {
        clearInterval(interval);
      }
    }, 35);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-dark-bg">
      <section className="relative flex items-center justify-center overflow-hidden py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
        <div className="absolute top-10 left-[-5rem] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-[-8rem] h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8 sm:mb-10">
            <img
              src="/asset/Picture1.png"
              alt="GBAABW Logo"
              className="relative mx-auto w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full border-4 border-white/30 shadow-2xl"
            />
          </div>
          <p className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs sm:text-sm font-medium tracking-wide">
            Hundeeffame Bara 2018
          </p>
          <h1 className="mx-auto max-w-4xl text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.15] mb-5 sm:mb-6 tracking-tight px-1">
            Gamtaa Barattoota
            <span className="block text-blue-200">Aanaa Ada&apos;aa Bargaa</span>
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-white/75 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-1">
            Tokkummaan nu walitti qabu barattoota Ada&apos;aa Bargaa Yuunivarsiitii
            Haramaayaa keessatti wal baruuf, wal gargaaruu fi wal jajjabeessuuf
            dhaabbatan.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none mx-auto">
            <Link
              to="/waaee"
              className="btn-primary w-full sm:w-auto px-8 py-3.5 min-h-[48px] text-base"
            >
              Waa&apos;ee Keenya
            </Link>
            <Link
              to="/register"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3.5 min-h-[48px] border-2 border-white/30 text-white font-semibold text-base rounded-xl hover:bg-white/10 transition-all"
            >
              Miseensa Ta&apos;i
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-white dark:bg-dark-bg border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {counterTargets.map((item, index) => (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-5 text-center"
              >
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {counts[index]}+
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Waan Nu Hojjennu
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Barattoota Ada&apos;aa Bargaa Yuunivarsiitii Haramaayaa gidduu gamtaa,
              walgargaarsa fi guddina ogummaa mirkaneessuuf tattaafanna.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {features.map((item) => (
              <div
                key={item.title}
                className="glass-card p-6 sm:p-8 rounded-2xl"
              >
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Upcoming Events
              </h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Sagantaalee dhufu keessatti hirmaadhu.
              </p>
            </div>
            <Link
              to="/events"
              className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              All events →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {upcomingEvents.map((event) => (
              <article
                key={event.title}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6"
              >
                <div className="inline-flex rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 text-xs font-semibold">
                  {event.date}
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                  {event.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {event.location}
                </p>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  {event.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="rounded-2xl overflow-hidden">
              <img
                src="/background/Picture37.png"
                alt="GBAABW Community"
                className="w-full h-auto object-cover aspect-[4/3]"
              />
            </div>
            <div className="max-w-lg">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-5">
                Waa&apos;ee Gamtaa
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base sm:text-lg mb-6">
                Gamtaa Barattoota Aanaa Ada&apos;aa Bargaa bara 2018tti hundeeffame.
                Kaayyoon keenaa barattoota Ada&apos;aa Bargaa Yuunivarsiitii
                Haramaayaa keessatti walitti qabuu fi waliif gargaarsa kennuudha.
              </p>
              <Link
                to="/waaee"
                className="inline-flex text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                Learn more about us →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              What Members Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-6"
              >
                <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.role}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
            Qophii Gamtaa Keenyatti Makamuu?
          </h2>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
            Gamtaa barattoota Ada&apos;aa Bargaa keessatti hiriyyaa haaraa argachuu
            fi wal gargaaruun barumsa keessanitti milkaauu dandeessu.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/register"
              className="btn-primary px-8 py-3.5 text-base"
            >
              Miseensa Ta&apos;i
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              Nu Qunnami
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
