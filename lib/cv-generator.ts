import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateHybridCV = (user: any, profile: any) => {
  const doc = new jsPDF("p", "pt", "a4");

  // Title
  doc.setFontSize(24);
  doc.text(user?.name || "Student", 40, 50);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(user?.email || "Email not provided", 40, 70);

  let currentY = 100;

  // Function to add a section
  const addSection = (title: string, y: number) => {
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 153);
    doc.text(title, 40, y);
    doc.setLineWidth(1);
    doc.setDrawColor(0, 51, 153);
    doc.line(40, y + 5, 550, y + 5);
    doc.setTextColor(0);
    return y + 25;
  };

  // Section 1: Top Career Matches (from Career Guide / Career Emotion)
  currentY = addSection("AI Career Profile", currentY);
  doc.setFontSize(12);

  const topGuidance = profile?.careerGuide?.top_1_prediction || "Not Available";
  doc.setFont("helvetica", "bold");
  doc.text("Top Recommended Role:", 40, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(topGuidance, 200, currentY);
  currentY += 20;

  if (profile?.careerEmotion?.topCareers?.[0]) {
    const emotionTop = profile.careerEmotion.topCareers[0];
    doc.setFont("helvetica", "bold");
    doc.text("Emotional Intelligence Fit:", 40, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`${emotionTop.career} (${Math.round(emotionTop.confidence * 100)}% match)`, 200, currentY);
    currentY += 30;
  }

  // Section 2: Skills & Market Dynamics (from Career Market)
  if (profile?.careerMarket) {
    currentY = addSection("Skill Market Analysis", currentY);
    doc.setFontSize(12);
    const mkt = profile.careerMarket;
    
    doc.setFont("helvetica", "bold");
    doc.text("Current Market Role Analyzed:", 40, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(mkt.career || "N/A", 200, currentY);
    currentY += 20;

    const overlap = mkt.studentGap?.have?.join(", ") || "None";
    const missing = mkt.studentGap?.missing?.slice(0, 3).map((m: any) => m.skill).join(", ") || "None";

    doc.text(`Matched Skills: ${overlap}`, 40, currentY);
    currentY += 20;
    doc.text(`Skills to Acquire: ${missing}`, 40, currentY);
    currentY += 30;
  }

  // Section 3: Personalized Learning Roadmap (from Career Prep)
  if (profile?.careerPrep?.roadmap?.milestones?.length > 0) {
    currentY = addSection("Preparation Roadmap", currentY);
    
    const bodyData = profile.careerPrep.roadmap.milestones.map((m: any, i: number) => {
      return [
        `Month ${i + 1}`,
        m.title,
        m.skills?.slice(0, 2).join(", ") || "N/A",
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: 40, right: 40 },
      head: [["Timeline", "Target Milestone", "Key Focus Skills"]],
      body: bodyData,
      theme: "striped",
      headStyles: { fillColor: [0, 51, 153] }
    });

    currentY = (doc as any).lastAutoTable.finalY + 30;
  }

  // Check bounds
  if (currentY > 750) {
    doc.addPage();
    currentY = 50;
  }

  // Output
  doc.save(`${user?.name || "Hybrid"}_AI_Career_CV.pdf`);
};
