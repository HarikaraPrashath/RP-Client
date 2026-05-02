"use client";

import { authHeader } from "../../lib/auth";

export default function SaveToProfileButton({
  data,
  type,
  label = "Save Insights to Profile"
}: {
  data: any;
  type: 'allTrend' | 'mergeSkills' | 'trDashboard';
  label?: string;
}) {
  const onSaveToProfile = async () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      const getHeaders = { ...authHeader() };
      const resGet = await fetch(apiBase + "/profile", { 
        credentials: "include",
        headers: getHeaders
      });
      if (!resGet.ok) throw new Error("Failed to get profile");
      const profileData = await resGet.json();

      if (!profileData.careerMarket) {
        profileData.careerMarket = {};
      }

      profileData.careerMarket[type] = data;

      const putHeaders = { 
        "Content-Type": "application/json", 
        ...authHeader() 
      };
      const resPut = await fetch(apiBase + "/profile", {
        method: "PUT",
        headers: putHeaders,
        credentials: "include",
        body: JSON.stringify(profileData)
      });
      if (resPut.ok) {
        alert(`Success! ${type === 'allTrend' ? 'Market' : 'Skill'} Insights saved to your Profile.`);
      } else {
        alert("Failed to save to profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile.");
    }
  };

  return (
    <button
      onClick={onSaveToProfile}
      style={{
        background: "#0f172a",
        color: "white",
        border: "none",
        padding: "0.5rem 1rem",
        borderRadius: "0.5rem",
        fontWeight: "bold",
        cursor: "pointer",
        marginTop: "1rem"
      }}
    >
      {label}
    </button>
  );
}
