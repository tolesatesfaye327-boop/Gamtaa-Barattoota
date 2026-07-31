import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const values = [
  {
    title: "Amanamummaa",
    desc: "Boca hojii keenyaa hundakeessatti dhugaa fi iftoomina sadarkaa olaanaa eega.",
  },
  {
    title: "Ga'umsa",
    desc: "Karoora fi sagantaa hunda keessatti sadarkaa olaanaa milkeessuu barbaanna.",
  },
  {
    title: "Tokkummaa",
    desc: "Humna walii galuuti fi hariiroo cimaa ijaaruu keessatti amanna.",
  },
  {
    title: "Tajaajila",
    desc: "Miseensota keenya fi hawaasa bal'aa tajaajiluuf of kenninee jirra.",
  },
  {
    title: "Hooggansa",
    desc: "Hooggantoota jijjiirama fidani fi guddina oofan leenjisnaa fi cimna.",
  },
  {
    title: "Garagarummaa",
    desc: "Ilaalcha garagaraa fudhannaafi carraa wal-qixaa hundumaaf mijeessina.",
  },
];

const goals = [
  {
    title: "Rakkoo Muudatu Hir'isuuf",
    description:
      "Barattoota haaraa odeeffannoo doormii, galmee fi tajaajila mooraa kennuun rakkoo jalqabaa hir'isuu.",
  },
  {
    title: "Tokkummaa Barattootaa Jabeessuuf",
    description:
      "Barattoota ganda gara garaa irraa dhufan wal baruun tokkummaa fi gargaarsa waloo cimsuu.",
  },
  {
    title: "Jaalala fi Wal-gargaarsa",
    description:
      "Hariiroo jaalalaa fi walii-gargaarsa barattoota gidduutti uumuun rakkoo keessoo waliitti himachuu.",
  },
  {
    title: "Barnoota Irratti Ga'umsa",
    description:
      "Kuusaalee barumsaa, gorsa qormaataa fi wal-barsiisa mijeessuun milkaa'ina barnootaa guddisuu.",
  },
  {
    title: "Gargaarsa Hawaasaa",
    description:
      "Yeroo gaddaa fi gammachuu, akkasumas rakkoo qabeenyaa irratti beenyaan fi beekumsaan wal tumsuu.",
  },
  {
    title: "Seera Mooraa Hubachiisuuf",
    description:
      "Barattoota haaraaf dambii ittiin bulmaata yuunivarsiitichaa ifsuun akka seera eegan gargaaruu.",
  },
];

const services = [
  {
    title: "Gargaarsa Barnootaa",
    desc: "Barattoota keenyaaf gargaarsa barnootaa, meeshaalee barumsaa fi qajeelfama kennuun milkaa'ina isaanii argisiifna.",
  },
  {
    title: "Gorsa fi Qajeelfama",
    desc: "Barattoota sadarkaa olaanaa irraa gorsa fi qajeelfama kennuun karaa isaanii qajeelchuuf tattaafanna.",
  },
  {
    title: "Walitti Dhufeenya Hawaasaa",
    desc: "Walgahii fi sagantaa adda addaa karaa tassine barattoonni wal baranii fi tokkummaa isaanii cimsu.",
  },
  {
    title: "Tajaajila Hawaasaa",
    desc: "Ganda keenya keessatti tajaajila hawaasaa kennuun hawaasa irratti dhiibbaa gaarii uumuu barbaanna.",
  },
];

const districts = [
  "Sanbarroo Saggoo",
  "Haroo Booroo",
  "Tulii Dasee",
  "Caancoo Birrattee",
  "Biyyoo Wagiddii",
  "Reejjii Mokodaa",
  "Bulchiinsa Magaalaa Mugar",
  "Ulaa Goraa",
  "Gaattiraa Nabee",
  "Bishaan Diimoo",
  "Bulchiinsa Magaalaa Incinnii",
  "Ejeree Nagawoo",
  "Iluu Daansee",
  "Iluu Muxxee",
  "Dirree Madaallee",
  "Odaa Daalotaa",
  "Itayyaa",
  "Warra Iluu",
  "Siree Bargaa",
  "Haroo Leemman",
];

const secondaryLinks = [
  { to: "/galata", label: "Thanksgiving", desc: "Galataa fi kabajaa" },
  { to: "/ergaa", label: "Brief Message", desc: "Ergaa gabaabaa" },
  { to: "/koreewwan", label: "Committees", desc: "Koreewwan gamtaa" },
];

