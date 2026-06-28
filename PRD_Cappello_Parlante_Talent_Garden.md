# **Documento di Requisiti Tecnici (PRD)**

Webapp "Cappello Parlante Tech"

**Progetto:** Sistema di Smistamento Dinamico per Talent Garden  
**Destinatario dell'implementazione:** Agente di Sviluppo AI (es. Google Antigravity / Coding Agent)  
**Obiettivo:** Creare una webapp interattiva e scenografica, proiettata su grande schermo, capace di profilare i ragazzi attraverso 3 domande dinamiche basate su slider e assegnarli ai laboratori rimasti liberi, rispettando rigidamente i vincoli di capienza ed evitando spreco di domande su categorie già sature.  
 

## **1\. Architettura di Sistema e Flusso Utente (UX/UI)**

---

Il sistema è concepito per una fruizione pubblica e scenografica. L'interfaccia deve essere ottimizzata per la visualizzazione su proiettore (font grandi, contrasto elevato, animazioni fluide).

* **Schermata di Standby / Benvenuto:** Mostra il logo del Talent Garden e un grande pulsante "Inizia il tuo Smistamento". Viene visualizzato l'elenco dei laboratori con i posti totali (opzionale: i posti rimanenti in tempo reale).  
* **Fase di Input Domande:** Il sistema presenta una domanda alla volta (per un totale tassativo di 3 domande). Sotto ogni domanda compare uno *slider orizzontale*. L'estremità sinistra rappresenta il valore minimo (es. "No / Per nulla"), l'estremità destra il valore massimo (es. "Sì / Mi piacerebbe molto"). Il ragazzo interagisce con il sistema (tramite tablet/mouse) e la progressione dello slider è visibile in tempo reale sul proiettore.  
* **Schermata di Elaborazione (Effetto Scenico):** Dopo la terza risposta, la webapp mostra un'animazione di caricamento "tech" (codice che scorre, grafici in movimento, calcolo dell'algoritmo) per creare suspense nella sala.  
* **Schermata di Verdetto:** Il sistema riproduce un effetto sonoro ed esibisce a pieno schermo il nome del laboratorio assegnato, il nome del tutor e la stanza di destinazione.

 

## **2\. Modello Dati e Configurazione dei Laboratori**

---

L'agente AI deve implementare un database locale (o un file di configurazione JSON) che tenga traccia dello stato dei laboratori in tempo reale. Ogni volta che un ragazzo viene assegnato, il contatore posti\_occupati incrementa di 1\. Quando posti\_occupati \== capienza\_max, il laboratorio è contrassegnato come **SATURO**.

| ID Laboratorio | Nome Laboratorio | Capienza Max | Tutor Responsabili | Sede / Stanza   |
| :---- | :---- | :---- | :---- | :---- |
| LAB\_LUCI | **Luci \+ Proiezione** | 4 | Zeno | Regia |
| LAB\_VIDEO | **Video** | 4 | Lorenzo | Sala Traduzione |
| LAB\_AUDIO | **Audio** | 5 | Kevin \+ Zucchiatti | Fondo platea |
| LAB\_DRONI | **Coreografia con i Droni** | 8 | Fabio \+ Andreas | Sala Don Bosco |
| LAB\_PRES | **Presentatori** | 2 | Don Daniele | Ufficio Presidente |
| LAB\_NAO | **Balletto con NAO** | 3 | Luca Zani \+ Maya | Primo piano Juvenes |
| LAB\_COMEDY | **Sketch Comico** | 5 | Fabrizio \+ Frederiko | Ufficio Kevin |

 

## **3\. Logica Algoritmica e Discernimento Dinamico**

---

Questa è la specifica logica più importante che l'agente AI deve codificare. Il sistema non deve estrarre domande a caso da un pool fisso, ma deve calcolare quali laboratori hanno ancora posti disponibili **PRIMA** di somministrare la prima domanda del ragazzo corrente.

### **Metodologia dei Vettori di Attitudine (Ponderazione)**

Ogni laboratorio è definito da un profilo attitudinale basato su 4 macro-assi (valori da 0 a 100):

* **EXPO (Esposizione Pubblica / Palco):** Massimo per Presentatori e Sketch Comico; minimo per Audio/Luci.  
* **TECH (Propensione Tecnologica / Programmazione):** Massimo per Droni e Robot NAO; medio per Luci/Audio/Video; minimo per Presentatori.  
* **ART (Creatività Visiva e Performativa):** Massimo per Sketch Comico, Balletto NAO, Coreografia Droni e Video.  
* **BACK (Lavoro di Controllo / Regia / Dietro le quinte):** Massimo per Luci, Audio, Video.

