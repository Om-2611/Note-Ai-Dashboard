
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BrainCircuit,
  FileText,
  Loader2,
  Mail,
  PlusCircle,
  Trash2,
  Upload,
  WandSparkles,
  Edit,
  Share2,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarInset,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { summarizeTranscript } from "@/ai/flows/summarize-transcript";
import { refineGeneratedSummary } from "@/ai/flows/refine-generated-summary";
import { customizeSummaryWithPrompt } from "@/ai/flows/customize-summary-with-prompt";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type Summary = {
  id: string;
  transcript: string;
  customPrompt: string;
  summary: string;
  title: string;
  createdAt: string;
};

export function NoteAIDashboard() {
  const { toast } = useToast();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [activeSummaryId, setActiveSummaryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("summarize");

  const [transcript, setTranscript] = useState("");
  const [transcriptFileName, setTranscriptFileName] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [editedSummary, setEditedSummary] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    try {
      const storedSummaries = localStorage.getItem("note-ai-summaries");
      if (storedSummaries) {
        setSummaries(JSON.parse(storedSummaries));
      }
    } catch (error) {
      console.error("Failed to parse summaries from localStorage", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load previous summaries.",
      });
    }
  }, [toast]);

  const activeSummary = useMemo(
    () => summaries.find((s) => s.id === activeSummaryId) || null,
    [summaries, activeSummaryId]
  );

  useEffect(() => {
    if (activeSummary) {
      setTranscript(activeSummary.transcript);
      setCustomPrompt(activeSummary.customPrompt);
      setEditedSummary(activeSummary.summary);
      setTranscriptFileName(activeSummary.title);
      setActiveTab("edit");
    } else {
      setTranscript("");
      setCustomPrompt("");
      setEditedSummary("");
      setTranscriptFileName("");
      setActiveTab("summarize");
    }
  }, [activeSummary]);

  const updateSummaries = (updatedSummaries: Summary[]) => {
    setSummaries(updatedSummaries);
    localStorage.setItem(
      "note-ai-summaries",
      JSON.stringify(updatedSummaries)
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (activeSummaryId) {
        handleCreateNew();
      }
      setTranscriptFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setTranscript(content);
      };
      reader.readAsText(file);
    }
  };

  const handleGenerateSummary = async () => {
    if (!transcript) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload a transcript first.",
      });
      return;
    }
    setIsLoading(true);
    setLoadingMessage("Generating summary...");
    try {
      const result = await summarizeTranscript({ transcript, customPrompt: "" });
      const newSummary: Summary = {
        id: new Date().toISOString(),
        transcript,
        customPrompt: "",
        summary: result.summary,
        title: transcriptFileName || `Summary ${new Date().toLocaleDateString()}`,
        createdAt: new Date().toISOString(),
      };
      const newSummaries = [newSummary, ...summaries];
      updateSummaries(newSummaries);
      setActiveSummaryId(newSummary.id);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate summary. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefineSummary = async () => {
    if (!activeSummary || editedSummary === activeSummary.summary) return;
    setIsLoading(true);
    setLoadingMessage("Refining with your edits...");
    try {
      const result = await refineGeneratedSummary({
        initialSummary: activeSummary.summary,
        userEdits: editedSummary,
      });
      const updatedSummaries = summaries.map((s) =>
        s.id === activeSummaryId
          ? { ...s, summary: result.refinedSummary, customPrompt }
          : s
      );
      updateSummaries(updatedSummaries);
      setEditedSummary(result.refinedSummary);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Refinement Failed",
        description: "Could not refine summary. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCustomizeSummary = async () => {
    if (!activeSummary || !customPrompt) return;
    setIsLoading(true);
    setLoadingMessage("Customizing summary...");
    try {
      const result = await customizeSummaryWithPrompt({
        transcript: activeSummary.transcript,
        originalSummary: activeSummary.summary,
        customPrompt,
      });
      const updatedSummaries = summaries.map((s) =>
        s.id === activeSummaryId
          ? { ...s, summary: result.refinedSummary, customPrompt }
          : s
      );
      updateSummaries(updatedSummaries);
      setEditedSummary(result.refinedSummary);
      toast({
        title: "Summary Customized",
        description: "The summary has been updated with your instructions.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Customization Failed",
        description: "Could not customize summary. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setActiveSummaryId(null);
  };

  const handleDeleteSummary = (id: string) => {
    const newSummaries = summaries.filter((s) => s.id !== id);
    updateSummaries(newSummaries);
    if (activeSummaryId === id) {
      setActiveSummaryId(null);
    }
  };

  const handleSendEmail = () => {
    if (!recipientEmail) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a recipient email.' });
      return;
    }
    if (!activeSummary) {
      toast({ variant: 'destructive', title: 'Error', description: 'No active summary to share.' });
      return;
    }
    const subject = `Meeting Summary: ${activeSummary.title}`;
    const body = encodeURIComponent(editedSummary);
    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-primary" />
            <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">NoteAI</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleCreateNew} size="lg">
                <PlusCircle />
                New Summary
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator />
          <SidebarMenu>
            {summaries.map((s) => (
              <SidebarMenuItem key={s.id}>
                <SidebarMenuButton
                  isActive={s.id === activeSummaryId}
                  onClick={() => setActiveSummaryId(s.id)}
                  tooltip={{ children: s.title, side: "right", align: "center" }}
                >
                  <FileText />
                  <span>{s.title}</span>
                </SidebarMenuButton>
                <SidebarMenuAction
                  onClick={() => handleDeleteSummary(s.id)}
                  aria-label="Delete summary"
                  showOnHover
                >
                  <Trash2 />
                </SidebarMenuAction>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter/>
      </Sidebar>

      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="text-2xl font-bold font-headline">
            {activeSummary ? activeSummary.title : "New Summary"}
          </h1>
          <SidebarTrigger />
        </header>

        <main className="flex-1 p-4 md:p-8 bg-background">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="summarize" disabled={!!activeSummaryId}>
                <Upload className="mr-2" />
                Summarize
              </TabsTrigger>
              <TabsTrigger value="edit" disabled={!activeSummaryId}>
                <Edit className="mr-2" />
                Edit & Refine
              </TabsTrigger>
              <TabsTrigger value="share" disabled={!activeSummaryId}>
                <Share2 className="mr-2" />
                Share
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summarize" className="mt-6">
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="text-primary" />
                    Start Here
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="transcript-upload">Upload Transcript</Label>
                    <div className="flex items-center gap-2">
                      <Input id="transcript-upload" type="file" accept=".txt,.md" onChange={handleFileChange} className="flex-1" />
                    </div>
                    {transcriptFileName && <p className="text-sm text-muted-foreground">File: {transcriptFileName}</p>}
                  </div>
                  <Button onClick={handleGenerateSummary} disabled={isLoading || !transcript} className="w-full bg-primary hover:bg-primary/90">
                    {isLoading ? <Loader2 className="animate-spin" /> : <WandSparkles />}
                    Generate Summary
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="edit" className="mt-6">
              <div className="grid gap-8 max-w-4xl mx-auto">
                <Card className="flex-1 flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="text-primary" />
                      Generated Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-4">
                    <div className="relative flex-1">
                      <Textarea
                        placeholder="Your AI-generated summary will appear here..."
                        className="h-full min-h-[250px] resize-none"
                        value={editedSummary}
                        onChange={(e) => setEditedSummary(e.target.value)}
                        readOnly={isLoading || !activeSummary}
                      />
                      {isLoading && (
                        <div className="absolute inset-0 bg-card/50 flex flex-col items-center justify-center gap-2 rounded-md">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <p className="text-muted-foreground">{loadingMessage}</p>
                        </div>
                      )}
                    </div>
                    <Button onClick={handleRefineSummary} disabled={isLoading || !activeSummary || editedSummary === activeSummary.summary} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                      <WandSparkles />
                      Refine with Your Edits
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <WandSparkles className="text-primary" />
                      Customize with a Prompt
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="custom-prompt">Custom Instructions</Label>
                        <Textarea
                          id="custom-prompt"
                          placeholder="e.g., 'Focus on action items' or 'Summarize in bullet points'"
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleCustomizeSummary} disabled={isLoading || !activeSummaryId || !customPrompt} variant="outline" className="w-full">
                        {isLoading && loadingMessage.startsWith('Customizing') ? <Loader2 className="animate-spin" /> : <WandSparkles />}
                        Apply Instructions
                      </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="share" className="mt-6">
               <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="text-primary" />
                    Share Summary via Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <Input
                    type="email"
                    placeholder="Recipient's email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    disabled={isLoading || !activeSummary}
                  />
                  <Button onClick={handleSendEmail} disabled={isLoading || !activeSummary} variant="secondary">
                    Send Email
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
