"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import Image from "next/image";

// Helper functions for API calls
async function fetchSettings(key: string) {
  const res = await fetch(`/api/settings/${key}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to fetch settings");
  }
  return res.json();
}

async function saveSettings(key: string, value: any) {
  const res = await fetch(`/api/settings/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw new Error("Failed to save settings");
  return res.json();
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Landing Banner State
  const [bannerStats, setBannerStats] = useState([
    { data: "900+", title: "STUDENTS", iconId: "graduation-cap" },
    { data: "30+", title: "TRAINED TEACHERS", iconId: "users" },
    { data: "100%", title: "RESULT", iconId: "trophy" },
    { data: "Science, Commerce", title: "STREAMS", iconId: "book-open" },
  ]);

  // Contact Us Stats (Mirrors Banner conceptually, but can have extra)
  const [contactStats, setContactStats] = useState({
    yearsOfExcellence: "22+",
    facultyMembers: "30+",
    happyStudents: "900+",
    resultPercentage: "100%",
  });

  // Admission Fee Structure
  const [feeStructure, setFeeStructure] = useState([
    { class: "Nursery", fee: 8690 },
  ]);

  // Admission Required Documents
  const [requiredDocs, setRequiredDocs] = useState([
    { title: "Identity Proof", items: ["Aadhar Card Photocopy"] },
  ]);

  // Careers Position Requirements
  const [careersReq, setCareersReq] = useState({
    subjects: "English, Mathematics, Biology, Physics, Chemistry, Social Science, Hindi, Sanskrit",
    qualifications: "Bachelor's Degree with B.Ed or equivalent",
    experience: "Minimum 2 years of teaching experience",
    salary: "₹15,000 - ₹25,000 per month",
    imageUrl: "/recruitment.png",
  });

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    setLoading(true);
    try {
      const banner = await fetchSettings("landing_banner");
      if (banner) setBannerStats(banner);

      const contact = await fetchSettings("contact_stats");
      if (contact) setContactStats(contact);

      const fees = await fetchSettings("admission_fee_structure");
      if (fees) setFeeStructure(fees);

      const docs = await fetchSettings("admission_documents");
      if (docs) setRequiredDocs(docs);

      const careers = await fetchSettings("careers_requirements");
      if (careers) setCareersReq(careers);
    } catch (error) {
      toast.error("Failed to load some settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: any) => {
    setSaving(true);
    try {
      await saveSettings(key, value);
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"
    );
    formData.append("folder", "sarvodaya/settings");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return data.secure_url;
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-600 mt-2">Manage dynamic content across the website pages.</p>
      </div>

      <Tabs defaultValue="landing">
        <TabsList className="mb-6 grid grid-cols-2 lg:grid-cols-4 bg-gray-100 rounded-lg p-1 h-auto">
          <TabsTrigger value="landing" className="py-2.5">Landing Page</TabsTrigger>
          <TabsTrigger value="contact" className="py-2.5">Contact Us</TabsTrigger>
          <TabsTrigger value="admission" className="py-2.5">Admission</TabsTrigger>
          <TabsTrigger value="careers" className="py-2.5">Careers</TabsTrigger>
        </TabsList>

        {/* Landing Page Settings */}
        <TabsContent value="landing" className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold mb-4">Banner Statistics</h2>
            {bannerStats.map((stat, idx) => (
              <div key={idx} className="flex gap-4 mb-4 items-end bg-gray-50 p-4 rounded-lg">
                <div className="flex-1">
                  <Label>Title</Label>
                  <Input 
                    value={stat.title} 
                    onChange={(e) => {
                      const newStats = [...bannerStats];
                      newStats[idx].title = e.target.value;
                      setBannerStats(newStats);
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Label>Data (e.g. 900+)</Label>
                  <Input 
                    value={stat.data} 
                    onChange={(e) => {
                      const newStats = [...bannerStats];
                      newStats[idx].data = e.target.value;
                      setBannerStats(newStats);
                    }}
                  />
                </div>
                <Button variant="destructive" size="icon" onClick={() => {
                  const newStats = bannerStats.filter((_, i) => i !== idx);
                  setBannerStats(newStats);
                }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-4 mt-4">
              <Button variant="outline" onClick={() => setBannerStats([...bannerStats, { title: "NEW STAT", data: "0", iconId: "book-open" }])}>
                <Plus className="w-4 h-4 mr-2" /> Add Stat
              </Button>
              <Button disabled={saving} onClick={() => handleSave("landing_banner", bannerStats)}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Banner
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Contact Us Settings */}
        <TabsContent value="contact" className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold mb-4">Contact Page Numbers</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Years of Excellence</Label>
                <Input value={contactStats.yearsOfExcellence} onChange={(e) => setContactStats({...contactStats, yearsOfExcellence: e.target.value})} />
              </div>
              <div>
                <Label>Faculty Members</Label>
                <Input value={contactStats.facultyMembers} onChange={(e) => setContactStats({...contactStats, facultyMembers: e.target.value})} />
              </div>
              <div>
                <Label>Happy Students</Label>
                <Input value={contactStats.happyStudents} onChange={(e) => setContactStats({...contactStats, happyStudents: e.target.value})} />
              </div>
              <div>
                <Label>Result Percentage</Label>
                <Input value={contactStats.resultPercentage} onChange={(e) => setContactStats({...contactStats, resultPercentage: e.target.value})} />
              </div>
            </div>
            <Button className="mt-6" disabled={saving} onClick={() => handleSave("contact_stats", contactStats)}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Contact Stats
            </Button>
          </div>
        </TabsContent>

        {/* Admission Settings */}
        <TabsContent value="admission" className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold mb-4">Fee Structure</h2>
            {feeStructure.map((fee, idx) => (
              <div key={idx} className="flex gap-4 mb-3 items-end">
                <div className="flex-1">
                  <Label>Class</Label>
                  <Input value={fee.class} onChange={(e) => {
                    const newFees = [...feeStructure];
                    newFees[idx].class = e.target.value;
                    setFeeStructure(newFees);
                  }} />
                </div>
                <div className="flex-1">
                  <Label>Total Fee (₹)</Label>
                  <Input type="number" value={fee.fee} onChange={(e) => {
                    const newFees = [...feeStructure];
                    newFees[idx].fee = Number(e.target.value);
                    setFeeStructure(newFees);
                  }} />
                </div>
                <Button variant="destructive" size="icon" onClick={() => setFeeStructure(feeStructure.filter((_, i) => i !== idx))}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-4 mt-4">
              <Button variant="outline" onClick={() => setFeeStructure([...feeStructure, { class: "New Class", fee: 0 }])}>
                <Plus className="w-4 h-4 mr-2" /> Add Class Fee
              </Button>
              <Button disabled={saving} onClick={() => handleSave("admission_fee_structure", feeStructure)}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Fee Structure
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold mb-4">Required Documents</h2>
            {requiredDocs.map((docCategory, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex gap-4 items-end mb-4">
                  <div className="flex-1">
                    <Label>Category Title</Label>
                    <Input value={docCategory.title} onChange={(e) => {
                      const newDocs = [...requiredDocs];
                      newDocs[idx].title = e.target.value;
                      setRequiredDocs(newDocs);
                    }} />
                  </div>
                  <Button variant="destructive" onClick={() => setRequiredDocs(requiredDocs.filter((_, i) => i !== idx))}>
                    Remove Category
                  </Button>
                </div>
                <Label>Items (one per line)</Label>
                <Textarea 
                  rows={4} 
                  value={docCategory.items.join("\n")} 
                  onChange={(e) => {
                    const newDocs = [...requiredDocs];
                    newDocs[idx].items = e.target.value.split("\n").filter(i => i.trim() !== "");
                    setRequiredDocs(newDocs);
                  }} 
                />
              </div>
            ))}
            <div className="flex gap-4 mt-4">
              <Button variant="outline" onClick={() => setRequiredDocs([...requiredDocs, { title: "New Category", items: ["Document 1"] }])}>
                <Plus className="w-4 h-4 mr-2" /> Add Category
              </Button>
              <Button disabled={saving} onClick={() => handleSave("admission_documents", requiredDocs)}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Documents
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Careers Settings */}
        <TabsContent value="careers" className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold mb-4">Position Requirements</h2>
            <div className="space-y-4">
              <div>
                <Label>Subjects Required</Label>
                <Textarea value={careersReq.subjects} onChange={(e) => setCareersReq({...careersReq, subjects: e.target.value})} />
              </div>
              <div>
                <Label>Qualifications</Label>
                <Input value={careersReq.qualifications} onChange={(e) => setCareersReq({...careersReq, qualifications: e.target.value})} />
              </div>
              <div>
                <Label>Experience</Label>
                <Input value={careersReq.experience} onChange={(e) => setCareersReq({...careersReq, experience: e.target.value})} />
              </div>
              <div>
                <Label>Salary Range</Label>
                <Input value={careersReq.salary} onChange={(e) => setCareersReq({...careersReq, salary: e.target.value})} />
              </div>
              
              <div className="pt-4 border-t">
                <Label>Recruitment Poster Image</Label>
                {careersReq.imageUrl && (
                  <div className="mt-2 mb-4">
                    <img src={careersReq.imageUrl} alt="Poster" className="max-h-[200px] rounded-lg border" />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        try {
                          const url = await uploadToCloudinary(e.target.files[0]);
                          setCareersReq({...careersReq, imageUrl: url});
                          toast.success("Image uploaded!");
                        } catch (err) {
                          toast.error("Failed to upload image");
                        }
                      }
                    }} 
                  />
                </div>
              </div>
              <Button className="mt-4" disabled={saving} onClick={() => handleSave("careers_requirements", careersReq)}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Careers Info
              </Button>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
