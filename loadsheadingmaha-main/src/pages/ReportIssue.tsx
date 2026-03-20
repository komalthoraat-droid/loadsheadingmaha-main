import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, ImagePlus, Upload, Home } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubstationSelect from "@/components/SubstationSelect";
import VillageSelect from "@/components/VillageSelect";

interface Substation {
    id: string;
    name: string;
}

interface Village {
    id: string;
    name: string;
}

const ReportIssue = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [substations, setSubstations] = useState<Substation[]>([]);
    const [villages, setVillages] = useState<Village[]>([]);
    const [selectedSubstation, setSelectedSubstation] = useState("");
    const [selectedVillage, setSelectedVillage] = useState("");
    const [description, setDescription] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch substations on mount
    useEffect(() => {
        const fetchSubstations = async () => {
            const { data } = await supabase
                .from("substations")
                .select("id, name")
                .order("name");

            if (data) {
                setSubstations(data);
            }
        };

        fetchSubstations();
    }, []);

    // Fetch villages when substation changes
    useEffect(() => {
        const fetchVillages = async () => {
            if (!selectedSubstation) {
                setVillages([]);
                setSelectedVillage("");
                return;
            }

            const { data } = await supabase
                .from("villages")
                .select("id, name")
                .eq("substation_id", selectedSubstation)
                .order("name");

            if (data) {
                setVillages(data);
            }
            setSelectedVillage("");
        };

        fetchVillages();
    }, [selectedSubstation]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "File too large",
                    description: "Please upload an image smaller than 5MB",
                    variant: "destructive",
                });
                return;
            }
            setPhoto(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !mobile || !selectedSubstation || !selectedVillage || !description) {
            toast({
                title: "Missing Information",
                description: "Please fill all required fields",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            let photoUrl = null;

            // Upload photo if provided
            if (photo) {
                const fileExt = photo.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError, data } = await supabase.storage
                    .from('problem_photos')
                    .upload(filePath, photo);

                if (uploadError) {
                    throw uploadError;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('problem_photos')
                    .getPublicUrl(filePath);

                photoUrl = publicUrl;
            }

            // Save report to database
            const { error: dbError } = await (supabase as any)
                .from('light_problems')
                .insert({
                    user_name: name,
                    mobile: mobile,
                    substation_id: selectedSubstation,
                    village_id: selectedVillage,
                    description: description,
                    photo_url: photoUrl,
                    status: 'Pending'
                });

            if (dbError) throw dbError;

            toast({
                title: "Report sent for verification",
                description: "Thank you for reporting. The technical team will review it shortly.",
            });

            // Reset form or navigate away
            navigate("/");

        } catch (error: any) {
            console.error("Error submitting report:", error);
            toast({
                title: "Error submitting report",
                description: error.message || "Failed to send report. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-6">
                <div className="max-w-md mx-auto">
                    <Link to="/" className="inline-flex items-center text-sm text-primary hover:underline mb-6">
                        <Home className="h-4 w-4 mr-1" />
                        Back to Home
                    </Link>

                    <div className="govt-card">
                        <div className="govt-card-header flex items-center gap-2 bg-destructive">
                            <ShieldAlert className="h-5 w-5" />
                            Report Light Problem (Light Gone)
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Your Name / तुमचे नाव *</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter full name"
                                        required
                                        maxLength={100}
                                        className="bg-background"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Mobile Number / मोबाईल नंबर *</Label>
                                    <Input
                                        id="mobile"
                                        type="tel"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        placeholder="Enter 10-digit number"
                                        required
                                        pattern="[0-9]{10}"
                                        maxLength={10}
                                        className="bg-background"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Taluka / Substation *</Label>
                                    <SubstationSelect
                                        substations={substations}
                                        value={selectedSubstation}
                                        onChange={setSelectedSubstation}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Village / गाव *</Label>
                                    <VillageSelect
                                        villages={villages}
                                        value={selectedVillage}
                                        onChange={setSelectedVillage}
                                        disabled={!selectedSubstation}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Problem Description / समस्येचे वर्णन *</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="e.g. Broken wire, transformer spark, entire village light gone..."
                                        required
                                        className="min-h-[100px] bg-background text-base"
                                        maxLength={500}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Upload Photo (Optional) / फोटो (पर्यायी)</Label>
                                    <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-4 text-center hover:bg-muted/50 transition-colors">
                                        <input
                                            type="file"
                                            id="photo"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                        />
                                        <label htmlFor="photo" className="cursor-pointer flex flex-col items-center gap-2">
                                            {photo ? (
                                                <>
                                                    <ImagePlus className="h-8 w-8 text-primary" />
                                                    <span className="text-sm font-medium text-foreground">{photo.name}</span>
                                                    <span className="text-xs text-muted-foreground">Click to change</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                                    <span className="text-sm font-medium text-foreground">Tap to upload a photo of the problem</span>
                                                    <span className="text-xs text-muted-foreground">Max size: 5MB</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full btn-large bg-destructive hover:bg-destructive/90 text-white"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Submit Report / अहवाल पाठवा"}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ReportIssue;
