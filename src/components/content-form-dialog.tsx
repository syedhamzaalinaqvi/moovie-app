
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, Search, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getContentById } from '@/lib/tmdb';
import type { Content, DownloadLink } from '@/lib/definitions';
import { updateContent } from '@/ai/flows/update-content';
import { ContentCard } from './content-card';

type ContentFormDialogProps = {
  children: React.ReactNode;
  contentToEdit?: Content;
  onSave?: () => void;
};

export function ContentFormDialog({ children, contentToEdit, onSave }: ContentFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tmdbId, setTmdbId] = useState(contentToEdit?.id || '');
  const [isLoading, setIsLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<Content | null>(contentToEdit || null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Form fields state
  const [trailerUrl, setTrailerUrl] = useState(contentToEdit?.trailerUrl || '');
  // Removed single downloadLink state in favor of list
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([]);
  // const [isHindiDubbed, setIsHindiDubbed] = useState(contentToEdit?.isHindiDubbed || false); // Deprecated state, mapped to languages
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState(contentToEdit?.customTags?.join(', ') || '');

  const { toast } = useToast();
  const isEditing = !!contentToEdit;

  useEffect(() => {
    // When the dialog is opened for editing, populate the form
    if (isOpen && contentToEdit) {
      setTmdbId(contentToEdit.id);
      setPreviewContent(contentToEdit);
      setTrailerUrl(contentToEdit.trailerUrl || '');

      // Initialize links
      if (contentToEdit.downloadLinks && contentToEdit.downloadLinks.length > 0) {
        setDownloadLinks(contentToEdit.downloadLinks);
      } else if (contentToEdit.downloadLink) {
        setDownloadLinks([{ label: 'Download', url: contentToEdit.downloadLink }]);
      } else {
        setDownloadLinks([]);
      }

      // Initialize Languages and Quality
      let langs = contentToEdit.languages || [];
      if (contentToEdit.isHindiDubbed && !langs.includes('Hindi Dubbed')) {
        langs = ['Hindi Dubbed', ...langs];
      }
      setSelectedLanguages(langs);
      setSelectedQuality(contentToEdit.quality || []);

      setCustomTags(contentToEdit.customTags?.join(', ') || '');
    } else {
      resetForm();
    }
  }, [contentToEdit, isOpen]);

  const resetForm = () => {
    if (!isEditing) {
      setTmdbId('');
      setPreviewContent(null);
      setTrailerUrl('');
      setDownloadLinks([]);
      setSelectedLanguages([]);
      setSelectedQuality([]);
      setCustomTags('');
      setPreviewError(null);
    }
  };


  const handlePreview = async () => {
    if (!tmdbId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a TMDB ID.' });
      return;
    }
    setIsLoading(true);
    setPreviewContent(null);
    setPreviewError(null);
    try {
      const content = await getContentById(tmdbId);
      if (!content) {
        throw new Error('Content not found with the provided ID.');
      }
      setPreviewContent(content);
      // Reset custom fields when previewing a new ID, but try to preserve existing ones if it's the same ID
      if (contentToEdit?.id !== tmdbId) {
        setTrailerUrl(content.trailerUrl || '');
        // For new content, check if it has links (unlikely from TMDB directly but safe)
        if (content.downloadLinks?.length) {
          setDownloadLinks(content.downloadLinks);
        } else if (content.downloadLink) {
          setDownloadLinks([{ label: 'Download', url: content.downloadLink }]);
        } else {
          setDownloadLinks([]);
        }

        // Initialize from TMDB or defaults
        setSelectedLanguages(content.languages || (content.isHindiDubbed ? ['Hindi Dubbed'] : []));
        setSelectedQuality(content.quality || []);

        setCustomTags(content.customTags?.join(', ') || '');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not fetch content details.';
      setPreviewError(message);
      toast({ variant: 'destructive', title: 'Preview Failed', description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLink = () => {
    setDownloadLinks([...downloadLinks, { label: '', url: '' }]);
  };

  const handleRemoveLink = (index: number) => {
    setDownloadLinks(downloadLinks.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, field: keyof DownloadLink, value: string) => {
    const newLinks = [...downloadLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setDownloadLinks(newLinks);
  };

  const handleSave = async () => {
    if (!previewContent) {
      toast({ variant: 'destructive', title: 'Error', description: 'Cannot save without content details.' });
      return;
    }
    setIsLoading(true);

    // Filter out empty links
    const validLinks = downloadLinks.filter(l => l.url.trim() !== '');

    const finalContentToAdd: Content = {
      ...previewContent,
      // The ID from the input field is the source of truth
      id: tmdbId,
      trailerUrl: trailerUrl || undefined,
      downloadLinks: validLinks,
      // Maintain backward compatibility for now by setting the first link as legacy downloadLink
      downloadLink: validLinks.length > 0 ? validLinks[0].url : undefined,
      languages: selectedLanguages,
      quality: selectedQuality,
      isHindiDubbed: selectedLanguages.includes('Hindi Dubbed'), // Sync for legacy visual support until fully migrated
      customTags: customTags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    try {
      const result = await updateContent(finalContentToAdd);
      if (!result.success) throw new Error('The AI flow failed to update the content.');

      toast({
        title: isEditing ? 'Content Updated' : 'Content Added',
        description: `'${finalContentToAdd.title}' has been saved successfully.`,
      });
      onSave?.();
      setIsOpen(false);
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save content.';
      toast({ variant: 'destructive', title: 'Save Failed', description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Content' : 'Add New Content'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for this item or change the ID to fetch a new one.' : 'Add content via its TMDB ID.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="tmdbId">TMDB ID</Label>
            <div className="flex gap-2">
              <Input
                id="tmdbId"
                value={tmdbId}
                onChange={(e) => setTmdbId(e.target.value)}
                placeholder="e.g., 550 for Fight Club"
                disabled={isLoading}
              />
              <Button onClick={handlePreview} disabled={isLoading || !tmdbId} variant="outline">
                {isLoading && tmdbId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Preview
              </Button>
            </div>
          </div>

          {previewError && !previewContent && (
            <Alert variant="destructive">
              <AlertTitle>Preview Failed</AlertTitle>
              <AlertDescription>{previewError}</AlertDescription>
            </Alert>
          )}

          {previewContent && (
            <div className='space-y-4 pt-4'>
              <Separator />
              <h3 className="text-lg font-medium text-center">Content Details</h3>
              <div className="mx-auto w-1/2">
                <ContentCard content={previewContent} />
              </div>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="trailerUrl">IFrame/Embed or Video URL</Label>
                  <Textarea
                    id="trailerUrl"
                    placeholder="<iframe...> or https://..."
                    value={trailerUrl}
                    onChange={(e) => setTrailerUrl(e.target.value)}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Download Links / Episodes</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddLink}>
                      <Plus className="h-4 w-4 mr-1" /> Add Link
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {downloadLinks.map((link, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Label (e.g. 720p, S01E01)"
                            value={link.label}
                            onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                            className="h-8"
                          />
                          <Input
                            placeholder="URL (https://...)"
                            value={link.url}
                            onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="mt-1 text-destructive hover:text-destructive/90"
                          onClick={() => handleRemoveLink(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {downloadLinks.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2 border border-dashed rounded-md">
                        No download links added.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="customTags">Custom Tags (comma-separated)</Label>
                  <Input
                    id="customTags"
                    placeholder="e.g., must watch, new, viral"
                    value={customTags}
                    onChange={(e) => setCustomTags(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Languages</Label>
                    <div className="flex flex-wrap gap-4">
                      {['Hindi Dubbed', 'English', 'Urdu Dubbed', 'Multi Audio'].map((lang) => (
                        <div key={lang} className="flex items-center space-x-2">
                          <Checkbox
                            id={`lang-${lang}`}
                            checked={selectedLanguages.includes(lang)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedLanguages([...selectedLanguages, lang]);
                              } else {
                                setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
                              }
                            }}
                            disabled={isLoading}
                          />
                          <Label htmlFor={`lang-${lang}`}>{lang}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Quality</Label>
                    <div className="flex flex-wrap gap-4">
                      {['HD', '4K', 'HDCAM', 'HDTS', 'HEVC'].map((q) => (
                        <div key={q} className="flex items-center space-x-2">
                          <Checkbox
                            id={`qual-${q}`}
                            checked={selectedQuality.includes(q)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedQuality([...selectedQuality, q]);
                              } else {
                                setSelectedQuality(selectedQuality.filter(item => item !== q));
                              }
                            }}
                            disabled={isLoading}
                          />
                          <Label htmlFor={`qual-${q}`}>{q}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {previewContent && (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add to Library'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
