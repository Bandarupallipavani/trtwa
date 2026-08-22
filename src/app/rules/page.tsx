"use client";
import React from "react";
import Link from "next/link";

export default function RulesPage() {
  const rules = [
    {
      section: "విభాగం 1: యూనియన్ ప్రాథమిక సూత్రాలు & సభ్యత్వం (1 - 10)",
      items: [
        { id: "01", title: "యూనియన్ పేరు మరియు ఉద్దేశం", text: "టెక్నీషియన్ల సంక్షేమం, ఐక్యత మరియు హక్కుల పరిరక్షణ కోసం ఏర్పాటు చేయబడిన అధికారిక సంఘం. అందరం కలిసికట్టుగా ఉంటే మార్కెట్లో మనకు ప్రత్యేక గుర్తింపు మరియు భద్రత లభిస్తుంది." },
        { id: "02", title: "సభ్యత్వం అర్హతలు", text: "అర్హత కలిగిన ప్రతి వాటర్ ప్యూరిఫైయర్ టెక్నీషియన్ యూనియన్లో సభ్యుడిగా చేరవచ్చు. సరైన అనుభవం ఉన్న టెక్నీషియన్లు మాత్రమే చేరడం ద్వారా సంఘం నాణ్యత మరియు గౌరవం నిలబడుతుంది." },
        { id: "03", title: "సభ్యత్వ రుసుము", text: "సంఘం నిర్వహణ నిమిత్తం నిర్ణయించిన ప్రారంభ రుసుము చెల్లించాలి. యూనియన్ ఫండ్ బలపడి అత్యవసర సమయాల్లో సంఘం నడవడానికి ఇది ప్రధాన ఆధారం." },
        { id: "04", title: "మాసపు చందా నియమం", text: "యూనియన్ ఖర్చులు మరియు సంక్షేమ కార్యక్రమాల కోసం ప్రతి నెలా క్రమం తప్పకుండా చందా చెల్లించాలి." },
        { id: "05", title: "నెలవారీ సమావేశాలు", text: "ప్రతి నెలా నిర్దిష్ట తేదీన అందరూ సమావేశమై వ్యాపార అభివృద్ధి గురించి చర్చించాలి." }
      ]
    },
    {
      section: "విభాగం 2: వ్యాపార విధానాలు & కస్టమర్ సంబంధాలు (11 - 20)",
      items: [
        { id: "11", title: "వ్యాపార పోటీ నియమాలు", text: "ఇతరుల వ్యాపారాన్ని దెబ్బతీసేలా తప్పుడు ప్రచారాలు చేయరాదు. ఆరోగ్యకరమైన పోటీ మాత్రమే ఉండాలి." },
        { id: "12", title: "కస్టమర్లతో ప్రవర్తన", text: "కస్టమర్లతో ఎప్పుడూ మర్యాదగా, సంయమనంతో మాట్లాడాలి." },
        { id: "20", title: "పాత పార్ట్స్ రీసైక్లింగ్ నిబంధన", text: "పాడైపోయిన పాత ఫిల్టర్లు మరియు స్పేర్ పార్ట్స్ ను నిబంధనల ప్రకారం పారవేయాలి. పర్యావరణాన్ని కాపాడుకోవడం మన బాధ్యత." }
      ]
    },
    {
      section: "విభాగం 3: సర్వీస్ స్టాండర్డ్స్ & భద్రత (21 - 30)",
      items: [
        { id: "21", title: "వారంటీ కార్డుల నిర్వహణ", text: "కొత్త ప్యూరిఫైయర్ లేదా పార్ట్ బిగించినప్పుడు ఖచ్చితంగా వారంటీ కార్డ్ ఇవ్వాలి." },
        { id: "22", title: "సేఫ్టీ గైడ్‌లైన్స్ & భద్రత", text: "కరెంట్ పనులు చేసేటప్పుడు తగిన భద్రతా జాగ్రత్తలు పాటించాలి. ప్రాణాపాయం రాకుండా జాగ్రత్తపడడం మొదటి కర్తవ్యం." },
        { id: "26", title: "టైమ్ మేనేజ్‌మెంట్", text: "కస్టమర్ ఇచ్చిన టైమ్ కి వెళ్లి సర్వీస్ పూర్తి చేయాలి. సమయపాలన ఉంటేనే మార్కెట్లో విలువ పెరుగుతుంది." }
      ]
    },
    {
      section: "విభాగం 4: సంక్షేమం & ఆర్థిక భద్రత (31 - 40)",
      items: [
        { id: "31", title: "డిజిటల్ పేమెంట్స్ విధానం", text: "కస్టమర్ల నుండి ఆన్లైన్ పేమెంట్స్ స్వీకరించేటప్పుడు స్పష్టత ఉండాలి. డిజిటల్ లావాదేవీలు పారదర్శకతను పెంచుతాయి." },
        { id: "34", title: "వృద్ధ టెక్నీషియన్ల సంక్షేమం", text: "వృద్ధాప్యం వల్ల పని చేయలేని సీనియర్ టెక్నీషియన్లకు యూనియన్ నుండి అండగా నిలవాలి." },
        { id: "36", title: "అనుకోని ప్రమాద బీమా (Group Insurance)", text: "యూనియన్ ఆధ్వర్యంలో సభ్యులందరికీ గ్రూప్ ఇన్సూరెన్స్ చేయించడానికి కృషి చేయాలి. ప్రాణాలకు భద్రత కల్పించడం అత్యవసరం." }
      ]
    }
  ];

  return (
    <div style={{ maxWidth: "800px", margin: "4rem auto", padding: "0 1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 className="heading-1" style={{ color: "var(--primary-color)" }}>TRWA నియమ నిబంధనలు</h1>
        <p className="text-body" style={{ fontSize: "1.125rem" }}>
          తెలంగాణ RO టెక్నీషియన్స్ వెల్ఫేర్ అసోసియేషన్ అధికారిక బైలాస్ (సంక్షిప్త రూపం)
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {rules.map((section, index) => (
          <div key={index} className="card" style={{ padding: "2rem" }}>
            <h2 className="heading-2" style={{ borderBottom: "2px solid var(--border-color)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              {section.section}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {section.items.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ 
                    background: "var(--primary-color)", color: "white", 
                    width: "40px", height: "40px", borderRadius: "50%", 
                    display: "flex", alignItems: "center", justifyContent: "center", 
                    fontWeight: "bold", flexShrink: 0
                  }}>
                    {item.id}
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.125rem", color: "var(--text-color)" }}>{item.title}</h3>
                    <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.6 }}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <Link href="/" className="btn btn-secondary">Back to Home</Link>
      </div>
    </div>
  );
}
