from sqlalchemy.orm import Session
from datetime import date

from db.database import SessionLocal  # oppure il tuo import corretto
from db.model import User, Achievement, UserAchievement, Article, Leaderboard, Configuration

def seed():
    db: Session = SessionLocal()

    # Evita di duplicare se già popolato
    if db.query(User).first():
        print("Dati già presenti.")
        return

    # Users
    users_data = [
        {
            "id": "1",
            "name": "Gabriele",
            "email": "gabbo@ai.com",
            "avatar": "https://forums.terraria.org/data/avatars/h/197/197802.jpg",
            "level": 6,
            "xp": 619,
            "xpToNext": 81,
            "totalXp": 619,
            "joinDate": date(2025, 5, 5)
        },
        {
            "id": "a1",
            "name": "Sarah Johnson",
            "email": "sarah@ai.com",
            "avatar": "https://images.unsplash.com/photo-1742234857006-ceaba909665c?w=100&h=100&fit=crop"
        },
        {
            "id": "a2",
            "name": "Paolo",
            "email": "paolo@ai.com",
            "avatar": "https://www.plai-accelerator.com/content/uploads/2024/05/ruscitti-e1715625676685.jpg"
        },
        {
            "id": "a3",
            "name": "Emma Wilson",
            "email": "emma@ai.com",
            "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
        },
        {
            "id": "a4",
            "name": "Marco Rossi",
            "email": "marco.rossi@tecno.it",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
        },
        {
            "id": "a5",
            "name": "Elena Giordano",
            "email": "elena.g@fitnesshub.com",
            "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop"
        },
        {
            "id": "a6",
            "name": "David Lee",
            "email": "david.lee@linguanet.org",
            "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop"
        }
    ]

    # Creazione utenti
    users = []
    configs = []
    for data in users_data:
        user = User(**data)
        user.set_password("TEST")
        db.add(user)
        users.append(user)

        configs.append(Configuration(
        tone_preference='friendly',
        length_preference='short',
        format_preference='text',
        age_preference=30,
        user=user  # link configuration to user
    ))

    db.add_all(configs)

    # Achievements
    achievements = [
        Achievement(id='1', name='First Steps', description='Read your first article', icon='📖', xpReward=50),
        Achievement(id='2', name='Speed Reader', description='Read 10 articles in one day', icon='⚡', xpReward=200)
    ]
    db.add_all(achievements)

    # UserAchievements
    user_achievements = [
        UserAchievement(userId='1', achievementId='1', unlockedAt=date(2025, 5, 15)),
        UserAchievement(userId='1', achievementId='2', unlockedAt=date(2025, 5, 20))
    ]
    db.add_all(user_achievements)

    # Articles
    articles = [
        Article(
            id='4',
            title='L\'Ascesa del Calcolo Quantistico',
            excerpt='Come i computer quantistici stanno per rivoluzionare la tecnologia...',
            content="""
                <h2>Introduzione al Calcolo Quantistico</h2>
                <p>Il calcolo quantistico non è più fantascienza. Sfruttando i principi della meccanica quantistica come la sovrapposizione e l'entanglement, questi computer promettono di risolvere problemi oggi intrattabili per i supercomputer classici.</p>
                
                <h2>Qubit: I Mattoni Fondamentali</h2>
                <p>A differenza dei bit classici, che possono essere 0 o 1, i qubit possono esistere in una combinazione di entrambi gli stati contemporaneamente. Questa capacità apre la strada a una potenza di calcolo esponenzialmente maggiore.</p>
                
                <h2>Applicazioni Potenziali</h2>
                <p>Le aree di impatto includono la scoperta di nuovi farmaci e materiali, l'ottimizzazione di complessi sistemi logistici, il miglioramento dell'intelligenza artificiale e la rottura degli attuali sistemi crittografici (e la creazione di nuovi).</p>
                
                <h2>Le Sfide Attuali</h2>
                <p>Nonostante i progressi, la costruzione di computer quantistici stabili e privi di errori è una sfida enorme. La decoerenza quantistica e la correzione degli errori sono aree di intensa ricerca.</p>

                <h2>Conclusione</h2>
                <p>Il cammino verso computer quantistici pienamente funzionali è ancora lungo, ma il potenziale è immenso. Stiamo entrando in una nuova era dell'informatica che potrebbe trasformare radicalmente la nostra società.</p>
            """,
            status='published',
            authorId='a4',
            publishDate=date(2024, 5, 10),
            readTime=10,
            likes=350,
            views=1800,
            isLiked=False,
            thumbnail='https://images.unsplash.com/photo-1617957689234-7a8d4f6c9a9c?w=400&h=250&fit=crop', # Abstract tech
            tags=", ".join(["Tecnologia", "Calcolo Quantistico", "Innovazione"])
        ),
        Article(
            id='5', # ID mantenuto, contenuto modificato
            title='Calisthenics: Allenarsi a Corpo Libero per Forza e Agilità',
            excerpt='Scopri i segreti del calisthenics per costruire un fisico forte e funzionale...',
            content="""
                <h2>Cos'è il Calisthenics?</h2>
                <p>Il Calisthenics è una forma di allenamento fisico che utilizza il peso del proprio corpo come resistenza. Esercizi come trazioni, piegamenti, dip e squat ne sono la base, con l'obiettivo di sviluppare forza, flessibilità, agilità, equilibrio e coordinazione.</p>
                
                <h2>Vantaggi Principali del Calisthenics</h2>
                <p>Questo tipo di allenamento migliora la forza funzionale, la composizione corporea (aumentando la massa magra e riducendo quella grassa), la postura e la consapevolezza del proprio corpo. Può essere praticato quasi ovunque, richiedendo poca o nessuna attrezzatura.</p>
                
                <h2>Come Iniziare con il Calisthenics</h2>
                <p>Inizia con i fondamentali: piegamenti sulle braccia (anche sulle ginocchia se necessario), trazioni assistite o negative (se non riesci a farle complete), squat a corpo libero, plank e affondi. Concentrati sulla forma corretta prima di aumentare il volume o la difficoltà.</p>
                
                <h2>Progressione e Abilità Avanzate</h2>
                <p>Una volta padroneggiati i fondamentali, il calisthenics offre infinite possibilità di progressione, introducendo varianti più complesse come muscle-up, human flag, front lever e planche. La progressione è graduale e richiede costanza e pazienza.</p>

                <h2>Precauzioni Importanti</h2>
                <p>È essenziale un buon riscaldamento prima di ogni sessione e stretching al termine. Ascolta il tuo corpo e non forzare movimenti per cui non sei pronto. La progressione graduale è la chiave per evitare infortuni.</p>

                <h2>Conclusione</h2>
                <p>Il Calisthenics è un approccio versatile ed efficace per migliorare la propria condizione fisica generale. Offre un percorso di crescita continua, sfidando corpo e mente per raggiungere nuovi livelli di forza e controllo.</p>
            """,
            status='published',
            authorId='a5',
            publishDate=date(2024, 5, 12), # Data potrebbe rimanere simile o leggermente aggiornata
            readTime=8, # Read time potrebbe variare leggermente
            likes=295, # Likes potrebbero variare
            views=1350, # Views potrebbero variare
            isLiked=True,
            thumbnail='https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&h=250&fit=crop', # Calisthenics / bodyweight
            tags=", ".join(["Fitness", "Salute", "Calisthenics", "Allenamento a Corpo Libero", "Forza"])
        ),
        Article(
            id='6',
            title='Shopping Online Consapevole: Guida per Acquisti Sostenibili',
            excerpt='Consigli pratici per fare acquisti online in modo più etico e sostenibile...',
            content="""
                <h2>L'Impatto dello Shopping Online</h2>
                <p>L'e-commerce ha reso lo shopping incredibilmente comodo, ma ha anche contribuito a problemi come il consumo eccessivo, i rifiuti da imballaggio e le emissioni dovute ai trasporti. Fare scelte consapevoli è più importante che mai.</p>
                
                <h2>Ricerca i Marchi</h2>
                <p>Prima di acquistare, informati sulla filosofia del marchio. Privilegia aziende trasparenti riguardo le loro catene di approvvigionamento, l'uso di materiali sostenibili e le condizioni di lavoro eque.</p>
                
                <h2>Qualità sulla Quantità</h2>
                <p>Investi in prodotti durevoli e di alta qualità che dureranno più a lungo, invece di cedere al fast fashion o a prodotti usa e getta. Questo riduce i rifiuti e, a lungo termine, spesso fa risparmiare denaro.</p>
                
                <h2>Considera l'Usato e il Ricondizionato</h2>
                <p>Piattaforme per l'usato e prodotti ricondizionati offrono ottime alternative al nuovo, riducendo la domanda di nuova produzione e dando una seconda vita agli oggetti.</p>

                <h2>Riduci Imballaggi e Spedizioni</h2>
                <p>Quando possibile, raggruppa gli ordini per ridurre il numero di spedizioni. Alcuni rivenditori offrono opzioni di imballaggio ecologico o la possibilità di ritirare in negozio.</p>

                <h2>Conclusione</h2>
                <p>Ogni acquisto è un voto. Scegliendo opzioni più sostenibili, possiamo collettivamente spingere il mercato verso pratiche più responsabili e ridurre il nostro impatto ambientale.</p>
            """,
            status='published',
            authorId='a1',
            publishDate=date(2024, 4, 28),
            readTime=9,
            likes=190,
            views=980,
            isLiked=False,
            thumbnail='https://images.unsplash.com/photo-1585102902907-955f3e0f15b2?w=400&h=250&fit=crop', # Sustainable shopping
            tags=", ".join(["Shopping", "Sostenibilità", "Etica", "Consumo Consapevole"])
        ),
        Article(
            id='7',
            title='Viaggiare Low-Cost in Europa: Consigli e Trucchi',
            excerpt='Esplora il Vecchio Continente senza svuotare il portafoglio...',
            content="""
                <h2>Introduzione al Viaggio Economico</h2>
                <p>L'Europa è ricca di storia, cultura e paesaggi mozzafiato. Molti pensano che visitarla richieda un budget elevato, ma con la giusta pianificazione è possibile vivere esperienze indimenticabili spendendo poco.</p>
                
                <h2>Scegli il Periodo Giusto</h2>
                <p>Viaggiare in bassa stagione (generalmente da ottobre a marzo, escluse le festività) può significare voli e alloggi molto più economici, oltre a meno folla nelle attrazioni principali.</p>
                
                <h2>Trasporti Intelligenti</h2>
                <p>Compagnie aeree low-cost, autobus a lunga percorrenza (come Flixbus o Eurolines) e treni regionali sono ottime opzioni. Prenota in anticipo e considera pass ferroviari se pianifichi molti spostamenti.</p>
                
                <h2>Alloggi Alternativi</h2>
                <p>Ostelli, Airbnb (stanze private), case vacanza e couchsurfing sono alternative più economiche agli hotel tradizionali. Molti offrono cucine condivise, permettendo di risparmiare sui pasti.</p>

                <h2>Mangiare Locale e Risparmiare</h2>
                <p>Evita i ristoranti turistici. Cerca mercati locali, panetterie e piccoli ristoranti frequentati dalla gente del posto. Preparare alcuni pasti da soli può fare una grande differenza nel budget.</p>

                <h2>Attività Gratuite o a Basso Costo</h2>
                <p>Molte città europee offrono tour a piedi gratuiti, musei con ingresso libero in determinati giorni, parchi meravigliosi e la possibilità di esplorare quartieri caratteristici senza spendere nulla.</p>

                <h2>Conclusione</h2>
                <p>Viaggiare in Europa con un budget limitato richiede un po' più di pianificazione, ma la ricompensa è un'avventura autentica e accessibile. Flessibilità e ricerca sono le tue migliori alleate!</p>
            """,
            status='published',
            authorId='a2',
            publishDate=date(2024, 5, 1),
            readTime=11,
            likes=420,
            views=2100,
            isLiked=True,
            thumbnail='https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400&h=250&fit=crop', # Travel
            tags=", ".join(["Viaggi", "Europa", "Low-Cost", "Budget", "Consigli"])
        ),
        Article(
            id='8',
            title='Imparare una Nuova Lingua: Metodi Efficaci e Risorse Utili',
            excerpt='Strategie e strumenti per padroneggiare una lingua straniera con successo...',
            content="""
                <h2>Perché Imparare una Nuova Lingua?</h2>
                <p>Padroneggiare una nuova lingua apre porte a nuove culture, opportunità di carriera e connessioni personali. È anche un ottimo esercizio per il cervello, migliorando la memoria e le capacità cognitive.</p>
                
                <h2>Metodi di Apprendimento Popolari</h2>
                <p>Esistono diversi approcci: l'immersione totale, le lezioni frontali (online o di persona), l'autoapprendimento con app e libri, e lo scambio linguistico con madrelingua. Spesso una combinazione di metodi è la più efficace.</p>
                
                <h2>Risorse Digitali Consigliate</h2>
                <p>App come Duolingo, Babbel, Memrise offrono lezioni interattive. Piattaforme come iTalki o Tandem connettono studenti con tutor e partner linguistici. YouTube è pieno di canali didattici gratuiti.</p>
                
                <h2>Consigli per il Successo</h2>
                <p><strong>Costanza:</strong> Studia regolarmente, anche solo per 15-30 minuti al giorno. <strong>Obiettivi Realistici:</strong> Non pretendere di diventare fluente in poche settimane. <strong>Pratica Attiva:</strong> Parla, scrivi, ascolta e leggi il più possibile. <strong>Divertimento:</strong> Trova modi per rendere l'apprendimento piacevole, come guardare film, ascoltare musica o leggere libri nella lingua target.</p>

                <h2>Superare gli Ostacoli Comuni</h2>
                <p>La paura di sbagliare e la mancanza di motivazione sono comuni. Ricorda che commettere errori fa parte del processo. Trova una community di apprendimento per supporto e mantieni chiari i tuoi obiettivi.</p>

                <h2>Conclusione</h2>
                <p>Imparare una nuova lingua è un viaggio gratificante. Con la giusta strategia, le risorse adeguate e una buona dose di perseveranza, chiunque può raggiungere un buon livello di competenza.</p>
            """,
            status='published',
            authorId='a6',
            publishDate=date(2024, 4, 20),
            readTime=9,
            likes=310,
            views=1500,
            isLiked=False,
            thumbnail='https://images.unsplash.com/photo-1524578254289-77175071768a?w=400&h=250&fit=crop', # Language learning
            tags=", ".join(["Lingue", "Apprendimento", "Educazione", "Risorse", "Autodidatta"])
        ),
        Article(
            id='9',
            title='Le Scoperte del Telescopio Spaziale James Webb',
            excerpt='Uno sguardo alle immagini e ai dati rivoluzionari forniti dal JWST...',
            content="""
                <h2>Introduzione al James Webb Space Telescope (JWST)</h2>
                <p>Lanciato nel dicembre 2021, il James Webb Space Telescope è il successore del telescopio spaziale Hubble, progettato per osservare l'universo nell'infrarosso. Le sue capacità stanno rivoluzionando la nostra comprensione del cosmo.</p>
                
                <h2>Le Prime Galassie dell'Universo</h2>
                <p>Una delle missioni primarie del JWST è scrutare indietro nel tempo, fino alle prime luci dell'universo. Ha già individuato galassie esistenti solo poche centinaia di milioni di anni dopo il Big Bang, molto prima di quanto si pensasse possibile.</p>
                
                <h2>Atmosfere di Esopianeti</h2>
                <p>Il JWST sta analizzando le atmosfere di pianeti al di fuori del nostro sistema solare (esopianeti) con una precisione senza precedenti. Ha rilevato vapore acqueo, anidride carbonica e altre molecole, fornendo indizi sulla potenziale abitabilità di questi mondi lontani.</p>
                
                <h2>Nascita e Morte delle Stelle</h2>
                <p>Grazie alla sua visione infrarossa, il JWST può penetrare le dense nubi di gas e polvere dove nascono le stelle, rivelando dettagli inediti dei processi di formazione stellare e planetaria. Sta anche studiando i resti di stelle esplose (supernovae).</p>

                <h2>Implicazioni per l'Astrofisica</h2>
                <p>Le osservazioni del JWST stanno già mettendo alla prova i modelli cosmologici esistenti e aprendo nuove domande. Ogni nuova immagine e ogni spettro raccolto aggiungono tasselli fondamentali al puzzle della storia dell'universo.</p>

                <h2>Conclusione</h2>
                <p>Il Telescopio Spaziale James Webb è solo all'inizio della sua missione, ma ha già dimostrato di essere uno strumento scientifico straordinario. Le scoperte future promettono di essere ancora più entusiasmanti e di trasformare la nostra visione del cosmo.</p>
            """,
            status='published',
            authorId='a3',
            publishDate=date(2024, 5, 15),
            readTime=12,
            likes=550,
            views=3200,
            isLiked=True,
            thumbnail='https://images.unsplash.com/photo-1614726365903-6746235378c4?w=400&h=250&fit=crop', # Space/JWST
            tags=", ".join(["Scienza", "Astronomia", "JWST", "Spazio", "Universo"])
        )
    ]
    db.add_all(articles)
    # Leaderboard
    leaderboard_entries = [
        Leaderboard(
            id='1',
            name='Stefano',
            avatar='https://www.plai-accelerator.com/content/uploads/2024/05/WhatsApp-Image-2024-05-30-at-22.20.28-e1717100490694.jpeg',
            level=15,
            totalXp=8750,
            articlesRead=127,
            streak=45
        ),
        Leaderboard(
            id='2',
            name='Antonio',
            avatar='https://www.plai-accelerator.com/content/uploads/2024/05/Antonio-Porro-AD-Gruppo-Mondadori-e1716021576318.jpeg',
            level=13,
            totalXp=6890,
            articlesRead=98,
            streak=23
        ),
        Leaderboard(
            id='3',
            name='Andrea',
            avatar='https://www.plai-accelerator.com/content/uploads/2024/04/Sito_Santagata.jpg',
            level=12,
            totalXp=5940,
            articlesRead=85,
            streak=18
        ),
        Leaderboard(
            id='4',
            name='Margherita',
            avatar='https://www.plai-accelerator.com/content/uploads/2025/05/corini-foto_346.jpg',
            level=12,
            totalXp=5200,
            articlesRead=76,
            streak=12
        ),
        Leaderboard(
            id='5',
            name='Caterina',
            avatar='https://www.plai-accelerator.com/content/uploads/2025/03/caterina-rutschmann_346_ok.png',
            level=9,
            totalXp=2450,
            articlesRead=34,
            streak=8
        ),
        Leaderboard(
            id='6',
            name='Francesco',
            avatar='https://www.plai-accelerator.com/content/uploads/2025/05/francesco_cavallo_346.jpeg',
            level=7,
            totalXp=1337,
            articlesRead=11,
            streak=3
        ),
        Leaderboard(
            id='7',
            name='Gabriele',
            avatar='https://forums.terraria.org/data/avatars/h/197/197802.jpg',
            level=6,
            totalXp=619,
            articlesRead=8,
            streak=2
        ),
        Leaderboard(
            id='8',
            name='Daniele',
            avatar='https://www.plai-accelerator.com/content/uploads/2024/05/giovannone_daniele_2.jpg',
            level=3,
            totalXp=322,
            articlesRead=6,
            streak=1
        ),
    ]

    db.add_all(leaderboard_entries)

    db.commit()
    db.close()
    print("Dati iniziali caricati con successo.")