### **Meccanismo di Selezione delle Domande (Filtro Predittivo)**

1. **Verifica Iniziale:** All'avvio della sessione del singolo ragazzo, il sistema recupera la lista dei soli laboratori con posti\_occupati \< capienza\_max (chiamato Pool\_Disponibili).  
2. **Calcolo della Varianza degli Assi:** Il sistema analizza quali assi attitudinali (EXPO, TECH, ART, BACK) mostrano la maggiore differenza (varianza) tra i laboratori rimasti nel Pool\_Disponibili.  
   *Esempio critico dell'utente:* Se rimangono solo LAB\_PRES (Presentatori) e LAB\_COMEDY (Sketch Comico), entrambi hanno un valore EXPO altissimo. Di conseguenza, l'asse EXPO ha varianza zero e viene ignorato. L'algoritmo rileva che la differenza sta nell'asse ART o in domande specifiche di contenuto (es. umorismo vs conduzione).  
3. **Generazione/Selezione della Domanda:** Il sistema seleziona dal database (o genera tramite un mini-template condizionale) domande i cui estremi dello slider (0 e 100\) pesino fortemente sulla discriminazione dei laboratori rimasti.

 

## **4\. Requisiti Funzionali Dettagliati (Per lo Sviluppo del Codice)**

### ---

**RF-01: Struttura del Database Domande (Esempio JSON richiesto per l'AI)**

{  
  "questions": \[  
    {  
      "id": "Q01",  
      "testo": "Hai mai recitato in un film o ti piacerebbe farlo?",  
      "label\_sinistra": "No, per nulla",  
      "label\_destra": "Sì, mi piacerebbe molto",  
      "impatto": { "LAB\_COMEDY": \+3, "LAB\_VIDEO": \+1 }  
    },  
    {  
      "id": "Q02",  
      "testo": "Ti piace essere al centro dell'attenzione?",  
      "label\_sinistra": "Per nulla",  
      "label\_destra": "Moltissimo",  
      "impatto": { "LAB\_PRES": \+4, "LAB\_COMEDY": \+4, "LAB\_LUCI": \-2, "LAB\_AUDIO": \-2 }  
    },  
    {  
      "id": "Q03",  
      "testo": "Se vedi un robot o un drone, preferisci guardarlo o programmarne i movimenti?",  
      "label\_sinistra": "Solo guardarlo",  
      "label\_destra": "Programmare i movimenti",  
      "impatto": { "LAB\_DRONI": \+4, "LAB\_NAO": \+4, "LAB\_COMEDY": \-3 }  
    },  
    {  
      "id": "Q04",  
      "testo": "Nello strutturare una performance sul palco, preferisci far ridere o coordinare la scaletta?",  
      "label\_sinistra": "Far ridere di gusto",  
      "label\_destra": "Coordinare e presentare",  
      "impatto": { "LAB\_COMEDY": \+5, "LAB\_PRES": \-5 }   
    }  
  \]  
}

*\*Nota per l'AI: La domanda Q04 è un esempio di domanda ad attivazione condizionale esclusiva, utile quando lo scenario si restringe solo a Presentatori e Sketch Comico.*

### **RF-02: Calcolo del Punteggio e Risoluzione dei Pareggi**

* Ad ogni spostamento dello slider (valore da 0 a 10), il sistema moltiplica il valore per il fattore di impatto associato ai laboratori validi.  
* Il laboratorio che ottiene il punteggio cumulativo più alto nelle 3 domande viene selezionato per l'assegnazione.  
* **Gestione del Pareggio Esatto:** Nel caso in cui due laboratori ottengano lo stesso identico punteggio, il sistema assegna automaticamente il ragazzo al laboratorio che ha, in quel momento, la percentuale minore di posti occupati (favorendo il riempimento omogeneo).

 

## **5\. Requisiti Non Funzionali e Note di Sicurezza Logica**

* ---

  **Persistenza dello Stato:** Lo stato dei posti occupati deve essere salvato localmente ad ogni assegnazione (es. in LocalStorage del browser o in un file JSON backend), in modo che se la pagina viene ricaricata accidentalmente durante la proiezione, non si perdano i dati dei ragazzi già smistati.  
* **Prevenzione del Crash di Sotto-Insieme:** Nel caso limite in cui rimanga un solo laboratorio con posti liberi in tutto il Talent Garden, il sistema deve saltare la fase delle domande e mostrare direttamente una schermata speciale di "Chiamata alle Armi Speciale" per l'ultimo team rimasto, spiegando scenograficamente che quel team ha bisogno di rinforzi immediati, salvaguardando la narrazione del gioco.