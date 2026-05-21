import { PRESETS } from '../../lib/constants';
import { Button } from '../ui/button';

export function ScenarioPresets({ activePreset, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {Object.entries(PRESETS).map(([key, preset]) => (
        <Button
          key={key}
          variant={activePreset === key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(key)}
          className="rounded-full"
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
