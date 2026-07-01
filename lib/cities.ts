// Orașe RO pentru pagini SEO locale programatice (/agenti-ai/[oras]).
// Țintă: rank #1 pe căutări gen "agenți AI <oraș>", "chatbot firmă <oraș>".
export type City = {
  slug: string;
  name: string;      // forma cu diacritice (afișare)
  county: string;    // județ
  region: string;    // regiune (pentru text variat)
};

export const CITIES: City[] = [
  { slug: "bucuresti", name: "București", county: "București", region: "Muntenia" },
  { slug: "cluj-napoca", name: "Cluj-Napoca", county: "Cluj", region: "Transilvania" },
  { slug: "timisoara", name: "Timișoara", county: "Timiș", region: "Banat" },
  { slug: "iasi", name: "Iași", county: "Iași", region: "Moldova" },
  { slug: "constanta", name: "Constanța", county: "Constanța", region: "Dobrogea" },
  { slug: "craiova", name: "Craiova", county: "Dolj", region: "Oltenia" },
  { slug: "brasov", name: "Brașov", county: "Brașov", region: "Transilvania" },
  { slug: "galati", name: "Galați", county: "Galați", region: "Moldova" },
  { slug: "ploiesti", name: "Ploiești", county: "Prahova", region: "Muntenia" },
  { slug: "oradea", name: "Oradea", county: "Bihor", region: "Crișana" },
  { slug: "braila", name: "Brăila", county: "Brăila", region: "Muntenia" },
  { slug: "arad", name: "Arad", county: "Arad", region: "Crișana" },
  { slug: "pitesti", name: "Pitești", county: "Argeș", region: "Muntenia" },
  { slug: "sibiu", name: "Sibiu", county: "Sibiu", region: "Transilvania" },
  { slug: "bacau", name: "Bacău", county: "Bacău", region: "Moldova" },
  { slug: "targu-mures", name: "Târgu Mureș", county: "Mureș", region: "Transilvania" },
  { slug: "baia-mare", name: "Baia Mare", county: "Maramureș", region: "Maramureș" },
  { slug: "buzau", name: "Buzău", county: "Buzău", region: "Muntenia" },
  { slug: "botosani", name: "Botoșani", county: "Botoșani", region: "Moldova" },
  { slug: "satu-mare", name: "Satu Mare", county: "Satu Mare", region: "Maramureș" },
  { slug: "suceava", name: "Suceava", county: "Suceava", region: "Bucovina" },
  { slug: "piatra-neamt", name: "Piatra Neamț", county: "Neamț", region: "Moldova" },
  { slug: "ramnicu-valcea", name: "Râmnicu Vâlcea", county: "Vâlcea", region: "Oltenia" },
  { slug: "focsani", name: "Focșani", county: "Vrancea", region: "Moldova" },
  { slug: "targoviste", name: "Târgoviște", county: "Dâmbovița", region: "Muntenia" },
  { slug: "bistrita", name: "Bistrița", county: "Bistrița-Năsăud", region: "Transilvania" },
  { slug: "resita", name: "Reșița", county: "Caraș-Severin", region: "Banat" },
  { slug: "tulcea", name: "Tulcea", county: "Tulcea", region: "Dobrogea" },
  { slug: "slatina", name: "Slatina", county: "Olt", region: "Oltenia" },
  { slug: "alba-iulia", name: "Alba Iulia", county: "Alba", region: "Transilvania" },
  { slug: "vaslui", name: "Vaslui", county: "Vaslui", region: "Moldova" },
  { slug: "giurgiu", name: "Giurgiu", county: "Giurgiu", region: "Muntenia" },
  { slug: "deva", name: "Deva", county: "Hunedoara", region: "Transilvania" },
  { slug: "zalau", name: "Zalău", county: "Sălaj", region: "Transilvania" },
  { slug: "sfantu-gheorghe", name: "Sfântu Gheorghe", county: "Covasna", region: "Transilvania" },
  { slug: "targu-jiu", name: "Târgu Jiu", county: "Gorj", region: "Oltenia" },
  { slug: "drobeta-turnu-severin", name: "Drobeta-Turnu Severin", county: "Mehedinți", region: "Oltenia" },
  { slug: "miercurea-ciuc", name: "Miercurea Ciuc", county: "Harghita", region: "Transilvania" },
  { slug: "alexandria", name: "Alexandria", county: "Teleorman", region: "Muntenia" },
  { slug: "slobozia", name: "Slobozia", county: "Ialomița", region: "Muntenia" },
  { slug: "calarasi", name: "Călărași", county: "Călărași", region: "Muntenia" },
];

export const getCity = (slug: string) => CITIES.find((c) => c.slug === slug);
