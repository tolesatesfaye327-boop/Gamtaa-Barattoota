import { useEffect, useState } from "react";

const goals = [
  {
    number: 1,
    title: "Rakkoo Muudatu Hir'isuuf",
    description:
      "Barattoonni haaraan maatii isaanii biraa bahanii gara mooraa yuunivarsiitii yeroo dhufan haaraa waan ta'aniif tajaajiloota tokko tokko hin beekani. Kanaafuu tajaajilli kunis kanneen akka iddoo nyaataa, lakkoofsa doormii, iddoo galmee fi galmee online itti agarsiisuudhaan rakkoowwan akka hin mudanne hir'isuun kaayyoo gamtaa kanaa keessaa isa tokkoodha. Fakkeenyaaf barataa haaraan tokko gara yuunivarsiitii gaafa dhufu yeroo galmee dabarsee argamnaan yuunivarsiitii sana irraa waan ari'amuuf kun immoo akka hin taaneef barataan dursee yuunivarsiiticha keessa jiru tokkummaa yoo qabaate, barataa haaraa sanaaf odeeffannoo guutuu kennuufi waan danda'uuf inni kun immoo rakkoo mudatu hir'isuuf kan gargaarudha. Kana malees barataan tokko gama fayyaa isaatiin akkasumas kan maatii kana malees rakkoo balaa tasaa osoo hin beekin mudachuu danda'u irratti jajjabeessuuf gargaara. Dabalataan immoo barataan yeroo department filatu akka carraa ta'ee department barbaadu sana yoo argachuu baate haaruudhaan dhiibbaa gara garaa kanneen akka dhiphina sammuu fi kkf keessa akka hin galle gorsuudhaaf kan gargaarudha.",
  },
  {
    number: 2,
    title: "Tokkummaa Barattootaa Jabeessuuf",
    description:
      "Tokkummaa barattootaa jabeessuu gaafa jennu barattoonni gaafa maatii isaanii biraa gara yuunivarsiitii dhufan ganda gara garaa irraa waan dhufaniif, akkasumas manneen barnootaa gara garaa irraa gara yuunivarsiitii yommuu dhufan akka isaan wal baranii tokkummaa isaanii daraan jabeessan isaan gargaara. Kunis immoo barattoonni kun akkuma iddoo gara garaa irraa dhufan asitti immoo wal baruun gama barumsaatiin gama gara garaatiin tokkummaa isaanii akka jabeessan isaan gargaara. Kun immoo kaayyoo gamtichaa keessa isa tokkodha. Kana malees hariiroo ykn marartee barattoota aanaa kanaa sirritti kan cimsuudha. Kunis immoo barattoonni tokkummaa asitti hubatan kana gaafa gara maatii isaanii biratti deebi'an aanaa sana keessatti fakkeenyummaa gaarii ta'e agarsiisuudhaaf kan gargaarudha. Akkasumas immoo jaalala hawaasummaa, tokkummaan humna guddaa ta'ee akka tajaajilu kan ittiin hubataniidha.",
  },
  {
    number: 3,
    title: "Jaalala Barattoota Gidduutti Jabeessuuf",
    description:
      "Jaalala barattoota gidduutti jabeessuu jechuun bu'aa walitti dhufeenyi kun qabu irraa kan ka'e hariiroo kanneen akka waliif yaaduu waliin socho'uu rakkoo keessoo walii waliitti himachuun walgargaruuf, fakkeenyaaf durbi tokko kan durba qofatti himattu akkasumas dhiirri tokko kan dhiira biratti himatu akkasumas kan waloo keenya irratti wal gargaaruu fi kkf jechudha. Akkasumas immoo hiikkaa tokkummaa hubachuudhaan barattoonni jaalala guddaa akka isaan waliif qabaatan kan godhuudha. Kana qofa otoo hin taane jaalala biyyaa, jaalala hawaasummaa akka isaan qabaatan kan taassisudha.",
  },
  {
    number: 4,
    title:
      "Barattoonni Maatii Biraa Fagaatanii Qofaa Isaanii Ta'uun Akka Itti Hin Dhagaa'amneef",
    description:
      "Barattoonni hamma kutaa 12 ffaatti yeroo baratan maatii isaanii bira taa'anii ykn immoo maatii isaanii itti dhiyoo jiraatanii kan baratanidha. Garuu gaafa gara yuunivarsiitii dhufan maatii isaanirraa fagaachuun hubatamaadha. Kunis immoo tokkummaan kana fakkaatu yoo jiraate barattoonni maatirraa fagaatanii qofaa ta'uu isaanii kan dhiphatan miti. Sababbiin isaatiyyuu barattoonni bifa gamtaa kanaan hiriiranii as keessatti waan argamaniif akka maatii isaanitti tokko ta'anii waliin akka jiraataniif kan gargaarudha. Fakkeenyaaf guyyoota ayyaanaa akkasumas immoo gara mana amantaa yeroo deeman qofaa isaanii akka hin taane tokkummaan kun kan isaan gargaarudha.",
  },
  {
    number: 5,
    title:
      "Barattoonni Barnoota Isaanii Irratti Ga'umsa Akka Qabaatanii fi Iddoo Guddaa Akka Ga'an Gochuuf",
    description:
      "Barattoonni haaraan gaafa gara mooraa dhufan barataan isaan dursu wantoota barnootaaf isaan barbaachisu; kuusaalee pdf koorsiiwwan gara garaa kaa'uudhaan ykn odeeffannoo sirrii isaaf kaa'uuf dabalataan immoo barattoonni muuxannoo qaban irratti walitti dhufanii akka isaan barnoota isaanii irratti wal wajjin qayyabataniif kan gargaarudha.",
  },
  {
    number: 6,
    title: "Gargaarsaaf",
    description:
      "Gargaarsa jechuun barattoonni yeroo gara mooraa dhufan mooricha keessatti wantoota barbaachisaa ta'e kanneen akka yaadaa akkasumas immoo yeroo barataan tokko mooraa keessaa gara maatii isaa bira galetti meeshaalee gara garaa barataa isa biraatiif barbaachisu maatii barataa sanaa irraa fideefi akka dhufuuf kan wal tumsu jechuudhaa. Dabalataan immoo barataan sababa qabeenyaatiif ykn maatiin isaa harka qalleessa ta'ee barnoota isaa irratti dhiibbaan yoo isa mudate gama barbaachisaa ta'een gargaaruu jechuudha. Gabaabumatti gargaarsi gaafa gaddaa gaafa gammachuu akkasumas yeroo kamiyyuu beenyaan, humnaan, beekumsaan, waanuma hundaan wal gargaaruu jechuudha.",
  },
  {
    number: 7,
    title: "Too'annoof",
    description:
      "Too'annoo jechuun barattoonni mooraa keessatti araada gara garaatiin akkasumas immoo iddoo hin barbaachifnetti akka isaan hin argamneef kan gargaarudha. Kan biraa immoo barataan tokko mooraa keessaa ba'ee iddoo hin barbaachifne akka hin deemneef kan ittiin barattoonni wal too'ataniidha. Gabaabumatti barattoonni kaayyoon dhufaniif barumsa waan ta'eef barumsaan alatti kan maatiin isaanii hawwanni isaanii irraa hin eegne akka hin raawwanne hundumtuu kan ittiin wal too'atuudha.",
  },
  {
    number: 8,
    title: "Hariiroo Hawaasummaa Cimsuuf",
    description:
      "Hariiroo hawaasummaa gaafa jennu nuti gaafa maatii biraa dhufnu keessatti akkuma ilaalcha, akkasumas yaada gara garaa qabnu bifa tokkummaatiin ilaallu as gaafa yuunivarsiitii dhufnee amantaalee gara garaa, saba gara garaa waliin waan jiraannuuf amantii nama biraa kabajuu hawaasummaa barachuu, naamusa, duudhaa fi kan kana fakkaatan baruudha.",
  },
  {
    number: 9,
    title: "Qabxii Gaarii Galmeessisuuf",
    description:
      "Qabxii gaarii galmeessuun kaayyoo gamtaa kanaa qofa osoo hin taane gaafa maatii biraa dhufnu qabxii gaarii galmeessuun dippaartimentii barbaachisaa filachuun ofiif akkasumas maatii irra darbee immoo hawaasa keessaa baane ittiin tajaajiluudha. Kun immoo kan ta'u barataan kamiyyuu yeroo isaa osoo hin dhiphatin, osoo hin sodaatin, yeroo qabu haalan fayyadamee akka inni galma gahuu kan taasisuudha. Odeeffannoo seeraan yoo sassaabbatee fi yoo sirnaan dubbiseedha. Gabaabumatti qabxii barbaachisaa ta'e galmeessuun dippaartimentii barbaannu yoo gallee abjuu ganamaa ofii milkeessuudha. Kuni immoo kaayyoo gamtaa kanaa keessaa isa tokkoodha ykn isa ijoodha.",
  },
  {
    number: 10,
    title: "Seera Mooraa Hubachiisuuf",
    description:
      "Seera mooraa hubachiisuu jechuun mooraan kallattii gara garaan seera mataa isaa danda'e qaba. Fakkeenyaaf mooraa keessatti waan mooraan hin eeyyamne hojjate yoo argame seerichi kan ariisisu ykn immoo kan adabsiisuudha. Haaluma wal fakkaatuun barattoonni haaraan gara yuunivarsiitii yeroo dhufan dambii ittiin bulmaata yuunivarsiitichaa hubachiisuuf gamtaan kun kan gargaarudha.",
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
  "Iluu Gololee",
  "Iluu Galaan",
  "Iluu Katabaa",
  "Bulchiinsa Magaalaa Olonkomii",
  "Dirree Madaallee",
  "Karkarreessa",
  "Odaa Daalotaa",
  "Dheebisa Aggaasaa",
  "Itayyaa",
  "Haroo Shoboree",
  "Dhakkuu Kittoo",
  "Warra Iluu",
  "Qoree Jeeno",
  "Dhakkuu Qarsaa",
  "Iluu Coqorsaa",
  "Siree Bargaa",
  "Kaaloo",
  "Maaruu Coboot",
  "Iluu Warabboo",
  "Iluu Soddolbee",
  "Adaadaa Soddolbee",
  "Caffee Bisil",
  "Iluu Xoosinyii",
  "Fittee",
  "Haroo Leemman",
  "Oddoo Mojoo",
];

const photos = [
  {
    src: "/Picture32.png",
    title: "Walga'ii Jalqabaa",
    desc: "Suuraan kun kan bara 2016 A.L.I tti yeroo jalqabaaf wal agareedha. Yemmuus baay'inni keenya nama digdama (20) hin caalu.",
  },
  {
    src: "/Picture33.png",
    title: "Sirna Eebbaa",
    desc: "Sirna eebbaa barattoota bara 2016 eebbifaman Tasammaa Caalaa fi Iyyuu Birhaanuu wajjin.",
  },
  {
    src: "/Picture34.png",
    title: "Affeerraa Laaqanaa",
    desc: "Suura affeerraa Laaqanaa bara 2016 A.L.I tti.",
  },
  {
    src: "/Picture35.png",
    title: "Gaggeessaa Barattoota GC",
    desc: "Gaggeessaa barattoota GC bara 2016 A.L.I. tti.",
  },
  {
    src: "/Picture36.png",
    title: "Barattoota Eebbifamoo",
    desc: "Barattoota eebbifamoo bara 2016 A.L.I. ttii.",
  },
  {
    src: "/Picture37.png",
    title: "Simannaa Barattoota Haaraa",
    desc: "Suuraa yeroo simannaa barattoota haaraa bara 2017 A.L.I irraa fudhatame.",
  },
  {
    src: "/Picture38.png",
    title: "Walga'ii Bara 2017",
    desc: "Suuraa bara 2017 A.L.I tti.",
  },
];

function useScrollAnim() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("anim-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    document
      .querySelectorAll("[data-anim]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function SectionTitle({
  icon,
  label,
  subsection,
}: {
  icon: React.ReactNode;
  label: string;
  subsection?: string;
}) {
  return (
    <div className="flex items-center gap-4 mb-4" data-anim="fade-up">
      {subsection && (
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-700/30 shrink-0">
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            {subsection}
          </span>
        </div>
      )}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-800/70 shadow-sm border border-gray-200/60 dark:border-gray-700/30 flex items-center justify-center shrink-0 backdrop-blur-sm">
        {icon}
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
        {label}
      </h2>
    </div>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg
      className={`w-3.5 h-3.5 text-${color}-600 dark:text-${color}-400`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}

export default function Waaee() {
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useScrollAnim();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <style>{`
        [data-anim] { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease-out, transform 0.7s ease-out; }
        [data-anim].anim-visible { opacity: 1; transform: translateY(0); }
        [data-anim="fade-up"] { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease-out, transform 0.7s ease-out; }
        [data-anim="fade-up"].anim-visible { opacity: 1; transform: translateY(0); }
        .glass-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.3); }
        .dark .glass-card { background: rgba(17,24,39,0.85); border-color: rgba(55,65,81,0.4); }
        .glass-nav { background: rgba(255,255,255,0.9); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .dark .glass-nav { background: rgba(17,24,39,0.9); }
        .hero-pattern { background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0); background-size: 40px 40px; }
        .text-gradient { background: linear-gradient(135deg, #ffffff 0%, #a7f3d0 50%, #5eead4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse-soft { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        .anim-float { animation: float 8s ease-in-out infinite; }
        .anim-pulse-soft { animation: pulse-soft 4s ease-in-out infinite; }
        .photo-card:hover .photo-overlay { opacity: 1; }
        .photo-card:hover .photo-zoom { transform: scale(1.1); }
      `}</style>

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-24 xl:bottom-8 right-4 sm:right-8 z-30 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-110 transition-all duration-300 flex items-center justify-center ${showBackTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 15.75l7.5-7.5 7.5 7.5"
          />
        </svg>
      </button>

      {/* Page 1: Logo + Association Info */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900 pt-14 sm:pt-16">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <img
          src="/background/Picture1.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/40 via-transparent to-teal-900/40 z-10" />
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-[140px] anim-float" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"></div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <svg
            className="w-8 h-8 text-white/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Founders & Credits */}
        <section className="py-10 -mt-8">
          <div
            data-anim="fade-up"
            className="glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-4 sm:p-6 border border-emerald-200/30 dark:border-emerald-800/30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
          >
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 text-sm">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
                  Madda
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Oliiqaa.G, Milkeessaa.S, Tigist.T, Sannaayit.B
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
                  Barreessitoota
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Tasfaayee.A, Tolasaa.T, Birhaanuu.T, Birhaanuu.G, Haacaaluu.B
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
                  Gulaaltota
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Girmaa.T, Tolasaa.K, Birhaanuu.G
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 1. Galata */}
        <section id="section-1" data-section="1" className="py-6 sm:py-10">
          <SectionTitle
            icon={
              <svg
                className="w-6 h-6 text-amber-600 dark:text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.392-.239l-3.338-1.17a2.25 2.25 0 00-1.272-.045l-2.264.7a1.5 1.5 0 01-1.09-.045L1.5 18.939V10.5l2.334-.748a1.5 1.5 0 011.066-.033l1.733.781z"
                />
              </svg>
            }
            label="Galata"
          />
          <div
            data-anim="fade-up"
            className="glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-5 sm:p-8"
          >
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              Duraan dursa waaqayyoon isa fayya guutuu, Nageenya gaarii, jaalala
              dhuma hin qabne nuuf laatee yeroo nuti maatii yookiin Abbaaf
              haadha keenya irraa fagaannee jirrutti obboloota dhugaa kan
              dhugumatti jaalala beekan warra madda ogummaa tahan kan irraa
              jaalala hubanne nuu kenneef galata hangafaa qabna. Itti aansuun
              angafoota keenya(warra gurmuu kana hundeessan) warra rakkoon
              keenya rakkoo isaanii ta`ee nuti rakkannee dhaloonni nu booddee
              jiran hin rakkatin jedhanii siidaa seenaa dhaloonni dhufee darbu
              irraa baratu hojjataniif galanni keenya guddaadha. Warra
              tokkummaan isaanii eenyummaa isaanii ta`ee jaalalli immoo faajjii
              moo`icha isaanii ibsu, ijoollee qaxalee karaa hundaan wanti hundi
              irraa bareedu hirmaannaa fi kutannoo keessaniif ijoollee Ada`aa
              Bargaa Yuunivarsiitii Haramaayaa hundi keessan galata guddaa
              qabdu. Akkasumas warreen yaada kana wixinee isaa lafa kaa'an
              kanneen onnee isaanii guutuudhaan tokkummaatti amanan Oliiqaa
              Girmaa, Milkeessaa Sisaayi, Tigist Takluu, Sannaayit Baqqalaa
              Hundeeffama Gamtaa kanaa irraa eegalanii hanga har'aatti yaadan nu
              jajjabeessuun, qaaman nu gidduutti argamuun nu waliin ta'aniif
              kabajaaf jaalala hangas hin jedhamne qabna, baay'ee nuuf
              galatoomaa. Dabalataanis nuuf milkaa'aa, nutis milkii keessan
              arguu barbaadna jennaani. Akkasumas kanneen jalqabbii kanaaf gahee
              hedduu qaban, garuu sa'aatii itti barruun kun eegalametti
              eebbifamaniif Tasammaa Caalaa fi Iyyuu Birhaanuu ijoollee bara
              2016 Eebbifamaniif galanni keenya dachaadha. Nuuf jiraadhaa yoomuu
              onnee ijoollee Ada'aa Bargaa keessa jirtu. Osoo nuuf danda'amee
              namoota kallattiinis ta'ee aalkallattiin hundeeffama kana
              keessatti qooda fudhatan kaasnee dubbannee baay'ee nu gammachiisa.
              Garuu hunda gaafa barreessinu barruun kun galmee maqaa namaa nu
              jalaa ta'a. Kanaaf hundumtuu galata guddaa qabdu. Tokkummaan humna
              jechuudhaan akkuma abboonni keenya mammaaksan faayidaa fi bu'aa
              Tokkummaan qabu ibsaa nutti dabarsan, isinis jecha abboota keessan
              irraa dhageessan gochatti hiikudhaaf xiiqii fi mul'anni isin
              eegaltan kunoo har'a lafa qabachuutti jira. Nuuf milkaa'aa, umurii
              arraagessaa qabaadhaa isiniin jedhu gamtaan barattoota Ada'aa
              Bargaa.
            </p>
          </div>
        </section>

        {/* 2. Ergaa gabaabaa hangafoota irraa */}
        <section id="section-2" data-section="2" className="py-6 sm:py-10">
          <SectionTitle
            icon={
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                />
              </svg>
            }
            label="Ergaa Gabaabaa Hangafoota Irraa"
          />
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {[
              {
                name: "✅Oliiqaa Girmaa",
                role: "Barataa chemical Engineering waggaa 5ffaa",
                message:
                  "Tokkummaan siidaa jaalalaa barattoota Aanaa keenyaan mooraa yuunivarsiitii Haramaayaa keessatti jalqabe kun gara hawaasa keenyattii fi kan birootti ce'uun madda furmaataa fi galma gahiinsaa gama barnootaan barattoota keenyaf akka karaa ta'uuf hawwii koo isa guddaadha.",
              },
              {
                name: "✅Tolasaa Tasfaayee",
                role: "Barataa software Engineering waggaa 3ffaa",
                message:
                  "Hiikaan jireenyaa gaafa ati obboleessa yookin obboleetti keef jiraattu siif gala. Yeroon akkas jedhu biqiltuun tokko biqiltuu tahuu isaa gaafa gaaddisaaf da'oo isaa hubattu dadhabbiin ykn humni biqiltuu sanatti bahe sitti muldhata. Kanaaf wanti nuti akka gatii hin qabneetti ilaallu boru gati guddaa qaba. Tokkummaan kun wanta nuti eessattuu irra deebinee hin arganneedha. Yaa hiriyoota koo waliif, waliin akkasumas waloon yaa jabaannu, yaa ceenun dhaamsa hiriyummaa kan koodha.",
              },
              {
                name: "✅Birhaanuu Tolchaa",
                role: "Barataa medical lab. waggaa 2ffaa",
                message:
                  "Tokkummaan humna! Humna irra kan darbe immoo eenyummaadha. Labatni eenyummaa isaa beeku immoo waan gochuu qabu godhee isa hojjachuuf dhalate hojjatee seenaa boollaa olitti hafee jiraatu dalaguun dhaloota dhufuun leellifamaa, akkasumas ashaaraa hin badne dhalootaaf bu'uuressa. Tokkummaan jalqabame kun burqaa hin gogne irraa dhoo'uun foolii tokkummaa fi jaalalaan Aanaa fi biyyaa keenya akka urgeessu nan abdadha. Jabaadhaa wajjin seenaa hojjanna.",
              },
              {
                name: "✅Tasfaayee Abeebee",
                role: "Barataa pharmacy waggaa 2ffaa",
                message:
                  "Akkuma Oromoon mixiin walqabattee laga ceeti jedhee bu'aa tokkummaa ibsu, tokkummaan bu'uura milkaa'inaa fi jabinaati. Kanaafuu tokkummaadhaa gara milkaa'inaatti haa deemnuun dhaamsa koo isa obbolummaati. Tokkummaadhaan wal haa deeggarru, wal haa jajjabeessinu, wal haa tumsinu! Wal wajjin gara milkaa'inaatti yaa deemnu!!!",
              },
              {
                name: "✅Girmaa Tiksee",
                role: "Barataa Ikkoonomiksii waggaa 2ffaa",
                message:
                  "Tokkummaan keenya jabaatee labata dhufu bira akka ga'uuf tumsa akka goonu, muudannoo nutti dhufu keessa darbuuf, kaayyoo keenya irratti kutannoo qabaachuun, ofiif qofa osoo hin ta'in waliif yaaduun dhaloota mul'ata gaarii qaban akka oomishnu jechuun dhaamsa koo isa angafaati. Akkasumas dhaaba keenya akka jabeessinu, tokkummaan kunis nu harka gahee akka hin laafne jechaa, Tokkummaan kun akka ifaa dhaloota biroo biratti ol bahee akka mul'atuuf ga'ee akka taphannu. Isa keessaas gammachuu, jaalalli, tokkummaani fi injifannoon akka burqu adaraan isiniif dhaamudha. Tokko ta'uun humna, waliin ta'uun injifannoodha.",
              },
              {
                name: "✅Haacaaluu Birhaanuu",
                role: "Barataa Electrical Engineering waggaa 2ffaa",
                message:
                  "Tokkummaan humna. Humni immoo ijaaruu, diiguu, harkisuu, dhiibuu, cabsuu, jabeessuu danda'a. Akkasumas tokkummaan jaalala; jaalalli immoo karaa dhalli namaa ittiin gammadee waliin jiraatudha. Waan hundas of keessaa qaba, iddoon nutii dhamdhama jaalala obbolummaa waliin dhamdhamne kun onnee dhaloota dhufuu keessatti siidaa seenaa ta'ee akka jiraatuuf jaalala har'a gidduu keenyatti mul'ate kana jabeessinee yaa kunuunsinuun dhaamsa kooti.",
              },
              {
                name: "✅Birhaanuu Galataa",
                role: "Barataa Electrical and Computer Engineering waggaa 3ffaa",
                message:
                  "Tokkummaan keenya miidhaginaa fi jabina keenya mirkaneessa. Publilius Syrus tokkummaa akka kana jedhee ibsa; \"Where there is unity there is always victory.\" kana jechuun bakka tokkummaan jiru, injifannoon ni jira. Wanti guddaan tokko nama tokkorraa hin dhalatu. Garuu waloon yoo hojjetame, dhugumaan bu'aa ol'aanaa fiduu danda'a. Akkuma mammaaksi Oromoo jedhu: \"Tokkummaan humna, tokkoon alagatu si saama.\" Kana jechuun, yoo waliin dhaabbannuu fi tokkummaan sochoonu, rakkina kamiyyuu ni injifanna jechuudha. Tokkummaan keenya Aanaa Ada'aa Bargaa keessatti dhalatee hanga Yuunivarsiitii ga'e, har'as jijjiirama guddinaa qabatamaa mul'isaa dhufeera. Yeroo rakkoon nutti dhufu, tokko taanee waliin rakkoo dagannee; yeroo gammachuun dhufus, tokko taanee wal faarsina. Wanti tokkoon dadhabamu, waloon ni salphata. Kanaafuu, tokkummaan keenya mallattoo jaalalaa, waliif yaaduu fi waliif gargaarsaa ta'ee jira. Waan haaraa ijaaruu fi seenaa galmeessuu kan dandeenyu, tokkummaan yoo nu bira jiraate qofa. Yoo wal jabeessine, yoo wal gargaarru, yoo waliif taane, egaa daandii milkaa'inaa hedduu ni ceena. \"Tokkummaan marge, diina cabsee injifannoo argamsiisa.\"",
              },
            ].map((person, i) => (
              <div
                key={i}
                data-anim="fade-up"
                className="glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-4 sm:p-6 group hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-base shadow-lg shrink-0">
                    {person.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">
                      {person.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {person.role}
                    </p>
                  </div>
                </div>
                <div className="relative pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                    {person.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Yaadannoo */}
        <section id="section-3" data-section="3" className="py-6 sm:py-10">
          <SectionTitle
            icon={
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            }
            label="Yaadannoo"
          />
          <div
            data-anim="fade-up"
            className="glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-5 sm:p-8 relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-500/5 rounded-full blur-2xl" />
            <p className="relative text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              Barruun kun uummata Oromoo sababoota nageenyaf aarsaa hedduu
              kaffalan kanneen mana isaanii irraa buqqaa'an, jireenya dhuunfaa
              isaanii dhiisanii akkasumas bara qabsoo hadhaawaa kana dhuguma
              dubbachuuf kan loluuf kan lolchiisu walii hin beekamne bara hamtuu
              akkasii keessa beekaniis ta'ee osoo hin beekne irbaata rasaasa of
              godhaniif yaadannoo lubbuu nuuf yaa ta'u. Akkasumas namoota akka
              Addunyaatti, akka biyyaatti fi akka naannootti tokkummaa
              barbaaduuf jecha lubbuu isaanii qaalii, ishee keessa deebii hin
              qabne warra aarsaa godhaniif yaadanno seenaa haa ta`u!!! Isin nu
              gidduu yoo hin jiraanneyyuu onneen keenya sin yaadata. Rabbiin
              bakka gaarii isiniif qopheessee isiniif yaa kennuun dhaamsa
              jaalalaa ijoollee keessaniiti. Irra caalattiyyuu ilmaan keenya
              waggoottan afran darbaniif aarsaa lubbuu kaffalan, addumattiin
              uummata baadiyyaa Aanaa Ada'aa Bargaa dhukkubbiin yookiin gidiraan
              isin keessa fi alaan miidhamaa turan yoomuu hin dagatamu. Kunoo
              ilmaan keessan yaadannoo akka isiniif taatuf barreeffama xiqqoo
              kana eegallee jirra.
            </p>
          </div>
        </section>

        {/* 4. Seensa */}
        <section id="section-4" data-section="4" className="py-6 sm:py-10">
          <SectionTitle
            icon={
              <svg
                className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            }
            label="Seensa"
          />
          <div
            data-anim="fade-up"
            className="glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-5 sm:p-8"
          >
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              Akka obboloonni keenya seenaa gamtaa kanaa nuun gahanitti gamtaan
              kun kan hundeeffame akka godina Shawwaa lixaatti ture. Sun garuu
              heeddummina namaa irraa kan ka'e hooggansii fi too'annoon isaa
              hagas mara miti. Akkasumas qindoomina heedduu hin qabu ture.
              Kanaaf yaadichi gara laaffachuutti dhufe. Sana booda obboloonni
              keenya warreen galata irratti maqaa isaanii kaasne akka haaraatti
              gamtaa kana hundeessuuf karoorfatan addumattiin barattoonni
              waa'een hundeeffama gamtaa kanaa hojii idilee isaanii ta'e kanneen
              akka barataa Oliiqaa Girmaa yeroo jalqabaaf barattoota walitti
              qabuuf yaalan akkuma karoorsan akka Aanaa Ada'aa Bargaatti GAMTAA
              BARATTOOTA ADA'AA BARGAA gaafa guyyaa 25/05/2013 A.L.I hundeessan.
              Kunis bifa qindaa'aa ta'een, bifa kaayyoon isaa barattoota keenya
              rakkoo gara garaa irraa hambisuu fi mooraa keessa barsiisuu
              qabateen hundaa'e. Erga hundaa'ee boodas bu'aa heedduu buusera.
              Akka barataa Oliiqaa irraa odeeffannetti kaayyoo fi xiiqin isaan
              ittiin gamtaa kana hundeessan inni guddaan rakkoo fi muudannoo
              gaafa inni yeroo jalqabaaf gara mooraa seenu isa mudateeni.
              Fakkeenya; doormi wallaaluu, nama itti siqee isa haasofsiisu
              dhabuu, nama isa simatu dhabuu fi wantoota heedduu isa irra gahe
              nuuf heerera. Kanaaf wantoota narra gahe kana akka obboloota koo
              irra gahu waanan hin barbaadnef gamtaa akkasi hundeessuu qabna
              jedhee yaada isaa hiriyyoota isaa kanneen akka Milkeessaa Sisaayi,
              Tigist Takluu, Sannaayit Baqqalaa, Tasammaa Caalaaf dabarsee.
              Obboloonni koos yaada kana fudhatanii guyyaa tokko walitti
              qabamuuf murteessan. Sana keessatti barataa Milkeessaa Sisaay
              walitti qabaa gamtaa barattoota kanaa akka ta'ee tajaajilu
              filatamee ture. Innis iddoo hojii isaa irratti hundaa'udhaan
              barattoota jajjabeessuu, barattoota gorsuu, akkasumas yeroo
              barbaachisaa ta'ettis akka isaan yeroo isaanitti fayyadamanii
              barattoonni ga'umsa cimaa akka qabaatan gochuudhaan tajaajila
              quubsaa tahe kennaa tureera. Akkasumas barattuu Sannaayit Baqqalaa
              kan jedhamtu itti aantuu barataa Milkeessaa Sisaay ta'uudhaan
              tajaajilaa turteetti. Haaluma wal fakkaatuun barattuu Tigist
              Takluu kan jedhamtu baruma armaan olitti eerame kana keessa hojii
              wal fakkaatuun tajaajilaniiru. Haaluma sanaan erga hundaa'ee booda
              baratoonni gara garaa gamtaa kanatti dabalamuun shoora isaanii
              taphataniiru. Sanarraa ka'uun tokkummaa qabaachuun keenya hojii
              guddaa akka hojjetu amanuudhaan gamtaan kun akka cimee itti fufuuf
              hundeeffame. Ta'us garuu sababoota gara garaa irraa kan ka'e hanga
              bara 2015 A.L.I tti yeroon tokkumaadhaan wal argan hin turre.
              Dhawaata keessa bara 2016 A.L.I irraa eegalee miseensonni
              tokkummaa kanaa marti wal wajjiin yeroo marii fi gorsaa walii
              wajjin qabaachuu eegalan. Akkuma lagni Abbayyaa guddaan
              dinqisiifamu copha irraa eegale, tokkummaa guddaan amma arginu kun
              yaada namoota muraasaa irraa eegaluun barattoota keenyaaf muka
              qabataa ykn wanta abdatan ta'eefii jira. Egaa Jechi warra adii
              tokko akkas jedha "A human being is die,but her or his fingerprite
              is alive forever." Nutis kaayyoo isaan eegalan kana osoo irraa hin
              sharafin, itti fufsiisuuf wantoota duubatti nu hambisan kamuu
              darbuun karoora kana osoo irraa hin maqne galmaan gahuuf obboloota
              hundeessitoota irra fuunee jirra.
            </p>
          </div>
        </section>

        {/* 5. Seenaa Aanaa Ada'aa Bargaa */}
        <section id="section-5" data-section="5" className="py-6 sm:py-10">
          <SectionTitle
            icon={
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                />
              </svg>
            }
            label="Seenaa Aanaa Ada'a Bargaa"
          />

          <div
            data-anim="fade-up"
            className="glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-5 sm:p-8 mb-8"
          >
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              Aanaan Ada'aa Bargaa aanaa godinni Shawwaa lixaa qabdu keessaa
              tokko taatee kallatti kaaba lixaa qabattee teessoo mootummaa
              naannoo oromiyaa finfinnee irraa kiloomeetira 70 irratti kan
              argamtuu fi teessoo bulchiinsa godina Shawwaa lixaa Amboo irraa
              kiloomeetira 130 irratti argamti. Aanan Ada'aa Bargaa karaa kibbaa
              aanaa Walmaraatin, karaa kibba-lixaa aanaa Ejereetin, karaa dhihaa
              aanaa Meettaa Roobiitiin, fi karaa kaabaa fi bahaa Laga Mogoriin
              daangeffamee argama. Akkuma fakkii olii irraa hubannu aanaan
              Ada'aa Bargaa aanaa qabeenya albuudaa gara garaan badhaatedha.
              Isaanis kanneen akka maarbilii, dhagaa hoofii, caustic soodaa,
              biyyee diimaa, ashawwaa warreen galtee oomisha simintoof shoora
              guddaa qabaniin guutudha. Albuudonni kunniin warshaalee kanneen
              akka simintoo mugar, warshaa simintoo daangotee fi warshaa bedrok
              fa'iif akka meeshaa dheedhitti kan tajaajilaniidha. Qabeenya
              kanaan badhaadhuun ishee aanaa mataa ofiirra darbitee simintoo
              biyya keenyaaf gumaachituu fi Itoophiyaa guutuu simintoon
              tajaajiltu ta'uun ishee ni beekkama. Aanaan Ada'aa Bargaa seenaa
              fi eenyummaa Oromoo keessatti iddoo ol-aanaa qabdi. Aanaa kana
              keessatti uummanni hojii qonnaa, horsiisa loonii fi aadaa ofii
              jabeeffachuudhaan beekkama. Akkasumas, dhaloonni aanaa kanaa
              barnootaaf dursa kennuun sadarkaa addaatti guddataa jiru. Isaan
              keessaa gurmuun kuni namoota muraasa. Gurmuu kana keessatti
              barattoonni dhalootaan Aanaa Ada'a Bargaa ta'an, eenyummaa fi
              seenaa isaaniitiin boonuudhaan, waliin hojjechuu fi ofirra
              darbanii aanolee biroof fakkeenya ta'uun, akkasumas ofitti
              haammachuudhaan gara fuulduraatti injifannoo galmeessuu irratti
              hojjetaa jiru. Aanaan Ada'a Bargaa biyya keenya keessatti bakka
              adda taate qabdi. Akkasumas Aanaa kana keessatti midhaan
              oomishaman beekamoon xaafii, qamadii, baaqelaa, garbuu, midhaan
              agadaa fi kan kana fakkaataniin kan badhaatedha. Dabalataanis
              aanaan kun horsiisa looniin beekamtuudha. Isaaniis kanneen akka
              horii gaanfaa, kotte duudaa, hoolaa, re'ee fi keessattuu hurufti
              bargaa kan aanaa kana keessatti argamu fardaan beekamaadha.
              Qabeenya uumamaa kan akka laggeenii, holqawwanii, biqiltoota,
              bineensota, allattii fi simbirroota gosa gara garaa kan qabduu fi
              qillensa mijataa jireenyaaf ta'u kan qabduudha. Kana qofas miti
              aanaan keenya gootota injifannoo biyyattii keessatti gahee qaban
              heedduu qabdi. Kanneen akka obboloota lamaan Damisee Bultoo fi
              Garbii Bultoo akkasumas artistoota kanneen akka Nugusuu Dirribaa,
              Kumarraa Darajjee fi kan kana fakkaatan heddu qabdi. Aanaan kun
              gandoota baadiyyaa 37 fi bulchiinsa magaalaa sadi kan qabduu fi
              aanaa guddinaaf tattaafachaa jirtuudha. Gandoonni fi bulchinsoonni
              isheen qabdu kunneen kanneen armaan gadiiti:
            </p>
          </div>

          <div
            data-anim="fade-up"
            className="glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-5 sm:p-8"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Gandoota fi Bulchiinsa Magaalota Aanaa Ada'aa Bargaa
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {districts.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50/80 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800/40 transition-all group"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50 transition-colors">
                    {i + 1}
                  </span>
                  <span className="truncate">{d}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            data-anim="fade-up"
            className="glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-5 sm:p-8 mt-8"
          >
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              Dabalataan aanaan kun siyaasa biyyatti keessatti namoota gahee
              Leencaa ba'achaa jiraanii fi bahaa turan heedduu akka qabdu
              beekamaadha. Walumaagalatti aanan Ada'aa Bargaa aanaa jireenyaaf
              Misoomaaf, daldalaaf mijattuu taatee fi misoomni gurguddoon
              keessatti geggeeffamuudha. Daangaan ishee qarooma, seenaa fi
              guddinaa of keessaa qabdi. Lafee hundee saba keenyaa keessaa tokko
              taatee, aadaa fi duudhaa ishee tikfattee guddisuuf carraaqxee
              jirti. Lafa kana keessatti dhalannee, seenaa aanaalee keenya
              sirriitti hubannee guddachuun keenya daran boonsaadha.
            </p>
          </div>
        </section>

        {/* 7. Kaayyoota - moved before 6 as per original order */}
        <section id="section-7" data-section="7" className="py-6 sm:py-10">
          <SectionTitle
            icon={
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            label="Kaayyoo Hundeeffama Gamtaa Kanaa"
          />
          <div className="space-y-5">
            {goals.map((goal, idx) => (
              <div
                key={goal.number}
                data-anim="fade-up"
                className="glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group"
                style={{ transitionDelay: `${(idx % 5) * 0.05}s` }}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-600 dark:text-blue-400 font-bold text-[10px] sm:text-xs shrink-0 shadow-sm mt-0.5">
                      {goal.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-base sm:text-lg">
                        {goal.title}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                        {goal.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Bu'aa */}
        <section id="section-8" data-section="8" className="py-6 sm:py-10">
          <SectionTitle
            icon={
              <svg
                className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
            }
            label="Bu'aa Hundeeffamuu Gamtaa Kanaa"
          />
          <div
            data-anim="fade-up"
            className="glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-5 sm:p-8"
          >
            <ul className="space-y-4">
              {[
                "Barattoonni gara mooraa dhufanii fedhii barnoota isaanii irratti cimanii akka baratan rakkoo gara garaaf saaxilamanii akka hin ari'amne taasiseera.",
                "Odeeffannoo mooraa irraa guutummaa guututti hin arganne gama gamtaa kanaa irraa argachuudhaan guutummaa guututti milkaa'aa ta'aniiru.",
                "Barattoonni karaa badiisaa gama kamiinuu dhufuu danda'u irraa baraaramaniiru. Araadawwan hin barbaachifneen qabamuu irraa bilisa ta'aniiru.",
                "Barnoota irratti barattoonni cimanii iddoo yaadaniin olitti milkaa'anii akka argaman ta'aniru.",
                "Aadaan wal gargaarsaa akka duudhaa hawaasa keenyatti cimee akka itti fufu ta'eera.",
                "Kabaja sabaa fi sablammoota, akkasumas immoo amantoota gara garaa sirnaan akka qabaannu taanerra.",
                "Barattoota dandeettii addaa fi kalaqa gara garaa qaban oomishuuf akkasumas sadarkaa biyyoolessaatti dorgomaa taasisuuf tokkummaan barattoota aanaa Ada'aa Bargaa Yuunivarsiitii Haramaayaa keessatti hundeeffame kun aanaa Ada'aa Bargaa keessatti akkasumas haga guutummaa godinaaleefi naannolee gara garaa keessatti fakkeenyummaa gaarii akka qabaatu gochuuf.",
                "Tokkummaan barattootaa yuunivarsiitii keessatti hundeeffame kun sadarkaa hojjetaa fi hawaasummaa keessatti akka guddatu gochuuf.",
                "Barattoonni fakkeenyummaa gaarii yuunivarsiitii keessatti agarsiisan kana gara hawaasummaatti gama diinagdeetiin, gama amantiitiin, gama aadaatiin fi kkf akka agarsiisan gochuuf.",
                "Walumaagalatti jiruu fi jireenya egeree dhalootaa ijaaruuf kanneen kana fakkaatan erga hundaa'ee eegalee dhiibbaa gamtaan kun fideedha, fidaas jiruudha.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <CheckIcon color="emerald" />
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 9. Mul'ata */}
        <section id="section-9" data-section="9" className="py-6 sm:py-10">
          <SectionTitle
            icon={
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
            }
            label="Mul'ata Gamtaa Kanaa"
          />
          <div
            data-anim="fade-up"
            className="glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-5 sm:p-8"
          >
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-6">
              Mul'ata gamtaa kanaa gaafa jennu karoora gara fuulduraa waldaan
              kun hojjachuuf karoorfateedha. Akkuma seensa irratti dubbachuuf
              yaalle gamtaan kun erga hundaa'ee wantoota heedduu hojjachaa ture,
              ammas wantoota baayye hojjachaa jira. Akkasuma gara fuulduraattis
              wantoota heedduu hojjachuuf karoorfatee jira. Isaan keessa
              muraasni:
            </p>
            <ul className="space-y-4">
              {[
                "Barattoota tokkummaa keenya keessa jiraan hundumti isaanii milkaa'anii arguu.",
                "Tokkummaan barattoota Aanaa Ada'aa Bargaa Yuunivarsiitii Haramaayaa keessatti eegale barattoota aanaa keenyaa Yuunivarsiitiwwan adda addaa keessa jiran biratti mul'atee irraa Baratame arguu.",
                "Tokkummaa dhugaa fi jaalala of keessaa qabu kan barattoota muraasan mooraa keessatti eegale kun guddate sadarkaa Aanaatti, Godinaatti, Naannootti, Biyyaatti Fi Ardiitti babal'ate arguu.",
                "Aanaan keenya waggoota kurnan dhufan keessatti ijoollota ishee hunda gara industirii barnootaatti deebifte arguu.",
                "Jaalala obbolummaa, tokkummaa keenya keessa jiruu fi miira waliin gammaduu fi waliif gadduu obbolootaa isa dhugaa barattoota gidduu jiru arguu.",
                "Waggoota muraasa fuula keenya dura jiru keessatti humna nama baratee daraan dabalee fi misooma fi guddina aanichaa keessatti gahee Leencaa ba'atu arguu.",
                "Aanaa bu'uuraalee misoomaatiin Badhaate fi aanaa Hayyootaaf Beektotaa taate arguu.",
                "Dhufeenya barattoota keenya cimsuudha. Kana jechuun barattooni keenya wal baruun muuxannoo, muudannoo fi haala jireenya mooraa yuunivarsiitichaa akka wal jijjiiran haala mijeessudha.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <CheckIcon color="purple" />
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 10. Ittiin Bulmaata */}
        <section id="section-10" data-section="10" className="py-6 sm:py-10">
          <SectionTitle
            icon={
              <svg
                className="w-6 h-6 text-amber-600 dark:text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            }
            label="Ittiin Bulmaata Gamtaa Kanaa"
          />
          <div
            data-anim="fade-up"
            className="glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-5 sm:p-8 mb-6"
          >
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              Gamtaan barattota Aanaa Ada'aa Bargaa ittiin bulmaata mataa isaa
              qaba. Isaanis barataan tokko gamtaa kana keessaatti wantoonni inni
              gochuu qabu yookiin immoo wantoonni inni gochuu hin qabne maal
              fa'a akka ta'e as jalatti ilaalla. Yeroo akkas jennu jaalaluma
              obbolumma walitti agarsiisuuf malee nama ajaja yookiin dirqama
              addaa nama irra kaa'uuf miti. Hubachiisa wantoota akka dambiitti
              keenye kana hunda miira ajajaan osoo hin taane miira obbolummaa fi
              jaalalaan kan hojiitti hiikamuudha.
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                rule: "1st",
                title: "Argamuu Walgahii",
                desc: "Barataan tokko guyyaa walgahii yookiin gamtaan kun wal argan irratti argamuu qaba. Yoo dhimma dhuunfaa qabaateen alatti kana yemmuu jennu miira nuffiin osoo hin taane akka jaalalli keenya nurraa muldhatuutti ta'u qaba.",
              },
              {
                rule: "2nd",
                title: "Simannaa Barattoota Haaraa",
                desc: "Guyyoota simannaa barattoota haaraa irratti argamuu qaba. Kana jechuunis ajaja osoo hin taane bifuma namatti toluu danda'uun obboloota isaa simachuu qaba. Sababbiin waldaan kun hundeeffameef inni guddaan wanta kanaaf waan ta'eefidha.",
              },
              {
                rule: "3rd",
                title: "Eeguu Safuu fi Aadaa",
                desc: "Miirri safuu, Aadaa, Amantaa fi gochaalee eenyummaa keenya xiqqeessan irraa of eeguu qaba. Kunis kaayyoon keenya jireenya nama dhuunfaa hoogganuu yookiin murteessuu osoo hin taane ijoolleen keenya duudhaa hawaasa keenyaa keessa akka isaan jiraatan waan barbaadnefidha. Akkasumas kabaja eenyummaa keenyaa qabaatanii akka nama aadaa, safuu fi amanamoo ta'anii eebbifaman gamtaan kun waan barbaadefi.",
              },
              {
                rule: "4th",
                title: "Buusii Ji'aa",
                desc: "Buusii ji'aa gamtaa qarshii 50 (shantama) yeroon kaffaluun barbaachisaadha. Tarii namni tokko qarshii dhabuu danda'a. Sun rakko tokkollee hin qabu. Kaayyoon keenya nama yookiin ijoollee keenya barbaadudha malee qarshii barbaaduu miti. Sun kaayyoo keenya ta'uu hin danda'u. Gama kamiinuu waliin deemuuf gamtaan keenya banaadha.",
              },
              {
                rule: "5th",
                title: "Walitti Gadduu Dhabuu",
                desc: "Namoonni gamtaa kana keessa jiran kamu walitti gadduun ykn waldhabuun hin danda'amu. Kana yeroo jennu tarii namni beekees osoo hin beekinis si gaddisiisuu danda'a. Sana garuu ija jaalalan waliif dhiisun wanta waaqnis namnis sirraa jaallatuudha.",
              },
              {
                rule: "6th",
                title: "Walii Kabajuu",
                desc: "Walii walii isaas kabajuu qaba. Akkas jechuun namni kamuu beekaas yaa tahu wallaalaan kabajamuu qaba. Yaadota gara garaa qabaachuu dandeenya, sana immo mariif marabbaan furamuutu fala malee ilaalcha xiqqeenyaa waliif qabaachuun numaan mataa keenya xiqqeesa.",
              },
              {
                rule: "7th",
                title: "Waliif Ajajamuu fi Wal Dhageeffachuu",
                desc: "Akkasumas waliif ajajamuun wal dhageeffachuun waliif yaaduun, gamtaa keenya keessatti akka lafa qabatu utubaa cimaa ta'aafi.",
              },
              {
                rule: "8th",
                title: "Gargaarsa Irratti Hirmaachuu",
                desc: "Gama baasiif wal gargaarsa gara garaa irratti hirmaachuun miseensa gamtaa kanaa irraa eegama.",
              },
            ].map((r, idx) => (
              <div
                key={r.rule}
                data-anim="fade-up"
                className="glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden group hover:shadow-xl transition-all duration-300"
                style={{ transitionDelay: `${(idx % 4) * 0.05}s` }}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 font-bold text-[10px] shrink-0 group-hover:scale-110 transition-transform">
                      {r.rule}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {r.title}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {r.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 11. Karoora */}
        <section id="section-11" data-section="11" className="py-6 sm:py-10">
          <SectionTitle
            icon={
              <svg
                className="w-6 h-6 text-rose-600 dark:text-rose-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                />
              </svg>
            }
            label="Karoora Gurmuu Kanaa"
          />
          <div
            data-anim="fade-up"
            className="glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-5 sm:p-8"
          >
            <ul className="space-y-4">
              {[
                "Simannaa barattoota haaraa, gaggeessaa barattoota buleeyyii haala adda ta'een kabajuuf karoora isaa keessa galfateera.",
                "Yeroo rakkoo gara garaa barattoota keenya cinaa dhaabbachuu fi tumsuuf.",
                "Dhaabbata aanaa fi biyya keenyaaf bu'aa buusu hundeessuu.",
                "Miidiyaa guddaa rakkoo uummata keenyaa furuu danda'u hundeessuu.",
                "Barattoota naamusa gaarii qaban oomishuu.",
                "Tokkummaa keenyaan rakkoo saba keenya mudateef sagalee ta'uu.",
                "Barattoota keenyaf carraa gara garaa uumuuf karoorfatee kan hojjatuudha.",
                "Ogummaa baranneen Aanaa fi biyya keenya tajaajiluu.",
                "Wantoota xiinsammuu fi egeree barattoota keenyaa miidhuu barbaadan mormuun tarkaanfii barbaachisu fudhachuuf ni hojjeta.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <CheckIcon color="rose" />
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 6. Suuraawwan Yaadannoof */}
        <section id="section-6" data-section="6" className="py-6 sm:py-10">
          <SectionTitle
            icon={
              <svg
                className="w-6 h-6 text-rose-600 dark:text-rose-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            }
            label="Suuraawwan Yaadannoof"
          />

          <div
            data-anim="fade-up"
            className="glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-5 sm:p-8 mb-8"
          >
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              Suurri armaan gadii kun yeroo obboloota keenya bara 2016
              eebbifaman Tasammaa caalaa fi Iyyu Birhaanuu gaggeessinuudha.
              Dhugaa dubbachuuf guyyaan akkasii hin jiru. Dhugummaattin guyyaa
              obboloonni hangafaa nu bira jiraachun akka carraa ta'e itti
              hubanneedha. Kanaaf nuuf galatoomaa isin jaalanna jenna. Akkuma
              beekamu barataadhaaf guyyaan inni guddaa fi kabajamaan guyyaa itti
              bu'aa dadhabbii bara dheeraa booda firii isaanii itti walitti
              qabataniidha. Guyyaan kun addadhas. nutis kanuma sababeeffachuun
              sirna eebba isaanii yeroo jalqabaaf bifa hoo'aa fi kennaa gara
              garaa qabuun gamtaan kun taasiseefi jira. Akkuma suuraa armaan
              gadii irraa hubannutti haala adda taheen obboloota keenya waliin
              gammachuu fi jaalalaan guyyoota babbareedoo armaan gadii kana
              akkasiin kan dabarsine. Kunneen ijoollee qaqqaaliwwan aanaa Ada'aa
              Bargaa kan fuulli isaanii akka biiftuu ifuudha. Guyyaan kun guyyaa
              itti tokkummaan keenya sirriitti ifa bahee itti muldhateedha.
              Suuraan kun kan bara 2016 A.L.I tti yeroo jalqabaaf wal agareedha.
              Yemmuus baay'inni keenya nama digdama (20) hin caalu.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo, i) => (
              <div
                key={i}
                data-anim="fade-up"
                className="photo-card glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
                style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
              >
                <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover photo-zoom transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="photo-overlay absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-sm font-medium flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                        />
                      </svg>
                      Ilaaluuf cuqaasi
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {photo.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {photo.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 12. Koree koolleejjiiwwanii fi maatii isaanii */}
        <section id="section-12" data-section="12" className="py-6 sm:py-10">
          <SectionTitle
            icon={
              <svg
                className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
            }
            label="Koreewwan Bara 2017 fi Maatii Isaanii"
          />

          <div
            data-anim="fade-up"
            className="glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-8 sm:p-12 text-center"
          >
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-8">
              Koreewwan bara 2017 fi maatii isaanii guutuun argachuuf afoola
              armaan gadii cuqaasaa.
            </p>
            <a
              href="/koreewwan"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-2xl hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105 hover:-translate-y-0.5"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              Koreewwan Ilaali
            </a>
          </div>
        </section>

        {/* 13. Barattootan wal yaa barru */}
        <section id="section-13" data-section="13" className="py-6 sm:py-10">
          <SectionTitle
            icon={
              <svg
                className="w-6 h-6 text-teal-600 dark:text-teal-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
            }
            label="Barattootan Wal Yaa Barru"
          />
          <div
            data-anim="fade-up"
            className="glass-card rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 p-5 sm:p-8 text-center"
          >
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base mb-6">
              Barattoota gamtaa keenyaa fi waa'ee isaanii beekuuf afoola armaan
              gadii cuqaasaa.
            </p>
            <a
              href="/students"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-2xl hover:from-teal-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105 hover:-translate-y-0.5"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              Barattoota Ilaali
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
