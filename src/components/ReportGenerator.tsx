import React, { useState } from "react";
import { Download, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { UserProfile } from "../services/gemini";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useUI } from "../context/UIContext";

interface ReportGeneratorProps {
  profile: UserProfile;
}

export function ReportGenerator({ profile }: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useUI();

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const reportElement = document.getElementById("financial-report-content");
      if (!reportElement) throw new Error("Report content not found");

      // Temporarily show the hidden report content for capturing
      reportElement.style.display = "block";
      
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ET_AI_Financial_Plan_${profile.displayName?.replace(/\s+/g, "_") || "User"}.pdf`);

      // Hide it back
      reportElement.style.display = "none";
      showToast("Report downloaded successfully!", "success");
    } catch (error) {
      console.error("PDF generation error:", error);
      showToast("Failed to generate report", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={generatePDF}
        disabled={isGenerating}
        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {isGenerating ? "Generating Report..." : "Download Financial Plan"}
      </button>

      {/* Hidden Report Content for PDF Generation */}
      <div 
        id="financial-report-content" 
        style={{ 
          display: "none", 
          width: "210mm", 
          padding: "20mm", 
          position: "fixed", 
          left: "-9999px", 
          top: "-9999px",
          backgroundColor: "#ffffff",
          color: "#000000",
          fontFamily: "Inter, sans-serif"
        }}
      >
        <div style={{ borderBottom: "2px solid #10b981", paddingBottom: "10mm", marginBottom: "10mm", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "24pt", fontWeight: "900", margin: 0, letterSpacing: "-1px" }}>ET AI CONCIERGE</h1>
            <p style={{ fontSize: "10pt", color: "#666", margin: "2mm 0 0 0" }}>Personalized Financial Strategy Report</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "8pt", color: "#999", margin: 0 }}>Generated on</p>
            <p style={{ fontSize: "10pt", fontWeight: "700", margin: 0 }}>{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10mm", marginBottom: "10mm" }}>
          <div style={{ backgroundColor: "#f9fafb", padding: "5mm", borderRadius: "8mm" }}>
            <h2 style={{ fontSize: "12pt", fontWeight: "900", marginBottom: "3mm" }}>User Profile</h2>
            <p style={{ fontSize: "10pt", margin: "1mm 0" }}><strong>Name:</strong> {profile.displayName}</p>
            <p style={{ fontSize: "10pt", margin: "1mm 0" }}><strong>Persona:</strong> {profile.persona}</p>
            <p style={{ fontSize: "10pt", margin: "1mm 0" }}><strong>Risk Level:</strong> {profile.riskLevel}</p>
            <p style={{ fontSize: "10pt", margin: "1mm 0" }}><strong>Income Range:</strong> {profile.incomeRange}</p>
          </div>
          <div style={{ backgroundColor: "#f0fdf4", padding: "5mm", borderRadius: "8mm", textAlign: "center" }}>
            <h2 style={{ fontSize: "12pt", fontWeight: "900", marginBottom: "3mm" }}>Financial Health Score</h2>
            <p style={{ fontSize: "36pt", fontWeight: "900", color: "#10b981", margin: 0 }}>{profile.financialScore || 72}</p>
            <p style={{ fontSize: "10pt", fontWeight: "700", color: "#065f46", margin: 0 }}>Wealth Builder</p>
          </div>
        </div>

        <div style={{ marginBottom: "10mm" }}>
          <h2 style={{ fontSize: "14pt", fontWeight: "900", borderBottom: "1px solid #eee", paddingBottom: "2mm", marginBottom: "4mm" }}>Active Savings Goals</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5mm" }}>
            {profile.savingsGoals?.map((goal, i) => (
              <div key={i} style={{ border: "1px solid #eee", padding: "4mm", borderRadius: "6mm" }}>
                <p style={{ fontSize: "10pt", fontWeight: "700", margin: "0 0 1mm 0" }}>{goal.title}</p>
                <p style={{ fontSize: "8pt", color: "#666", margin: "0 0 2mm 0" }}>{goal.category}</p>
                <div style={{ height: "2mm", backgroundColor: "#eee", borderRadius: "1mm", overflow: "hidden", marginBottom: "2mm" }}>
                  <div style={{ height: "100%", backgroundColor: "#10b981", width: `${(goal.currentSavings / goal.targetAmount) * 100}%` }}></div>
                </div>
                <p style={{ fontSize: "8pt", margin: 0 }}>₹{goal.currentSavings.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "10mm" }}>
          <h2 style={{ fontSize: "14pt", fontWeight: "900", borderBottom: "1px solid #eee", paddingBottom: "2mm", marginBottom: "4mm" }}>Recommended Services</h2>
          {profile.recommendations?.map((rec, i) => (
            <div key={i} style={{ marginBottom: "4mm" }}>
              <p style={{ fontSize: "10pt", fontWeight: "700", margin: "0 0 1mm 0" }}>{rec.title}</p>
              <p style={{ fontSize: "9pt", color: "#444", margin: "0 0 1mm 0" }}>{rec.description}</p>
              <p style={{ fontSize: "8pt", color: "#10b981", fontStyle: "italic", margin: 0 }}>Why: {rec.whyRecommended}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "20mm", paddingTop: "5mm", borderTop: "1px solid #eee", textAlign: "center" }}>
          <p style={{ fontSize: "8pt", color: "#999" }}>This report is AI-generated for informational purposes only. Consult with a human financial advisor for critical decisions.</p>
          <p style={{ fontSize: "9pt", fontWeight: "700", color: "#10b981" }}>© 2026 The Economic Times</p>
        </div>
      </div>
    </>
  );
}
