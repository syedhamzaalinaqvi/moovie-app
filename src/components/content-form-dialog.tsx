
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
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getContentById } from '@/lib/tmdb';
import type { Content } from '@/lib/definitions';
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
  const [downloadLink, setDownloadLink] = useState(contentToEdit?.downloadLink || '');
  const [isHindiDubbed, setIsHindiDubbed] = useState(contentToEdit?.isHindiDubbed || false);
  const [customTags, setCustomTags] = useState(contentToEdit?.customTags?.join(', ') || '');
  
  const { toast } = useToast();
  const isEditing = !!contentToEdit;

  useEffect(() => {
    // When the dialog is opened for editing, populate the form
    if (isOpen && contentToEdit) {
      setTmdbId(contentToEdit.id);
      setPreviewContent(contentToEdit);
      setTrailerUrl(contentToEdit.trailerUrl || '');
      setDownloadLink(contentToEdit.downloadLink || '');
      setIsHindiDubbed(contentToEdit.isHindiDubbed || false);
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
        setDownloadLink('');
        setIsHindiDubbed(false);
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
        setDownloadLink(content.downloadLink || '');
        setIsHindiDubbed(content.isHindiDubbed || false);
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

  const handleSave = async () => {
    if (!previewContent) {
      toast({ variant: 'destructive', title: 'Error', description: 'Cannot save without content details.' });
      return;
    }
    setIsLoading(true);

    const finalContentToAdd: Content = {
      ...previewContent,
      // The ID from the input field is the source of truth
      id: tmdbId, 
      trailerUrl: trailerUrl || undefined,
      downloadLink: downloadLink || undefined,
      isHindiDubbed: isHindiDubbed,
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
      <DialogContent>
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
                      {isLoading && tmdbId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4"/>}
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
                  <Separator/>
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
                          <Label htmlFor="downloadLink">Download Link</Label>
                          <Input
                              id="downloadLink"
                              placeholder="https://..."
                              value={downloadLink}
                              onChange={(e) => setDownloadLink(e.target.value)}
                              disabled={isLoading}
                          />
                      </div>
                      <div>
                          <Label htmlFor="customTags">Custom Tags (comma-separated)</Label>
                          <Input
                              id="customTags"
                              placeholder="e.g., must watch, new, 4k"
                              value={customTags}
                              onChange={(e) => setCustomTags(e.target.value)}
                              disabled={isLoading}
                          />
                      </div>
                      <div className="flex items-center space-x-2">
                          <Checkbox
                              id="isHindiDubbed"
                              checked={isHindiDubbed}
                              onCheckedChange={(checked) => setIsHindiDubbed(!!checked)}
                              disabled={isLoading}
                          />
                          <Label htmlFor="isHindiDubbed" className="font-medium">Hindi Dubbed</Label>
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