export default function About() {
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible((p) => ({ ...p, [entry.target.id]: true }));
          }
        }
      },
      { threshold: 0.1 },
    );
    const els = document.querySelectorAll("[data-anim]");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const animClass = (id: string) =>
    `transition-all duration-700 ease-out ${
      visible[id] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-16 sm:py-20 px-4">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium tracking-wide text-blue-200 mb-3">
            GBAABW · Hundeeffame 2018
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-white">
            Waa&apos;ee Keenya
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
            Barattoota Ada&apos;aa Bargaa Yuunivarsiitii Haramaayaa walitti qabuu,
            cimsuu fi bakka bu&apos;uuf.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div
          id="mission-vision"
          data-anim
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 ${animClass("mission-vision")}`}
        >
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              Kaayyoo
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base sm:text-lg">
              Barattoota Ada&apos;aa Bargaa Yuunivarsiitii Haramaayaa qabeenya,
              hariiroo fi carraa barbaachisan mijeessuun ogummaa isaanii
              keessatti milkaa&apos;uu fi hawaasa isaanii irratti dhiibbaa gaarii
              uumuuf.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              Mul&apos;ata
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base sm:text-lg">
              Barataan Ada&apos;aa Bargaa hundinuu gargaarsa, hariiroo fi carraa
              barbaachisan argatee dandeettii isaa guutuu fi guddina waliigalaa
              fiduu danda&apos;u.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900/50 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2
            id="goals-heading"
            data-anim
            className={`text-3xl sm:text-4xl font-bold text-center mb-4 ${animClass("goals-heading")}`}
          >
            Kaayyooolee Keenya
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-xl mx-auto mb-8 sm:mb-12">
            Kaayyoon gamtichaa barattoota waliin gargaaruu fi tokkummaa cimsuudha
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {goals.map((g, i) => (
              <div
                key={g.title}
                id={`goal-${i}`}
                data-anim
                className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-5 sm:p-6 ${animClass(`goal-${i}`)}`}
              >
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2 mb-2">
                  {g.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {g.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2
            id="services-heading"
            data-anim
            className={`text-3xl sm:text-4xl font-bold text-center mb-4 ${animClass("services-heading")}`}
          >
            Tajaajila
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-xl mx-auto mb-8 sm:mb-12">
            Tajaajila fi gargaarsa gamtaan keenya kennu
          </p>
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
            {services.map((s, i) => (
              <div
                key={s.title}
                id={`svc-${i}`}
                data-anim
                className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8 ${animClass(`svc-${i}`)}`}
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {s.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900/50 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2
            id="values-heading"
            data-anim
            className={`text-3xl sm:text-4xl font-bold text-center mb-4 ${animClass("values-heading")}`}
          >
            Bu&apos;uura Keenya
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-xl mx-auto mb-8 sm:mb-12">
            Hojii keenya hundaa kan nu qajeelchu bu&apos;uuralee
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {values.map((v, i) => (
              <div
                key={v.title}
                id={`val-${i}`}
                data-anim
                className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-5 sm:p-6 ${animClass(`val-${i}`)}`}
              >
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {v.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2
            id="districts-heading"
            data-anim
            className={`text-3xl sm:text-4xl font-bold text-center mb-4 ${animClass("districts-heading")}`}
          >
            Naannoo Keenya
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-xl mx-auto mb-8">
            Gandoota fi bulchiinsa Aanaa Ada&apos;aa Bargaa keessaa miseensonni
            keenya dhufan
          </p>
          <div
            id="districts-grid"
            data-anim
            className={`flex flex-wrap justify-center gap-2 sm:gap-3 ${animClass("districts-grid")}`}
          >
            {districts.map((d) => (
              <span
                key={d}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900/50 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Dabalataan Dubbisi
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-xl mx-auto mb-8">
            Fuulaalee dabalataa waa&apos;ee gamtaa keenyaa
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {secondaryLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-5 hover:border-primary-500/40 transition-colors"
              >
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {link.label}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {link.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-12 sm:py-16 px-4">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-white">
            Hawaasa Keenyatti Makamuu
          </h2>
          <p className="text-base sm:text-lg text-blue-100/90 mb-6 sm:mb-8">
            Miseensa gamtaa barattoota Ada&apos;aa Bargaa ta&apos;iitii hiriyyaa haaraa
            argadhu.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-block px-8 py-3 bg-white text-indigo-800 font-bold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Har&apos;a Galmee
            </Link>
            <Link
              to="/contact"
              className="inline-block px-8 py-3 border border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              Nu Qunnami
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
