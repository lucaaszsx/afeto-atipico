import { MessageCircle, Users, Hash, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef } from 'react';

interface MyGroupCardProps {
  group: {
    id: string;
    name: string;
    memberCount: number;
    tags: string[];
  };
  onAccess: (groupId: string) => void;
}

export const MyGroupCard = ({ group, onAccess }: MyGroupCardProps) => {
  const [visibleTags, setVisibleTags] = useState<string[]>([]);
  const [hiddenCount, setHiddenCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateVisibleTags = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.visibility = 'hidden';
      tempContainer.style.whiteSpace = 'nowrap';
      tempContainer.style.display = 'flex';
      tempContainer.style.gap = '4px';
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

      const gapWidth = 4;
      
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

    const timer = setTimeout(updateVisibleTags, 0);

    const resizeObserver = new ResizeObserver(updateVisibleTags);
    resizeObserver.observe(containerRef.current);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [group.tags]);

  return (
    <div
      className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg hover:from-primary/10 hover:to-primary/15 transition-all duration-300 cursor-pointer group border border-primary/20 hover:border-primary/40 animate-fade-in"
      onClick={() => onAccess(group.id)}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate flex-1 min-w-0 pr-2">
          {group.name}
        </h4>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </div>
      
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center text-sm text-muted-foreground flex-shrink-0">
          <Users className="w-4 h-4 mr-1" />
          <span className="whitespace-nowrap">{group.memberCount} membros</span>
        </div>
        
        <div ref={containerRef} className="flex gap-1 min-w-0 flex-1 justify-end items-center min-h-[24px]">
          {visibleTags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="text-xs"
            >
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
      </div>
    </div>
  );
};