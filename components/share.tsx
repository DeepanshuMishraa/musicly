import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Share, Link } from 'lucide-react';

interface ShareComponentProps {
  spaceId: string;
}

const ShareComponent: React.FC<ShareComponentProps> = ({ spaceId }) => {
  const shareableLink = `${window.location.origin}/dashboard?spaceId=${spaceId}`;
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink).then(() => {
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
        duration: 2000,
      });
    }).catch((err) => {
      console.error('Failed to copy: ', err);
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-black text-white border-white hover:bg-gray-900"
        >
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-black text-white border border-gray-800">
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
              Share this Space
            </h2>
            <p className="text-gray-400">
              Invite others to join your musical journey!
            </p>
          </div>
          <div className="flex items-center p-2 bg-gray-900 rounded-md">
            <Link className="w-5 h-5 mr-2 text-gray-400" />
            <Input
              readOnly
              value={shareableLink}
              className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={copyToClipboard}
              className="hover:bg-gray-800 focus:ring-0"
            >
              <Copy className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
          <p className="text-sm text-gray-400 text-center">
            Click the copy icon to grab the link and share it with your friends!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareComponent;
