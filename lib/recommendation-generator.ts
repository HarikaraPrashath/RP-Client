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
  // Modern dark header
  doc.setFillColor(30, 58, 138); // blue-900
  doc.rect(0, 0, pageWidth, 80, "F");
  // Accent line
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 80, pageWidth, 4, "F");
  
  centerText("MENTORA CAREER REPORT", 45, 20, [255, 255, 255]);
  centerText(`Prepared exclusively for: ${user?.name || "Valued User"}`, 65, 12, [148, 163, 184]);

  let currentY = 120;

  // --- 1. Executive Summary ---
  const addSectionTitle = (title: string, y: number) => {
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont("helvetica", "bold");
    doc.text(title, 40, y);
    // Draw modern left accent
    doc.setFillColor(37, 99, 235); // blue-600
    doc.rect(25, y - 12, 4, 16, "F");
    
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(1);
    doc.line(40, y + 8, pageWidth - 40, y + 8);
    
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
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 8 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 40;
  } else {
    doc.text("No roadmap data found. Complete the Career Preparation assessment.", 40, currentY);
    currentY += 40;
  }

  // --- 4. Market Dynamics & Competitive Analysis ---
  if (currentY > 750) { doc.addPage(); currentY = 50; }
  currentY = addSectionTitle("IV. Market Intelligence & Skill Radar", currentY);

  const market = profile?.careerMarket;
  const allTrend = market?.allTrend;
  const mergeSkills = market?.mergeSkills;

  // --- Data Extraction & Synthesis ---
  const targetRole = mergeSkills?.career || "your target role";
  const matchScore = mergeSkills?.averageMatch ? Math.round(mergeSkills.averageMatch) : 0;
  const coverage = mergeSkills?.marketCoverage ? Math.round(mergeSkills.marketCoverage) : 0;
  
  const targetTrend = allTrend?.topPromising?.find((p: any) => 
    p.name.toLowerCase().includes(targetRole.toLowerCase()) || 
    targetRole.toLowerCase().includes(p.name.toLowerCase())
  );
  const growth = targetTrend ? Math.round(targetTrend.growth) : 18;
  const industry = targetTrend ? targetTrend.name : "Technology";

  let missingSkill = "key technologies";
  let allRecSkills: string[] = [];
  if (mergeSkills?.roadmap) {
    allRecSkills = Object.values(mergeSkills.roadmap).flatMap((r: any) => r.recommended_skills || []);
    if (allRecSkills.length > 0) missingSkill = allRecSkills[0];
  }

  let urgentSkill = missingSkill;
  let isRising = false;
  if (allTrend?.rising && allRecSkills.length > 0) {
    const risingTerms = allTrend.rising.map((r: any) => r.term.toLowerCase());
    const risingGaps = allRecSkills.filter((s: string) => risingTerms.includes(s.toLowerCase()));
    if (risingGaps.length > 0) {
      urgentSkill = risingGaps[0];
      isRising = true;
    }
  }

  const userSkills = profile?.profile?.skills || [];
  const advantageSkill = userSkills.length > 0 ? userSkills[0] : "your core technical foundation";

  // A. Executive Summary: You vs. The Market
  if (currentY > 700) { doc.addPage(); currentY = 50; }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("A. Executive Summary: You vs. The Market", 40, currentY);
  currentY += 15;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.setFontSize(10);
  const execSummary = `Your current background gives you a ${matchScore}% readiness for ${targetRole}. This is an excellent position, as the market for ${targetRole} is currently experiencing a +${growth}% surge. You have strong market coverage (${coverage}%), but bridging the gap in ${missingSkill} will significantly increase your competitiveness.`;
  const splitExec = doc.splitTextToSize(execSummary, pageWidth - 80);
  doc.text(splitExec, 40, currentY);
  currentY += (splitExec.length * 13) + 15;

  // B. High Value Gap & Your Market Edge
  if (currentY > 700) { doc.addPage(); currentY = 50; }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 38, 38); // Red
  doc.text("High Value Gap:", 40, currentY);
  
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text("Your Market Edge:", pageWidth / 2, currentY);
  currentY += 15;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.setFontSize(10);
  
  const gapText = `You are missing ${urgentSkill}. This skill is currently a ${isRising ? "rising" : "high-demand"} technology in the global market. Learning it now will give you an immediate competitive advantage.`;
  const splitGap = doc.splitTextToSize(gapText, (pageWidth / 2) - 50);
  doc.text(splitGap, 40, currentY);

  const edgeText = `You already possess solid experience in ${advantageSkill}, which is currently categorized as a high-demand asset in the top-promising ${industry} sector.`;
  const splitEdge = doc.splitTextToSize(edgeText, (pageWidth / 2) - 50);
  doc.text(splitEdge, pageWidth / 2, currentY);
  
  const maxLines = Math.max(splitGap.length, splitEdge.length);
  currentY += (maxLines * 13) + 20;



  if (!allTrend && !mergeSkills) {
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("No market intelligence data found. Please complete the All-Trend and Skill Radar assessments.", 40, currentY);
    currentY += 30;
  }

  // --- Synthesis ---
  if (currentY > 750) { doc.addPage(); currentY = 50; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Conclusion & Synthesis:", 40, currentY);
  currentY += 18;
  doc.setFont("helvetica", "italic");
  doc.setTextColor(0);
  doc.setFontSize(10);
  
  const marketSummary = mergeSkills 
    ? `Your alignment for the "${mergeSkills.career}" role is currently at ${Math.round(mergeSkills.averageMatch)}%. `
    : "Your market alignment analysis is pending. ";
  const promiseSummary = allTrend?.topPromising?.[0]
    ? `The market shows high momentum for paths like ${allTrend.topPromising[0].name}. `
    : "";

  const conclusion = `The synergy between your academic background (${topGuide}) and your emotional intelligence profile (${topEmotion?.career || "General"}) creates a unique competitive advantage. ${marketSummary}${promiseSummary}By following the strategic roadmap and focusing on the identified high-growth technologies, you will not only gain the technical skills required for the market but also leverage your natural behavioral strengths to excel in high-pressure environments.`;
  
  const splitConclusion = doc.splitTextToSize(conclusion, pageWidth - 80);
  doc.text(splitConclusion, 40, currentY);

  // --- Footer ---
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(9); doc.setTextColor(148, 163, 184); // slate-400
  const footerText = "Generated by Mentora AI Career Platform - " + new Date().toLocaleDateString();
  const footerWidth = doc.getTextWidth(footerText);
  doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 30);

  // --- Save ---
  doc.save(`${user?.name || "User"}_Career_Recommendation_Report.pdf`);
};
