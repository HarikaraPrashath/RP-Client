import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateRecommendationReport = (user: any, profile: any) => {
  const doc = new jsPDF("p", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Helper: Center Text
  const centerText = (text: string, y: number, size: number, color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // --- Header & Title ---
  doc.setFillColor(30, 58, 138); // Dark blue header
  doc.rect(0, 0, pageWidth, 80, "F");
  
  centerText("CAREER RECOMMENDATION REPORT", 45, 20, [255, 255, 255]);
  centerText(`Prepared for: ${user?.name || "Valued User"}`, 65, 12, [224, 231, 255]);

  let currentY = 120;

  // --- 1. Executive Summary ---
  const addSectionTitle = (title: string, y: number) => {
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138);
    doc.setFont("helvetica", "bold");
    doc.text(title, 40, y);
    doc.setLineWidth(1.5);
    doc.setDrawColor(30, 58, 138);
    doc.line(40, y + 5, pageWidth - 40, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    return y + 35;
  };

  // --- 1. Academic & Skill Alignment ---
  currentY = addSectionTitle("I. Academic & Skill Alignment", currentY);
  doc.setFontSize(11);
  const topGuide = profile?.careerGuide?.top_1_prediction || "No specific career prediction available.";
  const otherMatches = profile?.careerGuide?.top_3_predictions || [];
  const guidance = profile?.careerGuide?.guidance || "";
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(`Top Recommended Role:`, 40, currentY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(37, 99, 235);
  doc.text(topGuide, 180, currentY);
  currentY += 20;
  
  if (otherMatches.length > 0) {
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(`Alternative Paths:`, 40, currentY);
    doc.setFont("helvetica", "normal");
    const otherText = otherMatches.join(", ");
    const splitOther = doc.splitTextToSize(otherText, pageWidth - 200);
    doc.text(splitOther, 180, currentY);
    currentY += (splitOther.length * 14) + 15;
  }

  if (guidance) {
    const cleanGuidance = guidance
      .replace(/###\s\d️⃣\s/g, "")
      .replace(/\*\*/g, "")
      .replace(/-\s\s\*/g, "• ");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text("AI Academic Fit Analysis:", 40, currentY);
    currentY += 18;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.setFontSize(10);
    const splitGuidance = doc.splitTextToSize(cleanGuidance, pageWidth - 80);
    doc.text(splitGuidance, 40, currentY);
    currentY += (splitGuidance.length * 14) + 25;
  }

  // Check Page Break
  if (currentY > 750) { doc.addPage(); currentY = 50; }

  // --- 2. Emotional & Behavioral Fit ---
  currentY = addSectionTitle("II. Emotional & Behavioral Analysis", currentY);
  const topEmotion = profile?.careerEmotion?.topCareers?.[0] || null;
  const insights = profile?.careerEmotion?.insights || [];

  if (topEmotion) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Behavioral Career Match:", 40, currentY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(37, 99, 235);
    doc.text(`${topEmotion.career} (${Math.round(topEmotion.confidence * 100)}% Match)`, 190, currentY);
    currentY += 25;
  }

  if (insights.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text("Qualitative Insights (Soft Skills):", 40, currentY);
    currentY += 18;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.setFontSize(10);
    insights.forEach((insight: string) => {
      const splitInsight = doc.splitTextToSize(`• ${insight}`, pageWidth - 100);
      doc.text(splitInsight, 50, currentY);
      currentY += (splitInsight.length * 13) + 5;
    });
    currentY += 20;
  } else {
    doc.setFontSize(10);
    doc.text("No emotional analysis data available. Complete the Emotional Intel assessment.", 40, currentY);
    currentY += 30;
  }

  // Check Page Break
  if (currentY > 750) { doc.addPage(); currentY = 50; }

  // --- 3. Strategic Learning Roadmap ---
  currentY = addSectionTitle("III. Strategic Learning Roadmap", currentY);
  if (profile?.careerPrep?.roadmap?.milestones?.length > 0) {
    const milestones = profile.careerPrep.roadmap.milestones;
    autoTable(doc, {
      startY: currentY,
      margin: { left: 40, right: 40 },
      head: [["Phase", "Action Milestone", "Priority Skills"]],
      body: milestones.map((m: any, i: number) => [
        `Phase ${i + 1}`, m.title, m.skills?.join(", ") || "N/A"
      ]),
      theme: "striped",
      headStyles: { fillColor: [30, 58, 138] },
      styles: { fontSize: 9 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 40;
  } else {
    doc.text("No roadmap data found. Complete the Career Preparation assessment.", 40, currentY);
    currentY += 40;
  }

  // --- Synthesis ---
  if (currentY > 750) { doc.addPage(); currentY = 50; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text("Conclusion & Synthesis:", 40, currentY);
  currentY += 18;
  doc.setFont("helvetica", "italic");
  doc.setTextColor(0);
  doc.setFontSize(10);
  const conclusion = `The synergy between your academic background (${topGuide}) and your emotional intelligence profile (${topEmotion?.career || "General"}) creates a unique competitive advantage. By following the learning roadmap above, you will not only gain the technical skills required for the market but also leverage your natural behavioral strengths to excel in high-pressure environments.`;
  const splitConclusion = doc.splitTextToSize(conclusion, pageWidth - 80);
  doc.text(splitConclusion, 40, currentY);

  // --- Footer ---
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(9); doc.setTextColor(150);
  const footerText = "Generated by FutureEdu AI Career Platform - " + new Date().toLocaleDateString();
  const footerWidth = doc.getTextWidth(footerText);
  doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 30);

  // --- Save ---
  doc.save(`${user?.name || "User"}_Career_Recommendation_Report.pdf`);
};
