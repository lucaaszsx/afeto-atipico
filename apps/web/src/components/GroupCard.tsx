import { Users, MessageCircle, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect, useRef } from 'react';

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    tags: string[];
    isJoined?: boolean;
  };
  onJoin?: (groupId: string) => void;
  onAccess?: (groupId: string) => void;
  isLoading?: boolean;
}

export const GroupCard = ({ group, onJoin, onAccess, isLoading }: GroupCardProps) => {
  const [visibleTags, setVisibleTags] = useState<string[]>([]);
  const [hiddenCount, setHiddenCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateVisibleTags = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      setContainerWidth(containerWidth);

      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.visibility = 'hidden';
      tempContainer.style.whiteSpace = 'nowrap';
      tempContainer.style.display = 'flex';
      tempContainer.style.gap = '8px';
      document.body.appendChild(tempContainer);

      let currentWidth = 0;
      let visibleTagsCount = 0;
      const tagWidths: number[] = [];

      group.tags.forEach((tag, index) => {
        const tempBadge = document.createElement('div');
        tempBadge.className = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground';
        tempBadge.innerHTML = `<svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>${tag}`;
        tempContainer.appendChild(tempBadge);
        
        const badgeWidth = tempBadge.offsetWidth;
        tagWidths.push(badgeWidth);
        tempContainer.removeChild(tempBadge);
      });

      const gapWidth = 8;
      let remainingTags = group.tags.length;

      for (let i = 0; i < group.tags.length; i++) {
        const tagWidth = tagWidths[i];
        let totalWidthWithThis = currentWidth + tagWidth;
        
        if (i < group.tags.length - 1) {
          const remainingAfterThis = group.tags.length - i - 1;
          if (remainingAfterThis > 0) {
            const tempPlusBadge = document.createElement('div');
            tempPlusBadge.className = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-foreground text-foreground';
            tempPlusBadge.textContent = `+${remainingAfterThis}`;
            tempContainer.appendChild(tempPlusBadge);
            const plusBadgeWidth = tempPlusBadge.offsetWidth;
            tempContainer.removeChild(tempPlusBadge);
            
            if (totalWidthWithThis + gapWidth + plusBadgeWidth > containerWidth) break;
          }
        }
        if (totalWidthWithThis > containerWidth) break;
        
        currentWidth = totalWidthWithThis + gapWidth;
        visibleTagsCount = i + 1;
      }

      if (visibleTagsCount === 0 && group.tags.length > 0) {
        setVisibleTags([]);
        setHiddenCount(group.tags.length);
      } else {
        setVisibleTags(group.tags.slice(0, visibleTagsCount));
        setHiddenCount(group.tags.length - visibleTagsCount);
      }

      document.body.removeChild(tempContainer);
    };
    
    updateVisibleTags();

    const resizeObserver = new ResizeObserver(updateVisibleTags);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [group.tags, containerWidth]);

  return (
    <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground mb-2 truncate">
                {group.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {group.description}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div ref={containerRef} className="flex flex-wrap gap-2 min-h-[28px] items-center">
            {visibleTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Hash className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {hiddenCount > 0 && (
              <Badge variant="outline" className="text-xs">
                +{hiddenCount}
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center text-sm text-muted-foreground min-w-0 flex-1">
              <Users className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{group.memberCount} membros</span>
            </div>
            
            <div className="flex gap-2 flex-shrink-0 ml-2">
              {group.isJoined ? (
                <Button 
                  onClick={() => onAccess?.(group.id)}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Acessar
                </Button>
              ) : (
                <Button 
                  onClick={() => onJoin?.(group.id)}
                  size="sm"
                  variant="outline"
                  disabled={isLoading}
                  className="hover:bg-primary hover:text-primary-foreground border-primary/30"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  ) : (
                    <Users className="w-4 h-4 mr-2" />
                  )}
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};