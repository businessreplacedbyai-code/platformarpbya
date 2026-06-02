export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  dateIso: string;
  readingTime: string;
  category: string;
  content: string;
};

export const posts: Post[] = [
  {
    slug: "agent-vocal-restaurant",
    title: "Cum am tăiat 40% din costul de call-center al unui restaurant",
    excerpt:
      "Studiu de caz: un restaurant cu 2 angajați la telefon a trecut la un agent vocal AI în 48h.",
    date: "Aprilie 2025",
    dateIso: "2025-04-10",
    readingTime: "6 min",
    category: "Studiu de caz",
    content: `
<p>Mihai conducea un restaurant cu 45 de locuri în Cluj-Napoca. Vinerea și sâmbăta, telefoanele sunau fără oprire — rezervări, întrebări despre meniu, comenzi takeaway. Ținea doi oameni dedicați exclusiv la telefon în weekend, fiecare costat ~4.500 lei/lună.</p>

<p>Problema nu era costul. Era că oamenii tot ratau apeluri. Clienți frustrați, recenzii negative pe Google, rezervări pierdute. "Linia e mereu ocupată" era cel mai frecvent comentariu în feedback.</p>

<h2>Situația înainte</h2>

<p>Înainte de implementare, am documentat 30 de zile de activitate telefonică:</p>

<ul>
  <li><strong>~180 apeluri/săptămână</strong> în medie</li>
  <li><strong>34% apeluri ratate</strong> (linia ocupată sau fără răspuns după program)</li>
  <li><strong>2 angajați full-time</strong> dedicați exclusiv telefonului în weekend</li>
  <li><strong>~9.000 lei/lună</strong> cost total pentru cele două persoane</li>
  <li>Program de răspuns: <strong>10:00–22:00</strong>, zero acoperire noaptea</li>
</ul>

<p>Cel mai dureros: 22% din apelurile ratate în weekend erau comenzi takeaway directe — bani lăsați pe masă, literalmente.</p>

<h2>Ce am implementat</h2>

<p>Am configurat un <strong>agent vocal AI</strong> care preia orice apel la numărul existent al restaurantului. Nu a fost nevoie de un număr nou — am activat un forward inteligent.</p>

<p>Agentul știe:</p>
<ul>
  <li>Meniul complet (inclusiv alergeni și prețuri)</li>
  <li>Programul de funcționare și locația exactă</li>
  <li>Cum să preia o rezervare cu date complete: nume, număr persoane, oră, număr de telefon</li>
  <li>Cum să transmită comenzile takeaway direct în sistemul POS</li>
  <li>Când să escaladeze la un om real (reclamații, situații speciale)</li>
</ul>

<p>Implementarea a durat <strong>48 de ore</strong>. O sesiune de onboarding de 45 de minute în care Mihai a explicat meniul și specificul restaurantului, și agentul era live.</p>

<h2>Rezultatele după 60 de zile</h2>

<p>Am măsurat aceleași metrici ca înainte:</p>

<ul>
  <li><strong>0% apeluri ratate</strong> — agentul preia indiferent de câte linii sună simultan</li>
  <li><strong>Disponibil 24/7</strong>, inclusiv noaptea — au prins comenzi la 23:30 pentru a doua zi</li>
  <li><strong>Cost lunar: 249 EUR</strong> față de 9.000 lei anterior</li>
  <li><strong>Timp de răspuns mediu: 2 secunde</strong> față de 40 secunde cu oameni</li>
  <li>Recenzii Google: media a urcat de la 4,1 la 4,6 în două luni</li>
</ul>

<p>Calculul simplu: de la ~9.000 lei/lună la ~1.240 lei/lună (249 EUR la cursul actual). O <strong>reducere de 86%</strong> a costului de telefonie, cu performanță mai bună.</p>

<h2>Ce a rămas la oameni</h2>

<p>Mihai nu a concediat pe nimeni. Cei doi angajați au fost mutați pe servit și interacțiunea cu clienții față în față — locul unde prezența umană contează cu adevărat. Satisfacția angajaților a crescut: nimeni nu mai vrea să stea 8 ore cu telefonul la ureche.</p>

<h2>Lecția principală</h2>

<p>Telefonul dintr-un restaurant nu e o problemă de oameni. E o problemă de infrastructură. Un agent vocal AI tratează fiecare apel identic — cu răbdare, cu informații corecte, fără să se grăbească.</p>

<p>Clienții nu știu că vorbesc cu un AI. Știu doar că cineva a răspuns imediat, a luat rezervarea corect și le-a spus că masa lor e gata vineri la 20:00.</p>

<p>Asta e tot ce contează.</p>
    `,
  },
  {
    slug: "no-show-clinica",
    title: "No-show de la 28% la 8% într-o clinică stomatologică",
    excerpt:
      "Reminder-uri automate pe WhatsApp + reprogramări inteligente. Iată cifrele complete.",
    date: "Martie 2025",
    dateIso: "2025-03-15",
    readingTime: "5 min",
    category: "Studiu de caz",
    content: `
<p>O clinică stomatologică din București cu 4 medici și program non-stop de luni până sâmbătă. Problema lor era una extrem de comună în domeniu: <strong>pacienții care nu se prezintă</strong>.</p>

<p>Un slot de 60 de minute la un medic stomatolog pierdut înseamnă 200-400 lei evaporate instantaneu. La 28% rată de no-show și ~80 de programări pe săptămână, clinica pierdea în medie <strong>22 de programări pe săptămână</strong>. Calculul devine rapid dureros.</p>

<h2>De ce se întâmplă no-show-ul</h2>

<p>Am vorbit cu pacienții care nu s-au prezentat. Răspunsul cel mai frecvent nu a fost că au uitat complet — a fost că <strong>au uitat că e azi</strong>. Sau că au vrut să reprogrameze dar nu au găsit numărul, sau că le-a fost jenă să sune.</p>

<p>Al doilea motiv: programările se fac cu 2-3 săptămâni în avans. Un SMS primit cu o zi înainte ar fi suficient pentru 70% dintre cazuri.</p>

<h2>Soluția implementată</h2>

<p>Am configurat un <strong>agent AI de programări</strong> cu trei componente:</p>

<h3>1. Reminder automat pe WhatsApp</h3>
<p>Cu <strong>48 de ore înainte</strong> de programare, pacientul primește un mesaj WhatsApp personalizat:</p>

<blockquote>
"Bună ziua, doamnă Ionescu! Vă amintim că aveți programare la Dr. Popescu joi, 14 martie, la ora 11:00. Confirmați cu DA sau reprogramați cu NU."
</blockquote>

<p>Dacă pacientul răspunde NU sau nu răspunde deloc, agentul trimite automat un mesaj de follow-up și propune 3 sloturi alternative disponibile.</p>

<h3>2. Reminder final cu 2 ore înainte</h3>
<p>Un al doilea mesaj scurt cu adresa clinicii și instrucțiuni de parcare — detalii practice care reduc anxietatea și motivele de abandon.</p>

<h3>3. Reumplere automată a sloturilor libere</h3>
<p>Când un pacient anulează, agentul contactează automat primii 3 pacienți de pe lista de așteptare și oferă slotul eliberat. Primul care confirmă primește programarea.</p>

<h2>Cifrele după 90 de zile</h2>

<ul>
  <li>Rată no-show: <strong>de la 28% la 8%</strong></li>
  <li>Programări recuperate prin lista de așteptare: <strong>~14 pe săptămână</strong></li>
  <li>Venit suplimentar estimat: <strong>~11.000 lei/lună</strong></li>
  <li>Recepționeră eliberată de ~3 ore/zi de apeluri de reminder</li>
  <li>Satisfacția pacienților: mai multe recenzii pozitive menționând "comunicarea excelentă"</li>
</ul>

<h2>Detaliu important: tonul contează</h2>

<p>Am testat două variante de mesaj. Varianta formală, "de clinică", avea rată de răspuns de 54%. Varianta caldă, cu prenumele medicului și un ton conversațional, a ajuns la <strong>81% rată de răspuns</strong>.</p>

<p>Pacienții nu vor să simtă că primesc un mesaj automat de la un software. Vor să simtă că cineva s-a gândit la ei. Un agent AI bine configurat poate face exact asta.</p>

<h2>Concluzie</h2>

<p>No-show-ul nu e o problemă de disciplină a pacienților. E o problemă de comunicare. Oamenii sunt ocupați, uită, se jenează să anuleze. Un sistem automat care comunică proactiv, cald și la momentul potrivit rezolvă 70% din problemă fără niciun efort uman.</p>

<p>Cele 8% rămase sunt cazuri de forță majoră — și aia e o rată perfect acceptabilă în orice clinică.</p>
    `,
  },
  {
    slug: "ai-pentru-imm",
    title: "De ce AI-ul este oportunitatea decadei pentru IMM-urile din România",
    excerpt:
      "Analiză: cum schimbă agenții AI peisajul afacerilor mici și medii.",
    date: "Februarie 2025",
    dateIso: "2025-02-20",
    readingTime: "7 min",
    category: "Analiză",
    content: `
<p>Există un moment în fiecare valuri tehnologic când avantajul se redistribuie. Internetul a nivelat accesul la informație. E-commerce-ul a dat posibilitatea unui depozit din Focșani să vândă în toată Europa. Acum AI-ul face același lucru cu <strong>forța de muncă operațională</strong>.</p>

<p>Și de data asta, IMM-urile românești au o fereastră de oportunitate pe care nu ar trebui să o rateze.</p>

<h2>Problema structurală a IMM-urilor din România</h2>

<p>Afacerile mici și medii din România se confruntă cu o ecuație imposibilă:</p>

<ul>
  <li>Nu își permit echipe mari</li>
  <li>Concurează cu corporații care au sute de angajați</li>
  <li>Clienții se așteaptă la răspunsuri rapide, program extins și zero erori</li>
  <li>Costul unui angajat bun a crescut cu 40% în ultimii 3 ani</li>
</ul>

<p>Rezultatul: proprietarul de IMM ajunge să facă el însuși tot — răspunde la telefon, ține evidența programărilor, trimite oferte, urmărește plățile. E CEO, recepționer, agent de vânzări și contabil în același timp.</p>

<p>Asta nu e scalabil. Și toată lumea știe.</p>

<h2>Ce schimbă agenții AI</h2>

<p>Un agent AI nu e un chatbot care dă răspunsuri robotice dintr-un FAQ. E un sistem care:</p>

<ul>
  <li><strong>Înțelege contextul</strong> conversației și răspunde natural</li>
  <li><strong>Se integrează</strong> în sistemele existente (calendar, CRM, WhatsApp, telefon)</li>
  <li><strong>Învață</strong> specificul afacerii tale — produse, prețuri, proceduri, ton de comunicare</li>
  <li><strong>Acționează</strong> — nu doar informează, ci și programează, trimite confirmări, escaladează</li>
</ul>

<p>Diferența față de automatizările din trecut e că acum poți instrui un agent în română, cu specificul afacerii tale, și el funcționează de a doua zi.</p>

<h2>Unde e avantajul competitiv real</h2>

<p>Marile corporații au implementat AI de 2-3 ani. Dar au implementat sisteme rigide, scumpe, greu de adaptat. Un IMM care pornește azi poate implementa o soluție modernă, flexibilă, în 48 de ore.</p>

<p>E prima oară în istorie când un restaurant cu 5 angajați poate oferi <strong>aceeași experiență de comunicare</strong> ca un lanț cu 500 de locații.</p>

<h3>Exemplu concret: sectorul HoReCa</h3>
<p>Un restaurant mic în România cheltuie în medie 2.000-4.000 lei/lună pe personal de front-office. Un agent vocal AI face același job pentru 250-500 lei/lună și nu ia concediu de Paște.</p>

<h3>Exemplu concret: clinici și cabinete</h3>
<p>O clinică stomatologică cu 3 medici pierde în medie 15-20% din venituri din cauza no-show-urilor și a programărilor ratate. Un agent de programări reduce no-show-ul cu 60-70% în primele 90 de zile.</p>

<h3>Exemplu concret: servicii și consultanță</h3>
<p>Un consultant independent sau un birou de avocatură pierde 2-3 ore pe zi pe email-uri de calificare a clienților. Un agent de pre-calificare filtrează lead-urile și livrează doar conversațiile care merită timp.</p>

<h2>De ce acum, nu mai târziu</h2>

<p>Există un principiu simplu în adoptarea tehnologiei: <strong>primii câștigă disproporționat</strong>.</p>

<p>Restaurantul din cartierul tău care implementează un agent vocal acum va apărea în Google cu mai multe recenzii pozitive (răspuns rapid, nicio linie ocupată) față de concurentul de peste drum care tot amână. Diferența se construiește în timp, nu instantaneu.</p>

<p>Peste 18 luni, agenții AI vor fi standard în sectoarele competitive. Întrebarea nu e dacă vei implementa, ci dacă vei fi printre primii sau printre ultimii.</p>

<h2>Obiecțiile comune și răspunsurile reale</h2>

<h3>"Clienții mei nu acceptă să vorbească cu un robot"</h3>
<p>Greșit. Clienții nu acceptă să aștepte 5 minute în așteptare sau să primească răspuns a doua zi. Dacă agentul răspunde imediat, corect și politicos, 80% dintre clienți nu întreabă dacă e om sau AI.</p>

<h3>"E prea complicat de implementat"</h3>
<p>Implementarea standard durează 48 ore. Nu necesită cunoștințe tehnice din partea ta. Dai un onboarding de 45 de minute, explici afacerea ta, și agentul e live.</p>

<h3>"Nu îmi permit"</h3>
<p>Un agent AI costă cât 10-15% din salariul unui angajat junior. Dacă nu îți permiți un agent AI, nu îți permiți nici angajatul pe care îl înlocuiește.</p>

<h2>Concluzie</h2>

<p>România are 500.000+ IMM-uri. Marea majoritate se luptă cu aceleași probleme: lipsă de timp, costuri crescânde, clienți cu așteptări mari. Agenții AI nu rezolvă toate problemele, dar rezolvă exact problemele operaționale repetitive care consumă cel mai mult timp și bani.</p>

<p>Oportunitatea e acum. Fereastra în care ești printre primii e de 12-18 luni. După aia, toată lumea va face asta și avantajul dispare.</p>
    `,
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
